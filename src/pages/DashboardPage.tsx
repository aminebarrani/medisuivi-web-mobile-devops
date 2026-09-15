import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService, { type UserDTO } from '../services/authService';
import patientService, { type PatientDTO, type NiveauRisque, type Sexe } from '../services/patientService';
import maladieService, { type MaladieDTO } from '../services/maladieService';
import suiviService, { type MesureDTO, type SymptomeDTO, type AlerteDTO, type TypeMesure, type Source, type Gravite } from '../services/suiviService';
import {
  tabClass,
  type TabType,
  getSecureRandomInt,
} from '../utils/dashboardClasses';

import { OverviewTab } from '../components/dashboard/OverviewTab';
import { PatientsTab } from '../components/dashboard/PatientsTab';
import { MaladiesTab } from '../components/dashboard/MaladiesTab';
import { SuiviTab } from '../components/dashboard/SuiviTab';
import { AlertesTab } from '../components/dashboard/AlertesTab';
import { ProfileTab } from '../components/dashboard/ProfileTab';
import { DashboardModals } from '../components/dashboard/DashboardModals';

const resolveDoctorProfile = async (user: UserDTO | null): Promise<number | null> => {
  if (!user?.id) return null;
  try {
    const profile = await patientService.getMedecinByUserId(user.id);
    return profile.id;
  } catch (err: unknown) {
    const axiosError = err as { response?: { status?: number } };
    if (axiosError?.response?.status === 404) {
      try {
        const randomSuffix = getSecureRandomInt(1000, 9999);
        const newProfile = await patientService.createMedecin({
          userId: user.id,
          specialite: 'Cardiologue',
          numeroOrdre: `DR-${user.id}-${randomSuffix}`,
        });
        return newProfile.id;
      } catch (createErr) {
        console.error('Error auto-creating Medecin profile:', createErr);
        try {
          const existing = await patientService.getMedecinByUserId(user.id);
          return existing.id;
        } catch (refetchErr) {
          console.error('Error re-fetching existing Medecin profile:', refetchErr);
        }
      }
    } else {
      console.error('Error fetching Medecin profile:', err);
    }
  }
  return null;
};

const getPasswordStrength = (pwd: string): number => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const getPasswordStrengthLabel = (score: number): string => {
  switch (score) {
    case 1:
      return 'Faible';
    case 2:
      return 'Moyen';
    case 3:
      return 'Fort';
    case 4:
      return 'Très robuste';
    default:
      return 'Très faible';
  }
};

const DashboardPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const medecinIdRef = useRef<number | null>(null);
  const resolvedUserIdRef = useRef<number | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Core Data States
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [maladies, setMaladies] = useState<MaladieDTO[]>([]);
  const [mesures, setMesures] = useState<MesureDTO[]>([]);
  const [symptomes, setSymptomes] = useState<SymptomeDTO[]>([]);
  const [alertes, setAlertes] = useState<AlerteDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter
  const [patientSearch, setPatientSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Doctor profile ID
  const [medecinId, setMedecinId] = useState<number | null>(null);

  // Modals visibility
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddMaladieModal, setShowAddMaladieModal] = useState(false);
  const [showAssignMaladieModal, setShowAssignMaladieModal] = useState(false);
  const [showAddMesureModal, setShowAddMesureModal] = useState(false);
  const [showAddSymptomeModal, setShowAddSymptomeModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientDTO | null>(null);
  const [predictingRisk, setPredictingRisk] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{ gravite: string; probabilities: Record<string, number> } | null>(null);

  // Forms
  const [newPatientForm, setNewPatientForm] = useState({
    username: '',
    email: '',
    password: '',
    nom: '',
    prenom: '',
    dateNaissance: '1990-05-15',
    sexe: 'HOMME' as Sexe,
    niveauRisque: 'FAIBLE' as NiveauRisque,
  });

  const [newMaladieForm, setNewMaladieForm] = useState({
    nom: '',
    description: '',
    parametresSuivis: '',
    seuilMin: '',
    seuilMax: '',
  });

  const [assignMaladieForm, setAssignMaladieForm] = useState({
    patientId: 0,
    maladieId: 0,
    dateDiagnostic: new Date().toISOString().split('T')[0],
  });

  const [newMesureForm, setNewMesureForm] = useState({
    patientId: 0,
    typeMesure: 'FREQUENCE_CARDIAQUE' as TypeMesure,
    valeur: '',
    unite: 'bpm',
    source: 'MEDECIN' as Source,
  });

  const [newSymptomeForm, setNewSymptomeForm] = useState({
    patientId: 0,
    description: '',
    gravite: 'MODERE' as Gravite,
  });

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPwd: '',
    confirm: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Avatar State
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Handle measure type unit defaults
  const handleMeasureTypeChange = (type: TypeMesure) => {
    let unite = 'bpm';
    switch (type) {
      case 'GLYCEMIE':
        unite = 'g/L';
        break;
      case 'TENSION':
        unite = 'mmHg';
        break;
      case 'TEMPERATURE':
        unite = '°C';
        break;
      case 'POIDS':
        unite = 'kg';
        break;
      case 'SPO2':
        unite = '%';
        break;
    }
    setNewMesureForm((prev) => ({ ...prev, typeMesure: type, unite }));
  };

  // Profile Picture Upload Handlers
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La taille du fichier ne doit pas dépasser 5 Mo.');
      return;
    }

    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (!base64) {
        setAvatarUploading(false);
        return;
      }
      try {
        const updated = await authService.updateProfilePicture(base64);
        updateUser(updated);
      } catch {
        authService.saveProfilePictureLocally(base64);
        if (user) {
          updateUser({ ...user, profilePictureUrl: base64 });
        }
      } finally {
        setAvatarUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Supprimer votre photo de profil ?')) return;
    setAvatarUploading(true);
    try {
      const updated = await authService.removeProfilePicture();
      updateUser(updated);
    } catch {
      localStorage.removeItem('medsuivi_avatar');
      if (user) {
        updateUser({ ...user, profilePictureUrl: undefined });
      }
    } finally {
      setAvatarUploading(false);
    }
  };

  // Data Loading
  const loadDashboardData = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const userChanged = resolvedUserIdRef.current !== (user?.id ?? null);
      let activeMedecinId = userChanged ? null : medecinIdRef.current;
      if (!activeMedecinId) {
        activeMedecinId = await resolveDoctorProfile(user);
        medecinIdRef.current = activeMedecinId;
        resolvedUserIdRef.current = user?.id ?? null;
        setMedecinId(activeMedecinId);
      }

      if (!activeMedecinId) {
        setPatients([]);
        setMaladies([]);
        setAlertes([]);
        setMesures([]);
        setSymptomes([]);
        return;
      }

      const [pts, mals, alrs, msrs, symp, usrs] = await Promise.allSettled([
        patientService.getPatientsByMedecin(activeMedecinId),
        maladieService.getAllMaladies(),
        suiviService.getAlertesByMedecin(activeMedecinId),
        suiviService.getMesuresByMedecin(activeMedecinId),
        suiviService.getSymptomesByMedecin(activeMedecinId),
        authService.getAllUsers(),
      ]);

      const usersList = usrs.status === 'fulfilled' ? usrs.value : [];
      const userMap = new Map(usersList.map((u) => [u.id, u]));

      let loadedPatients: PatientDTO[] = [];
      if (pts.status === 'fulfilled') {
        loadedPatients = pts.value;
      } else {
        try {
          const allPts = await patientService.getAllPatients();
          loadedPatients = allPts.filter((p) => p.medecinId === activeMedecinId);
        } catch {
          loadedPatients = [];
        }
      }

      const enrichedPatients = loadedPatients.map((p) => {
        const u = userMap.get(p.userId);
        return {
          ...p,
          nom: u ? u.lastName : (p.nom || ''),
          prenom: u ? u.firstName : (p.prenom || ''),
          email: u ? u.email : (p.email || ''),
        };
      });

      setPatients(enrichedPatients);
      setMaladies(mals.status === 'fulfilled' ? mals.value : []);
      setAlertes(alrs.status === 'fulfilled' ? alrs.value : []);
      setMesures(msrs.status === 'fulfilled' ? msrs.value : []);
      setSymptomes(symp.status === 'fulfilled' ? symp.value : []);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
      setPatients([]);
      setMaladies([]);
      setAlertes([]);
      setMesures([]);
      setSymptomes([]);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData(true);
    const syncInterval = setInterval(() => {
      loadDashboardData(false);
    }, 8000);
    return () => clearInterval(syncInterval);
  }, [loadDashboardData]);

  const getPatientDisplayName = (patientId: number): string => {
    const p = patients.find((pt) => pt.id === patientId);
    if (!p) return `Patient #${patientId}`;
    if (p.nom && p.prenom) return `${p.prenom} ${p.nom}`;
    return `Patient #${p.id}`;
  };

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        (p.nom?.toLowerCase() || '').includes(patientSearch.toLowerCase()) ||
        (p.prenom?.toLowerCase() || '').includes(patientSearch.toLowerCase()) ||
        p.id.toString().includes(patientSearch);
      const matchesRisk = riskFilter === 'ALL' || p.niveauRisque === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [patients, patientSearch, riskFilter]);

  const activeAlertsCount = useMemo(() => {
    return alertes.filter((a) => !a.traitee).length;
  }, [alertes]);

  // Form Submissions
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      const updated = await authService.updateProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
      });
      updateUser(updated);
      setProfileSuccess('Profil mis à jour avec succès !');
      setProfileEditMode(false);
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setProfileError(axiosError?.response?.data?.message || 'Erreur lors de la mise à jour du profil.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordForm.newPwd.length < 8) {
      setPasswordError('Le nouveau mot de passe doit comporter au moins 8 caractères.');
      return;
    }
    if (!/[A-Z]/.test(passwordForm.newPwd)) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins une lettre majuscule.');
      return;
    }
    if (!/\d/.test(passwordForm.newPwd)) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins un chiffre.');
      return;
    }
    if (passwordForm.newPwd !== passwordForm.confirm) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await authService.changePassword(passwordForm.current, passwordForm.newPwd);
      setPasswordSuccess(res.message || 'Mot de passe modifié avec succès !');
      setPasswordForm({ current: '', newPwd: '', confirm: '' });
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setPasswordError(axiosError?.response?.data?.message || 'Mot de passe actuel incorrect ou erreur serveur.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAddPatient = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let targetUserId: number | null = null;

      try {
        const regUser = await authService.register({
          username: newPatientForm.username,
          email: newPatientForm.email,
          password: newPatientForm.password,
          firstName: newPatientForm.prenom,
          lastName: newPatientForm.nom,
          role: 'PATIENT',
          active: true,
        });
        targetUserId = regUser.id;
      } catch (regErr: unknown) {
        const axiosRegErr = regErr as { response?: { data?: { message?: string } } };
        const regMsg = axiosRegErr?.response?.data?.message || '';

        // If username or email is already taken in user-service, check if we can reuse the existing user
        if (regMsg.includes('already taken') || regMsg.includes('already registered')) {
          const allUsers = await authService.getAllUsers();
          const existing = allUsers.find(
            (u) =>
              u.username.toLowerCase() === newPatientForm.username.toLowerCase() ||
              u.email.toLowerCase() === newPatientForm.email.toLowerCase()
          );
          if (existing) {
            targetUserId = existing.id;
          } else {
            throw regErr;
          }
        } else {
          throw regErr;
        }
      }

      if (!targetUserId) {
        throw new Error("Impossible de récupérer l'identifiant utilisateur.");
      }

      let currentMedId = medecinId || medecinIdRef.current;
      if (!currentMedId) {
        currentMedId = await resolveDoctorProfile(user);
        medecinIdRef.current = currentMedId;
        resolvedUserIdRef.current = user?.id ?? null;
        setMedecinId(currentMedId);
      }
      if (!currentMedId) {
        throw new Error('Profil médecin introuvable. Reconnectez-vous et réessayez.');
      }

      try {
        await patientService.createPatient({
          userId: targetUserId,
          medecinId: currentMedId,
          dateNaissance: newPatientForm.dateNaissance,
          sexe: newPatientForm.sexe,
          niveauRisque: newPatientForm.niveauRisque,
        });
      } catch (patErr: unknown) {
        const axiosPatErr = patErr as { response?: { data?: { message?: string } } };
        const patMsg = axiosPatErr?.response?.data?.message || '';
        if (patMsg.toLowerCase().includes('already exists')) {
          console.warn('Patient profile already existed for userId:', targetUserId);
          try {
            const existing = await patientService.getPatientByUserId(targetUserId);
            if (existing && existing.medecinId !== currentMedId) {
              await patientService.updatePatient(existing.id, {
                userId: targetUserId,
                medecinId: currentMedId,
                dateNaissance: existing.dateNaissance || newPatientForm.dateNaissance,
                sexe: existing.sexe || newPatientForm.sexe,
                niveauRisque: existing.niveauRisque || newPatientForm.niveauRisque,
              });
            }
          } catch (reassignErr) {
            console.warn('Could not reassign patient to current doctor:', reassignErr);
          }
        } else {
          throw patErr;
        }
      }

      setShowAddPatientModal(false);
      setNewPatientForm({
        username: '',
        email: '',
        password: '',
        nom: '',
        prenom: '',
        dateNaissance: '1990-05-15',
        sexe: 'HOMME',
        niveauRisque: 'FAIBLE',
      });
      loadDashboardData(false);
    } catch (err: unknown) {
      console.error('Failed to create patient:', err);
      const axiosErr = err as {
        response?: {
          data?: {
            message?: string;
            errors?: Record<string, string>;
          };
        };
        message?: string;
      };
      const detailMsg =
        axiosErr?.response?.data?.message ||
        (axiosErr?.response?.data?.errors
          ? Object.values(axiosErr.response.data.errors).join(', ')
          : '') ||
        axiosErr?.message ||
        'Erreur inconnue lors de la création du patient.';
      alert(`Erreur : ${detailMsg}`);
    }
  };

  const handleAddMaladie = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await maladieService.createMaladie({
        nom: newMaladieForm.nom,
        description: newMaladieForm.description,
        parametresSuivis: newMaladieForm.parametresSuivis,
        seuilMin: newMaladieForm.seuilMin ? parseFloat(newMaladieForm.seuilMin) : undefined,
        seuilMax: newMaladieForm.seuilMax ? parseFloat(newMaladieForm.seuilMax) : undefined,
      });
      setShowAddMaladieModal(false);
      setNewMaladieForm({ nom: '', description: '', parametresSuivis: '', seuilMin: '', seuilMax: '' });
      loadDashboardData(false);
    } catch (err) {
      console.error('Failed to create maladie:', err);
      alert('Erreur lors de la création de la pathologie.');
    }
  };

  const handleAssignMaladie = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!assignMaladieForm.patientId || !assignMaladieForm.maladieId) {
      alert('Veuillez sélectionner un patient et une pathologie.');
      return;
    }
    try {
      await maladieService.addMaladieToPatient({
        patientId: assignMaladieForm.patientId,
        maladieId: assignMaladieForm.maladieId,
        dateDiagnostic: assignMaladieForm.dateDiagnostic,
      });
      setShowAssignMaladieModal(false);
      loadDashboardData(false);
      alert('Pathologie associée au dossier patient avec succès !');
    } catch (err) {
      console.error('Failed to assign maladie:', err);
      alert("Erreur lors de l'affectation de la pathologie.");
    }
  };

  const handleAddMesure = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMesureForm.patientId) {
      alert('Veuillez sélectionner un patient.');
      return;
    }
    try {
      await suiviService.createMesure({
        patientId: newMesureForm.patientId,
        typeMesure: newMesureForm.typeMesure,
        valeur: parseFloat(newMesureForm.valeur),
        unite: newMesureForm.unite,
        source: newMesureForm.source,
      });
      setShowAddMesureModal(false);
      setNewMesureForm({
        patientId: 0,
        typeMesure: 'FREQUENCE_CARDIAQUE',
        valeur: '',
        unite: 'bpm',
        source: 'MEDECIN',
      });
      loadDashboardData(false);
    } catch (err) {
      console.error('Failed to add mesure:', err);
      alert("Erreur lors de l'enregistrement de la mesure.");
    }
  };

  const handleAddSymptome = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newSymptomeForm.patientId) {
      alert('Veuillez sélectionner un patient.');
      return;
    }
    try {
      await suiviService.createSymptome({
        patientId: newSymptomeForm.patientId,
        description: newSymptomeForm.description,
        gravite: newSymptomeForm.gravite,
      });
      setShowAddSymptomeModal(false);
      setNewSymptomeForm({
        patientId: 0,
        description: '',
        gravite: 'MODERE',
      });
      loadDashboardData(false);
    } catch (err) {
      console.error('Failed to report symptome:', err);
      alert('Erreur lors du signalement du symptôme.');
    }
  };

  const handleUpdateRisk = async (patientId: number, newRisk: NiveauRisque) => {
    try {
      await patientService.updateNiveauRisque(patientId, newRisk);
      loadDashboardData(false);
    } catch (err) {
      console.error('Failed to update risk:', err);
    }
  };

  const handlePredictRisk = async (patientId: number) => {
    setPredictingRisk(true);
    setPredictionResult(null);
    try {
      const res = await patientService.predictRisk(patientId);
      setPredictionResult(res);
      loadDashboardData(false);
    } catch (err) {
      console.error('Failed to run AI risk prediction:', err);
      alert('Impossible de contacter le service prédictif IA.');
    } finally {
      setPredictingRisk(false);
    }
  };

  const handleMarkAlerteTraitee = async (alerteId: number) => {
    try {
      await suiviService.markAlerteTraitee(alerteId);
      loadDashboardData(false);
    } catch (err) {
      console.error('Failed to mark alerte as traitee:', err);
    }
  };

  const openAssignMaladieModal = (patientId?: number) => {
    if (patientId) {
      setAssignMaladieForm((prev) => ({ ...prev, patientId }));
    }
    setShowAssignMaladieModal(true);
  };

  const openAddMesureModal = (patientId?: number) => {
    if (patientId) {
      setNewMesureForm((prev) => ({ ...prev, patientId }));
    }
    setShowAddMesureModal(true);
  };

  const openAddSymptomeModal = (patientId?: number) => {
    if (patientId) {
      setNewSymptomeForm((prev) => ({ ...prev, patientId }));
    }
    setShowAddSymptomeModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dash-container">
      {/* Top Navbar */}
      <header className="dash-header">
        <div className="dash-header-inner">
          <div className="flex items-center gap-3">
            <div className="dash-brand-icon">🩺</div>
            <div>
              <span className="dash-brand-title">MedSuivi</span>
              <span className="dash-brand-badge">Clinical Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="dash-sync-indicator">
              <span className="dash-sync-dot" />
              <span>Sync active</span>
            </div>

            <button
              onClick={() => setActiveTab('profile')}
              className="dash-user-badge group text-left"
              title="Gérer mon profil"
            >
              <div className="dash-avatar-sm">
                {user?.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={`Dr. ${user?.firstName} ${user?.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user?.firstName?.[0] || 'D'}</span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                  Dr. {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-teal-400">Médecin Référent</p>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="dash-btn-ghost text-xs text-rose-400 hover:text-rose-300"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="dash-main">
        {/* Navigation Tabs Bar */}
        <div className="dashboard-tab-bar">
          <button
            onClick={() => setActiveTab('overview')}
            className={tabClass(activeTab, 'overview')}
          >
            📊 Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={tabClass(activeTab, 'patients')}
          >
            👥 Mes Patients ({patients.length})
          </button>
          <button
            onClick={() => setActiveTab('maladies')}
            className={tabClass(activeTab, 'maladies')}
          >
            🩺 Pathologies ({maladies.length})
          </button>
          <button
            onClick={() => setActiveTab('suivi')}
            className={tabClass(activeTab, 'suivi')}
          >
            📈 Suivi & Constantes
          </button>
          <button
            onClick={() => setActiveTab('alertes')}
            className={tabClass(activeTab, 'alertes')}
          >
            🚨 Centre Alertes
            {activeAlertsCount > 0 && (
              <span className="dash-alert-counter">{activeAlertsCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={tabClass(activeTab, 'profile')}
          >
            <div className={`dash-tab-avatar ${activeTab === 'profile' ? 'dash-tab-avatar-active' : 'dash-tab-avatar-inactive'}`}>
              {user?.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span>👤</span>
              )}
            </div>
            Mon Profil
          </button>
        </div>

        {/* Content Views */}
        {loading ? (
          <div className="dash-loading-box">
            <div className="dash-spinner" />
            <p className="text-slate-400 font-medium">Chargement des données cliniques...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewTab
                user={user}
                patients={patients}
                maladies={maladies}
                alertes={alertes}
                activeAlertsCount={activeAlertsCount}
                onViewAllAlerts={() => setActiveTab('alertes')}
                getPatientDisplayName={getPatientDisplayName}
                onMarkAlerteTraitee={handleMarkAlerteTraitee}
                onAddPatient={() => setShowAddPatientModal(true)}
                onAssignMaladie={() => openAssignMaladieModal()}
                onAddMesure={() => openAddMesureModal()}
              />
            )}

            {activeTab === 'patients' && (
              <PatientsTab
                patientSearch={patientSearch}
                setPatientSearch={setPatientSearch}
                riskFilter={riskFilter}
                setRiskFilter={setRiskFilter}
                filteredPatients={filteredPatients}
                onAddPatient={() => setShowAddPatientModal(true)}
                onSelectPatient={(p) => setSelectedPatient(p)}
                onUpdateRisk={handleUpdateRisk}
              />
            )}

            {activeTab === 'maladies' && (
              <MaladiesTab
                maladies={maladies}
                onAddMaladie={() => setShowAddMaladieModal(true)}
                onAssignMaladie={() => setShowAssignMaladieModal(true)}
              />
            )}

            {activeTab === 'suivi' && (
              <SuiviTab
                mesures={mesures}
                symptomes={symptomes}
                getPatientDisplayName={getPatientDisplayName}
                onAddMesure={() => openAddMesureModal()}
                onAddSymptome={() => openAddSymptomeModal()}
              />
            )}

            {activeTab === 'alertes' && (
              <AlertesTab
                alertes={alertes}
                getPatientDisplayName={getPatientDisplayName}
                onMarkAlerteTraitee={handleMarkAlerteTraitee}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileTab
                user={user}
                medecinId={medecinId}
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                profileEditMode={profileEditMode}
                setProfileEditMode={setProfileEditMode}
                profileSaving={profileSaving}
                profileSuccess={profileSuccess}
                profileError={profileError}
                handleSaveProfile={handleSaveProfile}
                fileInputRef={fileInputRef}
                avatarUploading={avatarUploading}
                handleAvatarChange={handleAvatarChange}
                handleRemoveAvatar={handleRemoveAvatar}
                passwordForm={passwordForm}
                setPasswordForm={setPasswordForm}
                passwordSaving={passwordSaving}
                passwordSuccess={passwordSuccess}
                passwordError={passwordError}
                handleChangePassword={handleChangePassword}
                getPasswordStrength={getPasswordStrength}
                getPasswordStrengthLabel={getPasswordStrengthLabel}
              />
            )}
          </>
        )}
      </main>

      {/* Modals Component */}
      <DashboardModals
        showAddPatientModal={showAddPatientModal}
        setShowAddPatientModal={setShowAddPatientModal}
        newPatientForm={newPatientForm}
        setNewPatientForm={setNewPatientForm}
        handleAddPatient={handleAddPatient}
        showAddMaladieModal={showAddMaladieModal}
        setShowAddMaladieModal={setShowAddMaladieModal}
        newMaladieForm={newMaladieForm}
        setNewMaladieForm={setNewMaladieForm}
        handleAddMaladie={handleAddMaladie}
        showAssignMaladieModal={showAssignMaladieModal}
        setShowAssignMaladieModal={setShowAssignMaladieModal}
        assignMaladieForm={assignMaladieForm}
        setAssignMaladieForm={setAssignMaladieForm}
        handleAssignMaladie={handleAssignMaladie}
        showAddMesureModal={showAddMesureModal}
        setShowAddMesureModal={setShowAddMesureModal}
        newMesureForm={newMesureForm}
        setNewMesureForm={setNewMesureForm}
        handleMeasureTypeChange={handleMeasureTypeChange}
        handleAddMesure={handleAddMesure}
        showAddSymptomeModal={showAddSymptomeModal}
        setShowAddSymptomeModal={setShowAddSymptomeModal}
        newSymptomeForm={newSymptomeForm}
        setNewSymptomeForm={setNewSymptomeForm}
        handleAddSymptome={handleAddSymptome}
        selectedPatient={selectedPatient}
        setSelectedPatient={setSelectedPatient}
        predictingRisk={predictingRisk}
        predictionResult={predictionResult}
        handlePredictRisk={handlePredictRisk}
        patients={patients}
        maladies={maladies}
      />
    </div>
  );
};

export default DashboardPage;
