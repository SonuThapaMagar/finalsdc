// src/pages/user/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../api/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email input, 2: OTP input, 3: New password
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors = {};
    if (!formData.otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = 'OTP must be a 6-digit number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail()) {
      toast.error('Please enter a valid email');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/forgotPassword', { email: formData.email });
      toast.success(response.data.message || 'OTP sent to your email!');
      setStep(2);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!validateOtp()) {
      toast.error('Please enter a valid OTP');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/verifyOtp', {
        email: formData.email,
        otpCode: formData.otp,
      });
      toast.success(response.data.message || 'OTP verified successfully!');
      setStep(3);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid or expired OTP';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post(`/api/auth/resetPassword?newPassword=${formData.newPassword}`, {
        email: formData.email,
      });
      toast.success(response.data.message || 'Password reset successfully!');
      setFormData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
              <p className="text-sm text-gray-600">
                {step === 1 ? 'Enter your email to receive an OTP' : step === 2 ? 'Enter the OTP sent to your email' : 'Set your new password'}
              </p>
            </div>
          </div>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="email"
              onSubmit={handleSendOtp}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7063F3] transition-colors ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#7063F3] text-white rounded-md hover:bg-[#5a4fd1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form
              key="otp"
              onSubmit={handleVerifyOtp}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.otp}
                    onChange={(e) => handleInputChange('otp', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7063F3] transition-colors ${
                      errors.otp ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter 6-digit OTP"
                  />
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.otp && <p className="text-sm text-red-600 mt-1">{errors.otp}</p>}
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#7063F3] text-white rounded-md hover:bg-[#5a4fd1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.form
              key="password"
              onSubmit={handleResetPassword}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7063F3] transition-colors ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter new password"
                />
                {errors.newPassword && <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>}
                <div className="mt-2 text-xs text-gray-500">
                  Password must be at least 6 characters with uppercase, lowercase, and number
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7063F3] transition-colors ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm new password"
                />
                {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#7063F3] text-white rounded-md hover:bg-[#5a4fd1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;