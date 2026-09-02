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
          <Ionicons name="person-circle-outline" size={38} color="#2DD4BF" />
        </TouchableOpacity>
      </View>

      {/* Doctor Info Banner */}
      {doctor && (
        <View style={styles.doctorBanner}>
          <Ionicons name="medkit" size={18} color="#2DD4BF" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorBannerTitle}>Médecin Référent : {doctor.name}</Text>
            <Text style={styles.doctorBannerSubtitle}>{doctor.specialite} {doctor.numeroOrdre ? `• Ordre: ${doctor.numeroOrdre}` : ''}</Text>
          </View>
        </View>
      )}

      {/* Risk Status Card */}
      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons name="shield-checkmark" size={24} color="#2DD4BF" />
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
          <Ionicons name="warning" size={24} color="#F59E0B" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertBannerTitle}>Alerte médicale active ({alertes.length})</Text>
            <Text style={styles.alertBannerText} numberOfLines={2}>{alertes[0].description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#F59E0B" />
        </TouchableOpacity>
      )}

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
        <ActivityIndicator size="large" color="#2DD4BF" style={{ marginVertical: 20 }} />
      ) : recentMesures.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="medical-outline" size={40} color="#64748B" />
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
    backgroundColor: '#020617',
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
    color: '#94A3B8',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
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
    color: '#2DD4BF',
  },
  doctorBannerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusCard: {
    marginBottom: 16,
    backgroundColor: '#0F172A',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginLeft: 8,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  alertBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FBBF24',
  },
  alertBannerText: {
    fontSize: 13,
    color: '#FCD34D',
    marginTop: 2,
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
    color: '#F8FAFC',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2DD4BF',
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
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default DashboardScreen;
