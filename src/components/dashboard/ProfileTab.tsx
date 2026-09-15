import React, { useState } from 'react';
import type { UserDTO } from '../../services/authService';
import { pwdStrengthTextColor } from '../../utils/dashboardClasses';

export interface ProfileTabProps {
  user: UserDTO | null;
  medecinId: number | null;
  profileForm: { firstName: string; lastName: string; phone: string };
  setProfileForm: React.Dispatch<React.SetStateAction<{ firstName: string; lastName: string; phone: string }>>;
  profileEditMode: boolean;
  setProfileEditMode: (val: boolean) => void;
  profileSaving: boolean;
  profileSuccess: string;
  profileError: string;
  handleSaveProfile: () => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  avatarUploading: boolean;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleRemoveAvatar: () => Promise<void>;
  passwordForm: { current: string; newPwd: string; confirm: string };
  setPasswordForm: React.Dispatch<React.SetStateAction<{ current: string; newPwd: string; confirm: string }>>;
  passwordSaving: boolean;
  passwordSuccess: string;
  passwordError: string;
  handleChangePassword: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>;
  getPasswordStrength: (pwd: string) => number;
  getPasswordStrengthLabel: (score: number) => string;
}

const getBarColorClass = (index: number, score: number): string => {
  if (index > score) return 'bg-slate-800';
  if (score <= 1) return 'bg-rose-500';
  if (score === 2) return 'bg-amber-500';
  if (score === 3) return 'bg-teal-500';
  return 'bg-emerald-500';
};

const EyeIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

interface AvatarSectionProps {
  user: UserDTO | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  avatarUploading: boolean;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleRemoveAvatar: () => Promise<void>;
}

const AvatarSection: React.FC<AvatarSectionProps> = ({
  user,
  fileInputRef,
  avatarUploading,
  handleAvatarChange,
  handleRemoveAvatar,
}) => (
  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-800">
    <div className="relative group">
      <div className="dash-avatar-lg">
        {user?.profilePictureUrl ? (
          <img
            src={user.profilePictureUrl}
            alt={`Dr. ${user?.firstName} ${user?.lastName}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl font-extrabold text-teal-300">
            {user?.firstName?.[0]?.toUpperCase() ?? 'D'}
            {user?.lastName?.[0]?.toUpperCase() ?? 'R'}
          </span>
        )}
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={avatarUploading}
        aria-label="Modifier la photo de profil"
        className="dash-btn-avatar-edit"
        title="Changer la photo"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <input
        id="profile-picture-input"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
        aria-label="Sélectionner une photo de profil"
      />
    </div>

    <div className="flex-1 text-center sm:text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-bold text-white">
            Dr. {user?.firstName} {user?.lastName}
          </h3>
          <p className="text-sm text-teal-400 font-medium">{user?.email}</p>
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-2">
          <span className="badge badge-source">{user?.role}</span>
          <span className="badge badge-risk-faible">Compte Actif</span>
        </div>
      </div>

      <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={avatarUploading}
          className="dash-btn-teal text-xs"
        >
          {avatarUploading ? 'Upload...' : 'Changer la photo'}
        </button>
        {user?.profilePictureUrl && (
          <button
            onClick={handleRemoveAvatar}
            disabled={avatarUploading}
            className="dash-btn-ghost text-xs"
          >
            Supprimer la photo
          </button>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-2">JPG, PNG, WebP (glissez-déposez)</p>
    </div>
  </div>
);

interface PersonalInfoSectionProps {
  user: UserDTO | null;
  medecinId: number | null;
  profileForm: { firstName: string; lastName: string; phone: string };
  setProfileForm: React.Dispatch<React.SetStateAction<{ firstName: string; lastName: string; phone: string }>>;
  profileEditMode: boolean;
  setProfileEditMode: (val: boolean) => void;
  profileSaving: boolean;
  profileSuccess: string;
  profileError: string;
  handleSaveProfile: () => Promise<void>;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  user,
  medecinId,
  profileForm,
  setProfileForm,
  profileEditMode,
  setProfileEditMode,
  profileSaving,
  profileSuccess,
  profileError,
  handleSaveProfile,
}) => (
  <div className="pt-6">
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-base font-bold text-white">Informations Personnelles</h4>
      {!profileEditMode ? (
        <button
          id="edit-profile-btn"
          onClick={() => {
            setProfileForm({
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
              phone: user?.phone || '',
            });
            setProfileEditMode(true);
          }}
          className="dash-btn-teal text-xs"
        >
          ✏️ Modifier mes informations
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setProfileEditMode(false)}
            disabled={profileSaving}
            className="dash-btn-ghost text-xs"
          >
            Annuler
          </button>
          <button
            id="save-profile-btn"
            onClick={handleSaveProfile}
            disabled={profileSaving}
            className="dash-btn-gradient text-xs"
          >
            {profileSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>

    {profileSuccess && (
      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-2.5 rounded-xl mb-4">
        ✓ {profileSuccess}
      </div>
    )}
    {profileError && (
      <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-2.5 rounded-xl mb-4">
        {profileError}
      </div>
    )}

    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="profile-firstName" className="dash-label dash-label-spaced">Prénom</label>
          {profileEditMode ? (
            <input
              id="profile-firstName"
              type="text"
              value={profileForm.firstName}
              onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
              className="dash-input dash-input-edit"
            />
          ) : (
            <div className="dash-field-readonly">{user?.firstName || '—'}</div>
          )}
        </div>
        <div>
          <label htmlFor="profile-lastName" className="dash-label dash-label-spaced">Nom</label>
          {profileEditMode ? (
            <input
              id="profile-lastName"
              type="text"
              value={profileForm.lastName}
              onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
              className="dash-input dash-input-edit"
            />
          ) : (
            <div className="dash-field-readonly">{user?.lastName || '—'}</div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="profile-phone" className="dash-label dash-label-spaced">Téléphone</label>
        {profileEditMode ? (
          <input
            id="profile-phone"
            type="tel"
            placeholder="ex: +216 XX XXX XXX"
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            className="dash-input dash-input-edit"
          />
        ) : (
          <div className="dash-field-readonly">
            {user?.phone || <span className="text-slate-400 italic">Non renseigné</span>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div>
          <label htmlFor="readonly-username" className="dash-label dash-label-spaced">
            Nom d'utilisateur <span className="text-xs text-slate-400 italic">(Non modifiable)</span>
          </label>
          <div id="readonly-username" className="dash-field-disabled">@{user?.username}</div>
        </div>
        <div>
          <label htmlFor="readonly-email" className="dash-label dash-label-spaced">
            Adresse Email <span className="text-xs text-slate-400 italic">(Non modifiable)</span>
          </label>
          <div id="readonly-email" className="dash-field-disabled">{user?.email}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div>
          <label htmlFor="readonly-role" className="dash-label dash-label-spaced">Rôle</label>
          <div id="readonly-role" className="dash-field-disabled">{user?.role}</div>
        </div>
        <div>
          <label htmlFor="readonly-statut" className="dash-label dash-label-spaced">Statut</label>
          <div id="readonly-statut" className="dash-field-disabled">
            <span className="text-emerald-400 font-semibold">Actif</span>
          </div>
        </div>
        <div>
          <label htmlFor="readonly-medecin-id" className="dash-label dash-label-spaced">ID Médecin</label>
          <div id="readonly-medecin-id" className="dash-field-disabled font-mono">
            {medecinId !== null ? `#${medecinId}` : 'En cours...'}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PasswordRequirementsList: React.FC<{ newPwd: string }> = ({ newPwd }) => {
  const isMinLength = newPwd.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPwd);
  const hasDigit = /\d/.test(newPwd);
  return (
    <ul className="text-xs text-slate-400 space-y-0.5">
      <li className={`flex items-center gap-1.5 ${isMinLength ? 'text-emerald-400' : ''}`}>
        <span>{isMinLength ? '✓' : '○'}</span> Minimum 8 caractères
      </li>
      <li className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-400' : ''}`}>
        <span>{hasUppercase ? '✓' : '○'}</span> Une majuscule
      </li>
      <li className={`flex items-center gap-1.5 ${hasDigit ? 'text-emerald-400' : ''}`}>
        <span>{hasDigit ? '✓' : '○'}</span> Un chiffre
      </li>
    </ul>
  );
};

interface PasswordStrengthIndicatorProps {
  pwd: string;
  getPasswordStrength: (pwd: string) => number;
  getPasswordStrengthLabel: (score: number) => string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  pwd,
  getPasswordStrength,
  getPasswordStrengthLabel,
}) => {
  if (pwd.length === 0) return null;
  const score = getPasswordStrength(pwd);
  const label = getPasswordStrengthLabel(score);
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${getBarColorClass(i, score)}`}
          />
        ))}
      </div>
      <p className={`text-xs font-semibold ${pwdStrengthTextColor(score)}`}>
        {label}
      </p>
    </div>
  );
};

interface ChangePasswordSectionProps {
  passwordForm: { current: string; newPwd: string; confirm: string };
  setPasswordForm: React.Dispatch<React.SetStateAction<{ current: string; newPwd: string; confirm: string }>>;
  passwordSaving: boolean;
  passwordSuccess: string;
  passwordError: string;
  handleChangePassword: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>;
  getPasswordStrength: (pwd: string) => number;
  getPasswordStrengthLabel: (score: number) => string;
}

const ChangePasswordSection: React.FC<ChangePasswordSectionProps> = ({
  passwordForm,
  setPasswordForm,
  passwordSaving,
  passwordSuccess,
  passwordError,
  handleChangePassword,
  getPasswordStrength,
  getPasswordStrengthLabel,
}) => {
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  return (
    <div className="pt-8 mt-8 border-t border-slate-800">
      <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
        <span>🔒 Changer de mot de passe</span>
      </h4>
      <p className="dash-panel-subtitle mb-4">Pour sécuriser votre compte, utilisez un mot de passe robuste d'au moins 8 caractères</p>

      {passwordSuccess && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-2.5 rounded-xl mb-4">
          ✓ {passwordSuccess}
        </div>
      )}
      {passwordError && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-2.5 rounded-xl mb-4">
          {passwordError}
        </div>
      )}

      <form id="change-password-form" onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current password */}
        <div>
          <label htmlFor="current-password" className="dash-label dash-label-spaced">Mot de passe actuel</label>
          <div className="relative">
            <input
              id="current-password"
              type={showCurrentPwd ? 'text' : 'password'}
              placeholder="••••••••"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
              className="dash-input pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPwd(!showCurrentPwd)}
              aria-label={showCurrentPwd ? 'Masquer le mot de passe actuel' : 'Afficher le mot de passe actuel'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showCurrentPwd ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div>
          <label htmlFor="new-password" className="dash-label dash-label-spaced">Nouveau mot de passe</label>
          <div className="relative">
            <input
              id="new-password"
              type={showNewPwd ? 'text' : 'password'}
              placeholder="••••••••"
              value={passwordForm.newPwd}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPwd: e.target.value })}
              className="dash-input pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPwd(!showNewPwd)}
              aria-label={showNewPwd ? 'Masquer le nouveau mot de passe' : 'Afficher le nouveau mot de passe'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showNewPwd ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <PasswordStrengthIndicator
            pwd={passwordForm.newPwd}
            getPasswordStrength={getPasswordStrength}
            getPasswordStrengthLabel={getPasswordStrengthLabel}
          />
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="confirm-password" className="dash-label dash-label-spaced">Confirmer le mot de passe</label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirmPwd ? 'text' : 'password'}
              placeholder="••••••••"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              className="dash-input pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPwd(!showConfirmPwd)}
              aria-label={showConfirmPwd ? 'Masquer la confirmation du mot de passe' : 'Afficher la confirmation du mot de passe'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showConfirmPwd ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* Submit row */}
        <div className="md:col-span-3 flex items-center justify-between pt-2 border-t border-slate-800 mt-2">
          <PasswordRequirementsList newPwd={passwordForm.newPwd} />
          <button
            id="submit-change-password"
            type="submit"
            disabled={passwordSaving}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {passwordSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Changement...
              </>
            ) : (
              'Mettre à jour le mot de passe'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export const ProfileTab: React.FC<ProfileTabProps> = (props) => (
  <div className="dash-section-sm max-w-4xl mx-auto">
    <div className="dash-toolbar-row">
      <div>
        <h2 className="text-xl font-bold text-white">Mon Profil Médecin</h2>
        <p className="dash-panel-subtitle">Gérez vos informations personnelles, votre photo de profil et votre mot de passe</p>
      </div>
    </div>

    <div className="dash-panel">
      <AvatarSection
        user={props.user}
        fileInputRef={props.fileInputRef}
        avatarUploading={props.avatarUploading}
        handleAvatarChange={props.handleAvatarChange}
        handleRemoveAvatar={props.handleRemoveAvatar}
      />
      <PersonalInfoSection
        user={props.user}
        medecinId={props.medecinId}
        profileForm={props.profileForm}
        setProfileForm={props.setProfileForm}
        profileEditMode={props.profileEditMode}
        setProfileEditMode={props.setProfileEditMode}
        profileSaving={props.profileSaving}
        profileSuccess={props.profileSuccess}
        profileError={props.profileError}
        handleSaveProfile={props.handleSaveProfile}
      />
      <ChangePasswordSection
        passwordForm={props.passwordForm}
        setPasswordForm={props.setPasswordForm}
        passwordSaving={props.passwordSaving}
        passwordSuccess={props.passwordSuccess}
        passwordError={props.passwordError}
        handleChangePassword={props.handleChangePassword}
        getPasswordStrength={props.getPasswordStrength}
        getPasswordStrengthLabel={props.getPasswordStrengthLabel}
      />
    </div>
  </div>
);
