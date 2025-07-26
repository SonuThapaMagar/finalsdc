import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../api/api";
import "../../../styles/AdoptionSucess.css";

const statusColors = {
  APPROVED: "#10b981",
  PENDING: "#f59e0b",
  REJECTED: "#ef4444",
};

const MyAdoptions = () => {
  const [adoptions, setAdoptions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchAdoptionHistory = async () => {
      try {
        const response = await api.get("/api/user/adoption-history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        });
        console.log("Adoption Data:", response.data.data); // Log the data
        setAdoptions(response.data.data);
      } catch (error) {
        console.error("Error fetching adoption history:", error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("jwtToken");
          navigate("/login");
        } else {
          toast.error("Failed to load adoption history. Please try again.");
        }
      }
    };

    fetchAdoptionHistory();
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "60vh",
        background: "#f8fafc",
        padding: "32px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#4f46e5",
          marginBottom: 24,
        }}
      >
        My Adoptions
      </h1>
      {adoptions.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#6b7280",
            fontSize: 18,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 24px #e0e7ff",
            padding: 24,
            width: 400,
            maxWidth: "95vw",
          }}
        >
          No adoption history yet.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
            width: "100%",
            maxWidth: 1100,
          }}
        >
          {adoptions.map((adoption) => (
            <div
              key={adoption.id}
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 4px 24px #e0e7ff",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 0,
              }}
            >
              <img
                src={adoption.petImage || "/placeholder.svg?height=90&width=90"}
                alt={adoption.petName}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 12,
                  objectFit: "cover",
                  boxShadow: "0 1px 4px #e0e7ff",
                  marginBottom: 16,
                }}
              />
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 20,
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                {adoption.petName}
              </div>
              <div style={{ marginBottom: 8 }}>
                <span
                  style={{
                    background: statusColors[adoption.status],
                    color: "#fff",
                    borderRadius: 8,
                    padding: "4px 16px",
                    fontWeight: 500,
                    fontSize: 15,
                  }}
                >
                  {adoption.status}
                </span>
              </div>
              <div style={{ color: "#6b7280", fontSize: 15, marginBottom: 4 }}>
                Submitted on:{" "}
                <span style={{ color: "#6366f1", fontWeight: 500 }}>
                  {new Date(adoption.submittedAt).toLocaleDateString()}
                </span>
              </div>
              <div style={{ color: "#6366f1", fontWeight: 500, fontSize: 15 }}>
                {adoption.petCenter || "Pet Center"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAdoptions;
