"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com';

export default function AccountPage() {
  const { user, token, refreshProfile, updateUser } = useAuth();
  const [saveSuccess, setSaveSuccess] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    address: '',
    birthday: '',
    gender: ''
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        contactNumber: (user as any).contactNumber || prev.contactNumber,
        address: (user as any).address || prev.address,
        birthday: (user as any).birthday ? new Date((user as any).birthday).toISOString().slice(0,10) : prev.birthday,
        gender: (user as any).gender || prev.gender
      }));
    }
  }, [user]);

  const handleWishlistClick = () => {};
  const handleCartClick = () => {};

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    const run = async () => {
      try {
        setSaveError('');
        setIsSaving(true);
        const newErrors: Record<string,string> = {};
        if (!profileData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!profileData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (profileData.contactNumber && !/^\+?[0-9\-\s]{7,15}$/.test(profileData.contactNumber)) newErrors.contactNumber = 'Enter a valid contact number';
        if (profileData.birthday && isNaN(Date.parse(profileData.birthday))) newErrors.birthday = 'Enter a valid date';
        if (profileData.gender && !['male','female','other'].includes(profileData.gender)) newErrors.gender = 'Invalid gender';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) { setIsSaving(false); return; }

        if (!token) {
          setSaveError('You must be logged in to update your profile.');
          setIsSaving(false);
          return;
        }

        let profilePictureUrl: string | undefined = undefined;
        if (avatarFile) {
          const form = new FormData();
          form.append('avatar', avatarFile);
          const uploadRes = await fetch(`${API_BASE_URL}/api/users/profile/avatar`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: form,
          });
          const uploadCt = uploadRes.headers.get('content-type') || '';
          const uploadJson = uploadCt.includes('application/json') ? await uploadRes.json() : { error: await uploadRes.text() } as any;
          if (!uploadRes.ok) throw new Error(uploadJson.error || 'Avatar upload failed');
          profilePictureUrl = uploadJson.url;
        }

        const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            profilePicture: profilePictureUrl,
            contactNumber: profileData.contactNumber || undefined,
            address: profileData.address || undefined,
            birthday: profileData.birthday || undefined,
            gender: profileData.gender || undefined,
          }),
        });
        const ct = res.headers.get('content-type') || '';
        const json = ct.includes('application/json') ? await res.json() : { error: await res.text() } as any;
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}${json.error ? `: ${json.error}` : ''}`);

        // Persist locally so it reflects after reload/logout/login
        updateUser({
          firstName: json.user.firstName,
          lastName: json.user.lastName,
          email: json.user.email,
          role: json.user.role,
          profilePicture: json.user.profilePicture,
          contactNumber: json.user.contactNumber,
          address: json.user.address,
          birthday: json.user.birthday,
          gender: json.user.gender,
        });
        await refreshProfile();
        setIsEditing(false);
        setSaveSuccess('Profile updated successfully');
      } catch (e) {
        console.error(e);
        setSaveError((e as any).message || 'Failed to save changes');
      } finally {
        setIsSaving(false);
      }
    };
    run();
  };

  const handleAvatarChange = (file?: File | null) => {
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    } else {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 ml-0 md:ml-[300px]">
      <div className="w-full max-w-[1200px] mx-auto py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                      <h1 className="text-2xl sm:text-3xl font-bold text-(--color-olive)">My Profile</h1>
                      <button
                        onClick={() => setIsEditing((v) => !v)}
                        className="px-4 py-2 rounded-full bg-(--color-green) text-white hover:bg-green-800 transition-modern text-sm font-semibold"
                      >
                        {isEditing ? 'Cancel' : 'Edit'}
                      </button>
                    </div>

                    {/* Profile Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center relative">
                        {avatarPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : user?.profilePicture ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-600 font-medium">
                            {(user?.firstName || 'U')[0]}
                            {(user?.lastName || 'N')[0]}
                          </span>
                        )}
                        {isEditing && (
                          <label className="absolute -bottom-2 -right-2 bg-(--color-green) text-white text-xs px-2 py-1 rounded cursor-pointer shadow">
                            Change Photo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
                            />
                          </label>
                        )}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Unnamed User'}
                        </div>
                        <div className="text-sm text-gray-600">{user?.email}</div>
                        {user?.role && (
                          <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {saveError && (
                      <div className="mb-4 text-sm text-red-600">{saveError}</div>
                    )}
                    {!isEditing && saveSuccess && (
                      <div className="relative mb-4 text-sm text-green-700 bg-green-100 border border-green-200 rounded px-3 py-2">
                        <span>{saveSuccess}</span>
                        <button
                          onClick={() => setSaveSuccess('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-green-800 hover:text-green-900"
                          aria-label="Close success message"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {/* Details */}
                    <div className="w-full max-w-[1200px]">
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={profileData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                className={`w-full px-4 py-3 border ${errors.firstName ? 'border-red-500' : 'border-gray-200'} bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600`}
                              />
                            ) : (
                              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                {user?.firstName || '-'}
                              </div>
                            )}
                            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={profileData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                className={`w-full px-4 py-3 border ${errors.lastName ? 'border-red-500' : 'border-gray-200'} bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600`}
                              />
                            ) : (
                              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                {user?.lastName || '-'}
                              </div>
                            )}
                            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                              {user?.email || '-'}
                            </div>
                          </div>

                          {/* Contact Number */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={profileData.contactNumber}
                                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                                className={`w-full px-4 py-3 border ${errors.contactNumber ? 'border-red-500' : 'border-gray-200'} bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600`}
                              />
                            ) : (
                              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                {(user as any)?.contactNumber || '-'}
                              </div>
                            )}
                            {errors.contactNumber && <p className="mt-1 text-xs text-red-600">{errors.contactNumber}</p>}
                          </div>

                          {/* Address */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={profileData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600"
                              />
                            ) : (
                              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                {(user as any)?.address || '-'}
                              </div>
                            )}
                          </div>

                          {/* Birthday */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
                            {isEditing ? (
                              <input
                                type="date"
                                value={profileData.birthday}
                                onChange={(e) => handleInputChange('birthday', e.target.value)}
                                className={`w-full px-4 py-3 border ${errors.birthday ? 'border-red-500' : 'border-gray-200'} bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-600`}
                              />
                            ) : (
                              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                                {(user as any)?.birthday ? new Date((user as any).birthday).toLocaleDateString() : '-'}
                              </div>
                            )}
                            {errors.birthday && <p className="mt-1 text-xs text-red-600">{errors.birthday}</p>}
                          </div>

                          {/* Gender */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                            {isEditing ? (
                              <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={profileData.gender === 'female'}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                  />
                                  <span className="text-gray-800">Female</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={profileData.gender === 'male'}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 "
                                  />
                                  <span className="text-gray-800">Male</span>
                                </label>
                              </div>
                            ) : (
                              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 capitalize">
                                {(user as any)?.gender || '-'}
                              </div>
                            )}
                            {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
                          </div>

                          {/* Role is not editable here */}
                        </div>

                        {isEditing && (
                          <div className="mt-8 flex justify-end">
                            <button
                              onClick={handleSaveChanges}
                              disabled={isSaving}
                              className={`bg-(--color-green) hover:bg-green-800 transition-modern text-white px-8 py-3 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-[12px] md:text-[16px] ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
        </div>
      </div>
    </div>
  );
}


