import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PetCenterBarChart from '../components/PetCenterBarChart';
import PetCenterList from '../components/PetCenterList';
import PetCenterDeleteDialog from '../components/PetCenterDeleteDialog';
import { toast } from 'react-toastify';
import api from '../../../api/api';
import * as XLSX from 'xlsx';

export default function PetCenterMgmt() {
  const navigate = useNavigate();
  const [petCenters, setPetCenters] = useState([]);
  const [deletePetCenterId, setDeletePetCenterId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // zero-based
  const [totalPages, setTotalPages] = useState(1);
  const centersPerPage = 5;
  const [chartData, setChartData] = useState([]); // For exporting chart data

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (!token || userRole !== 'SUPERADMIN') {
      toast.error('Please log in to access pet center management');
      navigate('/superadmin/login');
      return;
    }
    fetchPetCenters(token, currentPage);
    fetchChartData(token);
  }, [navigate, currentPage]);

  // Fetch chart data for export
  const fetchChartData = async (token) => {
    try {
      const res = await api.get('/api/superadmin/pet-centers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const transformedData = res.data.map(center => ({
        name: center.shelterName || 'Unnamed',
        pets: center.petCount || 0,
      }));
      setChartData(transformedData);
    } catch (error) {
      setChartData([]);
    }
  };

  const fetchPetCenters = async (token, page = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/api/superadmin/pet-centers?page=${page}&size=${centersPerPage}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      let centersArr = Array.isArray(data) ? data : (data.content || []);
      setPetCenters(centersArr.map(center => ({
        id: center.id,
        name: center.shelterName || 'Unnamed Center',
        location: center.address || 'Unknown',
        contact: center.phone || 'N/A',
        status: center.status || 'active',
      })));
      setTotalPages(Math.ceil((data.totalElements || centersArr.length || 1) / centersPerPage));
    } catch (error) {
      console.error('Failed to fetch pet centers:', error);
      if (error.response) {
        console.error('API error response:', error.response.status, error.response.data);
      } else {
        console.error('Network or other error:', error.message);
      }
      setError('Failed to load pet centers');
      if (error.response?.status === 403) {
        toast.error('Permission denied. Ensure you have SUPERADMIN role.');
        navigate('/superadmin/login');
      } else if (error.response?.status === 401) {
        toast.error('Please log in to view pet centers');
        navigate('/superadmin/login');
      } else {
        toast.error('Failed to load pet centers. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Export chart data to Excel
  const handleExportChart = () => {
    if (!chartData.length) {
      toast.error('No chart data to export');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(chartData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PetCenterChart');
    XLSX.writeFile(workbook, 'pet_center_chart.xlsx');
  };

  // Export table data to Excel
  const handleExportTable = () => {
    if (!petCenters.length) {
      toast.error('No table data to export');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(petCenters);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PetCenters');
    XLSX.writeFile(workbook, 'pet_centers_table.xlsx');
  };

  const handleDelete = async (petCenterId) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/superadmin/pet-centers/${petCenterId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPetCenters(petCenters.filter(pc => pc.id !== petCenterId));
      toast.success('Pet center deleted successfully!');
      setDeletePetCenterId(null);
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response?.status === 403) {
        toast.error('Permission denied. Ensure you have SUPERADMIN role.');
        navigate('/superadmin/login');
      } else if (error.response?.status === 401) {
        toast.error('Please log in to delete pet centers');
        navigate('/superadmin/login');
      } else {
        toast.error('Failed to delete pet center. Please try again.');
      }
    }
  };

  const handleEdit = (petCenterId) => {
    navigate(`/superadmin/pet-centers/edit/${petCenterId}`);
  };

  const handleViewDetails = (petCenterId) => {
    navigate(`/superadmin/pet-centers/view-details/${petCenterId}`);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-center items-center h-[400px] text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Pet Center Management</h1>
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={handleExportChart}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Export Chart Data to Excel
        </button>
        
      </div>
      <PetCenterBarChart />
      <div className="flex justify-end mb-2">
        <button
          onClick={handleExportTable}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Export Table Data to Excel
        </button>
      </div>
      <PetCenterList
        petCenters={petCenters}
        onEdit={handleEdit}
        onDelete={petCenterId => setDeletePetCenterId(petCenterId)}
        onViewDetails={handleViewDetails}
      />
      {/* Pagination Controls */}
      <div className="flex justify-center items-center py-4">
        <button
          className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          Prev
        </button>
        <span className="mx-2">Page {currentPage + 1} of {totalPages}</span>
        <button
          className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={currentPage >= totalPages - 1}
        >
          Next
        </button>
      </div>
      <PetCenterDeleteDialog
        open={!!deletePetCenterId}
        onCancel={() => setDeletePetCenterId(null)}
        onConfirm={() => handleDelete(deletePetCenterId)}
      />
    </div>
  );
}