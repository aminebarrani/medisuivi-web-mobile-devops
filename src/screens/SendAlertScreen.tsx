import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuth from '../hooks/useAuth';
import suiviService from '../services/suiviService';
import patientService from '../services/patientService';
import { NiveauRisque, SourceAlerte, AlerteDTO, DoctorDetails } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';

interface RiskOption {
  level: NiveauRisque;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const RISK_OPTIONS: RiskOption[] = [
  {
    level: 'CRITIQUE',
    label: 'Critique (Urgence Immédiate)',
    description: 'Symptômes graves, détresse vitale immédiate.',
    color: '#F43F5E',
    bgColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: 'rgba(244, 63, 94, 0.4)',
    icon: 'flame',
  },
  {
    level: 'ELEVE',
    label: 'Élevé (Urgent)',
    description: 'Douleur aiguë, anomalie sévère ou malaise prononcé.',
    color: '#FB923C',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.4)',
    icon: 'alert-circle',
  },
  {
    level: 'MODERE',
    label: 'Modéré (Important)',
    description: 'Gêne persistante, question urgente sur le traitement.',
    color: '#FBBF24',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    icon: 'warning',
  },
  {
    level: 'FAIBLE',
    label: 'Faible (Informatif)',
    description: 'Simple remarque ou évolution à signaler au médecin.',
    color: '#2DD4BF',
    bgColor: 'rgba(20, 184, 166, 0.15)',
    borderColor: 'rgba(20, 184, 166, 0.4)',
    icon: 'information-circle',
  },
];

const PRESET_SYMPTOMS = [
  'Douleur thoracique / Oppression',
  'Difficulté respiratoire / Essoufflement',
  'Vertiges / Malaise soudain',
  'Fièvre élevée (> 38.5°C)',
  'Palpitations cardiaques anormales',
  'Effet indésirable de médicament',
  'Pic ou chute de glycémie',
  'Tension artérielle anormale',
  'Nausées / Vomissements sévères',
];

export const SendAlertScreen: React.FC = () => {
  const { patient } = useAuth();
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);

  // Form states
  const [selectedRisk, setSelectedRisk] = useState<NiveauRisque>('ELEVE');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // History states
  const [alertHistory, setAlertHistory] = useState<AlerteDTO[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'SEND' | 'HISTORY'>('SEND');

  // Load doctor details
  useEffect(() => {
    if (patient?.medecinId) {
      patientService.getDoctorDetails(patient.medecinId).then(setDoctor).catch(() => {});
    }
  }, [patient?.medecinId]);

  // Load patient alert history
  const loadAlertHistory = useCallback(async () => {
    if (!patient?.id) {
      setLoadingHistory(false);
      return;
    }
    try {
      const data = await suiviService.getAlertesByPatient(patient.id);
      const sorted = (data || []).sort(
        (a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
      );
      setAlertHistory(sorted);
    } catch (err) {
      console.warn('Erreur chargement historique alertes:', err);
    } finally {
      setLoadingHistory(false);
      setRefreshing(false);
    }
  }, [patient?.id]);

  useEffect(() => {
    loadAlertHistory();
  }, [loadAlertHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAlertHistory();
  };

  const handleSelectPreset = (preset: string) => {
    if (selectedPreset === preset) {
      setSelectedPreset(null);
    } else {
      setSelectedPreset(preset);
      if (!note.includes(preset)) {
        setNote((prev) => (prev.trim() ? `${preset}\n${prev}` : preset));
      }
    }
  };

  const handleSendAlert = async () => {
    if (!patient?.id) {
      Alert.alert('Erreur', 'Identifiant patient introuvable. Veuillez vous reconnecter.');
      return;
    }

    if (!note.trim()) {
      setFormError('Veuillez ajouter une description ou sélectionner un motif pour votre alerte.');
      return;
    }

    setFormError(null);
    setSubmitting(true);

    try {
      await suiviService.createAlerte({
        patientId: patient.id,
        niveauRisque: selectedRisk,
        source: 'SYMPTOME',
        description: note.trim(),
      });

      // Reset form
      setNote('');
      setSelectedPreset(null);
      setSelectedRisk('ELEVE');

      // Refresh list
      await loadAlertHistory();

      Alert.alert(
        '🚨 Alerte Transmise',
        `Votre alerte (${selectedRisk}) et votre note ont été synchronisées et transmises immédiatement au Dr. ${
          doctor ? doctor.name : ''
        }.`,
        [
          {
            text: 'Voir le suivi',
            onPress: () => setActiveTab('HISTORY'),
          },
          { text: 'OK' },
        ]
      );
    } catch (err: any) {
      console.error('Erreur envoi alerte:', err);
      setFormError(
        err?.response?.data?.message ||
          err?.message ||
          "Une erreur est survenue lors de l'envoi de l'alerte."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmergencyCall = () => {
    const phoneNumber = Platform.OS === 'android' ? 'tel:15' : 'telprompt:15';
    Linking.openURL(phoneNumber).catch(() => {
      Alert.alert('Numéro d\'urgence', 'Veuillez composer le 15 (SAMU) ou le 112 directement depuis votre téléphone.');
    });
  };

  const selectedRiskObj = RISK_OPTIONS.find((r) => r.level === selectedRisk) || RISK_OPTIONS[1];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header / Mode Switch */}
      <View style={styles.topBar}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'SEND' && styles.tabBtnActive]}
            onPress={() => setActiveTab('SEND')}
          >
            <Ionicons
              name="paper-plane"
              size={18}
              color={activeTab === 'SEND' ? '#DC2626' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabText, activeTab === 'SEND' && styles.tabTextActiveSend]}>
              Nouvelle Alerte
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'HISTORY' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('HISTORY');
              loadAlertHistory();
            }}
          >
            <Ionicons
              name="notifications"
              size={18}
              color={activeTab === 'HISTORY' ? '#2563EB' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabText, activeTab === 'HISTORY' && styles.tabTextActiveHistory]}>
              Suivi ({alertHistory.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'SEND' ? (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Doctor Destination Banner */}
          <View style={styles.doctorBanner}>
            <View style={styles.doctorIconBox}>
              <Ionicons name="medical" size={22} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.doctorBannerTitle}>Destinataire :</Text>
              <Text style={styles.doctorBannerName}>
                {doctor ? `Dr. ${doctor.name}` : patient?.medecinId ? `Dr. #${patient.medecinId}` : 'Médecin traitant'}
              </Text>
              {doctor?.specialite && (
                <Text style={styles.doctorBannerSpecialty}>{doctor.specialite}</Text>
              )}
            </View>
            <View style={styles.liveSyncBadge}>
              <View style={styles.liveSyncDot} />
              <Text style={styles.liveSyncText}>Synchro Directe</Text>
            </View>
          </View>

          {/* Emergency Call Box for Vital Situations */}
          {selectedRisk === 'CRITIQUE' && (
            <TouchableOpacity
              style={styles.emergencyBox}
              onPress={handleEmergencyCall}
              activeOpacity={0.85}
            >
              <View style={styles.emergencyIconBox}>
                <Ionicons name="call" size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.emergencyTitle}>URGENCE VITALE IMMÉDIATE ?</Text>
                <Text style={styles.emergencySubtitle}>
                  Appelez le 15 (SAMU) ou le 112 sans attendre.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* 1. Urgency Level Selection */}
          <Text style={styles.sectionHeader}>1. Sélectionnez le niveau d'urgence :</Text>
          <View style={styles.riskGrid}>
            {RISK_OPTIONS.map((opt) => {
              const isSelected = selectedRisk === opt.level;
              return (
                <TouchableOpacity
                  key={opt.level}
                  style={[
                    styles.riskCard,
                    {
                      backgroundColor: isSelected ? opt.bgColor : '#FFFFFF',
                      borderColor: isSelected ? opt.color : '#E2E8F0',
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedRisk(opt.level)}
                  activeOpacity={0.75}
                >
                  <View style={styles.riskCardHeader}>
                    <Ionicons name={opt.icon} size={20} color={opt.color} />
                    <Text
                      style={[
                        styles.riskCardTitle,
                        { color: isSelected ? opt.color : '#1E293B' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  <Text style={styles.riskCardDesc}>{opt.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 2. Quick Symptoms Presets */}
          <Text style={styles.sectionHeader}>2. Motifs & Symptômes Fréquents :</Text>
          <View style={styles.presetContainer}>
            {PRESET_SYMPTOMS.map((preset) => {
              const isSelected = selectedPreset === preset;
              return (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetChip,
                    isSelected && styles.presetChipSelected,
                  ]}
                  onPress={() => handleSelectPreset(preset)}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      isSelected && styles.presetChipTextSelected,
                    ]}
                  >
                    {preset}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 3. Detailed Note / Description */}
          <Text style={styles.sectionHeader}>3. Note ou Message pour le Médecin :</Text>
          <Card style={styles.noteCard}>
            <TextInput
              style={styles.textInput}
              placeholder="Décrivez précisément ce que vous ressentez (durée, intensité, déclencheurs, prise de médicaments...)"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={note}
              onChangeText={(text) => {
                setNote(text);
                if (formError) setFormError(null);
              }}
            />
            <View style={styles.noteFooter}>
              <Text style={styles.charCount}>{note.length} caractères</Text>
              {note.length > 0 && (
                <TouchableOpacity onPress={() => setNote('')}>
                  <Text style={styles.clearBtnText}>Effacer</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>

          {/* Form Error Banner */}
          {formError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}

          {/* Submit Alert Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: selectedRiskObj.color },
              submitting && { opacity: 0.7 },
            ]}
            onPress={handleSendAlert}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="notifications" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>
                  Transmettre l'Alerte au Médecin
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* Alert History and Live Status View */
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
          }
        >
          <View style={styles.historyHeader}>
            <Text style={styles.historyHeaderTitle}>Vos Alertes Transmises</Text>
            <Text style={styles.historyHeaderSub}>
              Suivez en direct l'état de traitement de vos alertes par le médecin.
            </Text>
          </View>

          {loadingHistory ? (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
          ) : alertHistory.length === 0 ? (
            <Card style={styles.emptyHistoryCard}>
              <Ionicons name="checkmark-done-circle-outline" size={56} color="#10B981" />
              <Text style={styles.emptyHistoryTitle}>Aucune alerte active</Text>
              <Text style={styles.emptyHistoryText}>
                Vous n'avez transmis aucune alerte médicale récente. En cas de problème ou de malaise, utilisez l'onglet "Nouvelle Alerte".
              </Text>
            </Card>
          ) : (
            alertHistory.map((item) => {
              const riskCfg =
                RISK_OPTIONS.find((r) => r.level === item.niveauRisque) || RISK_OPTIONS[2];
              const dateStr = item.dateCreation
                ? new Date(item.dateCreation).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '-';

              return (
                <Card key={item.id} style={styles.alertHistoryCard}>
                  {/* Top Bar of Alert Card */}
                  <View style={styles.alertCardTop}>
                    <View
                      style={[
                        styles.riskBadge,
                        { backgroundColor: riskCfg.bgColor, borderColor: riskCfg.borderColor },
                      ]}
                    >
                      <Ionicons name={riskCfg.icon} size={14} color={riskCfg.color} style={{ marginRight: 4 }} />
                      <Text style={[styles.riskBadgeText, { color: riskCfg.color }]}>
                        {item.niveauRisque}
                      </Text>
                    </View>

                    {/* Status Badge: Treated or In Progress */}
                    {item.traitee ? (
                      <View style={styles.statusTreatedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#15803D" style={{ marginRight: 4 }} />
                        <Text style={styles.statusTreatedText}>Traitée par le médecin</Text>
                      </View>
                    ) : (
                      <View style={styles.statusPendingBadge}>
                        <Ionicons name="time" size={14} color="#B45309" style={{ marginRight: 4 }} />
                        <Text style={styles.statusPendingText}>En attente de prise en charge</Text>
                      </View>
                    )}
                  </View>

                  {/* Alert Description / Note */}
                  <Text style={styles.alertCardDescription}>{item.description}</Text>

                  {/* Footer with timestamp and source */}
                  <View style={styles.alertCardFooter}>
                    <View style={styles.dateRow}>
                      <Ionicons name="calendar-outline" size={13} color="#94A3B8" style={{ marginRight: 4 }} />
                      <Text style={styles.alertCardDate}>{dateStr}</Text>
                    </View>
                    <Text style={styles.alertCardSource}>Source: {item.source || 'PATIENT'}</Text>
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#091124',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActiveSend: {
    color: '#F43F5E',
    fontWeight: '700',
  },
  tabTextActiveHistory: {
    color: '#2DD4BF',
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  doctorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  doctorIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(20, 184, 166, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  doctorBannerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2DD4BF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  doctorBannerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  doctorBannerSpecialty: {
    fontSize: 12,
    color: '#94A3B8',
  },
  liveSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  liveSyncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 5,
  },
  liveSyncText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
  },
  emergencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  emergencyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  emergencySubtitle: {
    fontSize: 12,
    color: '#FEE2E2',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#CBD5E1',
    marginBottom: 10,
    marginTop: 4,
  },
  riskGrid: {
    gap: 8,
    marginBottom: 16,
  },
  riskCard: {
    padding: 14,
    borderRadius: 14,
  },
  riskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  riskCardDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    marginLeft: 28,
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetChip: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  presetChipSelected: {
    backgroundColor: '#0D9488',
    borderColor: '#2DD4BF',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  presetChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noteCard: {
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#0F172A',
  },
  textInput: {
    fontSize: 15,
    color: '#F8FAFC',
    minHeight: 100,
    lineHeight: 22,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
    marginTop: 8,
  },
  charCount: {
    fontSize: 11,
    color: '#64748B',
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F43F5E',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.35)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    color: '#FB7185',
    marginLeft: 8,
    flex: 1,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  historyHeader: {
    marginBottom: 16,
  },
  historyHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  historyHeaderSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyHistoryCard: {
    alignItems: 'center',
    padding: 32,
    marginTop: 20,
    backgroundColor: '#0F172A',
  },
  emptyHistoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 14,
  },
  emptyHistoryText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  alertHistoryCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#0F172A',
  },
  alertCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusTreatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  statusTreatedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34D399',
  },
  statusPendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  statusPendingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FBBF24',
  },
  alertCardDescription: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 12,
  },
  alertCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertCardDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  alertCardSource: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
});

export default SendAlertScreen;
