import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuth from '../hooks/useAuth';
import { STORAGE_KEYS, API_CONFIG } from '../config/constants';
import Card from '../components/Card';
import Button from '../components/Button';
import InputField from '../components/InputField';
import patientService from '../services/patientService';
import { DoctorDetails } from '../types';

export const ProfileScreen: React.FC = () => {
  const { user, patient, logout } = useAuth();
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [apiUrl, setApiUrl] = useState<string>(API_CONFIG.BASE_URL);
  const [isSavedUrl, setIsSavedUrl] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.API_URL).then((url) => {
      if (url) {
        setApiUrl(url);
      }
    });

    if (patient?.medecinId) {
      patientService.getDoctorDetails(patient.medecinId).then(setDoctor);
    }
  }, [patient?.medecinId]);

  const handleSaveApiUrl = async () => {
    try {
      if (!apiUrl.trim()) {
        await AsyncStorage.removeItem(STORAGE_KEYS.API_URL);
        setApiUrl(API_CONFIG.BASE_URL);
      } else {
        await AsyncStorage.setItem(STORAGE_KEYS.API_URL, apiUrl.trim());
      }
      setIsSavedUrl(true);
      Alert.alert('Configuration enregistrée', 'L\'adresse du serveur API Gateway a été mise à jour.');
      setTimeout(() => setIsSavedUrl(false), 3000);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder la configuration.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter de votre espace patient ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(user?.firstName?.[0] || user?.username?.[0] || 'P').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.nameText}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.emailText}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>COMPTE PATIENT</Text>
        </View>
      </View>

      {/* Patient Information Card */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Informations Personnelles</Text>

        <View style={styles.infoRow}>
          <Ionicons name="id-card-outline" size={20} color="#64748B" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Identifiant Patient (ID)</Text>
            <Text style={styles.infoValue}>#{patient?.id || 'Non assigné'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color="#64748B" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Nom d'utilisateur</Text>
            <Text style={styles.infoValue}>{user?.username || '-'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#64748B" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Téléphone</Text>
            <Text style={styles.infoValue}>{user?.phone || 'Non renseigné'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="transgender-outline" size={20} color="#64748B" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Sexe enregistré</Text>
            <Text style={styles.infoValue}>
              {patient?.sexe === 'M' || patient?.sexe === 'HOMME' ? 'Homme' : 'Femme'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="medkit-outline" size={20} color="#2DD4BF" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Médecin Référent</Text>
            <Text style={styles.infoValue}>
              {doctor ? doctor.name : (patient?.medecinId ? `Dr. #${patient.medecinId}` : 'Non attribué')}
            </Text>
            {doctor?.specialite ? (
              <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                Spécialité : {doctor.specialite} {doctor.numeroOrdre ? `• Ordre : ${doctor.numeroOrdre}` : ''}
              </Text>
            ) : null}
            {doctor?.email ? (
              <Text style={{ fontSize: 12, color: '#2DD4BF', marginTop: 1 }}>
                {doctor.email}
              </Text>
            ) : null}
          </View>
        </View>
      </Card>

      {/* Network / API Server Configuration */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Configuration Serveur API</Text>
        <Text style={styles.cardSubtitle}>
          Modifiez l'URL du serveur si vous le testez sur un téléphone physique ou un réseau local.
        </Text>

        <InputField
          label="Adresse URL API Gateway"
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://192.168.1.X:8080/api"
          autoCapitalize="none"
          icon={<Ionicons name="server-outline" size={20} color="#64748B" />}
        />

        <Button
          title={isSavedUrl ? '✓ Enregistré !' : 'Mettre à jour l\'URL'}
          onPress={handleSaveApiUrl}
          variant="outline"
        />
      </Card>

      {/* Logout Button */}
      <Button
        title="Se Déconnecter"
        onPress={handleLogout}
        variant="danger"
        style={styles.logoutBtn}
        icon={<Ionicons name="log-out-outline" size={22} color="#FFFFFF" />}
      />
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
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  emailText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2DD4BF',
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#0F172A',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoIcon: {
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: 12,
  },
});

export default ProfileScreen;
