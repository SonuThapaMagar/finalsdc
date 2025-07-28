import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../pages/user/pages/auth-provider";
import UserLogin from "../pages/user/auth/Login";
import AdminLogin from "../pages/auth/Login";
import SuperadminLayout from "../pages/superadmin/layout/SuperadminLayout";
import Dashboard from "../pages/superadmin/Dashboard";
import UserManagement from "../pages/superadmin/pages/UserManagement";
import PetCenterMgmt from "../pages/superadmin/pages/PetCenterMgmt";
import PetMgmt from "../pages/superadmin/pages/PetMgmt";
import EditUserPage from "../pages/superadmin/pages/EditUser";
import EditPet from "../pages/superadmin/pages/EditPet";
import EditPetCenter from "../pages/superadmin/pages/EditPetCenter";
import ViewPetCenterDetails from "../pages/superadmin/pages/ViewPetCenterDetails"; 
import AdminLayout from "../pages/admin/layout/AdminLayout";
import AdminDashboard from "../pages/admin/pages/AdminDashboard";
import AdoptionRequests from "../pages/admin/pages/AdoptionRequests";
import PetCenterProfile from "../pages/admin/pages/PetCenterProfile";
import ViewUsers from "../pages/admin/pages/ViewUsers";
import PetCRUD from "../pages/admin/pages/PetCRUD";
import FAQ from "../pages/user/pages/FAQ";
import Contact from "../pages/user/components/contact/Contact";
import NotFound from "../pages/user/pages/NotFound";
import UserSignup from "../pages/user/auth/Signup";
import LearnMore from "../pages/user/pages/LearnMore";
import AboutUs from "../pages/user/pages/AboutUs";
import ShelterRegistration from "../pages/user/pages/ShelterRegistration";
import Adoptme from "../pages/user/pages/Adoptme";
import AdoptionSuccess from "../pages/user/pages/AdoptionSuccess";
import Category from "../pages/user/pages/category";
import LandingPage from "../pages/user/LandingPage";
import UserLayout from "../pages/user/layout/UserLayout";
import Profile from "../pages/user/pages/Profile";
import UserDashboard from "../pages/user/pages/UserDashboard";
import ChangePassword from "../pages/user/pages/ChangePassword";
import LostFound from "../pages/user/pages/LostFound";
import MyAdoptions from "../pages/user/pages/MyAdoptions";
import ForgotPassword from "../pages/user/pages/ForgotPassword";

// Route Guard Components (unchanged)
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (requiredRole === "ADMIN" || requiredRole === "SUPERADMIN") {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    if (requiredRole === "ADMIN" || requiredRole === "SUPERADMIN") {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children, redirectTo = null }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (isAuthenticated && redirectTo) {
    if (user?.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === "SUPERADMIN") {
      return <Navigate to="/superadmin/dashboard" replace />;
    } else if (user?.role === "USER") {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
};

const AuthRoute = ({ children }) => {
  const { isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  return children;
};

const ConditionalRoute = ({ children, requireAuth = false }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes wrapped in UserLayout for consistent navbar */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/register-shelter" element={<ShelterRegistration />} />
        <Route path="/pets" element={<Category />} />
        <Route path="/category" element={<Category />} />
      </Route>

      {/* Authentication routes */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <UserLogin />
          </AuthRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthRoute>
            <UserSignup />
          </AuthRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthRoute>
            <ForgotPassword />
          </AuthRoute>
        }
      />
      <Route
        path="/admin/login"
        element={
          <AuthRoute>
            <AdminLogin />
          </AuthRoute>
        }
      />

      {/* Conditional routes */}
      <Route
        path="/adoptme/:petId?"
        element={
          <ConditionalRoute requireAuth={true}>
            <Adoptme />
          </ConditionalRoute>
        }
      />
      <Route
        path="/adoption-success/:petId/:applicationId"
        element={
          <ConditionalRoute requireAuth={true}>
            <AdoptionSuccess />
          </ConditionalRoute>
        }
      />

      {/* Protected User routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute requiredRole="USER">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="myadoptions" element={<MyAdoptions />} />
        <Route path="lost-found" element={<LostFound />} />
        <Route path="about-us" element={<AboutUs />} />
        <Route path="contact" element={<Contact />} />
        <Route path="profile" element={<Profile />} />
        <Route path="petList" element={<Category />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* Protected Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<ViewUsers />} />
        <Route path="pets" element={<PetCRUD />} />
        <Route path="adoptionRequests" element={<AdoptionRequests />} />
        <Route path="adminProfile" element={<PetCenterProfile />} />
        <Route path="pet-centers/edit/:centerId" element={<EditPetCenter />} />
      </Route>

      {/* Protected Superadmin routes */}
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute requiredRole="SUPERADMIN">
            <SuperadminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="users/edit/:userId" element={<EditUserPage />} />
        <Route path="pet-centers" element={<PetCenterMgmt />} />
        <Route path="pet-centers/edit/:centerId" element={<EditPetCenter />} />
        <Route path="pets" element={<PetMgmt />} />
        <Route path="pets/edit/:petId" element={<EditPet />} />
        <Route path="pet-centers/view-details/:centerId" element={<ViewPetCenterDetails />} /> {/* New route */}
      </Route>

      {/* Catch all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}