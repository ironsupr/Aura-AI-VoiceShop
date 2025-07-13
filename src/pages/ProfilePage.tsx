import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Save, X, Camera, Package, Heart, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || ''
  });

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      await updateProfile({
        displayName: formData.displayName
      });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: user?.displayName || '',
      email: user?.email || ''
    });
    setIsEditing(false);
    setError('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
          <Link
            to="/login"
            className="btn-primary inline-block px-6 py-3"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 text-primary hover:text-blue-700"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center space-x-6">
            <div className="relative">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-50">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="input-field"
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="input-field bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{user.displayName}</h2>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.emailVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.emailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Link
            to="/orders"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Orders</h3>
                <p className="text-gray-600 text-sm">View order history</p>
              </div>
            </div>
          </Link>

          <Link
            to="/wishlist"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Wishlist</h3>
                <p className="text-gray-600 text-sm">Saved items</p>
              </div>
            </div>
          </Link>

          <Link
            to="/settings"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Settings</h3>
                <p className="text-gray-600 text-sm">Account settings</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
              <p className="text-gray-900">Recently</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <p className="text-gray-900">Personal</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voice Shopping</label>
              <p className="text-gray-900">Enabled</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notifications</label>
              <p className="text-gray-900">Email & Push</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
