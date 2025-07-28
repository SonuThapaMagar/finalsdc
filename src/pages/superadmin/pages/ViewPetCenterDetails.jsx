import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import { toast } from "react-toastify";

const ViewPetCenterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [centerDetails, setCenterDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Fetching details for id:', id);
    const token = "your-postman-token-here"; // Replace with the actual token
    const userRole = "SUPERADMIN"; // Bypass role check for testing
    console.log("Token:", token.substring(0, 20) + "...");
    console.log("UserRole:", userRole);
  
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/superadmin/pet-centers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('API Response:', response.data);
        setCenterDetails(response.data);
      } catch (error) {
        console.error("Failed to fetch pet center details:", error);
        if (error.response) {
          console.error('API Error Details:', {
            status: error.response.status,
            data: error.response.data,
            url: error.config.url,
            headers: error.config.headers,
          });
        }
        // ... rest of the error handling
      } finally {
        setLoading(false);
      }
    };
  
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !centerDetails) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-center items-center h-[400px] text-red-600">
          {error || "Pet center not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">
        Pet Center Details
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {centerDetails.shelterName || "Unnamed Center"}
        </h2>
        <p>
          <strong>Location:</strong> {centerDetails.address || "Unknown"}
        </p>
        <p>
          <strong>Contact:</strong> {centerDetails.phone || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {centerDetails.email || "N/A"}
        </p>
        <p>
          <strong>Status:</strong> {centerDetails.status || "active"}
        </p>
        <p>
          <strong>Description:</strong>{" "}
          {centerDetails.description || "No description"}
        </p>

        {/* Display Documents */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Documents
          </h3>
          {centerDetails.documents && centerDetails.documents.length > 0 ? (
            <ul className="list-disc pl-5">
              {centerDetails.documents.map((doc, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {doc.name || `Document ${index + 1}`} -{" "}
                  {doc.url || "No URL available"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No documents available</p>
          )}
        </div>
      </div>
      <button
        onClick={() => navigate("/superadmin/pet-centers")}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Back to Pet Centers
      </button>
    </div>
  );
};

export default ViewPetCenterDetails;