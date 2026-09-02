import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuth from '../hooks/useAuth';
import InputField from '../components/InputField';
import Button from '../components/Button';

export const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMsg('Veuillez remplir l\'identifiant et le mot de passe.');
      return;
    }

    setErrorMsg(null);
    try {
      await login({
        usernameOrEmail: usernameOrEmail.trim(),
        password: password.trim(),
      });
    } catch (err: any) {
      console.error('Login error:', err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Impossible de se connecter. Vérifiez vos identifiants et votre connexion.';
      setErrorMsg(message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="pulse" size={44} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>MediSuivi</Text>
          <Text style={styles.appTagline}>Espace Patient Télé-Monitoring</Text>
        </View>

        {/* Login Form Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Saisissez vos identifiants pour accéder à votre espace de suivi.</Text>

          {errorMsg ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" style={styles.errorIcon} />
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
            </View>
          ) : null}

          <InputField
            label="Identifiant ou Adresse Email"
            placeholder="patient@medsuivi.com"
            value={usernameOrEmail}
            onChangeText={setUsernameOrEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            icon={<Ionicons name="mail-outline" size={20} color="#64748B" />}
          />

          <InputField
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            icon={<Ionicons name="lock-closed-outline" size={20} color="#64748B" />}
          />

          <TouchableOpacity
            style={styles.togglePasswordBtn}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.togglePasswordText}>
              {showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            </Text>
          </TouchableOpacity>

          <Button
            title="Se Connecter"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginBtn}
          />
        </View>

        {/* Support Footer */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={16} color="#64748B" />
          <Text style={styles.footerText}> Données médicales protégées & sécurisées</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 14,
    color: '#2DD4BF',
    marginTop: 4,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.35)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#FB7185',
    fontWeight: '600',
  },
  togglePasswordBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  togglePasswordText: {
    fontSize: 13,
    color: '#2DD4BF',
    fontWeight: '600',
  },
  loginBtn: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
});

export default LoginScreen;
