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
      const isNetworkError = err?.code === 'ERR_NETWORK' || err?.message === 'Network Error';
      if (isNetworkError) {
        console.warn('Login network error', err?.config?.baseURL || err?.config?.url);
      } else {
        console.error('Login error:', err);
      }
      const message = isNetworkError
        ? "Impossible de joindre le serveur. Vérifiez que le téléphone est sur le même Wi-Fi que le PC et que l'API tourne sur le port 8222."
        : err?.response?.data?.message ||
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
            icon={<Ionicons name="mail-outline" size={20} color="#8A847A" />}
          />

          <InputField
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            icon={<Ionicons name="lock-closed-outline" size={20} color="#8A847A" />}
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
          <Ionicons name="shield-checkmark" size={16} color="#8A847A" />
          <Text style={styles.footerText}> Données médicales protégées & sécurisées</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3EFE6',
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
    borderRadius: 24,
    backgroundColor: '#3D8B7A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#3D8B7A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C2A26',
  },
  appTagline: {
    fontSize: 14,
    color: '#3D8B7A',
    marginTop: 4,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#463A28',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E4DDD0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2A26',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6F6B64',
    marginBottom: 20,
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8ECEC',
    borderWidth: 1,
    borderColor: '#E8C6C6',
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
    color: '#C45C5C',
    fontWeight: '600',
  },
  togglePasswordBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  togglePasswordText: {
    fontSize: 13,
    color: '#3D8B7A',
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
    color: '#8A847A',
    fontWeight: '500',
  },
});

export default LoginScreen;
