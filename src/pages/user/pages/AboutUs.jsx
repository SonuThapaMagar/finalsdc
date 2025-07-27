import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Shield,
  Users,
  Award,
  Target,
  Eye,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import group from "../../../images/group.png";
import "../../../styles/landing.css";
import LandingFooter from "../components/Footer/LandingFooter";

export default function AboutUs() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { number: "10,000+", label: "Successful Adoptions", icon: Heart },
    { number: "500+", label: "Partner Shelters", icon: Shield },
    { number: "50,000+", label: "Happy Families", icon: Users },
    { number: "5", label: "Years of Service", icon: Award },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      bio: "Animal welfare advocate with 15+ years of experience in pet rescue and adoption.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Dr. Michael Chen",
      role: "Veterinary Director",
      bio: "Licensed veterinarian ensuring the health and wellbeing of all pets in our network.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Emily Rodriguez",
      role: "Adoption Coordinator",
      bio: "Passionate about matching families with their perfect pet companions.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "David Thompson",
      role: "Technology Lead",
      bio: "Building innovative solutions to streamline the pet adoption process.",
      image: "/placeholder.svg?height=300&width=300",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassion First",
      description:
        "Every decision we make is guided by our love for animals and commitment to their welfare.",
    },
    {
      icon: Shield,
      title: "Trust & Transparency",
      description:
        "We maintain the highest standards of honesty and openness in all our operations.",
    },
    {
      icon: Users,
      title: "Community Focus",
      description:
        "Building strong relationships between pets, families, and local communities.",
    },
    {
      icon: Target,
      title: "Excellence",
      description:
        "Continuously improving our services to provide the best adoption experience.",
    },
  ];

  return (
    <>
      <div className="landing-page">
        {/* Header Section */}
        <section className="hero" style={{ padding: "3rem 0" }}>
          <div className="hero-container">
            <button
              onClick={() => navigate("/")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "none",
                border: "none",
                color: "#8b5cf6",
                fontSize: "1rem",
                cursor: "pointer",
                marginBottom: "2rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#7c3aed")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8b5cf6")}
            >
              <ArrowLeft size={20} />
              Back to Home
            </button>

            <div className="hero-grid">
              <div className="hero-content">
                <h1 className="hero-title">
                  About
                  <span className="hero-gradient-text"> FurEverHome</span>
                </h1>
                <p className="hero-subtitle">
                  We're on a mission to connect every pet with a loving family.
                  Since 2019, we've been building bridges between animals in
                  need and the families who will love them forever.
                </p>
              </div>

              <div className="hero-image-container">
                <div className="hero-image">
                  <img
                    src={group || "/group.png"}
                    alt="Our team"
                    width="600"
                    height="500"
                  />
                  <div className="hero-overlay" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="categories" style={{ background: "white" }}>
          <div className="categories-container">
            <div className="section-header">
              <h2 className="section-title">Our Impact</h2>
              <p className="section-subtitle">
                Numbers that tell our story of connecting pets with loving
                families
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "2rem",
              }}
            >
              {stats.map((stat, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    background: "#f9fafb",
                    borderRadius: "1rem",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      width: "4rem",
                      height: "4rem",
                      background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem",
                      color: "white",
                    }}
                  >
                    <stat.icon size={24} />
                  </div>
                  <div
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {stat.number}
                  </div>
                  <div style={{ color: "#6b7280", fontWeight: "500" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="features">
          <div className="features-container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                gap: "3rem",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "4rem",
                    height: "4rem",
                    background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                    borderRadius: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    color: "white",
                  }}
                >
                  <Target size={32} />
                </div>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    marginBottom: "1rem",
                  }}
                >
                  Our Mission
                </h3>
                <p style={{ color: "#6b7280", lineHeight: 1.6 }}>
                  To revolutionize pet adoption by creating a seamless,
                  transparent, and compassionate platform that connects rescue
                  animals with loving families, ensuring every pet finds their
                  forever home.
                </p>
              </div>

              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "4rem",
                    height: "4rem",
                    background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                    borderRadius: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    color: "white",
                  }}
                >
                  <Eye size={32} />
                </div>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    marginBottom: "1rem",
                  }}
                >
                  Our Vision
                </h3>
                <p style={{ color: "#6b7280", lineHeight: 1.6 }}>
                  A world where no healthy, loving animal is euthanized due to
                  lack of a home. We envision communities where pet adoption is
                  the first choice for families seeking animal companionship.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="about" style={{ background: "white" }}>
          <div className="about-container">
            <div className="section-header">
              <h2 className="section-title">Our Values</h2>
              <p className="section-subtitle">
                The principles that guide everything we do
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "2rem",
              }}
            >
              {values.map((value, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    background: "#f9fafb",
                    borderRadius: "1rem",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      width: "3rem",
                      height: "3rem",
                      background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem",
                      color: "white",
                    }}
                  >
                    <value.icon size={20} />
                  </div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      marginBottom: "1rem",
                    }}
                  >
                    {value.title}
                  </h3>
                  <p style={{ color: "#6b7280", lineHeight: 1.6 }}>
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        {/* <section className="features">
          <div className="features-container">
            <div className="section-header">
              <h2 className="section-title">Meet Our Team</h2>
              <p className="section-subtitle">The passionate people behind FurEverHome</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
              {team.map((member, index) => (
                <div
                  key={index}
                  style={{
                    background: "white",
                    borderRadius: "1rem",
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div style={{ height: "250px", overflow: "hidden" }}>
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>{member.name}</h3>
                    <div style={{ color: "#8b5cf6", fontWeight: "500", marginBottom: "1rem" }}>{member.role}</div>
                    <p style={{ color: "#6b7280", lineHeight: 1.6 }}>{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* Contact Section */}
        <section className="about" style={{ background: "white" }}>
          <div className="about-container">
            <div className="section-header">
              <h2 className="section-title">Get in Touch</h2>
              <p className="section-subtitle">We'd love to hear from you</p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "2rem",
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1.5rem",
                  background: "#f9fafb",
                  borderRadius: "1rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <Phone size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                    Phone
                  </div>
                  <div style={{ color: "#6b7280" }}>+977-9785854460</div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1.5rem",
                  background: "#f9fafb",
                  borderRadius: "1rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                    Email
                  </div>
                  <div style={{ color: "#6b7280" }}>fureverhome@gmail.com</div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1.5rem",
                  background: "#f9fafb",
                  borderRadius: "1rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                    Location
                  </div>
                  <div style={{ color: "#6b7280" }}>Kathmandu, Nepal</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta">
          <div className="cta-container">
            <h2>Join Our Mission</h2>
            <p>
              Help us create more happy endings. Start your adoption journey or
              become a partner shelter today!
            </p>

            <div className="cta-buttons">
              <button
                className="cta-btn-primary"
                onClick={() => navigate("/category")}
              >
                Browse Available Pets
              </button>
              <button
                className="cta-btn-secondary"
                onClick={() => navigate("/register-shelter")}
              >
                Become a Partner
              </button>
            </div>
          </div>
        </section>
        <LandingFooter />
      </div>
    </>
  );
}
