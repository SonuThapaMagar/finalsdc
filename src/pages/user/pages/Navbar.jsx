import React, { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Menu, X, User } from "lucide-react"
import ProfileModal from "./ProfileModal"
import logo from "../../../images/logo.png"
import "../../../styles/Navbar.css"
import { useAuth } from "./auth-provider"
import avatarImg from '../../../images/avatar.jpg';

// Debounce hook
function useDebounce(callback, delay) {
  const timeoutRef = useRef()
  const debouncedFn = useCallback((...args) => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay])
  return debouncedFn
}

function NavigationLinks({ links, onNavigate, className = "" }) {
  return (
    <div className={className}>
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          onClick={e => {
            if (link.href.startsWith("/")) {
              e.preventDefault()
              onNavigate(link.href)
            }
          }}
          className="navbar-nav-link"
        >
          {link.name}
        </a>
      ))}
    </div>
  )
}

function AuthButtons({ onLogin, onSignup }) {
  return (
    <div className="navbar-auth-buttons">
      <button onClick={onLogin} className="navbar-signin-btn" aria-label="Sign In">
        Sign In
      </button>
      <button onClick={onSignup} className="navbar-signup-btn" aria-label="Sign Up">
        Sign Up
      </button>
    </div>
  )
}

function ProfileDropdown({ onProfile, onChangePassword, onLogout, onClose }) {
  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="navbar-profile-dropdown" style={{ position: "absolute", top: "100%", right: 0, background: "white", border: "1px solid #eee", borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", minWidth: "160px", zIndex: 100, display: "flex", flexDirection: "column" }}
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={(e) => {
        e.stopPropagation();
        onProfile();
      }} style={{ background: "none", border: "none", padding: "10px 16px", textAlign: "left", cursor: "pointer", fontSize: "1rem", color: "#333", transition: "background 0.2s" }}>
        My Profile
      </button>
      {/* <button onClick={(e) => {
        e.stopPropagation();
        onChangePassword();
      }} style={{ background: "none", border: "none", padding: "10px 16px", textAlign: "left", cursor: "pointer", fontSize: "1rem", color: "#333", transition: "background 0.2s" }}>
        Change Password
      </button> */}
      <button onClick={(e) => {
        e.stopPropagation();
        onLogout();
      }} style={{ background: "none", border: "none", padding: "10px 16px", textAlign: "left", cursor: "pointer", fontSize: "1rem", color: "#e53e3e", transition: "background 0.2s" }}>
        Logout
      </button>
    </div>
  )
}

export default function Navbar({
  showSearch = true,
  searchQuery = "",
  onSearchChange,
  searchResults = [],
  onSearchResultClick,
  className = "",
  forceAuthButtons = false,
}) {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false) // <-- Add state for modal
  const profileDropdownRef = useRef(null)

  // Generate a consistent color based on user's email/name
  const getAvatarColor = (emailOrName) => {
    const colors = [
      "#3b82f6", // blue
      "#8b5cf6", // purple
      "#06b6d4", // cyan
      "#10b981", // emerald
      "#f59e0b", // amber
      "#ef4444", // red
      "#ec4899", // pink
      "#84cc16", // lime
    ];
    if (!emailOrName) return colors[0];
    const hash = emailOrName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const getUserInitial = (user) => {
    if (user?.fullName) return user.fullName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const avatarColor = getAvatarColor(user?.email || user?.fullName);
  const userInitial = getUserInitial(user);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isMobileMenuOpen])

  // Click outside to close profile dropdown
  useEffect(() => {
    if (!isProfileDropdownOpen) return
    function handleClick(e) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [isProfileDropdownOpen])

  // Debounced search
  const debouncedSearchChange = useDebounce((value) => {
    if (onSearchChange) onSearchChange(value)
  }, 300)

  const showProfile = isAuthenticated && user?.role === 'USER' && !forceAuthButtons

  // Navigation links for logged-in users
  const userNavigationLinks = [
    { name: "Dashboard", href: "/user/dashboard" },
    { name: "Pet Listing", href: "/user/petList" },
    { name: "My Adoptions", href: "/user/myadoptions" },
    { name: "Contact", href: "/contact" },
  ];

  // Navigation links for guests
  const guestNavigationLinks = [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn-more" },
    { name: "About", href: "/about-us" },
    { name: "Pet Listing", href: "/category" },
    { name: "Contact", href: "/contact" },
  ];

  const navigationLinks = showProfile ? userNavigationLinks : guestNavigationLinks;

  return (
    <>
      <nav className={`navbar ${className}`} aria-label="Main Navigation">
        <div className="navbar-container">
          <div className="navbar-content">
            {/* Logo */}
            <div className="navbar-logo" onClick={() => navigate("/")} tabIndex={0} aria-label="Go to Home" role="button">
              <div className="navbar-logo-icon">
                <img
                  src={logo || "/logo.png"}
                  alt="logo"
                  width="48"
                  height="48"
                />
              </div>
              <span className="navbar-logo-text">FurEverHome</span>
            </div>

            {/* Desktop Navigation */}
            <NavigationLinks links={navigationLinks} onNavigate={navigate} className="navbar-nav" />

            {/* Desktop Actions */}
            <div className="navbar-actions">
              {/* {showSearch && (
                <button className="navbar-search-btn" aria-label="Open search" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                  <Search size={20} />
                </button>
              )} */}

              {showProfile ? (
                <div
                  className="navbar-profile"
                  tabIndex={0}
                  style={{ position: "relative" }}
                  ref={profileDropdownRef}
                  aria-haspopup="true"
                  aria-expanded={isProfileDropdownOpen}
                >
                  <div
                    className="navbar-profile-image"
                    onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                    style={{ cursor: "pointer" }}
                    aria-label="Open profile menu"
                    tabIndex={0}
                  >
                    <img
                      src={avatarImg}
                      alt={user?.fullName || "Profile"}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover"
                      }}
                    />
                  </div>
                  <div className="navbar-profile-info" onClick={() => setIsProfileDropdownOpen((prev) => !prev)} style={{ cursor: "pointer" }} tabIndex={0}>
                    {/* <div className="navbar-profile-name">{user?.fullName || "User"}</div> */}
                    {user?.email && (
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 400 }}>{user.email}</div>
                    )}
                  </div>
                  {isProfileDropdownOpen && (
                    <>
                      <ProfileDropdown
                        onProfile={() => { navigate("/user/profile"); setIsProfileDropdownOpen(false) }}
                        // onChangePassword={() => { navigate("/user/change-password"); setIsProfileDropdownOpen(false) }}
                        onLogout={() => { setShowLogoutDialog(true); setIsProfileDropdownOpen(false) }} // <-- Open modal
                        onClose={() => setIsProfileDropdownOpen(false)}
                      />
                      {/* Overlay for click outside */}
                      <div
                        style={{ position: "fixed", inset: 0, zIndex: 99 }}
                        onClick={() => setIsProfileDropdownOpen(false)}
                        aria-label="Close profile menu"
                        tabIndex={-1}
                      />
                    </>
                  )}
                </div>
              ) : (
                <AuthButtons onLogin={() => navigate("/login")} onSignup={() => navigate("/signup")} />
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="navbar-mobile-btn" aria-label="Open mobile menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && isSearchOpen && (
          <div className="navbar-search-bar">
            <div className="navbar-search-container">
              <input
                type="text"
                placeholder="Search for pets by name, breed, or type..."
                value={searchQuery}
                onChange={e => debouncedSearchChange(e.target.value)}
                className="navbar-search-input"
                aria-label="Search for pets"
                autoFocus
              />
              <Search size={20} className="navbar-search-icon" />
            </div>

            {/* Search Results */}
            {searchQuery && searchResults.length >= 0 && (
              <div className="navbar-search-results">
                {searchResults.length > 0 ? (
                  searchResults.slice(0, 5).map((pet) => (
                    <div key={pet.id} className="navbar-search-result" onClick={onSearchResultClick} tabIndex={0} role="button" aria-label={`View ${pet.name}`}>
                      <img
                        src={pet.imageUrl || "/placeholder.svg"}
                        alt={pet.name}
                        className="navbar-search-result-image"
                      />
                      <div>
                        <div className="navbar-search-result-name">
                          {pet.name} {pet.gender === "female" ? "♀️" : "♂️"}
                        </div>
                        <div className="navbar-search-result-details">
                          {pet.age} • {pet.breed} • {pet.type}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="navbar-search-no-results">No pets found matching "{searchQuery}"</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu */}
        <div className={`navbar-mobile-menu ${isMobileMenuOpen ? "" : "hidden"}`}>
          <div className="navbar-mobile-menu-content">
            <NavigationLinks links={navigationLinks} onNavigate={href => { navigate(href); setIsMobileMenuOpen(false) }} className="" />

            {showProfile ? (
              <div className="navbar-mobile-profile">
                <div
                  className="navbar-mobile-profile-info"
                  onClick={() => {
                    setIsProfileOpen(true)
                    setIsMobileMenuOpen(false)
                  }}
                  tabIndex={0}
                  aria-label="Open profile modal"
                  role="button"
                >
                  <div className="navbar-mobile-profile-image">
                    <img
                      src={avatarImg}
                      alt={user?.fullName || "Profile"}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        objectFit: "cover"
                      }}
                    />
                  </div>
                  <div>
                    <div className="navbar-mobile-profile-location">Location</div>
                    <div className="navbar-mobile-profile-name">{user?.fullName || "User"}</div>
                    {user?.email && (
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 400 }}>{user.email}</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigate("/category")
                    setIsMobileMenuOpen(false)
                  }}
                  className="navbar-mobile-browse-btn"
                  aria-label="Browse Pets"
                >
                  Browse Pets
                </button>
              </div>
            ) : (
              <div className="navbar-mobile-auth">
                <button
                  onClick={() => {
                    navigate("/login")
                    setIsMobileMenuOpen(false)
                  }}
                  className="navbar-mobile-signin-btn"
                  aria-label="Sign In"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate("/signup")
                    setIsMobileMenuOpen(false)
                  }}
                  className="navbar-mobile-signup-btn"
                  aria-label="Sign Up"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
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
                onClick={() => {
                  logout();
                  setShowLogoutDialog(false);
                  navigate("/login");
                }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}