import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import AuthLayout from '../components/auth/AuthLayout';
import { ErrorIcon, SpinnerIcon } from '../components/auth/AlertIcon';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Veuillez saisir votre adresse e-mail.');
      return;
    }
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      setSuccessMessage(res.message || 'Un e-mail de réinitialisation contenant votre code a été envoyé.');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || "Une erreur s'est produite. Veuillez vérifier votre adresse e-mail.");
    } finally {
      setLoading(false);
    }
  };

  const keyIcon = (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" />
    </svg>
  );

  return (
    <AuthLayout
      icon={keyIcon}
      title="Mot de passe oublié"
      subtitle="Récupérez l'accès à votre compte MedSuivi"
    >
      <div className="card-glass">
        {error && (
          <div className="alert alert-error">
            <ErrorIcon />
            {error}
          </div>
        )}

        {successMessage ? (
          <div className="status-center">
            <div className="status-icon-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="status-text text-teal-400 font-medium">
              {successMessage}
            </p>
            <div className="pt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => navigate('/reset-password')}
                className="btn btn-primary"
              >
                Saisir le code de réinitialisation
              </button>
              <Link to="/login" className="link-muted py-2">
                Retour à la connexion
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form-group">
            <div>
              <label htmlFor="email" className="form-label">
                Adresse e-mail du compte
              </label>
              <div className="form-input-icon-wrap">
                <span className="form-input-icon">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input form-input-with-icon"
                  placeholder="doctor@medsuivi.tn"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? (
                <>
                  <SpinnerIcon />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer le code de réinitialisation'
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="link-accent text-sm">
                ← Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
