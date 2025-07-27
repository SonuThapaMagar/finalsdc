import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserDeleteDialog from '../../superadmin/components/UserDeleteDialog';
import { toast } from 'react-toastify';
import api from '../../../api/api';
import UserLists from './UserLists';

export default function ViewUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 5;
  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      // If your backend supports pagination, use this:
      const res = await api.get(`/api/admin/users?page=${currentPage - 1}&size=${usersPerPage}`);
      
      // Handle different response formats
      if (res.data.content) {
        // Spring Boot pagination format
        setUsers(res.data.content);
        setTotalUsers(res.data.totalElements);
        setTotalPages(res.data.totalPages);
      } else if (res.data.users) {
        // Custom pagination format
        setUsers(res.data.users);
        setTotalUsers(res.data.total);
        setTotalPages(Math.ceil(res.data.total / usersPerPage));
      } else {
        // Fallback: manually paginate the data
        const allUsers = res.data;
        const startIndex = (currentPage -1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        setUsers(allUsers.slice(startIndex, endIndex));
        setTotalUsers(allUsers.length);
        setTotalPages(Math.ceil(allUsers.length / usersPerPage));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/api/admin/users/${userId}`);
      // Refresh the current page after deletion
      fetchUsers();
      toast.success('User deleted successfully!');
      setDeleteUserId(null);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  // const handleEdit = (userId) => {
  //   navigate(`/admin/users/edit/${userId}`);
  // };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages -1);
    
    if (endPage - startPage + 1 < maxVisiblePages)
      startPage = Math.max(1, endPage - maxVisiblePages +1);

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 border border-gray-300 rounded-l-md hover:bg-gray-50"
        >
          Previous
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium border ${
            currentPage === i
              ? 'bg-blue-50 text-blue-600 border-blue-300'
              : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 border border-gray-300 rounded-r-md hover:bg-gray-50"
        >
          Next
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">User Management</h1>
      
      {/* User count info */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {users.length} of {totalUsers} users
      </div>
      
      <UserLists
        users={users}
        // 
        
        onDelete={userId => setDeleteUserId(userId)}
      />
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-1">
            {renderPagination()}
          </div>
        </div>
      )}
      
      <UserDeleteDialog
        open={!!deleteUserId}
        onCancel={() => setDeleteUserId(null)}
        onConfirm={() => handleDelete(deleteUserId)}
      />
    </div>
  );
}