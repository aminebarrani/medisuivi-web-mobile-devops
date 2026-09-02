import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import useAuth from '../hooks/useAuth';
import suiviService from '../services/suiviService';
import { MEASURE_TYPES_CONFIG } from '../config/constants';
import { TypeMesure } from '../types';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Card from '../components/Card';
import { MainTabParamList } from '../navigation/types';

type NavigationProp = BottomTabNavigationProp<MainTabParamList, 'AddMeasure'>;

export const AddMeasureScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { patient } = useAuth();

  const [selectedType, setSelectedType] = useState<TypeMesure>('TENSION');
  const [valeurStr, setValeurStr] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentConfig = MEASURE_TYPES_CONFIG.find((m) => m.type === selectedType) || MEASURE_TYPES_CONFIG[0];

  const handleSubmit = async () => {
    if (!patient?.id) {
      Alert.alert('Erreur', 'Profil patient non disponible. Veuillez vous re-connecter.');
      return;
    }

    const numericValue = parseFloat(valeurStr.replace(',', '.'));
    if (isNaN(numericValue) || numericValue <= 0) {
      setErrorMsg('Veuillez saisir une valeur numérique valide (ex: 120 ou 1.2).');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      await suiviService.createMesure({
        patientId: patient.id,
        typeMesure: selectedType,
        valeur: numericValue,
        unite: currentConfig.unit,
      });

      Alert.alert(
        'Succès',
        `Votre mesure de ${currentConfig.label} (${numericValue} ${currentConfig.unit}) a été enregistrée avec succès !`,
        [
          {
            text: 'OK',
            onPress: () => {
              setValeurStr('');
              navigation.navigate('History');
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('Erreur ajout mesure:', err);
      setErrorMsg(
        err?.response?.data?.message || err?.message || 'Erreur lors de l\'enregistrement de la mesure.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Saisie de Mesure</Text>
          <Text style={styles.subtitle}>Sélectionnez le type de constante et saisissez la valeur observée.</Text>
        </View>

        {/* Source Badge Notice */}
        <View style={styles.sourceNotice}>
          <Ionicons name="information-circle-outline" size={20} color="#1D4ED8" />
          <Text style={styles.sourceNoticeText}>
            Source enregistrée : <Text style={{ fontWeight: '700' }}>PATIENT</Text> (Saisie manuelle)
          </Text>
        </View>

        {/* Measure Type Grid Selector */}
        <Text style={styles.labelSection}>1. Choisissez le type de mesure :</Text>
        <View style={styles.typeGrid}>
          {MEASURE_TYPES_CONFIG.map((item) => {
            const isSelected = selectedType === item.type;
            return (
              <TouchableOpacity
                key={item.type}
                style={[styles.typeTile, isSelected && styles.typeTileSelected]}
                onPress={() => {
                  setSelectedType(item.type as TypeMesure);
                  setErrorMsg(null);
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon as any}
                  size={26}
                  color={isSelected ? '#FFFFFF' : '#2DD4BF'}
                />
                <Text style={[styles.tileText, isSelected && styles.tileTextSelected]}>
                  {item.label}
                </Text>
                <Text style={[styles.unitBadgeText, isSelected && styles.unitBadgeTextSelected]}>
                  ({item.unit})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Value Input Section */}
        <Card style={styles.inputCard}>
          <Text style={styles.labelSection}>
            2. Valeur observée pour <Text style={{ color: '#2DD4BF' }}>{currentConfig.label}</Text> :
          </Text>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.inputRow}>
            <InputField
              placeholder={`Ex: ${currentConfig.defaultVal}`}
              value={valeurStr}
              onChangeText={setValeurStr}
              keyboardType="numeric"
              style={styles.valeurInput}
            />
            <View style={styles.unitBox}>
              <Text style={styles.unitBoxText}>{currentConfig.unit}</Text>
            </View>
          </View>

          <Button
            title="Enregistrer la Mesure"
            onPress={handleSubmit}
            loading={loading}
            icon={<Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />}
            style={{ marginTop: 16 }}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  sourceNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    padding: 12,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  sourceNoticeText: {
    fontSize: 13,
    color: '#2DD4BF',
    marginLeft: 8,
  },
  labelSection: {
    fontSize: 15,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeTile: {
    width: '48%',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  typeTileSelected: {
    backgroundColor: '#0D9488',
    borderColor: '#2DD4BF',
  },
  tileText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 8,
    textAlign: 'center',
  },
  tileTextSelected: {
    color: '#FFFFFF',
  },
  unitBadgeText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  unitBadgeTextSelected: {
    color: '#CCFBF1',
  },
  inputCard: {
    padding: 20,
    backgroundColor: '#0F172A',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valeurInput: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  unitBox: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginTop: -16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  unitBoxText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2DD4BF',
  },
  errorBox: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.35)',
  },
  errorText: {
    fontSize: 13,
    color: '#FB7185',
    fontWeight: '600',
  },
});

export default AddMeasureScreen;
