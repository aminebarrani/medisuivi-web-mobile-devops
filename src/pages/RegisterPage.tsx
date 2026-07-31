import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import { ErrorIcon, SpinnerIcon } from '../components/auth/AlertIcon';

interface FormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validateStep1 = () => {
    if (!form.firstName || !form.lastName) {
      setError('Le prénom et le nom sont requis.');
      return false;
    }
    if (!form.username || form.username.length < 3) {
      setError("Le nom d'utilisateur doit comporter au moins 3 caractères.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Adresse email invalide.');
      return false;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        role: 'MEDECIN',
        active: true,
      });
      setSuccess('Compte créé avec succès ! Vous allez être redirigé...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || "Erreur lors de la création du compte. L'email ou le nom d'utilisateur est déjà utilisé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Inscription — Espace Médecin">
      <div className="step-track">
        <div className={`step-item ${currentStep >= 1 ? 'step-item-active' : 'step-item-inactive'}`}>
          <div className={`step-dot ${currentStep >= 1 ? 'step-dot-active' : 'step-dot-inactive'}`}>1</div>
          <span className="hidden sm:block">Identité</span>
        </div>
        <div className={`step-line ${currentStep >= 2 ? 'step-line-active' : 'step-line-inactive'}`} />
        <div className={`step-item ${currentStep >= 2 ? 'step-item-active' : 'step-item-inactive'}`}>
          <div className={`step-dot ${currentStep >= 2 ? 'step-dot-active' : 'step-dot-inactive'}`}>2</div>
          <span className="hidden sm:block">Accès</span>
        </div>
      </div>

      <div className="card-glass">
        {success ? (
          <div className="status-center py-6">
            <div className="status-icon">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="status-title">Compte créé !</h3>
            <p className="status-text">{success}</p>
          </div>
        ) : (
          <>
            <h2 className="card-title">
              {currentStep === 1 ? 'Informations personnelles' : 'Identifiants de connexion'}
            </h2>
            <p className="card-subtitle">
              {currentStep === 1 ? 'Dites-nous qui vous êtes' : 'Sécurisez votre compte'}
            </p>

            {error && (
              <div className="alert alert-error">
                <ErrorIcon />
                {error}
              </div>
            )}

            <div className="badge-role">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Profil : Médecin</span>
              <span className="badge-role-hint">Rôle fixé automatiquement</span>
            </div>

            {currentStep === 1 ? (
              <div className="form-stack">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="form-label-sm">Prénom</label>
                    <input id="firstName" name="firstName" type="text" value={form.firstName} onChange={handleChange} className="form-input" placeholder="Mohamed" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="form-label-sm">Nom</label>
                    <input id="lastName" name="lastName" type="text" value={form.lastName} onChange={handleChange} className="form-input" placeholder="Ben Ali" />
                  </div>
                </div>
                <div>
                  <label htmlFor="username" className="form-label-sm">Nom d'utilisateur</label>
                  <div className="form-input-icon-wrap">
                    <span className="form-input-icon text-sm">@</span>
                    <input id="username" name="username" type="text" value={form.username} onChange={handleChange} className="form-input form-input-with-icon" placeholder="dr.benali" />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="form-label-sm">
                    Téléphone <span className="text-slate-500 font-normal">(optionnel)</span>
                  </label>
                  <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className="form-input" placeholder="+216 XX XXX XXX" />
                </div>
                <button id="register-next" type="button" onClick={handleNextStep} className="btn btn-primary">
                  Continuer →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="form-stack">
                <div>
                  <label htmlFor="email" className="form-label-sm">Adresse email</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="form-input" placeholder="dr.benali@medsuivi.tn" />
                </div>
                <div>
                  <label htmlFor="password" className="form-label-sm">Mot de passe</label>
                  <div className="form-input-icon-wrap">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      className="form-input form-input-with-action"
                      placeholder="Min. 6 caractères"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="form-input-action">
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="form-label-sm">Confirmer le mot de passe</label>
                  <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="form-input" placeholder="Répétez le mot de passe" />
                </div>

                <div className="btn-row">
                  <button type="button" onClick={() => { setCurrentStep(1); setError(''); }} className="btn btn-secondary">
                    ← Retour
                  </button>
                  <button id="register-submit" type="submit" disabled={loading} className="btn btn-primary flex-1">
                    {loading ? (
                      <>
                        <SpinnerIcon />
                        Création...
                      </>
                    ) : (
                      "S'inscrire"
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        <div className="auth-footer-link">
          <p>
            Déjà inscrit ?{' '}
            <Link to="/login" className="link-accent">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
