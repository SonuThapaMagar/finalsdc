import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/api';
import { toast } from 'react-toastify';
import { RiEdit2Line, RiSaveLine, RiCloseLine, RiAccountCircleFill } from 'react-icons/ri';

const PetCenterProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    shelterName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (!token || userRole !== 'ADMIN') {
      toast.error('Please log in to access profile');
      navigate('/admin/login');
      return;
    }
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setFetchError('');
      console.log('Fetching profile with token:', localStorage.getItem('token'));
      const response = await api.get('/api/admin/profile');
      console.log('Full API response:', JSON.stringify(response, null, 2));
      const data = response.data.data || response.data;
      setProfile({
        shelterName: data.shelterName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        description: data.description || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      const message = error.response?.data?.message || 'Failed to load profile. Please try again.';
      setFetchError(message);
      toast.error(message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!profile.shelterName.trim()) newErrors.shelterName = 'Shelter name is required.';
    if (!profile.email.trim()) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(profile.email)) newErrors.email = 'Invalid email format.';
    if (!profile.phone.trim()) newErrors.phone = 'Phone is required.';
    else if (!/^\+?[1-9]\d{0,15}$/.test(profile.phone.replace(/\s|-/g, ''))) {
      newErrors.phone = 'Invalid phone number format.';
    }
    if (!profile.address.trim()) newErrors.address = 'Address is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please correct the errors in the form.');
      return;
    }
    try {
      const updateRequest = {
        shelterName: profile.shelterName,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        description: profile.description || null, // Allow null for optional fields
      };
      await api.put('/api/admin/profile', updateRequest);
      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Save error:', error);
      const message = error.response?.data?.message || 'Failed to update profile. Please try again.';
      toast.error(message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        navigate('/admin/login');
      }
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setErrors({});
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Avatar Icon */}
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <RiAccountCircleFill className="text-blue-500 text-5xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Pet Center Profile</h1>
              <p className="text-gray-600 mt-2">Manage your pet center information</p>
            </div>
          </div>
          {!editing && !fetchError && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RiEdit2Line className="text-lg" />
              Edit Profile
            </button>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          {fetchError ? (
            <div className="text-red-600 text-center py-8">{fetchError}</div>
          ) : !editing ? (
            <div className="space-y-4">
              <div>
                <span className="block text-sm text-gray-500">Shelter Name</span>
                <span className="block text-lg text-gray-900 font-medium">
                  {profile.shelterName || 'Not provided'}
                </span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">Email</span>
                <span className="block text-lg text-gray-900">{profile.email || 'Not provided'}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">Phone</span>
                <span className="block text-lg text-gray-900">{profile.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">Address</span>
                <span className="block text-lg text-gray-900">{profile.address || 'Not provided'}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">Description</span>
                <span className="block text-lg text-gray-900">{profile.description || 'Not provided'}</span>
              </div>
            </div>
          ) : (
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="shelterName" className="block text-sm font-medium text-gray-700 mb-2">
                    Shelter Name *
                  </label>
                  <input
                    id="shelterName"
                    name="shelterName"
                    type="text"
                    value={profile.shelterName}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.shelterName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.shelterName && <p className="text-sm text-red-500 mt-1">{errors.shelterName}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={profile.address}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={profile.description}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <RiCloseLine className="text-lg" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RiSaveLine className="text-lg" />
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetCenterProfile;