import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Check,
  Heart,
} from "lucide-react";
import "../../../styles/landing.css";
import { toast } from "react-toastify";
import api from "../../../api/api";

export default function ShelterRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentStep(1);
    setErrors({});
    setTouchedFields({});
    setIsSubmitting(false);
  }, []);

  const [formData, setFormData] = useState({
    shelterName: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    organizationType: "",
    yearEstablished: "",
    registrationNumber: "",
    taxId: "",
    capacity: "",
    animalsCurrently: "",
    servicesOffered: [],
    adoptionFee: "",
    description: "",
    mission: "",
    specialPrograms: "",
    password: "", // Added password field
    documents: {
      license: null,
      insurance: null,
      taxExempt: null,
    },
  });

  const validateField = (field, value) => {
    switch (field) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? "" : "Please enter a valid email address";
      case "phone":
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(value.replace(/[\s\-$$$$]/g, ""))
          ? ""
          : "Please enter a valid phone number";
      case "website":
        if (!value) return "";
        const urlRegex = /^https?:\/\/.+\..+/;
        return urlRegex.test(value)
          ? ""
          : "Please enter a valid website URL (include http:// or https://)";
      case "yearEstablished":
        const year = Number.parseInt(value);
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
          return `Year must be between 1900 and ${currentYear}`;
        }
        return "";
      case "capacity":
      case "animalsCurrently":
        const num = Number.parseInt(value);
        if (isNaN(num) || num < 0) {
          return "Please enter a valid number";
        }
        if (
          field === "animalsCurrently" &&
          formData.capacity &&
          num > Number.parseInt(formData.capacity)
        ) {
          return "Current animals cannot exceed total capacity";
        }
        return "";
      case "zipCode":
        return value.length >= 3 ? "" : "Please enter a valid ZIP/postal code";
      case "password": // Added password validation
        return value.length >= 8 ? "" : "Password must be at least 8 characters long";
      default:
        return value.trim() ? "" : "This field is required";
    }
  };

  const validateStep = (step) => {
    const stepErrors = {};
    switch (step) {
      case 1:
        const step1Fields = [
          "shelterName",
          "contactPerson",
          "email",
          "phone",
          "address",
          "city",
          "state",
          "zipCode",
          "password", // Added password to validation
        ];
        step1Fields.forEach((field) => {
          const error = validateField(field, formData[field]);
          if (error) stepErrors[field] = error;
        });
        break;
      case 2:
        const step2Fields = ["organizationType", "yearEstablished", "description"];
        step2Fields.forEach((field) => {
          const error = validateField(field, formData[field]);
          if (error) stepErrors[field] = error;
        });
        break;
      case 3:
        const step3Fields = ["capacity", "animalsCurrently"];
        step3Fields.forEach((field) => {
          const error = validateField(field, formData[field]);
          if (error) stepErrors[field] = error;
        });
        if (formData.servicesOffered.length === 0) {
          stepErrors.servicesOffered = "Please select at least one service";
        }
        break;
      case 4:
        if (!formData.documents.license) {
          stepErrors.license = "Operating license is required";
        }
        if (!formData.documents.insurance) {
          stepErrors.insurance = "Insurance certificate is required";
        }
        break;
    }
    return stepErrors;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
    if (touchedFields[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    }
  };

  const handleBlur = (field) => {
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true,
    }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData((prev) => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter((s) => s !== service)
        : [...prev.servicesOffered, service],
    }));
    if (errors.servicesOffered) {
      setErrors((prev) => ({
        ...prev,
        servicesOffered: "",
      }));
    }
  };

  const handleFileUpload = (docType, file) => {
    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        [docType]: "File size must be less than 10MB",
      }));
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [docType]: "Please upload a PDF, Word document, or image file",
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: file,
      },
    }));
    setErrors((prev) => ({
      ...prev,
      [docType]: "",
    }));
  };

  const nextStep = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      Object.keys(stepErrors).forEach((field) => {
        setTouchedFields((prev) => ({
          ...prev,
          [field]: true,
        }));
      });
      return;
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allErrors = validateStep(4);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "documents") {
          Object.entries(value).forEach(([docKey, file]) => {
            if (file) data.append(docKey, file);
          });
        } else if (Array.isArray(value)) {
          value.forEach((v) => data.append(key, v));
        } else {
          data.append(key, value);
        }
      });
      // Log FormData for debugging
      for (let pair of data.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      await api.post("/api/admin/auth/signup", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Registration submitted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error.response?.data?.message || "There was an error submitting your application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    border: "2px solid #e5e7eb",
    borderRadius: "0.5rem",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const getInputStyle = (field) => ({
    ...inputStyle,
    borderColor: errors[field]
      ? "#ef4444"
      : touchedFields[field] && !errors[field]
      ? "#10b981"
      : "#e5e7eb",
  });

  const labelStyle = {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "600",
    color: "#374151",
  };

  const errorStyle = {
    color: "#ef4444",
    fontSize: "0.875rem",
    marginTop: "0.25rem",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  };

  const successStyle = {
    color: "#10b981",
    fontSize: "0.875rem",
    marginTop: "0.25rem",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  };

  const services = [
    "Dog Adoption",
    "Cat Adoption",
    "Small Animal Adoption",
    "Veterinary Services",
    "Spay/Neuter Programs",
    "Training Classes",
    "Foster Programs",
    "Emergency Rescue",
  ];

  const organizationTypes = [
    "Non-profit Organization",
    "Government Shelter",
    "Private Rescue",
    "Animal Control",
    "Sanctuary",
  ];

  const isStepValid = (step) => {
    const stepErrors = validateStep(step);
    return Object.keys(stepErrors).length === 0;
  };

  return (
    <div className="landing-page">
      <section className="hero" style={{ padding: "3rem 0 2rem" }}>
        <div className="hero-container">
          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "none",
              border: "none",
              color: "#8b5cf6",
              fontSize: "1rem",
              cursor: "pointer",
              marginBottom: "2rem",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#7c3aed")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8b5cf6")}
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <div className="hero-content" style={{ textAlign: "center" }}>
            <h1 className="hero-title" style={{ fontSize: "3rem", marginBottom: "1rem" }}>
              Become a<span className="hero-gradient-text"> Partner Shelter</span>
            </h1>
            <p className="hero-subtitle" style={{ maxWidth: "800px", margin: "0 auto" }}>
              Join our network of trusted shelters and rescues. Help us connect more pets with loving families.
            </p>
          </div>
        </div>
      </section>
      <section style={{ background: "white", padding: "2rem 0" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
            {[1, 2, 3, 4].map((step) => (
              <div key={step} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "50%",
                    background:
                      currentStep >= step
                        ? isStepValid(step) || currentStep > step
                          ? "linear-gradient(135deg, #10b981, #059669)"
                          : "linear-gradient(135deg, #8b5cf6, #6366f1)"
                        : "#e5e7eb",
                    color: currentStep >= step ? "white" : "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "600",
                  }}
                >
                  {currentStep > step && isStepValid(step) ? <CheckCircle size={16} /> : step}
                </div>
                {step < 4 && (
                  <div
                    style={{
                      flex: 1,
                      height: "2px",
                      background: currentStep > step ? "linear-gradient(135deg, #10b981, #059669)" : "#e5e7eb",
                      margin: "0 1rem",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Organization Details"}
              {currentStep === 3 && "Services & Capacity"}
              {currentStep === 4 && "Documents & Review"}
            </h3>
            <p style={{ color: "#6b7280" }}>Step {currentStep} of 4</p>
          </div>
        </div>
      </section>
      <section style={{ background: "#f9fafb", padding: "3rem 0" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1rem" }}>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                background: "white",
                padding: "2rem",
                borderRadius: "1rem",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              {currentStep === 1 && (
                <div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "2rem", color: "#111827" }}>
                    Basic Information
                  </h3>
                  <div style={{ display: "grid", gap: "1.5rem" }}>
                    <div>
                      <label style={labelStyle}>Shelter/Organization Name *</label>
                      <input
                        type="text"
                        value={formData.shelterName}
                        onChange={(e) => handleInputChange("shelterName", e.target.value)}
                        onBlur={() => handleBlur("shelterName")}
                        style={getInputStyle("shelterName")}
                        onFocus={(e) => !errors.shelterName && (e.target.style.borderColor = "#8b5cf6")}
                        required
                      />
                      {errors.shelterName && (
                        <div style={errorStyle}>
                          <AlertCircle size={16} />
                          {errors.shelterName}
                        </div>
                      )}
                      {touchedFields.shelterName && !errors.shelterName && formData.shelterName && (
                        <div style={successStyle}>
                          <Check size={16} />
                          Looks good!
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={labelStyle}>Password *</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        onBlur={() => handleBlur("password")}
                        style={getInputStyle("password")}
                        onFocus={(e) => !errors.password && (e.target.style.borderColor = "#8b5cf6")}
                        required
                      />
                      {errors.password && (
                        <div style={errorStyle}>
                          <AlertCircle size={16} />
                          {errors.password}
                        </div>
                      )}
                      {touchedFields.password && !errors.password && formData.password && (
                        <div style={successStyle}>
                          <Check size={16} />
                          Looks good!
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "1.5rem",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Contact Person *</label>
                        <input
                          type="text"
                          value={formData.contactPerson}
                          onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                          onBlur={() => handleBlur("contactPerson")}
                          style={getInputStyle("contactPerson")}
                          onFocus={(e) => !errors.contactPerson && (e.target.style.borderColor = "#8b5cf6")}
                          required
                        />
                        {errors.contactPerson && (
                          <div style={errorStyle}>
                            <AlertCircle size={16} />
                            {errors.contactPerson}
                          </div>
                        )}
                      </div>
                      <div>
                        <label style={labelStyle}>Email Address *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          onBlur={() => handleBlur("email")}
                          style={getInputStyle("email")}
                          onFocus={(e) => !errors.email && (e.target.style.borderColor = "#8b5cf6")}
                          required
                        />
                        {errors.email && (
                          <div style={errorStyle}>
                            <AlertCircle size={16} />
                            {errors.email}
                          </div>
                        )}
                        {touchedFields.email && !errors.email && formData.email && (
                          <div style={successStyle}>
                            <Check size={16} />
                            Valid email format
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "1.5rem",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Phone Number *</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          onBlur={() => handleBlur("phone")}
                          style={getInputStyle("phone")}
                          onFocus={(e) => !errors.phone && (e.target.style.borderColor = "#8b5cf6")}
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                        {errors.phone && (
                          <div style={errorStyle}>
                            <AlertCircle size={16} />
                            {errors.phone}
                          </div>
                        )}
                      </div>
                      <div>
                        <label style={labelStyle}>Website (Optional)</label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange("website", e.target.value)}
                          onBlur={() => handleBlur("website")}
                          style={getInputStyle("website")}
                          onFocus={(e) => !errors.website && (e.target.style.borderColor = "#8b5cf6")}
                          placeholder="https://yourwebsite.com"
                        />
                        {errors.website && (
                          <div style={errorStyle}>
                            <AlertCircle size={16} />
                            {errors.website}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Full Address *</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        onBlur={() => handleBlur("address")}
                        style={{ ...getInputStyle("address"), minHeight: "100px", resize: "vertical" }}
                        onFocus={(e) => !errors.address && (e.target.style.borderColor = "#8b5cf6")}
                        placeholder="Street address, building number, etc."
                        required
                      />
                      {errors.address && (
                        <div style={errorStyle}>
                          <AlertCircle size={16} />
                          {errors.address}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1.5rem",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>City *</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          onBlur={() => handleBlur("city")}
                          style={getInputStyle("city")}
                          onFocus={(e) => !errors.city && (e.target.style.borderColor = "#8b5cf6")}
                          required
                        />
                        {errors.city && (
                          <div style={errorStyle}>
                            <AlertCircle size={16} />
                            {errors.city}
                          </div>
                        )}
                      </div>
                      <div>
                        <label style={labelStyle}>State/Province *</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          onBlur={() => handleBlur("state")}
                          style={getInputStyle("state")}
                          onFocus={(e) => !errors.state && (e.target.style.borderColor = "#8b5cf6")}
                          required
                        />
                        {errors.state && (
                          <div style={errorStyle}>
                            <AlertCircle size={16} />
                            {errors.state}
                          </div>
                        )}
                      </div>
                      <div>
                        <label style={labelStyle}>ZIP/Postal Code *</label>
                        <input
                          type="text"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          onBlur={() => handleBlur("zipCode")}
                          style={getInputStyle("zipCode")}
                          onFocus={(e) => !errors.zipCode && (e.target.style.borderColor = "#8b5cf6")}
                          required
                        />
                        {errors.zipCode && (
                          <div style={errorStyle}>
                            <AlertCircle size={16} />
                            {errors.zipCode}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "2rem", color: "#111827" }}>
                    Organization Details
                  </h3>
                  <div style={{ display: "grid", gap: "1.5rem" }}>
                    <div>
                      <label style={labelStyle}>Organization Type *</label>
                      <select
                        value={formData.organizationType}
                        onChange={(e) => handleInputChange("organizationType", e.target.value)}
                        onBlur={() => handleBlur("organizationType")}
                        style={getInputStyle("organizationType")}
                        onFocus={(e) => !errors.organizationType && (e.target.style.borderColor = "#8b5cf6")}
                        required
                      >
                        <option value="">Select organization type</option>
                        {organizationTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.organizationType && (
                        <div style={errorStyle}>
                          <AlertCircle size={16} />
                          {errors.organizationType}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "1.5rem",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Year Established *</label>
                        <input
                          type="number"
                          value={formData.yearEstablished}
                          onChange={(e) => handleInputChange("yearEstablished", e.target.value)}
                          onBlur={() => handleBlur("yearEstablished")}
                          style={getInputStyle("yearEstablished")}
                          onFocus={(e) => !errors.yearEstablished && (e.target.style.borderColor = "#8b5cf6")}
                          min="1900"
                          max={new Date().getFullYear()}
                          required
                        />
                        {errors.yearEstablished && (
                          <div style={errorStyle}>
                            <AlertCircle size={16} />
                            {errors.yearEstablished}
                          </div>
                        )}
                      </div>
                      <div>
                        <label style={labelStyle}>Registration Number</label>
                        <input
                          type="text"
                          value={formData.registrationNumber}
                          onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "#8b5cf6")}
                          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Tax ID/EIN</label>
                      <input
                        type="text"
                        value={formData.taxId}
                        onChange={(e) => handleInputChange("taxId", e.target.value)}
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "#8b5cf6")}
                        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Organization Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        onBlur={() => handleBlur("description")}
                        style={{ ...getInputStyle("description"), minHeight: "120px", resize: "vertical" }}
                        onFocus={(e) => !errors.description && (e.target.style.borderColor = "#8b5cf6")}
                        placeholder="Tell us about your organization, its history, and mission..."
                        required
                      />
                      {errors.description && (
                        <div style={errorStyle}>
                          <AlertCircle size={16} />
                          {errors.description}
                        </div>
                      )}
                      <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                        {formData.description.length}/500 characters
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Mission Statement</label>
                      <textarea
                        value={formData.mission}
                        onChange={(e) => handleInputChange("mission", e.target.value)}
                        style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                        onFocus={(e) => (e.target.style.borderColor = "#8b5cf6")}
                        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                        placeholder="What is your organization's mission? (Optional)"
                      />
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "2rem", color: "#111827" }}>
                    Services & Capacity
                  </h3>
                  <div style={{ display: "grid", gap: "1.5rem" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "1.5rem",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Total Capacity *</label>
                        <input
                          type="number"
                          value={formData.capacity}
                          onChange={(e) => handleInputChange("capacity", e.target.value)}
                          onBlur={() => handleBlur("capacity")}
                          style={getInputStyle("capacity")}
                          onFocus={(e) => !errors.capacity && (e.target.style.borderColor = "#8b5cf6")}
                          min="1"
                          placeholder="Maximum number of animals"
                          required
                        />
                        {errors.capacity && (
                          <div style={errorStyle}>
                            <AlertCircle size={16} />
                            {errors.capacity}
                          </div>
                        )}
                      </div>
                      <div>
                        <label style={labelStyle}>Animals Currently Housed *</label>
                        <input
                          type="number"
                          value={formData.animalsCurrently}
                          onChange={(e) => handleInputChange("animalsCurrently", e.target.value)}
                          onBlur={() => handleBlur("animalsCurrently")}
                          style={getInputStyle("animalsCurrently")}
                          onFocus={(e) => !errors.animalsCurrently && (e.target.style.borderColor = "#8b5cf6")}
                          min="0"
                          placeholder="Current number of animals"
                          required
                        />
                        {errors.animalsCurrently && (
                          <div style={errorStyle}>
                            <AlertCircle size={16} />
                            {errors.animalsCurrently}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Average Adoption Fee Range</label>
                      <input
                        type="text"
                        value={formData.adoptionFee}
                        onChange={(e) => handleInputChange("adoptionFee", e.target.value)}
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "#8b5cf6")}
                        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                        placeholder="e.g., $50-$300"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Services Offered *</label>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "1rem",
                          marginTop: "0.5rem",
                          padding: "1rem",
                          border: errors.servicesOffered ? "2px solid #ef4444" : "2px solid #e5e7eb",
                          borderRadius: "0.5rem",
                          background: "#f9fafb",
                        }}
                      >
                        {services.map((service) => (
                          <label
                            key={service}
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
                          >
                            <input
                              type="checkbox"
                              checked={formData.servicesOffered.includes(service)}
                              onChange={() => handleServiceToggle(service)}
                              style={{ width: "1rem", height: "1rem" }}
                            />
                            <span style={{ fontSize: "0.875rem" }}>{service}</span>
                          </label>
                        ))}
                      </div>
                      {errors.servicesOffered && (
                        <div style={errorStyle}>
                          <AlertCircle size={16} />
                          {errors.servicesOffered}
                        </div>
                      )}
                      {formData.servicesOffered.length > 0 && (
                        <div style={successStyle}>
                          <Check size={16} />
                          {formData.servicesOffered.length} service{formData.servicesOffered.length > 1 ? "s" : ""}{" "}
                          selected
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={labelStyle}>Special Programs</label>
                      <textarea
                        value={formData.specialPrograms}
                        onChange={(e) => handleInputChange("specialPrograms", e.target.value)}
                        style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                        onFocus={(e) => (e.target.style.borderColor = "#8b5cf6")}
                        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                        placeholder="Describe any special programs, partnerships, or unique services you offer... (Optional)"
                      />
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 4 && (
                <div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "2rem", color: "#111827" }}>
                    Documents & Review
                  </h3>
                  <div style={{ display: "grid", gap: "2rem" }}>
                    <div>
                      <h4 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#374151" }}>
                        Required Documents
                      </h4>
                      <div style={{ display: "grid", gap: "1.5rem" }}>
                        {[
                          { key: "license", label: "Operating License/Permit", required: true },
                          { key: "insurance", label: "Liability Insurance Certificate", required: true },
                          { key: "taxExempt", label: "Tax-Exempt Status (if applicable)", required: false },
                        ].map((doc) => (
                          <div
                            key={doc.key}
                            style={{
                              padding: "1.5rem",
                              border: errors[doc.key]
                                ? "2px dashed #ef4444"
                                : formData.documents[doc.key]
                                ? "2px dashed #10b981"
                                : "2px dashed #e5e7eb",
                              borderRadius: "0.5rem",
                              textAlign: "center",
                              cursor: "pointer",
                              transition: "border-color 0.2s",
                              background: formData.documents[doc.key] ? "#f0fdf4" : "#f9fafb",
                            }}
                          >
                            <Upload
                              size={32}
                              style={{
                                color: formData.documents[doc.key] ? "#10b981" : "#8b5cf6",
                                margin: "0 auto 1rem",
                              }}
                            />
                            <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                              {doc.label} {doc.required && "*"}
                            </div>
                            <div style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1rem" }}>
                              {formData.documents[doc.key]
                                ? "File uploaded successfully"
                                : "Click to upload or drag and drop"}
                            </div>
                            <div style={{ color: "#6b7280", fontSize: "0.75rem", marginBottom: "1rem" }}>
                              Supported formats: PDF, Word, JPG, PNG (Max 10MB)
                            </div>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload(doc.key, e.target.files[0])}
                              style={{ display: "none" }}
                              id={`file-${doc.key}`}
                            />
                            <label
                              htmlFor={`file-${doc.key}`}
                              style={{
                                background: formData.documents[doc.key] ? "#10b981" : "#8b5cf6",
                                color: "white",
                                padding: "0.5rem 1rem",
                                borderRadius: "0.25rem",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                display: "inline-block",
                              }}
                            >
                              {formData.documents[doc.key] ? "Replace File" : "Choose File"}
                            </label>
                            {formData.documents[doc.key] && (
                              <div style={{ marginTop: "0.5rem", color: "#10b981", fontSize: "0.875rem" }}>
                                <Check size={16} style={{ display: "inline", marginRight: "0.25rem" }} />
                                {formData.documents[doc.key].name}
                              </div>
                            )}
                            {errors[doc.key] && (
                              <div style={{ ...errorStyle, justifyContent: "center", marginTop: "0.5rem" }}>
                                <AlertCircle size={16} />
                                {errors[doc.key]}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div
                      style={{
                        background: "#f9fafb",
                        padding: "1.5rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <h4 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#374151" }}>
                        Review Your Information
                      </h4>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.6 }}>
                        <p>
                          <strong>Organization:</strong> {formData.shelterName || "Not provided"}
                        </p>
                        <p>
                          <strong>Contact:</strong> {formData.contactPerson || "Not provided"}
                        </p>
                        <p>
                          <strong>Email:</strong> {formData.email || "Not provided"}
                        </p>
                        <p>
                          <strong>Phone:</strong> {formData.phone || "Not provided"}
                        </p>
                        <p>
                          <strong>Type:</strong> {formData.organizationType || "Not provided"}
                        </p>
                        <p>
                          <strong>Capacity:</strong> {formData.capacity || "Not provided"}
                        </p>
                        <p>
                          <strong>Services:</strong>{" "}
                          {formData.servicesOffered.length > 0 ? formData.servicesOffered.join(", ") : "None selected"}
                        </p>
                        <p>
                          <strong>Documents:</strong> {Object.values(formData.documents).filter(Boolean).length} uploaded
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "2rem",
                  paddingTop: "2rem",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "2px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    background: "white",
                    color: "#6b7280",
                    cursor: currentStep === 1 ? "not-allowed" : "pointer",
                    opacity: currentStep === 1 ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (currentStep > 1) {
                      e.currentTarget.style.borderColor = "#8b5cf6";
                      e.currentTarget.style.color = "#8b5cf6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentStep > 1) {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.color = "#6b7280";
                    }
                  }}
                >
                  Previous
                </button>
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      fontWeight: "600",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: "0.75rem 2rem",
                      background: isSubmitting ? "#9ca3af" : "linear-gradient(135deg, #10b981, #059669)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      fontWeight: "600",
                      transition: "transform 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {isSubmitting ? (
                      <>
                        <div
                          style={{
                            width: "1rem",
                            height: "1rem",
                            border: "2px solid #ffffff",
                            borderTop: "2px solid transparent",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>
      <section className="about" style={{ background: "white" }}>
        <div className="about-container">
          <div className="section-header">
            <h2 className="section-title">What Happens Next?</h2>
            <p className="section-subtitle">After you submit your application</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
            {[
              {
                step: "1",
                title: "Application Review",
                description: "Our team will review your application and documents within 3-5 business days.",
                icon: FileText,
              },
              {
                step: "2",
                title: "Site Visit",
                description: "We'll schedule a visit to your facility to ensure it meets our standards.",
                icon: Building,
              },
              {
                step: "3",
                title: "Partnership Agreement",
                description: "Once approved, we'll finalize the partnership agreement and provide training.",
                icon: CheckCircle,
              },
              {
                step: "4",
                title: "Go Live",
                description: "Start listing your pets on our platform and connecting with potential adopters!",
                icon: Heart,
              },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  background: "#f9fafb",
                  borderRadius: "1rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    width: "4rem",
                    height: "4rem",
                    background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                    color: "white",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                  }}
                >
                  {item.step}
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>{item.title}</h3>
                <p style={{ color: "#6b7280", lineHeight: 1.6 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="cta">
        <div className="cta-container">
          <h2>Questions About Partnership?</h2>
          <p>Our team is here to help you through the application process.</p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", marginTop: "2rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "white" }}>
              <Mail size={20} />
              <span>partnerships@fureverhome.com</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "white" }}>
              <Phone size={20} />
              <span>+977-9785854460</span>
            </div>
          </div>
        </div>
      </section>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}