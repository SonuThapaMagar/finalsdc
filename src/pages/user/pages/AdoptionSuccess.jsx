import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../../styles/AdoptionSucess.css";

export default function AdoptionSuccess({ pet, onClose }) {
  const navigate = useNavigate();
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/user/dashboard");
    }
  };

  return (
    <div className="adoption-success-container">
      <div className="success-icon">
        <Check />
      </div>

      <h1 className="success-title">Application Submitted!</h1>

      <p className="success-message">
        Thank you for your interest in adopting {pet?.name || "this pet"}! Your
        application has been successfully submitted and is now being reviewed by
        our adoption team.
      </p>
      <div className="success-next-steps">
        <h3>What happens next?</h3>
        <p>
          Our team will review your application within 2-3 business days. We'll
          contact you via email or phone to discuss the next steps in the
          adoption process.
        </p>
      </div>

      <div className="success-actions">
        <button className="success-button secondary" onClick={handleClose}>
          Close
        </button>
      </div>
    </div>
  );
}
