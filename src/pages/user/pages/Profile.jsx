import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "../../../services/userService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth-provider"; // adjust path as needed
import { Camera, User, Mail, Phone, MapPin, Calendar, Shield, Edit2, Save } from 'lucide-react';

function Profile() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile();
        const formattedProfile = {
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          profileImage: profile.profileImage || null,
          memberSince: new Date(profile.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          accountStatus: profile.status || "Active",
        };
        setUserProfile(formattedProfile);
        setProfileData(formattedProfile);
        setIsProfileLoading(false);
      } catch (error) {
        console.error("Profile fetch error:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          toast.error(
            "Access denied. Please log in with a user account or re-authenticate."
          );
          logout(); // Clear token and session
          navigate("/login");
        } else {
          toast.error(error.message || "Failed to fetch profile. Please try again.");
        }
        setIsProfileLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, logout]);

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
      await updateUserProfile({
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        profileImage: profileData.profileImage,
      });
      setUserProfile({ ...profileData });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      if (error.response && error.response.status === 403) {
        toast.error("Access denied. Please log in with a user account.");
        logout();
        navigate("/login");
      } else {
        toast.error(error.message || "Failed to update profile.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData(userProfile);
    setErrors({});
    setIsEditing(false);
  };

  if (isProfileLoading) return <div>Loading...</div>;

  return (
    <div className="profile-page-container" style={{ maxWidth: 600, margin: "40px auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px #e0e7ff", padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ position: "relative", width: 110, height: 110 }}>
            {profileData.profileImage ? (
              <img
                src={profileData.profileImage}
                alt="Profile"
                style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", border: "3px solid #6366f1" }}
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
            {isEditing && (
              <label style={{
                position: "absolute", bottom: 8, right: 8, background: "#6366f1", borderRadius: "50%", padding: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Camera size={20} color="#fff" />
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
              </label>
            )}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#4f46e5", margin: 0 }}>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={e => handleInputChange('fullName', e.target.value)}
                  style={{ fontSize: 24, fontWeight: 600, border: errors.fullName ? "1px solid #ef4444" : "1px solid #e5e7eb", borderRadius: 8, padding: "4px 8px" }}
                  disabled={!isEditing}
                />
              ) : (
                profileData.fullName
              )}
            </h1>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <Edit2 size={16} /> Edit
              </button>
            ) : (
              <>
                <button onClick={handleCancel} style={{ background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 8, padding: "6px 14px", marginRight: 8, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={isSaving} style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  {isSaving ? <span>Saving...</span> : <><Save size={16} /> Save</>}
                </button>
              </>
            )}
          </div>
          {errors.fullName && <div style={{ color: "#ef4444", fontSize: 13 }}>{errors.fullName}</div>}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Mail size={16} />{" "}
              {isEditing ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  style={{ border: errors.email ? "1px solid #ef4444" : "1px solid #e5e7eb", borderRadius: 8, padding: "2px 8px" }}
                  disabled={!isEditing}
                />
              ) : (
                <span>{profileData.email}</span>
              )}
            </div>
            {errors.email && <div style={{ color: "#ef4444", fontSize: 13 }}>{errors.email}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Phone size={16} />{" "}
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  style={{ border: errors.phone ? "1px solid #ef4444" : "1px solid #e5e7eb", borderRadius: 8, padding: "2px 8px" }}
                  disabled={!isEditing}
                />
              ) : (
                <span>{profileData.phone}</span>
              )}
            </div>
            {errors.phone && <div style={{ color: "#ef4444", fontSize: 13 }}>{errors.phone}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <MapPin size={16} />{" "}
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.address}
                  onChange={e => handleInputChange('address', e.target.value)}
                  style={{ border: errors.address ? "1px solid #ef4444" : "1px solid #e5e7eb", borderRadius: 8, padding: "2px 8px" }}
                  disabled={!isEditing}
                />
              ) : (
                <span>{profileData.address}</span>
              )}
            </div>
            {errors.address && <div style={{ color: "#ef4444", fontSize: 13 }}>{errors.address}</div>}
          </div>
          <div style={{ display: "flex", gap: 32, marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={16} /> <span style={{ color: "#6366f1", fontWeight: 500 }}>{profileData.memberSince}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Shield size={16} /> <span style={{ color: "#10b981", fontWeight: 500 }}>{profileData.accountStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
//