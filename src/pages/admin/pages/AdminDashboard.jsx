import React, { useState, useEffect } from 'react';
import { FaUsers, FaPaw, FaHeart, FaClipboardList } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../../pages/user/pages/auth-provider';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [stats, setStats] = useState([]);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user || user.role !== 'ADMIN') {
      toast.error('Please log in as an admin to access this dashboard');
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
  }, [navigate, authLoading, isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsResponse = await api.get('/api/admin/dashboard/stats');
      const statsData = statsResponse.data
        ? [
          { title: 'Total Users', value: statsResponse.data.totalUsers || 0, icon: <FaUsers className="text-blue-500 text-2xl" /> },
          { title: 'Available Pets', value: statsResponse.data.totalPets || 0, icon: <FaPaw className="text-pink-500 text-2xl" /> },
          { title: 'Adoption Requests', value: statsResponse.data.totalAdoptionRequests || 0, icon: <FaClipboardList className="text-green-500 text-2xl" /> },
          { title: 'Successful Adoptions', value: statsResponse.data.totalAdoptions || 0, icon: <FaHeart className="text-red-500 text-2xl" /> },
        ]
        : [];
      setStats(statsData);

      // Fetch pet data for pie chart
      const petsResponse = await api.get('/api/admin/pets');
      const pets = petsResponse.data || [];
      console.log('Pets data:', pets); // Debug
      const statusCounts = pets.reduce(
        (acc, pet) => {
          acc[pet.status] = (acc[pet.status] || 0) + 1;
          return acc;
        },
        { AVAILABLE: 0, PENDING: 0, ADOPTED: 0 } // Match backend case
      );
      const pieData = [
        { name: 'AVAILABLE', value: statusCounts.AVAILABLE || 0, color: '#34d399' },
        { name: 'PENDING', value: statusCounts.PENDING || 0, color: '#f59e0b' },
        { name: 'ADOPTED', value: statusCounts.ADOPTED || 0, color: '#3b82f6' },
      ];
      console.log('Pie Data:', pieData); // Debug
      setPieData(pieData);

      // Fetch adoption requests for bar chart
      const adoptionRequestsResponse = await api.get('/api/admin/adoption-requests', {
        params: { page: 0, size: 1000 },
      });
      const adoptionRequests = adoptionRequestsResponse.data.content || [];
      const monthlyAdoptions = adoptionRequests
        .filter((req) => req.status === 'ACCEPTED')
        .reduce((acc, req) => {
          const date = new Date(req.submittedAt); // Use submittedAt instead of createdAt
          const month = date.toLocaleString('en-US', { month: 'short' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});
      const barData = Object.entries(monthlyAdoptions).map(([month, adoptions]) => ({ month, adoptions }));
      setBarData(barData);

      // Fetch recent activities
      const recentActivities = adoptionRequests
        .slice(0, 5)
        .map((req) => ({
          activity: `Adoption request for pet ID ${req.petId}`,
          status: req.status,
          time: new Date(req.submittedAt).toLocaleTimeString(),
        }));
      setRecentActivities(recentActivities);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      if (error.response?.status === 403) {
        toast.error('Permission denied. Ensure you have ADMIN role.');
        navigate('/admin/login');
      } else if (error.response?.status === 401) {
        toast.error('Please log in to view dashboard');
        navigate('/admin/login');
      } else {
        toast.error('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
              {stat.icon}
            </div>
            <div>
              <div className="text-gray-500 text-sm font-medium">{stat.title}</div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-lg font-semibold text-gray-800 mb-4">Monthly Adoptions</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="adoptions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-lg font-semibold text-gray-800 mb-4">Pet Status Distribution</div>
          <div className="h-64 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500">No pet status data available</div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentActivities.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 whitespace-nowrap">{item.activity}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{item.status}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}