import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBrand?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  icon,
  title = 'MedSuivi',
  subtitle,
  showBrand = true,
}) => {
  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-1" aria-hidden="true" />
      <div className="auth-blob auth-blob-2" aria-hidden="true" />

      <div className="auth-container auth-animate">
        {showBrand && (
          <div className="text-center mb-8">
            <div className="brand-icon">
              <span className="brand-icon-ring" />
              <span className="brand-icon-ring brand-icon-ring-2" />
              {icon ?? (
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
            </div>
            <h1 className="brand-title">{title}</h1>
            {subtitle && <p className="brand-subtitle">{subtitle}</p>}
          </div>
        )}

        {children}

        <p className="auth-footer">
          © 2025 MedSuivi — Plateforme réservée aux professionnels de santé
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
