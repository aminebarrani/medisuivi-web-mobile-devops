import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentTime = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const stats = [
    { label: 'Patients suivis', value: '24', icon: '👥', trend: '+2 ce mois' },
    { label: 'Consultations', value: '8', icon: '🩺', trend: 'Aujourd\'hui' },
    { label: 'Ordonnances', value: '12', icon: '📋', trend: 'Cette semaine' },
    { label: 'Messages', value: '3', icon: '💬', trend: 'Non lus' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Navbar */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg">MedSuivi</span>
              <span className="bg-teal-500/20 text-teal-400 text-xs font-medium px-2 py-0.5 rounded-full border border-teal-500/30">
                Médecin
              </span>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-medium">Dr. {user?.firstName} {user?.lastName}</p>
                  <p className="text-slate-400 text-xs">{user?.email}</p>
                </div>
              </div>
              <button
                id="logout-btn"
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 text-sm font-medium px-3 py-2 rounded-xl transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:block">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/20 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500 rounded-full filter blur-3xl opacity-10" />
          <div className="relative">
            <p className="text-slate-400 text-sm mb-1 capitalize">{currentTime}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Bienvenue, Dr. {user?.firstName} {user?.lastName} 👋
            </h1>
            <p className="text-slate-300 text-sm">
              Votre espace de suivi médical est prêt. Gérez vos patients et consultations en toute sécurité.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/8 hover:border-white/20 transition-all duration-200 hover:scale-[1.02] cursor-default"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-full px-2 py-0.5">{stat.trend}</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-slate-400 text-xs font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-200 cursor-pointer group">
            <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">Nouveau Patient</h3>
            <p className="text-slate-400 text-sm">Ajouter un nouveau patient à votre liste</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-200 cursor-pointer group">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">Planifier RDV</h3>
            <p className="text-slate-400 text-sm">Gérer votre agenda de consultations</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-200 cursor-pointer group">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">Ordonnances</h3>
            <p className="text-slate-400 text-sm">Créer et gérer vos ordonnances</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Votre Profil
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-slate-500 text-xs mb-1">Prénom</p>
              <p className="text-white text-sm font-medium">{user?.firstName || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Nom</p>
              <p className="text-white text-sm font-medium">{user?.lastName || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Nom d'utilisateur</p>
              <p className="text-white text-sm font-medium">@{user?.username || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Email</p>
              <p className="text-white text-sm font-medium">{user?.email || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Téléphone</p>
              <p className="text-white text-sm font-medium">{user?.phone || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Rôle</p>
              <span className="inline-flex items-center gap-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-medium px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full"></span>
                {user?.role || 'MEDECIN'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
