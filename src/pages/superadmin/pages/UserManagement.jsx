import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserBarChart from '../components/UserBarChart';
import UserList from '../components/UserList';
import UserDeleteDialog from '../components/UserDeleteDialog';
import { toast } from 'react-toastify';
import api from '../../../api/api';
import * as XLSX from 'xlsx';

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState([]); 
  const [currentPage, setCurrentPage] = useState(0); 
  const [deleteUserId, setDeleteUserId] = useState(null);
  const usersPerPage = 5;

  useEffect(() => {
    fetchUsers(currentPage);
    fetchMonthlyStats(); // Fetch monthly stats on mount
  }, [currentPage]);

  const fetchUsers = async (page) => {
    try {
      const res = await api.get(`/api/superadmin/users?page=${page}&size=${usersPerPage}`);
      const data = res.data;
      if (data && typeof data === 'object') {
        setUsers(data.content || data);
        setTotalUsers(data.totalElements || data.length || 0);
      } else {
        setUsers([]);
        setTotalUsers(0);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
      setUsers([]);
      setTotalUsers(0);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const res = await api.get('/api/superadmin/dashboard/monthly-stats');
      setMonthlyStats(res.data || []);
    } catch (error) {
      toast.error('Failed to fetch monthly stats');
      setMonthlyStats([]);
    }
  };

  // Export chart data to Excel
  const handleExportChart = () => {
    if (!monthlyStats.length) {
      toast.error('No chart data to export');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(monthlyStats);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'UserChart');
    XLSX.writeFile(workbook, 'user_chart.xlsx');
  };

  // Export table data to Excel
  const handleExportTable = () => {
    if (!users.length) {
      toast.error('No table data to export');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'users_table.xlsx');
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/api/superadmin/users/${userId}`);
      toast.success('User deleted successfully!');
      setDeleteUserId(null);
      const remainingUsers = users.filter(u => u.id !== userId).length;
      if (remainingUsers === 0 && currentPage > 0) {
        setCurrentPage(prevPage => prevPage - 1);
      } else {
        fetchUsers(currentPage);
      }
      setTotalUsers(prevTotal => prevTotal - 1);
      fetchMonthlyStats(); // Refresh monthly stats after deletion
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleEdit = (userId) => {
    navigate(`/superadmin/users/edit/${userId}`);
  };

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">User Management</h1>
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={handleExportChart}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Export Chart Data to Excel
        </button>
      </div>
      <UserBarChart monthlyStats={monthlyStats} />
      <div className="flex justify-end mb-2">
        <button
          onClick={handleExportTable}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Export Table Data to Excel
        </button>
      </div>
      <UserList
        users={users}
        onEdit={handleEdit}
        onDelete={userId => setDeleteUserId(userId)}
      />
      <UserDeleteDialog
        open={!!deleteUserId}
        onCancel={() => setDeleteUserId(null)}
        onConfirm={() => handleDelete(deleteUserId)}
      />
      <div className="mt-4 flex justify-center items-center gap-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage + 1} of {totalPages || 1}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, (totalPages || 1) - 1))}
          disabled={currentPage + 1 >= (totalPages || 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}