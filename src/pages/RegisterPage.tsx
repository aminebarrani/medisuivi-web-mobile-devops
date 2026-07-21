import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      setError("Adresse email invalide.");
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

  const inputClass = "w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-teal-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl opacity-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1.5s' }} />

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl mb-4 shadow-lg shadow-teal-500/30">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">MedSuivi</h1>
          <p className="text-slate-400 mt-1 text-sm">Inscription — Espace Médecin</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6 gap-3">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-teal-400' : 'text-slate-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${currentStep >= 1 ? 'bg-teal-500/20 border-teal-500 text-teal-400' : 'border-slate-600 text-slate-600'}`}>1</div>
            <span className="text-xs font-medium hidden sm:block">Identité</span>
          </div>
          <div className={`h-px w-12 transition-all duration-300 ${currentStep >= 2 ? 'bg-teal-500' : 'bg-slate-700'}`} />
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-teal-400' : 'text-slate-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${currentStep >= 2 ? 'bg-teal-500/20 border-teal-500 text-teal-400' : 'border-slate-600 text-slate-600'}`}>2</div>
            <span className="text-xs font-medium hidden sm:block">Accès</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {success ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Compte créé !</h3>
              <p className="text-slate-400 text-sm">{success}</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">
                {currentStep === 1 ? 'Informations personnelles' : 'Identifiants de connexion'}
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                {currentStep === 1 ? 'Dites-nous qui vous êtes' : 'Sécurisez votre compte'}
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Role badge — always MEDECIN */}
              <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-xl px-4 py-2.5 mb-5">
                <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-teal-400 text-xs font-medium">Profil : Médecin</span>
                <span className="text-slate-500 text-xs ml-auto">Rôle fixé automatiquement</span>
              </div>

              {currentStep === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-xs font-medium text-slate-300 mb-1.5">Prénom</label>
                      <input id="firstName" name="firstName" type="text" value={form.firstName} onChange={handleChange} className={inputClass} placeholder="Mohamed" />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-xs font-medium text-slate-300 mb-1.5">Nom</label>
                      <input id="lastName" name="lastName" type="text" value={form.lastName} onChange={handleChange} className={inputClass} placeholder="Ben Ali" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-xs font-medium text-slate-300 mb-1.5">Nom d'utilisateur</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-sm">@</span>
                      <input id="username" name="username" type="text" value={form.username} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="dr.benali" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-slate-300 mb-1.5">Téléphone <span className="text-slate-500">(optionnel)</span></label>
                    <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className={inputClass} placeholder="+216 XX XXX XXX" />
                  </div>
                  <button
                    id="register-next"
                    type="button"
                    onClick={handleNextStep}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-teal-500/25 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Continuer →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1.5">Adresse email</label>
                    <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="dr.benali@medsuivi.tn" />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-xs font-medium text-slate-300 mb-1.5">Mot de passe</label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        className={`${inputClass} pr-10`}
                        placeholder="Min. 6 caractères"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300">
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-300 mb-1.5">Confirmer le mot de passe</label>
                    <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className={inputClass} placeholder="Répétez le mot de passe" />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setCurrentStep(1); setError(''); }}
                      className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium py-3 px-4 rounded-xl text-sm transition-all duration-200"
                    >
                      ← Retour
                    </button>
                    <button
                      id="register-submit"
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-teal-500/25 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
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

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Déjà inscrit ?{' '}
              <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2025 MedSuivi — Plateforme réservée aux professionnels de santé
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
