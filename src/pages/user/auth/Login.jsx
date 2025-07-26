import { Link, useNavigate } from "react-router-dom";
import "../../../styles/login.css";
import img from "../../../images/login.png";
import "../../../styles/global.css";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../../../api/api";
import { toast } from "react-toastify";
import { useAuth } from "../pages/auth-provider";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      console.log("API Response:", response.data);
      const { message, id, token, role = "USER" } = response.data; // Default to 'USER' if role is missing
      toast.success(message || "Login successful!");
      console.log("User ID:", id, "Role:", role);

      // Clear stale tokens
      localStorage.removeItem("adminToken");
      localStorage.removeItem("superadminToken");
      localStorage.removeItem("userRole");
      localStorage.setItem("jwtToken", token);

      const userData = {
        id: id,
        role: role,
        fullName: response.data.fullName || "User",
        email: formData.email,
        profileImage:
          response.data.profileImage || "/placeholder.svg?height=40&width=40",
      };
      login(userData, token);

      // Navigate based on role
      if (role === "SUPERADMIN") navigate("/superadmin/dashboard");
      else if (role === "ADMIN") navigate("/admin/dashboard");
      else navigate("/user/dashboard"); // Default to user dashboard
    } catch (error) {
      let errorMessage = "An error occurred during login";
      if (error.response) {
        console.error("Error Response:", error.response.data);
        if (error.response.status === 401) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      console.error("Error:", errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="page-container">
      <main className="main-content">
        <div className="illustration-container">
          <img
            src={img}
            alt="Pet care illustration"
            className="pet-illustration"
          />
        </div>
        <div className="form-container">
          <div className="form-card">
            <h4 className="title">FurEverHome</h4>
            <h2 className="form-title">Login</h2>
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email*</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password*</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter Your Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ paddingRight: "2rem" }}
                  />
                  <span
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: "absolute",
                      right: "0.5rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      userSelect: "none",
                      fontSize: "1.2rem",
                    }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
              </div>
              <div className="forgot-password">
                <Link to="/forgot-password">Forget Password</Link>
              </div>
              <button type="submit" className="submit-button">
                Sign in
              </button>
            </form>
            <div className="form-footer">
              <p>
                Don't have Account?{" "}
                <Link to="/signup" className="form-link">
                  Sign up Here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
