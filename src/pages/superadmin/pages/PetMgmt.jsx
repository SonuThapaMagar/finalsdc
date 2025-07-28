import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";
import { RiFileExcel2Line, RiEdit2Line } from "react-icons/ri";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';

const PetMgmt = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [petStats, setPetStats] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [tableLoading, setTableLoading] = useState(true); // Separate loading for table
  const [deletePetId, setDeletePetId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // zero-based
  const [totalPages, setTotalPages] = useState(1);
  const petsPerPage = 5;

  // Initial load and authentication check
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    if (!token || userRole !== "SUPERADMIN") {
      toast.error("Please log in to access pet management");
      navigate("/superadmin/login");
      return;
    }
    // Fetch charts data (only on initial load)
    const fetchInitialData = async () => {
      try {
        const monthlyStatsResponse = await api.get("/api/superadmin/dashboard/monthly-stats");
        const mappedPetStats = monthlyStatsResponse.data.map((stat) => ({
          month: stat.month,
          pets: stat.pets,
        }));
        setPetStats(mappedPetStats);

        const statusResponse = await api.get("/api/superadmin/dashboard/pet-status");
        setStatusData(statusResponse.data);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        if (error.response?.status === 403) {
          toast.error("Permission denied. Ensure you have SUPERADMIN role.");
          navigate("/superadmin/login");
        } else if (error.response?.status === 401) {
          toast.error("Please log in to view pets");
          navigate("/superadmin/login");
        } else {
          toast.error("Failed to fetch data. Please try again.");
        }
      }
    };
    fetchInitialData();
  }, [navigate]);

  // Fetch table data (pets) when currentPage changes
  useEffect(() => {
    const fetchData = async () => {
      setTableLoading(true);
      try {
        const petsResponse = await api.get(
          `/api/superadmin/pets?page=${currentPage}&size=${petsPerPage}`
        );
        const data = petsResponse.data;
        if (data && typeof data === "object") {
          setPets(data.content || []);
          setTotalPages(data.totalPages || 1);
        } else {
          setPets([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Failed to fetch pets:", error);
        if (error.response?.status === 403) {
          toast.error("Permission denied. Ensure you have SUPERADMIN role.");
          navigate("/superadmin/login");
        } else if (error.response?.status === 401) {
          toast.error("Please log in to view pets");
          navigate("/superadmin/login");
        } else {
          toast.error("Failed to fetch data. Please try again.");
        }
      } finally {
        setTableLoading(false);
      }
    };
    fetchData();
  }, [currentPage]); // Removed navigate from dependency array

  // Export chart data to Excel (Bar and Pie chart data)
  const handleExportChart = () => {
    if (!petStats.length && !statusData.length) {
      toast.error('No chart data to export');
      return;
    }
    // Export both bar and pie chart data as separate sheets
    const workbook = XLSX.utils.book_new();
    if (petStats.length) {
      const barSheet = XLSX.utils.json_to_sheet(petStats);
      XLSX.utils.book_append_sheet(workbook, barSheet, 'MonthlyStats');
    }
    if (statusData.length) {
      const pieSheet = XLSX.utils.json_to_sheet(statusData);
      XLSX.utils.book_append_sheet(workbook, pieSheet, 'StatusData');
    }
    XLSX.writeFile(workbook, 'pet_charts.xlsx');
  };

  // Export table data to Excel
  const handleExportTable = () => {
    if (!pets.length) {
      toast.error('No table data to export');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(pets);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pets');
    XLSX.writeFile(workbook, 'pets_table.xlsx');
  };

  const handleEdit = (petId) => {
    navigate(`/superadmin/pets/edit/${petId}`);
  };

  const handleDelete = async (petId) => {
    try {
      await api.delete(`/api/superadmin/pets/${petId}`);
      setPets(pets.filter((p) => p.id !== petId));
      toast.success("Pet deleted successfully!");
      setDeletePetId(null);
    } catch (error) {
      console.error("Delete error:", error);
      if (error.response?.status === 403) {
        toast.error("Permission denied. Ensure you have SUPERADMIN role.");
      } else if (error.response?.status === 401) {
        toast.error("Please log in to delete pets");
        navigate("/superadmin/login");
      } else {
        toast.error("Failed to delete pet. Please try again.");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Pet Management</h1>
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={handleExportChart}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Export Chart Data to Excel
        </button>
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Pet Statistics</h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={petStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pets" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Adoption Status</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleExportTable}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Export Table Data to Excel
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {tableLoading ? (
            <div className="p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Breed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pets.map((pet) => (
                  <tr key={pet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {pet.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {pet.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{pet.breed}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{pet.age}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{pet.gender}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{pet.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pet.status === "AVAILABLE"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {pet.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(pet.id)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <RiEdit2Line className="text-xl" />
                      </button>
                    </td>
                  </tr>
                ))}
                {pets.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No pets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-center items-center py-4">
          <button
            className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            Prev
          </button>
          <span className="mx-2">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
            }
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deletePetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <div className="font-semibold text-lg mb-2">Are you sure?</div>
            <div className="text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete the pet
              and remove their data from our servers.
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setDeletePetId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => handleDelete(deletePetId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetMgmt;