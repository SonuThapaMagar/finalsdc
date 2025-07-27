import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiDashboardLine,
  RiUserLine,
  RiStore2Line,
  RiAppsLine,
  RiLogoutBoxLine,
  RiAccountCircleLine,
} from 'react-icons/ri';
import { toast } from 'react-toastify';

const menuItems = [
  {
    key: 'dashboard',
    icon: <RiDashboardLine className="text-lg" />,
    label: 'Dashboard',
    path: '/admin/dashboard',
  },
  {
    key: 'users',
    icon: <RiUserLine className="text-lg" />,
    label: 'View Users',
    path: '/admin/users',
  },
  {
    key: 'pets',
    icon: <RiAppsLine className="text-lg" />,
    label: 'Pet Management',
    path: '/admin/pets',
  },
  {
    key: 'adoptionRequests',
    icon: <RiStore2Line className="text-lg" />,
    label: 'Adoption Requests',
    path: '/admin/adoptionRequests',
  },
  {
    key: 'profile',
    icon: <RiAccountCircleLine className="text-lg" />,
    label: 'Profile',
    path: '/admin/adminProfile',
  },
  {
    key: 'logout',
    icon: <RiLogoutBoxLine className="text-lg" />,
    label: 'Logout',
    path: '/logout',
  },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token'); // Changed from 'adminToken'
    const userRole = localStorage.getItem('userRole');
    if (!token || userRole !== 'ADMIN') {
      toast.error('Please log in to access admin features');
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  const handleMenuClick = (item) => {
    if (item.key === 'logout') {
      setShowLogoutDialog(true);
    } else {
      navigate(item.path);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Changed from 'adminToken'
    localStorage.removeItem('userId'); // Changed from 'adminId'
    localStorage.removeItem('userRole');
    setShowLogoutDialog(false);
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <RiUserLine className="text-white text-xl" />
          </div>
          <span className="text-lg font-semibold text-gray-800">Admin</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {isMobileMenuOpen ? <RiMenuFoldLine className="text-xl" /> : <RiMenuUnfoldLine className="text-xl" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
              <RiUserLine className="text-white text-2xl" />
            </div>
            <span className="text-xl font-semibold text-gray-800">Admin</span>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <span className={`text-lg ${location.pathname === item.path ? 'text-blue-600' : 'text-gray-500'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar */}
        <aside className={`fixed left-0 top-0 z-30 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}>
          <div className="flex flex-col h-full">
            <div className="flex flex-col items-center p-6 border-b border-gray-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <RiUserLine className="text-white text-xl" />
              </div>
              {!collapsed && <span className="text-lg font-semibold text-gray-800">Admin</span>}
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'hover:bg-gray-50 hover:text-blue-600'
                  } ${collapsed ? 'justify-center' : 'justify-start'}`}
                >
                  <span className={`text-lg ${location.pathname === item.path ? 'text-blue-600' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-72'}`}>
          <div className="p-6">
            <div className="mb-6">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg"
              >
                {collapsed ? <RiMenuUnfoldLine className="text-xl" /> : <RiMenuFoldLine className="text-xl" />}
              </button>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <div className="font-semibold text-lg mb-2">Do you want to logout?</div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowLogoutDialog(false)}
              >
                No
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={handleLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;