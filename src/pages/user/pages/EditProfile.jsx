import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "../../../services/userService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Camera, Mail, Phone, MapPin, Save, ArrowLeft } from 'lucide-react';

function EditProfile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile();
        setProfileData({
          fullName: profile.fullName || "",
          email: profile.email || "",
          phone: profile.phone || "",
          address: profile.address || "",
          profileImage: profile.profileImage || null,
        });
      } catch (error) {
        toast.error("Failed to fetch profile.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!profileData.fullName?.trim()) newErrors.fullName = 'Full name is required';
    else if (profileData.fullName.trim().length < 2) newErrors.fullName = 'Full name must be at least 2 characters';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profileData.email?.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(profileData.email)) newErrors.email = 'Invalid email address';
    if (profileData.phone && !/^\+?\d{7,15}$/.test(profileData.phone)) newErrors.phone = 'Invalid phone number';
    if (!profileData.address?.trim()) newErrors.address = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, profileImage: 'Please select a valid image file' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, profileImage: 'Image size must be less than 5MB' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData((prev) => ({ ...prev, profileImage: e.target.result }));
        setErrors((prev) => ({ ...prev, profileImage: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      await updateUserProfile(profileData);
      toast.success("Profile updated successfully!");
      navigate("/user/profile");
    } catch (error) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>;

  return (
    <div className="edit-profile-container" style={{
      maxWidth: 600,
      margin: "40px auto",
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 4px 24px #e0e7ff",
      padding: 24,
      width: "95vw"
    }}>
      <button
        onClick={() => navigate("/user/profile")}
        style={{
          background: "none",
          border: "none",
          color: "#6366f1",
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 18,
          cursor: "pointer",
          fontSize: 16
        }}
      >
        <ArrowLeft size={18} /> Back to Profile
      </button>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24
      }}>
        <div style={{ position: "relative", width: 110, height: 110 }}>
          {profileData.profileImage ? (
            <img
              src={profileData.profileImage}
              alt="Profile"
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #6366f1"
              }}
            />
          ) : (
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                backgroundColor: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 44,
                fontWeight: "bold",
                textTransform: "uppercase",
                border: "3px solid #6366f1"
              }}
            >
              {profileData.email ? profileData.email.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <label style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            background: "#6366f1",
            borderRadius: "50%",
            padding: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Camera size={20} color="#fff" />
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
          </label>
          {errors.profileImage && <div style={{ color: "#ef4444", fontSize: 13 }}>{errors.profileImage}</div>}
        </div>
        <form
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 18
          }}
          onSubmit={e => { e.preventDefault(); handleSave(); }}
        >
          <div>
            <label style={{ fontWeight: 500, color: "#374151" }}>Full Name</label>
            <input
              type="text"
              value={profileData.fullName}
              onChange={e => handleInputChange('fullName', e.target.value)}
              style={{
                width: "100%",
                fontSize: 16,
                border: errors.fullName ? "1px solid #ef4444" : "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "8px 12px",
                marginTop: 4
              }}
              placeholder="Full Name"
            />
            {errors.fullName && <div style={{ color: "#ef4444", fontSize: 13 }}>{errors.fullName}</div>}
          </div>
          <div>
            <label style={{ fontWeight: 500, color: "#374151" }}>Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              style={{
                width: "100%",
                fontSize: 16,
                border: errors.email ? "1px solid #ef4444" : "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "8px 12px",
                marginTop: 4
              }}
              placeholder="Email"
            />
            {errors.email && <div style={{ color: "#ef4444", fontSize: 13 }}>{errors.email}</div>}
          </div>
          <div>
            <label style={{ fontWeight: 500, color: "#374151" }}>Phone</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
              style={{
                width: "100%",
                fontSize: 16,
                border: errors.phone ? "1px solid #ef4444" : "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "8px 12px",
                marginTop: 4
              }}
              placeholder="Phone"
            />
            {errors.phone && <div style={{ color: "#ef4444", fontSize: 13 }}>{errors.phone}</div>}
          </div>
          <div>
            <label style={{ fontWeight: 500, color: "#374151" }}>Address</label>
            <input
              type="text"
              value={profileData.address}
              onChange={e => handleInputChange('address', e.target.value)}
              style={{
                width: "100%",
                fontSize: 16,
                border: errors.address ? "1px solid #ef4444" : "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "8px 12px",
                marginTop: 4
              }}
              placeholder="Address"
            />
            {errors.address && <div style={{ color: "#ef4444", fontSize: 13 }}>{errors.address}</div>}
          </div>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 0",
              fontSize: 18,
              fontWeight: 600,
              cursor: "pointer",
              marginTop: 10,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}
          >
            {isSaving ? <span>Saving...</span> : <><Save size={18} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;