import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileTab } from '../ProfileTab';
import type { UserDTO } from '../../../services/authService';

const user: UserDTO = {
  id: 5, username: 'dr', email: 'dr@test.com', firstName: 'Ali', lastName: 'Ben',
  role: 'MEDECIN', active: true, phone: '+216', profilePictureUrl: 'data:img',
};

function baseProps(over: Partial<React.ComponentProps<typeof ProfileTab>> = {}) {
  return {
    user, medecinId: 3,
    profileForm: { firstName: 'Ali', lastName: 'Ben', phone: '+216' },
    setProfileForm: vi.fn(),
    profileEditMode: false, setProfileEditMode: vi.fn(),
    profileSaving: false, profileSuccess: '', profileError: '',
    handleSaveProfile: vi.fn(),
    fileInputRef: { current: null } as any,
    avatarUploading: false,
    handleAvatarChange: vi.fn(),
    handleRemoveAvatar: vi.fn(),
    passwordForm: { current: '', newPwd: '', confirm: '' },
    setPasswordForm: vi.fn(),
    passwordSaving: false, passwordSuccess: '', passwordError: '',
    handleChangePassword: vi.fn(),
    getPasswordStrength: () => 3,
    getPasswordStrengthLabel: () => 'Fort',
    ...over,
  } as any;
}

describe('ProfileTab', () => {
  it('renders read-only profile with avatar and username', () => {
    render(<ProfileTab {...baseProps()} />);
    expect(screen.getByText(/Dr\./)).toBeInTheDocument();
    expect(screen.getByText('@dr')).toBeInTheDocument();
    expect(screen.getByAltText(/Dr\. Ali Ben/i)).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('shows initials fallback when no profile picture', () => {
    render(<ProfileTab {...baseProps({ user: { ...user, profilePictureUrl: undefined } })} />);
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('entering edit mode populates the form and renders inputs', () => {
    const props = baseProps();
    render(<ProfileTab {...props} />);
    fireEvent.click(screen.getByText(/Modifier mes informations/i));
    expect(props.setProfileEditMode).toHaveBeenCalledWith(true);
    expect(props.setProfileForm).toHaveBeenCalled();
  });

  it('edit mode renders editable inputs, success/error banners and save/cancel', () => {
    const props = baseProps({ profileEditMode: true, profileSuccess: 'OK!', profileError: 'Erreur' });
    render(<ProfileTab {...props} />);
    expect(screen.getByText(/OK!/)).toBeInTheDocument();
    expect(screen.getByText('Erreur')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'New' } });
    fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Name' } });
    fireEvent.change(screen.getByLabelText('Téléphone'), { target: { value: '+1' } });
    expect(props.setProfileForm).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Annuler'));
    expect(props.setProfileEditMode).toHaveBeenCalledWith(false);
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(props.handleSaveProfile).toHaveBeenCalled();
  });

  it('avatar buttons trigger file picker and removal', () => {
    const props = baseProps();
    render(<ProfileTab {...props} />);
    // React attaches the real <input> to fileInputRef.current; spy on its click
    const input = screen.getByLabelText('Sélectionner une photo de profil') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});

    fireEvent.click(screen.getByLabelText('Modifier la photo de profil'));
    expect(clickSpy).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Changer la photo'));
    expect(clickSpy).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByText('Supprimer la photo'));
    expect(props.handleRemoveAvatar).toHaveBeenCalled();
  });

  it('password section: toggles visibility, strength and submit', () => {
    const props = baseProps({
      passwordForm: { current: 'a', newPwd: 'Passw0rd', confirm: 'Passw0rd' },
      passwordSuccess: 'Changed', passwordError: 'Bad', passwordSaving: false,
    });
    render(<ProfileTab {...props} />);
    expect(screen.getByText(/Changed/)).toBeInTheDocument();
    expect(screen.getByText('Bad')).toBeInTheDocument();
    expect(screen.getByText('Fort')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Mot de passe actuel'), { target: { value: 'x' } });
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'y' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'y' } });
    expect(props.setPasswordForm).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Afficher le mot de passe actuel'));
    fireEvent.click(screen.getByLabelText('Afficher le nouveau mot de passe'));
    fireEvent.click(screen.getByLabelText('Afficher la confirmation du mot de passe'));

    fireEvent.submit(screen.getByText('Mettre à jour le mot de passe').closest('form')!);
    expect(props.handleChangePassword).toHaveBeenCalled();
  });

  it('password saving state shows spinner label and no strength when empty', () => {
    render(<ProfileTab {...baseProps({ passwordSaving: true, passwordForm: { current: '', newPwd: '', confirm: '' } })} />);
    expect(screen.getByText('Changement...')).toBeInTheDocument();
  });
});
