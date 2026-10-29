import React, { useState, useEffect } from 'react';
import { profileService, careerService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  User,
  Compass,
  Clock,
  Lock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { logout, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [careers, setCareers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      profileService.getProfile(),
      careerService.listCareers(),
    ])
      .then(([pRes, cRes]) => {
        setProfile(pRes.data);
        setCareers(cRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      await profileService.updateProfile({
        full_name: profile.full_name,
        college: profile.college,
        degree: profile.degree,
        branch: profile.branch,
        graduation_year: Number(profile.graduation_year),
        bio: profile.bio,
        target_career_id: Number(profile.target_career_id),
        weekly_learning_hours: Number(profile.weekly_learning_hours),
        learning_pace: profile.learning_pace,
        preferred_learning_style: profile.preferred_learning_style,
      });
      await refreshUser();
      setSuccess('Profile and preferences updated successfully.');
    } catch (err: any) {
      setError('Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    try {
      await authService.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordStatus('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordStatus(err.response?.data?.detail || 'Failed to change password.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete your account and all associated assessment records?')) return;
    try {
      await profileService.deleteAccount();
      logout();
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-violet-400" />
          <span>Profile & Platform Settings</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Manage your student credentials, career targets, study availability, and security settings.
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-[#101321] border border-[#1F2438] rounded-2xl p-6 md:p-8 shadow-card-glow">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-6">
          <User className="w-4 h-4 text-cyan-400" />
          <span>Academic & Learning Profile</span>
        </h3>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.full_name || ''}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={profile.email || ''}
                className="w-full bg-[#080912] border border-[#1F2438] opacity-50 rounded-xl px-3 py-2 text-xs text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">College or University</label>
              <input
                type="text"
                value={profile.college || ''}
                onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Branch / Major</label>
              <input
                type="text"
                value={profile.branch || ''}
                onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Target Career Role</label>
              <select
                value={profile.target_career_id || ''}
                onChange={(e) => setProfile({ ...profile, target_career_id: Number(e.target.value) })}
                className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                {careers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Weekly Study Commitment: <strong className="text-cyan-400 font-mono">{profile.weekly_learning_hours} hrs/week</strong>
              </label>
              <input
                type="range"
                min={5}
                max={40}
                value={profile.weekly_learning_hours || 10}
                onChange={(e) => setProfile({ ...profile, weekly_learning_hours: Number(e.target.value) })}
                className="w-full accent-cyan-400 bg-[#080912] rounded-lg h-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-300 mb-1">Student Bio</label>
              <textarea
                rows={3}
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 rounded-xl font-medium text-xs text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 shadow-neon-violet flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Box */}
      <div className="bg-[#101321] border border-[#1F2438] rounded-2xl p-6 md:p-8 shadow-card-glow">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-4">
          <Lock className="w-4 h-4 text-violet-400" />
          <span>Security & Password</span>
        </h3>

        {passwordStatus && (
          <div className="p-3 mb-4 rounded-xl bg-[#080912] border border-[#1F2438] text-xs text-cyan-300">
            {passwordStatus}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">New Password (Min. 6 chars)</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="py-2 px-5 rounded-xl text-xs font-medium text-white bg-[#17192B] border border-violet-500/30 hover:border-violet-500/60 transition-all"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-950/10 border border-rose-500/20 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-rose-400 flex items-center space-x-2 mb-1">
          <Trash2 className="w-4 h-4" />
          <span>Danger Zone</span>
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Permanently remove your student account, uploaded resumes, learning documents, and all assessment history.
        </p>

        <button
          onClick={handleDeleteAccount}
          className="py-2 px-4 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all"
        >
          Delete Account & Purge Data
        </button>
      </div>
    </div>
  );
};
