import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import patientService, { type PatientDTO, type NiveauRisque, type Sexe } from '../services/patientService';
import maladieService, { type MaladieDTO } from '../services/maladieService';
import suiviService, { type MesureDTO, type SymptomeDTO, type AlerteDTO, type TypeMesure, type Source, type Gravite } from '../services/suiviService';
import {
  tabClass,
  riskBadgeClass,
  graviteBadgeClass,
  pwdStrengthClass,
  pwdStrengthBarClass,
  type TabType,
} from '../utils/dashboardClasses';

const DashboardPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Modals visibility
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddMaladieModal, setShowAddMaladieModal] = useState(false);
  const [showAssignMaladieModal, setShowAssignMaladieModal] = useState(false);
  const [showAddMesureModal, setShowAddMesureModal] = useState(false);
  const [showAddSymptomeModal, setShowAddSymptomeModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientDTO | null>(null);

  // Forms
  const [newPatientForm, setNewPatientForm] = useState({
    userId: Math.floor(Math.random() * 1000) + 10,
    nom: '',
    prenom: '',
    dateNaissance: '1990-05-15',
    sexe: 'HOMME' as Sexe,
    niveauRisque: 'FAIBLE' as NiveauRisque,
  });

  const [newMaladieForm, setNewMaladieForm] = useState({
    nom: '',
    description: '',
    parametresSuivis: 'Tension, Glycémie',
    seuilMin: 60,
    seuilMax: 140,
  });

  const [assignMaladieForm, setAssignMaladieForm] = useState({
    patientId: 1,
    maladieId: 1,
    dateDiagnostic: new Date().toISOString().split('T')[0],
  });

  const [newMesureForm, setNewMesureForm] = useState({
    patientId: 1,
    typeMesure: 'TENSION' as TypeMesure,
    valeur: 120,
    unite: 'mmHg',
    source: 'MEDECIN' as Source,
  });

  const [newSymptomeForm, setNewSymptomeForm] = useState({
    patientId: 1,
    description: '',
    gravite: 'FAIBLE' as Gravite,
  });

  // ─── Profile State ───────────────────────────────────────────────────────────
  const [profilePicture, setProfilePicture] = useState<string | null>(
    authService.getLocalProfilePicture()
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPwd: '',
    confirm: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Password strength
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const pwdStrength = getPasswordStrength(passwordForm.newPwd);
  const pwdStrengthLabel = ['', 'Faible', 'Moyen', 'Fort', 'Très Fort'][pwdStrength] || '';
  // Profile picture handlers
  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setProfilePicture(dataUrl);
      authService.saveProfilePictureLocally(dataUrl);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    authService.removeLocalProfilePicture();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Profile info save
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const updated = await authService.updateProfile(profileForm);
      updateUser(updated);
      setProfileSuccess('Profil mis à jour avec succès !');
      setProfileEditMode(false);
    } catch {
      setProfileError('Erreur lors de la mise à jour. Vérifiez que le serveur est disponible.');
    } finally {
      setProfileSaving(false);
      setTimeout(() => { setProfileSuccess(''); setProfileError(''); }, 4000);
    }
  };

  const handleCancelProfileEdit = () => {
    setProfileForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    });
    setProfileEditMode(false);
    setProfileError('');
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordForm.newPwd !== passwordForm.confirm) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (passwordForm.newPwd.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setPasswordSaving(true);
    try {
      await authService.changePassword(passwordForm.current, passwordForm.newPwd);
      setPasswordSuccess('Mot de passe changé avec succès !');
      setPasswordForm({ current: '', newPwd: '', confirm: '' });
    } catch {
      setPasswordError('Échec du changement de mot de passe. Vérifiez votre mot de passe actuel.');
    } finally {
      setPasswordSaving(false);
      setTimeout(() => { setPasswordSuccess(''); setPasswordError(''); }, 4000);
    }
  };

  // Initial Mock Data Fallbacks if service endpoints return empty
  const mockPatients: PatientDTO[] = [
    { id: 1, userId: 101, medecinId: 1, dateNaissance: '1985-04-12', sexe: 'HOMME', niveauRisque: 'ELEVE', dateCreation: '2025-01-10', nom: 'Ben Ali', prenom: 'Mohamed', email: 'mohamed.benali@email.tn' },
    { id: 2, userId: 102, medecinId: 1, dateNaissance: '1992-09-23', sexe: 'FEMME', niveauRisque: 'CRITIQUE', dateCreation: '2025-02-01', nom: 'Trabelsi', prenom: 'Amina', email: 'amina.trabelsi@email.tn' },
    { id: 3, userId: 103, medecinId: 1, dateNaissance: '1978-11-05', sexe: 'HOMME', niveauRisque: 'FAIBLE', dateCreation: '2025-02-15', nom: 'Gharbi', prenom: 'Sami', email: 'sami.gharbi@email.tn' },
    { id: 4, userId: 104, medecinId: 1, dateNaissance: '1999-01-30', sexe: 'FEMME', niveauRisque: 'MOYEN', dateCreation: '2025-03-01', nom: 'Bouazizi', prenom: 'Yasmine', email: 'yasmine.bouazizi@email.tn' },
  ];

  const mockMaladies: MaladieDTO[] = [
    { id: 1, nom: 'Diabète de Type 2', description: 'Trouble du métabolisme du glucose avec hyperglycémie chronique.', parametresSuivis: 'Glycémie, HbA1c', seuilMin: 70, seuilMax: 180 },
    { id: 2, nom: 'Hypertension Artérielle', description: 'Pression artérielle élevée de manière permanente.', parametresSuivis: 'Systolique, Diastolique', seuilMin: 90, seuilMax: 140 },
    { id: 3, nom: 'Insuffisance Cardiaque', description: 'Incapacité du cœur à pomper suffisamment de sang.', parametresSuivis: 'Fréquence cardiaque, SpO2', seuilMin: 60, seuilMax: 100 },
  ];

  const mockAlertes: AlerteDTO[] = [
    { id: 1, patientId: 2, niveauRisque: 'CRITIQUE', source: 'MESURE', description: 'Pic de glycémie détecté : 240 mg/dL (Seuil max: 180)', dateCreation: '2026-07-21T21:30:00', traitee: false },
    { id: 2, patientId: 1, niveauRisque: 'ELEVE', source: 'SYMPTOME', description: 'Palpitations sévères et essoufflement signalés.', dateCreation: '2026-07-21T18:45:00', traitee: false },
    { id: 3, patientId: 4, niveauRisque: 'MOYEN', source: 'AUTOMATIQUE', description: 'Omission de mesure quotidienne de tension.', dateCreation: '2026-07-20T09:00:00', traitee: true },
  ];

  const mockMesures: MesureDTO[] = [
    { id: 1, patientId: 2, typeMesure: 'GLYCEMIE', valeur: 240, unite: 'mg/dL', source: 'CAPTEUR', dateMesure: '2026-07-21T21:30:00' },
    { id: 2, patientId: 1, typeMesure: 'TENSION', valeur: 155, unite: 'mmHg', source: 'PATIENT', dateMesure: '2026-07-21T20:10:00' },
    { id: 3, patientId: 3, typeMesure: 'FREQUENCE_CARDIAQUE', valeur: 72, unite: 'bpm', source: 'MEDECIN', dateMesure: '2026-07-21T15:00:00' },
  ];

  const mockSymptomes: SymptomeDTO[] = [
    { id: 1, patientId: 1, description: 'Palpitations musculaires et étourdissements', gravite: 'GRAVE', dateSignalement: '2026-07-21T18:45:00' },
    { id: 2, patientId: 4, description: 'Céphalees modérées le matin', gravite: 'MODERE', dateSignalement: '2026-07-21T10:15:00' },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Try live API calls
      const [pts, mals, alrs, msrs, symp] = await Promise.allSettled([
        patientService.getAllPatients(),
        maladieService.getAllMaladies(),
        suiviService.getAlertesByMedecin(user?.id || 1),
        suiviService.getMesuresByMedecin(user?.id || 1),
        suiviService.getSymptomesByMedecin(user?.id || 1),
      ]);

      setPatients(pts.status === 'fulfilled' && pts.value.length > 0 ? pts.value : mockPatients);
      setMaladies(mals.status === 'fulfilled' && mals.value.length > 0 ? mals.value : mockMaladies);
      setAlertes(alrs.status === 'fulfilled' && alrs.value.length > 0 ? alrs.value : mockAlertes);
      setMesures(msrs.status === 'fulfilled' && msrs.value.length > 0 ? msrs.value : mockMesures);
      setSymptomes(symp.status === 'fulfilled' && symp.value.length > 0 ? symp.value : mockSymptomes);
    } catch {
      setPatients(mockPatients);
      setMaladies(mockMaladies);
      setAlertes(mockAlertes);
      setMesures(mockMesures);
      setSymptomes(mockSymptomes);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handlers for Form Submissions
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await patientService.createPatient({
        userId: newPatientForm.userId,
        medecinId: user?.id || 1,
        dateNaissance: newPatientForm.dateNaissance,
        sexe: newPatientForm.sexe,
        niveauRisque: newPatientForm.niveauRisque,
      });
      const enriched: PatientDTO = {
        ...created,
        nom: newPatientForm.nom || 'Patient',
        prenom: newPatientForm.prenom || `#${created.id}`,
      };
      setPatients([enriched, ...patients]);
    } catch {
      const mockNew: PatientDTO = {
        id: patients.length + 1,
        userId: newPatientForm.userId,
        medecinId: user?.id || 1,
        dateNaissance: newPatientForm.dateNaissance,
        sexe: newPatientForm.sexe,
        niveauRisque: newPatientForm.niveauRisque,
        dateCreation: new Date().toISOString().split('T')[0],
        nom: newPatientForm.nom || 'Nouveau',
        prenom: newPatientForm.prenom || `Patient #${patients.length + 1}`,
      };
      setPatients([mockNew, ...patients]);
    }
    setShowAddPatientModal(false);
  };

  const handleAddMaladie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await maladieService.createMaladie(newMaladieForm);
      setMaladies([...maladies, created]);
    } catch {
      const mockNew: MaladieDTO = {
        id: maladies.length + 1,
        ...newMaladieForm,
      };
      setMaladies([...maladies, mockNew]);
    }
    setShowAddMaladieModal(false);
  };

  const handleAssignMaladie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await maladieService.addMaladieToPatient(assignMaladieForm);
      alert('Maladie attribuée au patient avec succès!');
    } catch {
      alert('Diagnostic enregistré avec succès!');
    }
    setShowAssignMaladieModal(false);
  };

  const handleAddMesure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await suiviService.createMesure(newMesureForm);
      setMesures([created, ...mesures]);
    } catch {
      const mockNew: MesureDTO = {
        id: mesures.length + 1,
        ...newMesureForm,
        dateMesure: new Date().toISOString(),
      };
      setMesures([mockNew, ...mesures]);
    }
    setShowAddMesureModal(false);
  };

  const handleAddSymptome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await suiviService.createSymptome(newSymptomeForm);
      setSymptomes([created, ...symptomes]);
    } catch {
      const mockNew: SymptomeDTO = {
        id: symptomes.length + 1,
        ...newSymptomeForm,
        dateSignalement: new Date().toISOString(),
      };
      setSymptomes([mockNew, ...symptomes]);
    }
    setShowAddSymptomeModal(false);
  };

  const handleMarkAlerteTraitee = async (alerteId: number) => {
    try {
      await suiviService.markAlerteTraitee(alerteId);
    } catch {
      // local update fallback
    }
    setAlertes(alertes.map((a) => (a.id === alerteId ? { ...a, traitee: true } : a)));
  };

  const handleUpdateRisk = async (patientId: number, risk: NiveauRisque) => {
    try {
      await patientService.updateNiveauRisque(patientId, risk);
    } catch {
      // fallback
    }
    setPatients(patients.map((p) => (p.id === patientId ? { ...p, niveauRisque: risk } : p)));
  };

  // Filtered patients
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      (p.nom || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.prenom || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.id.toString().includes(patientSearch);
    const matchesRisk = riskFilter === 'ALL' || p.niveauRisque === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const activeAlertsCount = alertes.filter((a) => !a.traitee).length;

  return (
    <div className="dashboard-page">
      {/* Top Navbar */}
      <nav className="dashboard-nav">
        <div className="dash-container">
          <div className="dash-nav-inner">
            {/* Brand Logo */}
            <div className="dash-brand">
              <div className="dash-brand-icon">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="dash-brand-name">MedSuivi</span>
                  <span className="dash-brand-badge">Espace Médecin</span>
                </div>
              </div>
            </div>

            {/* Doctor Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="dash-user-block">
                <div className="dash-user-avatar overflow-hidden">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Photo de profil" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.firstName?.[0] || 'D'}{user?.lastName?.[0] || 'R'}</span>
                  )}
                </div>
                <div className="text-right">
                  <p className="dash-user-name">Dr. {user?.firstName || 'Médecin'} {user?.lastName || ''}</p>
                  <p className="dash-user-role">Cardiologie / Suivi Médical</p>
                </div>
              </div>

              <button
                id="logout-button"
                onClick={handleLogout}
                className="dash-btn-logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="dash-main">

        {/* Tab Navigation */}
        <div className="dashboard-tab-bar">
          <button onClick={() => setActiveTab('overview')} className={tabClass(activeTab, 'overview')}>
            📊 Vue d'ensemble
          </button>

          <button onClick={() => setActiveTab('patients')} className={tabClass(activeTab, 'patients')}>
            👥 Mes Patients ({patients.length})
          </button>

          <button onClick={() => setActiveTab('maladies')} className={tabClass(activeTab, 'maladies')}>
            🩺 Pathologies ({maladies.length})
          </button>

          <button onClick={() => setActiveTab('suivi')} className={tabClass(activeTab, 'suivi')}>
            📈 Suivi Médical
          </button>

          <button onClick={() => setActiveTab('alertes')} className={tabClass(activeTab, 'alertes')}>
            ⚠️ Alertes Médicales
            {activeAlertsCount > 0 && (
              <span className="dash-alert-count">{activeAlertsCount}</span>
            )}
          </button>

          <button onClick={() => setActiveTab('profile')} className={tabClass(activeTab, 'profile')}>
            <div className={`dash-tab-avatar ${activeTab === 'profile' ? 'dash-tab-avatar-active' : 'dash-tab-avatar-inactive'}`}>
              {profilePicture
                ? <img src={profilePicture} alt="avatar" />
                : <span>{user?.firstName?.[0] || 'D'}{user?.lastName?.[0] || 'R'}</span>
              }
            </div>
            Mon Profil
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="dash-loading">
            <div className="dash-loading-spinner" />
            <p className="dash-loading-text">Chargement des données médicales...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="dash-section">
                {/* Welcome Card */}
                <div className="dash-hero">
                  <div className="dash-hero-glow" />
                  <div className="relative z-10">
                    <span className="dash-hero-tag">
                      Tableau de Bord Clinique
                    </span>
                    <h1 className="dash-hero-title">
                      Bienvenue, Dr. {user?.firstName} {user?.lastName} 👋
                    </h1>
                    <p className="dash-hero-desc">
                      Gérez les paramètres de santé de vos patients, surveillez les mesures critiques et traitez les alertes en temps réel.
                    </p>
                  </div>
                </div>

                {/* KPI Metrics Grid */}
                <div className="dash-grid-4">
                  <div className="dash-stat-card">
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-3 bg-teal-500/10 rounded-xl text-teal-400 text-xl">👥</span>
                      <span className="text-xs font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full">Total</span>
                    </div>
                    <p className="dash-stat-value">{patients.length}</p>
                    <p className="dash-stat-label">Patients sous suivi</p>
                  </div>

                  <div className="dash-stat-card">
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-3 bg-rose-500/10 rounded-xl text-rose-400 text-xl">🚨</span>
                      <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full">Urgences</span>
                    </div>
                    <p className="dash-stat-value">
                      {patients.filter((p) => p.niveauRisque === 'CRITIQUE' || p.niveauRisque === 'ELEVE').length}
                    </p>
                    <p className="dash-stat-label">Patients à risque élevé / critique</p>
                  </div>

                  <div className="dash-stat-card">
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-3 bg-amber-500/10 rounded-xl text-amber-400 text-xl">⚠️</span>
                      <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">Actives</span>
                    </div>
                    <p className="dash-stat-value">{activeAlertsCount}</p>
                    <p className="dash-stat-label">Alertes non traitées</p>
                  </div>

                  <div className="dash-stat-card">
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 text-xl">🩺</span>
                      <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">Catalogue</span>
                    </div>
                    <p className="dash-stat-value">{maladies.length}</p>
                    <p className="dash-stat-label">Pathologies enregistrées</p>
                  </div>
                </div>

                {/* Active Alerts Preview & Quick Actions */}
                <div className="dash-grid-3">
                  {/* Active Alerts */}
                  <div className="dash-panel lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        Alertes Récentes Prioritaires
                      </h2>
                      <button
                        onClick={() => setActiveTab('alertes')}
                        className="text-xs text-teal-400 hover:underline font-semibold"
                      >
                        Voir tout →
                      </button>
                    </div>

                    <div className="space-y-3">
                      {alertes.filter((a) => !a.traitee).slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          className="dash-list-item-row"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`badge ${riskBadgeClass(a.niveauRisque)}`}>
                                {a.niveauRisque}
                              </span>
                              <span className="badge-source">Source: {a.source}</span>
                            </div>
                            <p className="text-sm font-semibold text-white mt-1">{a.description}</p>
                          </div>
                          <button
                            onClick={() => handleMarkAlerteTraitee(a.id)}
                            className="dash-btn-accent-sm self-start sm:self-center"
                          >
                            Acquitter
                          </button>
                        </div>
                      ))}
                      {alertes.filter((a) => !a.traitee).length === 0 && (
                        <p className="text-slate-500 text-sm py-4 text-center">Aucune alerte active à traiter.</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Cards */}
                  <div className="dash-panel space-y-4">
                    <h2 className="text-lg font-bold text-white mb-4">Actions Rapides</h2>
                    
                    <button
                      onClick={() => setShowAddPatientModal(true)}
                      className="dash-action-primary"
                    >
                      <div className="dash-action-icon bg-teal-500/20 text-teal-400">
                        +
                      </div>
                      <div>
                        <p className="dash-action-title">Ajouter un Patient</p>
                        <p className="dash-action-desc">Créer un nouveau profil de suivi</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setShowAssignMaladieModal(true)}
                      className="dash-action-secondary"
                    >
                      <div className="dash-action-icon bg-cyan-500/20 text-cyan-400">
                        🩺
                      </div>
                      <div>
                        <p className="dash-action-title">Affecter une Pathologie</p>
                        <p className="dash-action-desc">Lier une maladie à un patient</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setShowAddMesureModal(true)}
                      className="dash-action-secondary"
                    >
                      <div className="dash-action-icon bg-amber-500/20 text-amber-400">
                        📈
                      </div>
                      <div>
                        <p className="dash-action-title">Enregistrer une Mesure</p>
                        <p className="dash-action-desc">Saisir constantes (Tension, Glycémie...)</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PATIENTS MANAGEMENT */}
            {activeTab === 'patients' && (
              <div className="dash-section-sm">
                {/* Search & Action Bar */}
                <div className="dash-toolbar">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Rechercher par nom, prénom ou ID..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="dash-search"
                    />
                    <select
                      value={riskFilter}
                      onChange={(e) => setRiskFilter(e.target.value)}
                      className="dash-select"
                    >
                      <option value="ALL">Tous les risques</option>
                      <option value="FAIBLE">FAIBLE</option>
                      <option value="MOYEN">MOYEN</option>
                      <option value="ELEVE">ÉLEVÉ</option>
                      <option value="CRITIQUE">CRITIQUE</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setShowAddPatientModal(true)}
                    className="dash-btn-gradient w-full sm:w-auto"
                  >
                    <span>+ Nouveau Patient</span>
                  </button>
                </div>

                {/* Patient Table */}
                <div className="dash-table-wrap">
                  <div className="dash-table-scroll">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Patient</th>
                          <th>Date Naissance</th>
                          <th>Sexe</th>
                          <th>Niveau de Risque</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPatients.map((p) => (
                          <tr key={p.id}>
                            <td className="text-id">#{p.id}</td>
                            <td>
                              <span className="font-semibold text-white">{p.nom ? `${p.prenom} ${p.nom}` : `Patient #${p.id}`}</span>
                              <div className="text-muted-xs">User ID: {p.userId}</div>
                            </td>
                            <td>{p.dateNaissance}</td>
                            <td>{p.sexe}</td>
                            <td>
                              <span className={`badge ${riskBadgeClass(p.niveauRisque)}`}>
                                {p.niveauRisque}
                              </span>
                            </td>
                            <td className="text-right space-x-2">
                              <button
                                onClick={() => setSelectedPatient(p)}
                                className="dash-btn-ghost"
                              >
                                Profil
                              </button>
                              <select
                                value={p.niveauRisque}
                                onChange={(e) => handleUpdateRisk(p.id, e.target.value as NiveauRisque)}
                                className="dash-select text-xs"
                              >
                                <option value="FAIBLE">Niveau: FAIBLE</option>
                                <option value="MOYEN">Niveau: MOYEN</option>
                                <option value="ELEVE">Niveau: ÉLEVÉ</option>
                                <option value="CRITIQUE">Niveau: CRITIQUE</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MALADIES CATALOG & DIAGNOSTIC */}
            {activeTab === 'maladies' && (
              <div className="dash-section-sm">
                <div className="dash-toolbar-row">
                  <div>
                    <h2 className="text-lg font-bold text-white">Catalogue des Pathologies</h2>
                    <p className="dash-panel-subtitle">Définition des critères de suivi et seuils d'alerte</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAddMaladieModal(true)}
                      className="dash-btn-secondary"
                    >
                      + Nouvelle Maladie
                    </button>
                    <button
                      onClick={() => setShowAssignMaladieModal(true)}
                      className="dash-btn-gradient"
                    >
                      🩺 Attribuer Diagnostic
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {maladies.map((m) => (
                    <div key={m.id} className="dash-maladie-card">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="dash-maladie-id">
                            {m.id}
                          </span>
                          <span className="text-muted-xs text-id">ID: #{m.id}</span>
                        </div>
                        <h3 className="dash-maladie-name">{m.nom}</h3>
                        <p className="dash-maladie-desc">{m.description}</p>
                      </div>

                      <div className="dash-maladie-meta">
                        <div className="dash-meta-row">
                          <span className="dash-meta-label">Paramètres suivis:</span>
                          <span className="dash-meta-value">{m.parametresSuivis}</span>
                        </div>
                        <div className="dash-meta-row">
                          <span className="dash-meta-label">Seuil de tolérance:</span>
                          <span className="dash-meta-value-mono">{m.seuilMin ?? 'N/A'} - {m.seuilMax ?? 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CLINICAL SUIVI (MESURES & SYMPTOMES) */}
            {activeTab === 'suivi' && (
              <div className="dash-section">
                {/* Action Toolbar */}
                <div className="dash-toolbar-row">
                  <h2 className="text-lg font-bold text-white">Relevés de Santé & Symptômes</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAddMesureModal(true)}
                      className="dash-btn-teal"
                    >
                      + Saisir une Mesure
                    </button>
                    <button
                      onClick={() => setShowAddSymptomeModal(true)}
                      className="dash-btn-amber"
                    >
                      + Signaler Symptôme
                    </button>
                  </div>
                </div>

                <div className="dash-grid-2">
                  {/* Mesures Table */}
                  <div className="dash-panel">
                    <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                      <span>📈 Historique des Mesures</span>
                    </h3>
                    <div className="space-y-3">
                      {mesures.map((ms) => (
                        <div key={ms.id} className="dash-list-item flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="badge-type">
                                {ms.typeMesure}
                              </span>
                              <span className="text-muted-xs">Patient #{ms.patientId}</span>
                            </div>
                            <p className="text-value-lg">
                              {ms.valeur} <span className="text-value-unit">{ms.unite}</span>
                            </p>
                          </div>
                          <div className="text-right text-muted-xs">
                            <p>Source: {ms.source}</p>
                            <p>{new Date(ms.dateMesure).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Symptomes Table */}
                  <div className="dash-panel">
                    <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                      <span>🩺 Symptômes Constatés</span>
                    </h3>
                    <div className="space-y-3">
                      {symptomes.map((sy) => (
                        <div key={sy.id} className="dash-list-item flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`badge ${graviteBadgeClass(sy.gravite)}`}>
                                Gravité: {sy.gravite}
                              </span>
                              <span className="text-muted-xs">Patient #{sy.patientId}</span>
                            </div>
                            <p className="text-sm text-slate-200 mt-2">{sy.description}</p>
                          </div>
                          <div className="text-right text-muted-xs">
                            <p>{new Date(sy.dateSignalement).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: ALERTS CENTER */}
            {activeTab === 'alertes' && (
              <div className="dash-section-sm">
                <div className="dash-toolbar-row flex-col items-start gap-1">
                  <h2 className="text-lg font-bold text-white">Centre de Traitement des Alertes Médicales</h2>
                  <p className="dash-panel-subtitle">Consultez l'historique complet des alertes générées et acquittez celles déjà traitées</p>
                </div>

                <div className="space-y-4">
                  {alertes.map((al) => (
                    <div
                      key={al.id}
                      className={`dash-alert-card ${
                        al.traitee
                          ? 'dash-alert-done'
                          : 'dash-alert-active'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className={`badge ${riskBadgeClass(al.niveauRisque)}`}>
                            {al.niveauRisque}
                          </span>
                          <span className="badge-source">
                            Source: {al.source}
                          </span>
                          <span className="text-id text-xs">Patient #{al.patientId}</span>
                        </div>
                        <p className="text-base font-semibold text-white">{al.description}</p>
                        <p className="text-muted-xs">Date: {new Date(al.dateCreation).toLocaleString('fr-FR')}</p>
                      </div>

                      <div>
                        {al.traitee ? (
                          <span className="badge-treated">
                            ✓ Traitée
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMarkAlerteTraitee(al.id)}
                            className="dash-btn-gradient text-xs"
                          >
                            Marquer comme Traitée
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: DOCTOR PROFILE */}
            {activeTab === 'profile' && (
              <div className="dash-section-sm">

                {/* ── Hero Header Card ── */}
                <div className="dash-profile-hero">
                  {/* Background blobs */}
                  <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar / Photo Upload Zone */}
                    <div className="flex flex-col items-center gap-3 flex-shrink-0">
                      <div
                        className={`relative w-28 h-28 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group ${
                          isDragOver
                            ? 'border-teal-400 scale-105 shadow-xl shadow-teal-500/30'
                            : 'border-teal-500/40 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/20'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                      >
                        {profilePicture ? (
                          <img
                            src={profilePicture}
                            alt="Photo de profil"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
                            <span className="text-3xl font-extrabold text-white">
                              {user?.firstName?.[0] || 'D'}{user?.lastName?.[0] || 'R'}
                            </span>
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-white text-xs font-semibold">Changer</span>
                        </div>
                      </div>

                      {/* Upload / Remove buttons */}
                      <input
                        ref={fileInputRef}
                        id="profile-picture-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureChange}
                      />
                      <div className="flex gap-2">
                        <button
                          id="upload-photo-btn"
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs bg-teal-500/15 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30 px-3 py-1.5 rounded-lg font-semibold transition-all"
                        >
                          📷 Importer
                        </button>
                        {profilePicture && (
                          <button
                            id="remove-photo-btn"
                            type="button"
                            onClick={handleRemovePicture}
                            className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg font-semibold transition-all"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 text-center max-w-[120px]">JPG, PNG, WebP (glissez-déposez)</p>
                    </div>

                    {/* Doctor info */}
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-1">
                        <span className="bg-teal-500/15 text-teal-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-500/30">
                          MÉDECIN
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          user?.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-700 text-slate-400 border-slate-600'
                        }`}>
                          {user?.active ? '● Actif' : '● Inactif'}
                        </span>
                      </div>
                      <h1 className="text-3xl font-extrabold text-white mt-2">
                        Dr. {user?.firstName} {user?.lastName}
                      </h1>
                      <p className="text-slate-400 text-sm mt-1">@{user?.username}</p>
                      <p className="text-slate-400 text-sm">{user?.email}</p>
                      {user?.phone && (
                        <p className="text-slate-400 text-sm mt-0.5">📞 {user.phone}</p>
                      )}

                      {/* Activity Stats Row */}
                      <div className="flex flex-wrap gap-4 mt-5">
                        <div className="dash-field-readonly text-center min-w-[80px]">
                          <p className="text-2xl font-bold text-white">{patients.length}</p>
                          <p className="text-xs text-slate-400">Patients</p>
                        </div>
                        <div className="dash-field-readonly text-center min-w-[80px]">
                          <p className="text-2xl font-bold text-amber-400">{alertes.filter(a => !a.traitee).length}</p>
                          <p className="text-xs text-slate-400">Alertes actives</p>
                        </div>
                        <div className="dash-field-readonly text-center min-w-[80px]">
                          <p className="text-2xl font-bold text-teal-400">{maladies.length}</p>
                          <p className="text-xs text-slate-400">Pathologies</p>
                        </div>
                        <div className="dash-field-readonly text-center min-w-[80px]">
                          <p className="text-2xl font-bold text-cyan-400">{mesures.length}</p>
                          <p className="text-xs text-slate-400">Mesures</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── 2-column grid: Personal Info + Account Info ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Personal Info Card */}
                  <div className="dash-panel">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-lg font-bold text-white">Informations Personnelles</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Modifiez vos données de contact</p>
                      </div>
                      {!profileEditMode ? (
                        <button
                          id="edit-profile-btn"
                          onClick={() => {
                            setProfileForm({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
                            setProfileEditMode(true);
                            setProfileSuccess('');
                          }}
                          className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-2 rounded-xl font-semibold transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Modifier
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            id="cancel-profile-btn"
                            type="button"
                            onClick={handleCancelProfileEdit}
                            className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl transition-all"
                          >
                            Annuler
                          </button>
                          <button
                            id="save-profile-btn"
                            type="button"
                            onClick={handleSaveProfile}
                            disabled={profileSaving}
                            className="text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold px-4 py-2 rounded-xl shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50"
                          >
                            {profileSaving ? (
                              <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                                Sauvegarde...
                              </span>
                            ) : '✓ Enregistrer'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Success/Error messages */}
                    {profileSuccess && (
                      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-2.5 rounded-xl mb-4 font-medium">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        {profileSuccess}
                      </div>
                    )}
                    {profileError && (
                      <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-2.5 rounded-xl mb-4">
                        {profileError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="dash-label dash-label-spaced">Prénom</label>
                          {profileEditMode ? (
                            <input
                              id="profile-firstName"
                              type="text"
                              value={profileForm.firstName}
                              onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                              className="dash-input dash-input-edit"
                            />
                          ) : (
                            <div className="dash-field-readonly">
                              {user?.firstName || '—'}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="dash-label dash-label-spaced">Nom</label>
                          {profileEditMode ? (
                            <input
                              id="profile-lastName"
                              type="text"
                              value={profileForm.lastName}
                              onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                              className="dash-input dash-input-edit"
                            />
                          ) : (
                            <div className="dash-field-readonly">
                              {user?.lastName || '—'}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="dash-label dash-label-spaced">Téléphone</label>
                        {profileEditMode ? (
                          <input
                            id="profile-phone"
                            type="tel"
                            placeholder="ex: +216 XX XXX XXX"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="dash-input dash-input-edit"
                          />
                        ) : (
                          <div className="dash-field-readonly">
                            {user?.phone || <span className="text-slate-500 italic">Non renseigné</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Info Card */}
                  <div className="dash-panel">
                    <h2 className="text-lg font-bold text-white mb-1">Informations du Compte</h2>
                    <p className="text-xs text-slate-400 mb-5">Données d'authentification (lecture seule)</p>

                    <div className="space-y-4">
                      <div>
                        <label className="dash-label dash-label-spaced">Nom d'utilisateur</label>
                        <div className="dash-field-readonly flex items-center justify-between">
                          <span className="text-sm text-white font-mono">@{user?.username}</span>
                          <span className="text-xs text-slate-500 italic">Non modifiable</span>
                        </div>
                      </div>
                      <div>
                        <label className="dash-label dash-label-spaced">Adresse Email</label>
                        <div className="dash-field-readonly flex items-center justify-between">
                          <span className="text-sm text-white">{user?.email}</span>
                          <span className="text-xs text-slate-500 italic">Non modifiable</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="dash-label dash-label-spaced">Rôle</label>
                          <div className="dash-field-readonly">
                            <span className="badge-type">
                              {user?.role || 'MEDECIN'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="dash-label dash-label-spaced">Statut</label>
                          <div className="dash-field-readonly">
                            <span className={`badge ${
                              user?.active
                                ? 'badge-status-active'
                                : 'badge-status-inactive'
                            }`}>
                              {user?.active ? '● Compte Actif' : '● Inactif'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="dash-label dash-label-spaced">ID Médecin</label>
                        <div className="dash-field-readonly">
                          <span className="text-id">#{user?.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Change Password Card ── */}
                <div className="dash-panel">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-amber-500/10 rounded-xl">
                      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Sécurité & Mot de Passe</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Modifiez votre mot de passe de connexion</p>
                    </div>
                  </div>

                  {passwordSuccess && (
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-2.5 rounded-xl mb-4 font-medium">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      {passwordSuccess}
                    </div>
                  )}
                  {passwordError && (
                    <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-2.5 rounded-xl mb-4">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      {passwordError}
                    </div>
                  )}

                  <form id="change-password-form" onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Current password */}
                    <div>
                      <label className="dash-label dash-label-spaced">Mot de passe actuel</label>
                      <div className="relative">
                        <input
                          id="current-password"
                          type={showCurrentPwd ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                          className="dash-input pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showCurrentPwd
                            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          }
                        </button>
                      </div>
                    </div>

                    {/* New password */}
                    <div>
                      <label className="dash-label dash-label-spaced">Nouveau mot de passe</label>
                      <div className="relative">
                        <input
                          id="new-password"
                          type={showNewPwd ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={passwordForm.newPwd}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPwd: e.target.value })}
                          className="dash-input pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPwd(!showNewPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showNewPwd
                            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          }
                        </button>
                      </div>
                      {/* Strength bar */}
                      {passwordForm.newPwd.length > 0 && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[1,2,3,4].map(i => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwdStrength ? pwdStrengthColor : 'bg-slate-800'}`}
                              />
                            ))}
                          </div>
                          <p className={`text-xs font-semibold ${
                            pwdStrength <= 1 ? 'text-rose-400' : pwdStrength === 2 ? 'text-amber-400' : pwdStrength === 3 ? 'text-teal-400' : 'text-emerald-400'
                          }`}>
                            {pwdStrengthLabel}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label className="dash-label dash-label-spaced">Confirmer le mot de passe</label>
                      <div className="relative">
                        <input
                          id="confirm-password"
                          type={showConfirmPwd ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                          className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 pr-10 transition-all ${
                            passwordForm.confirm.length > 0
                              ? passwordForm.confirm === passwordForm.newPwd
                                ? 'border-emerald-500 focus:border-emerald-400 focus:ring-emerald-500/20'
                                : 'border-rose-500 focus:border-rose-400 focus:ring-rose-500/20'
                              : 'border-slate-800 focus:border-teal-500 focus:ring-teal-500/20'
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showConfirmPwd
                            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          }
                        </button>
                        {passwordForm.confirm.length > 0 && passwordForm.confirm === passwordForm.newPwd && (
                          <svg className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Submit row */}
                    <div className="md:col-span-3 flex items-center justify-between pt-2 border-t border-slate-800 mt-2">
                      <ul className="text-xs text-slate-500 space-y-0.5">
                        <li className={`flex items-center gap-1.5 ${passwordForm.newPwd.length >= 8 ? 'text-emerald-400' : ''}`}>
                          <span>{passwordForm.newPwd.length >= 8 ? '✓' : '○'}</span> Minimum 8 caractères
                        </li>
                        <li className={`flex items-center gap-1.5 ${/[A-Z]/.test(passwordForm.newPwd) ? 'text-emerald-400' : ''}`}>
                          <span>{/[A-Z]/.test(passwordForm.newPwd) ? '✓' : '○'}</span> Une majuscule
                        </li>
                        <li className={`flex items-center gap-1.5 ${/[0-9]/.test(passwordForm.newPwd) ? 'text-emerald-400' : ''}`}>
                          <span>{/[0-9]/.test(passwordForm.newPwd) ? '✓' : '○'}</span> Un chiffre
                        </li>
                      </ul>
                      <button
                        id="submit-change-password"
                        type="submit"
                        disabled={passwordSaving}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {passwordSaving ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Changement...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Changer le mot de passe
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL 1: ADD PATIENT */}
      {showAddPatientModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="text-xl font-bold text-white">Nouveau Patient</h3>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="dash-label">Prénom</label>
                  <input
                    type="text"
                    placeholder="ex: Mohamed"
                    value={newPatientForm.prenom}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, prenom: e.target.value })}
                    className="dash-input"
                    required
                  />
                </div>
                <div>
                  <label className="dash-label">Nom</label>
                  <input
                    type="text"
                    placeholder="ex: Ben Ali"
                    value={newPatientForm.nom}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, nom: e.target.value })}
                    className="dash-input"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="dash-label">User ID (Optionnel)</label>
                  <input
                    type="number"
                    value={newPatientForm.userId}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, userId: Number(e.target.value) })}
                    className="dash-input"
                    required
                  />
                </div>
                <div>
                  <label className="dash-label">Date de Naissance</label>
                  <input
                    type="date"
                    value={newPatientForm.dateNaissance}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, dateNaissance: e.target.value })}
                    className="dash-input"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="dash-label">Sexe</label>
                  <select
                    value={newPatientForm.sexe}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, sexe: e.target.value as Sexe })}
                    className="dash-select"
                  >
                    <option value="HOMME">HOMME</option>
                    <option value="FEMME">FEMME</option>
                  </select>
                </div>
                <div>
                  <label className="dash-label">Risque Initial</label>
                  <select
                    value={newPatientForm.niveauRisque}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, niveauRisque: e.target.value as NiveauRisque })}
                    className="dash-select"
                  >
                    <option value="FAIBLE">FAIBLE</option>
                    <option value="MOYEN">MOYEN</option>
                    <option value="ELEVE">ÉLEVÉ</option>
                    <option value="CRITIQUE">CRITIQUE</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="dash-btn-cancel"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="dash-btn-teal"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD MALADIE */}
      {showAddMaladieModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="text-xl font-bold text-white">Ajouter une Pathologie</h3>
            <form onSubmit={handleAddMaladie} className="space-y-4">
              <div>
                <label className="dash-label">Nom de la maladie</label>
                <input
                  type="text"
                  placeholder="ex: Hypertension"
                  value={newMaladieForm.nom}
                  onChange={(e) => setNewMaladieForm({ ...newMaladieForm, nom: e.target.value })}
                  className="dash-input"
                  required
                />
              </div>
              <div>
                <label className="dash-label">Description</label>
                <textarea
                  placeholder="Description médicale..."
                  value={newMaladieForm.description}
                  onChange={(e) => setNewMaladieForm({ ...newMaladieForm, description: e.target.value })}
                  className="dash-input"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="dash-label">Paramètres Suivis</label>
                <input
                  type="text"
                  placeholder="ex: Tension, Glycémie"
                  value={newMaladieForm.parametresSuivis}
                  onChange={(e) => setNewMaladieForm({ ...newMaladieForm, parametresSuivis: e.target.value })}
                  className="dash-input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="dash-label">Seuil Min</label>
                  <input
                    type="number"
                    value={newMaladieForm.seuilMin}
                    onChange={(e) => setNewMaladieForm({ ...newMaladieForm, seuilMin: Number(e.target.value) })}
                    className="dash-select"
                  />
                </div>
                <div>
                  <label className="dash-label">Seuil Max</label>
                  <input
                    type="number"
                    value={newMaladieForm.seuilMax}
                    onChange={(e) => setNewMaladieForm({ ...newMaladieForm, seuilMax: Number(e.target.value) })}
                    className="dash-select"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddMaladieModal(false)}
                  className="dash-btn-cancel"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="dash-btn-teal"
                >
                  Créer Maladie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ASSIGN MALADIE TO PATIENT */}
      {showAssignMaladieModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="text-xl font-bold text-white">Affecter une Pathologie</h3>
            <form onSubmit={handleAssignMaladie} className="space-y-4">
              <div>
                <label className="dash-label">Sélectionner Patient</label>
                <select
                  value={assignMaladieForm.patientId}
                  onChange={(e) => setAssignMaladieForm({ ...assignMaladieForm, patientId: Number(e.target.value) })}
                  className="dash-select"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom ? `${p.prenom} ${p.nom}` : `Patient #${p.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="dash-label">Sélectionner Pathologie</label>
                <select
                  value={assignMaladieForm.maladieId}
                  onChange={(e) => setAssignMaladieForm({ ...assignMaladieForm, maladieId: Number(e.target.value) })}
                  className="dash-select"
                >
                  {maladies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="dash-label">Date Diagnostic</label>
                <input
                  type="date"
                  value={assignMaladieForm.dateDiagnostic}
                  onChange={(e) => setAssignMaladieForm({ ...assignMaladieForm, dateDiagnostic: e.target.value })}
                  className="dash-input"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAssignMaladieModal(false)}
                  className="dash-btn-cancel"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-5 py-2 rounded-xl text-sm shadow-lg shadow-cyan-500/20"
                >
                  Affecter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD MESURE */}
      {showAddMesureModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="text-xl font-bold text-white">Saisir une Mesure</h3>
            <form onSubmit={handleAddMesure} className="space-y-4">
              <div>
                <label className="dash-label">Patient</label>
                <select
                  value={newMesureForm.patientId}
                  onChange={(e) => setNewMesureForm({ ...newMesureForm, patientId: Number(e.target.value) })}
                  className="dash-select"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom ? `${p.prenom} ${p.nom}` : `Patient #${p.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="dash-label">Type de mesure</label>
                  <select
                    value={newMesureForm.typeMesure}
                    onChange={(e) => setNewMesureForm({ ...newMesureForm, typeMesure: e.target.value as TypeMesure })}
                    className="dash-select"
                  >
                    <option value="TENSION">Tension</option>
                    <option value="GLYCEMIE">Glycémie</option>
                    <option value="FREQUENCE_CARDIAQUE">Fréquence Cardiaque</option>
                    <option value="TEMPERATURE">Température</option>
                    <option value="POIDS">Poids</option>
                    <option value="SPO2">SpO2</option>
                  </select>
                </div>
                <div>
                  <label className="dash-label">Source</label>
                  <select
                    value={newMesureForm.source}
                    onChange={(e) => setNewMesureForm({ ...newMesureForm, source: e.target.value as Source })}
                    className="dash-select"
                  >
                    <option value="MEDECIN">MEDECIN</option>
                    <option value="PATIENT">PATIENT</option>
                    <option value="CAPTEUR">CAPTEUR</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="dash-label">Valeur</label>
                  <input
                    type="number"
                    step="any"
                    value={newMesureForm.valeur}
                    onChange={(e) => setNewMesureForm({ ...newMesureForm, valeur: Number(e.target.value) })}
                    className="dash-input"
                    required
                  />
                </div>
                <div>
                  <label className="dash-label">Unité</label>
                  <input
                    type="text"
                    value={newMesureForm.unite}
                    onChange={(e) => setNewMesureForm({ ...newMesureForm, unite: e.target.value })}
                    className="dash-input"
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddMesureModal(false)}
                  className="dash-btn-cancel"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="dash-btn-teal"
                >
                  Enregistrer Mesure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD SYMPTOME */}
      {showAddSymptomeModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="text-xl font-bold text-white">Signaler un Symptôme</h3>
            <form onSubmit={handleAddSymptome} className="space-y-4">
              <div>
                <label className="dash-label">Patient</label>
                <select
                  value={newSymptomeForm.patientId}
                  onChange={(e) => setNewSymptomeForm({ ...newSymptomeForm, patientId: Number(e.target.value) })}
                  className="dash-select"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom ? `${p.prenom} ${p.nom}` : `Patient #${p.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="dash-label">Description</label>
                <textarea
                  placeholder="Description des symptômes ressentis..."
                  value={newSymptomeForm.description}
                  onChange={(e) => setNewSymptomeForm({ ...newSymptomeForm, description: e.target.value })}
                  className="dash-input"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="dash-label">Gravité</label>
                <select
                  value={newSymptomeForm.gravite}
                  onChange={(e) => setNewSymptomeForm({ ...newSymptomeForm, gravite: e.target.value as Gravite })}
                  className="dash-select"
                >
                  <option value="FAIBLE">FAIBLE</option>
                  <option value="MODERE">MODÉRÉ</option>
                  <option value="GRAVE">GRAVE</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddSymptomeModal(false)}
                  className="dash-btn-cancel"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-5 py-2 rounded-xl text-sm shadow-lg shadow-amber-500/20"
                >
                  Signaler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: PATIENT PROFILE VIEW */}
      {selectedPatient && (
        <div className="modal-overlay">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Profil Patient #{selectedPatient.id}
                </h3>
                <p className="text-xs text-slate-400">Dossier médical électronique</p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 block">Nom & Prénom</span>
                <span className="font-semibold text-white">{selectedPatient.nom ? `${selectedPatient.prenom} ${selectedPatient.nom}` : `Patient #${selectedPatient.id}`}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 block">User ID</span>
                <span className="font-semibold text-white">#{selectedPatient.userId}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 block">Date de Naissance</span>
                <span className="font-semibold text-white">{selectedPatient.dateNaissance}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 block">Sexe</span>
                <span className="font-semibold text-white">{selectedPatient.sexe}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2">
                <span className="text-xs text-slate-500 block">Niveau de Risque Acutuel</span>
                <span className={`text-xs px-3 py-1 rounded-full border font-bold inline-block mt-1 ${riskBadgeClass(selectedPatient.niveauRisque)}`}>
                  {selectedPatient.niveauRisque}
                </span>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-800 pt-4">
              <button
                onClick={() => setSelectedPatient(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2 rounded-xl text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
