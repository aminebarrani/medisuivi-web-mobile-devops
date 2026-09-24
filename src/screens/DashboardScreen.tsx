import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import useAuth from '../hooks/useAuth';
import suiviService from '../services/suiviService';
import patientService from '../services/patientService';
import { MesureDTO, AlerteDTO, DoctorDetails } from '../types';
import RiskBadge from '../components/RiskBadge';
import MeasureCard from '../components/MeasureCard';
import Card from '../components/Card';
import Button from '../components/Button';
import { MainTabParamList } from '../navigation/types';

type NavigationProp = BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, patient, refreshPatient } = useAuth();
  const [recentMesures, setRecentMesures] = useState<MesureDTO[]>([]);
  const [alertes, setAlertes] = useState<AlerteDTO[]>([]);
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<Awaited<ReturnType<typeof patientService.predictRisk>> | null>(null);

  const loadData = useCallback(async () => {
    try {
      // 1. Fetch fresh patient profile to ensure latest risk level is displayed
      const freshPatient = await refreshPatient();
      const currentPatient = freshPatient || patient;

      if (currentPatient?.medecinId) {
        patientService.getDoctorDetails(currentPatient.medecinId).then(setDoctor);
      }

      if (currentPatient?.id) {
        const [mesuresData, alertesData] = await Promise.all([
          suiviService.getMesuresByPatient(currentPatient.id),
          suiviService.getAlertesByPatient(currentPatient.id).catch(() => []),
        ]);

        const sortedMesures = mesuresData.sort(
          (a, b) => new Date(b.dateMesure).getTime() - new Date(a.dateMesure).getTime()
        );
        setRecentMesures(sortedMesures.slice(0, 3));
        setAlertes(alertesData.filter((a) => !a.traitee));
      }
    } catch (err) {
      console.warn('Erreur lors du chargement des données du tableau de bord:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [patient, refreshPatient]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAnalyze = async () => {
    if (!patient?.id || analyzing) return;
    setAnalyzing(true);
    try {
      const res = await patientService.predictRisk(patient.id);
      setAiResponse(res);
      await refreshPatient();
    } catch (err) {
      console.warn('Erreur analyse IA:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const patientName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`
    : user?.username || 'Patient';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour 👋</Text>
          <Text style={styles.userName}>{patientName}</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle-outline" size={38} color="#3D8B7A" />
        </TouchableOpacity>
      </View>

      {/* Doctor Info Banner */}
      {doctor && (
        <View style={styles.doctorBanner}>
          <Ionicons name="medkit" size={18} color="#3D8B7A" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorBannerTitle}>Médecin Référent : {doctor.name}</Text>
            <Text style={styles.doctorBannerSubtitle}>{doctor.specialite} {doctor.numeroOrdre ? `• Ordre: ${doctor.numeroOrdre}` : ''}</Text>
          </View>
        </View>
      )}

      {/* Risk Status Card */}
      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons name="shield-checkmark" size={24} color="#3D8B7A" />
          <Text style={styles.statusTitle}>État de Santé Général</Text>
        </View>
        <RiskBadge
          niveauRisque={patient?.niveauRisque || 'FAIBLE'}
          showExplanation={true}
        />
      </Card>

      {/* Untreated Alerts Notification if any */}
      {alertes.length > 0 && (
        <TouchableOpacity
          style={styles.alertBanner}
          onPress={() => navigation.navigate('Alert')}
          activeOpacity={0.85}
        >
          <Ionicons name="warning" size={24} color="#DC2626" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertBannerTitle}>Alerte médicale active ({alertes.length})</Text>
            <Text style={styles.alertBannerText} numberOfLines={2}>{alertes[0].description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#DC2626" />
        </TouchableOpacity>
      )}

      {/* MediSuivi AI — Analyse XAI */}
      <View style={styles.aiSection}>
        <TouchableOpacity
          style={styles.aiAnalyzeBtn}
          onPress={handleAnalyze}
          disabled={analyzing}
          activeOpacity={0.85}
        >
          <Ionicons name="sparkles" size={20} color="#7C3AED" style={{ marginRight: 8 }} />
          <Text style={styles.aiAnalyzeText}>
            {analyzing
              ? 'Analyse en cours...'
              : aiResponse
                ? "Relancer l'analyse IA"
                : 'Analyser mes constantes (IA)'}
          </Text>
        </TouchableOpacity>

        {aiResponse?.agent?.explication_patient && (
          <Card style={styles.aiExplanationCard}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={20} color="#7C3AED" />
              <Text style={styles.aiTitle}>
                {aiResponse.agent.synthese_titre || 'Analyse Intelligente de vos Constantes'}
              </Text>
            </View>
            <Text style={styles.aiSummary}>{aiResponse.agent.explication_patient.resume}</Text>

            <Text style={styles.aiSectionTitle}>Pourquoi ce niveau de risque ?</Text>
            {(aiResponse.agent.explication_patient.facteurs_declencheurs || []).map((facteur, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Ionicons name="trending-up" size={16} color="#DC2626" />
                <Text style={styles.bulletText}>{facteur}</Text>
              </View>
            ))}

            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>Conseils recommandés :</Text>
              {(aiResponse.agent.explication_patient.conseils_immediats || []).map((conseil, idx) => (
                <Text key={idx} style={styles.tipItem}>• {conseil}</Text>
              ))}
            </View>

            <Text style={styles.aiReassure}>{aiResponse.agent.explication_patient.message_rassurant}</Text>
          </Card>
        )}
      </View>

      {/* Quick Action Buttons: Add Measure & Send Alert */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.sosActionBtn}
          onPress={() => navigation.navigate('Alert')}
          activeOpacity={0.85}
        >
          <Ionicons name="alert-circle" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.sosActionTitle}>🚨 Signaler une Alerte Médecin</Text>
            <Text style={styles.sosActionSubtitle}>Transmettre un malaise, douleur ou note urgente</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FEE2E2" />
        </TouchableOpacity>

        <Button
          title="+ Saisir une nouvelle mesure"
          onPress={() => navigation.navigate('AddMeasure')}
          style={styles.addBtn}
          icon={<Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />}
        />
      </View>

      {/* Recent Measurements Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Dernières Mesures</Text>
        <TouchableOpacity onPress={() => navigation.navigate('History')}>
          <Text style={styles.seeAllText}>Voir tout ({recentMesures.length})</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3D8B7A" style={{ marginVertical: 20 }} />
      ) : recentMesures.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="medical-outline" size={40} color="#8A847A" />
          <Text style={styles.emptyText}>Aucune mesure enregistrée pour le moment.</Text>
          <Text style={styles.emptySubtext}>Cliquez sur le bouton ci-dessus pour ajouter votre première mesure.</Text>
        </Card>
      ) : (
        recentMesures.map((m) => <MeasureCard key={m.id} mesure={m} />)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3EFE6',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  greeting: {
    fontSize: 14,
    color: '#6F6B64',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C2A26',
  },
  profileBtn: {
    padding: 4,
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
  doctorBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D8B7A',
  },
  doctorBannerSubtitle: {
    fontSize: 12,
    color: '#6F6B64',
    marginTop: 2,
  },
  statusCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2A26',
    marginLeft: 8,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.4)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  alertBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  alertBannerText: {
    fontSize: 13,
    color: '#7F1D1D',
    marginTop: 2,
  },
  aiSection: {
    marginBottom: 16,
  },
  aiAnalyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.35)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  aiAnalyzeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C3AED',
  },
  aiExplanationCard: {
    marginTop: 12,
    borderColor: 'rgba(124, 58, 237, 0.25)',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7C3AED',
    marginLeft: 8,
    flex: 1,
  },
  aiSummary: {
    fontSize: 14,
    color: '#2C2A26',
    lineHeight: 20,
    marginBottom: 12,
  },
  aiSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6F6B64',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletText: {
    fontSize: 13,
    color: '#2C2A26',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  tipsBox: {
    backgroundColor: 'rgba(61, 139, 122, 0.08)',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3D8B7A',
    marginBottom: 4,
  },
  tipItem: {
    fontSize: 13,
    color: '#2C2A26',
    lineHeight: 19,
  },
  aiReassure: {
    fontSize: 12,
    color: '#6F6B64',
    fontStyle: 'italic',
    marginTop: 10,
    lineHeight: 17,
  },
  actionsContainer: {
    marginBottom: 20,
    gap: 10,
  },
  sosActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 14,
    padding: 14,
    elevation: 3,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  sosActionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sosActionSubtitle: {
    fontSize: 12,
    color: '#FEE2E2',
    marginTop: 2,
  },
  addBtn: {
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C2A26',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3D8B7A',
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CBD5E1',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#8A847A',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default DashboardScreen;
