import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../api/api";
import { useAuth } from "./auth-provider";
import "../../../styles/Adoptme.css";

export default function AdoptMe() {
  const { petId } = useParams(); // petId is a string from the URL
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    petId: petId ? petId : "",
    motivation: "",
    housingType: "",
    ownRent: "",
    experience: "",
    hasYard: false,
    hasPets: false,
    agreement: false,
  });

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const response = await api.get(`/api/user/pets/${petId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        });
        setPet(response.data);
      } catch (error) {
        console.error(
          "Pet fetch error:",
          error.response?.data || error.message
        );
        if (error.response?.status === 403) {
          toast.error(
            "You are not authorized to view this pet's details. Please log in as a user."
          );
        } else if (error.response?.status === 404) {
          toast.error("Pet not found or not available.");
        } else {
          toast.error("Failed to fetch pet data. Please try again later.");
        }
        navigate("/category");
      } finally {
        setLoading(false);
      }
    };
    if (petId) fetchPetData();
    else {
      toast.error("Invalid pet ID");
      setLoading(false);
      navigate("/category");
    }
  }, [petId, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreement) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    const submissionData = {
      petId: formData.petId,
      motivation: formData.motivation,
      housingType: formData.housingType,
      ownRent: formData.ownRent,
      experience: formData.experience,
      hasYard: formData.hasYard,
      hasPets: formData.hasPets,
      agreement: formData.agreement,
    };

    try {
      const response = await api.post(
        "/api/user/adoption-request",
        submissionData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );
      const appId =
        response.data.data?.id || `APP${Date.now().toString().slice(-6)}`;
      toast.success(
        "Application submitted successfully! Check your adoption history for status updates."
      );
      navigate("/adoption-history", {
        state: { pet, applicationId: appId },
      });
    } catch (error) {
      console.error("API Error:", {
        url: error.config.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit application. Please try again.";
      if (error.response?.status === 401) {
        toast.error("Session expired or invalid token. Please log in again.");
        localStorage.removeItem("jwtToken");
        navigate("/login");
      } else if (error.response?.status === 403) {
        toast.error(
          "Access denied. Please log in with a user account to submit an adoption request."
        );
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleClose = () => {
    navigate("/category");
  };

  if (loading) {
    return <div className="adoption-loading">Loading...</div>;
  }

  if (!pet) {
    return <div className="error">Pet not found</div>;
  }

  return (
    <div className="adoption-form-container">
      <div className="adoption-form-header">
        <h1 className="adoption-form-title">Adopt {pet.name}</h1>
        <p className="adoption-form-subtitle">
          Please fill out this form to start the adoption process
        </p>
      </div>

      <div className="adoption-pet-details-card">
        <div className="adoption-pet-details-header">
          <img
            src={pet.imageUrl || "/placeholder.svg?height=80&width=80"}
            alt={pet.name}
            className="adoption-pet-image"
          />
          <div className="adoption-pet-basic-info">
            <div className="adoption-pet-name-large">
              {pet.name}
              <span
                className={
                  pet.gender === "female"
                    ? "adoption-gender-female"
                    : "adoption-gender-male"
                }
              >
                {pet.gender === "female" ? "♀️" : "♂️"}
              </span>
            </div>
            <div className="adoption-pet-breed">{pet.breed}</div>
            <div className="adoption-pet-location-info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle
                  cx="12"
                  cy="10"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              {pet.location}
            </div>
          </div>
        </div>

        <div className="adoption-pet-attributes-grid">
          <div className="adoption-pet-attribute">
            <div className="adoption-pet-attribute-value">{pet.age}</div>
            <div className="adoption-pet-attribute-label">Age</div>
          </div>
          <div className="adoption-pet-attribute">
            <div className="adoption-pet-attribute-value">
              {pet.color || "N/A"}
            </div>
            <div className="adoption-pet-attribute-label">Color</div>
          </div>
          <div className="adoption-pet-attribute">
            <div className="adoption-pet-attribute-value">
              {pet.weight || "N/A"}
            </div>
            <div className="adoption-pet-attribute-label">Weight</div>
          </div>
          <div className="adoption-pet-attribute">
            <div className="adoption-pet-attribute-value">{pet.breed}</div>
            <div className="adoption-pet-attribute-label">Breed</div>
          </div>
        </div>
      </div>

      <form className="adoption-form" onSubmit={handleSubmit}>
        <div className="adoption-form-group">
          <label className="adoption-form-label">Housing Type *</label>
          <select
            name="housingType"
            value={formData.housingType}
            onChange={handleInputChange}
            className="adoption-form-select"
            required
          >
            <option value="">Select housing type</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="adoption-form-group">
          <label className="adoption-form-label">Do you own or rent? *</label>
          <select
            name="ownRent"
            value={formData.ownRent}
            onChange={handleInputChange}
            className="adoption-form-select"
            required
          >
            <option value="">Select option</option>
            <option value="own">Own</option>
            <option value="rent">Rent</option>
          </select>
        </div>

        <div className="adoption-checkbox-group">
          <input
            type="checkbox"
            name="hasYard"
            checked={formData.hasYard}
            onChange={handleInputChange}
            className="adoption-form-checkbox"
          />
          <label className="adoption-form-label">
            I have a yard or outdoor space
          </label>
        </div>

        <div className="adoption-checkbox-group">
          <input
            type="checkbox"
            name="hasPets"
            checked={formData.hasPets}
            onChange={handleInputChange}
            className="adoption-form-checkbox"
          />
          <label className="adoption-form-label">
            I currently have other pets
          </label>
        </div>

        <div className="adoption-form-group">
          <label className="adoption-form-label">Pet Experience</label>
          <textarea
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            className="adoption-form-textarea"
            placeholder="Tell us about your experience with pets..."
          />
        </div>

        <div className="adoption-form-group">
          <label className="adoption-form-label">
            Why do you want to adopt {pet.name}? *
          </label>
          <textarea
            name="motivation"
            value={formData.motivation}
            onChange={handleInputChange}
            className="adoption-form-textarea"
            placeholder="Tell us why you'd like to adopt this pet..."
            required
          />
        </div>

        <div className="adoption-checkbox-group">
          <input
            type="checkbox"
            name="agreement"
            checked={formData.agreement}
            onChange={handleInputChange}
            className="adoption-form-checkbox"
            required
          />
          <label className="adoption-form-label">
            I agree to the terms and conditions and understand that this is an
            application, not a guarantee of adoption *
          </label>
        </div>

        <button
          type="submit"
          className="adoption-submit-button"
          disabled={!formData.agreement}
        >
          Submit Adoption Application
        </button>
      </form>
    </div>
  );
}