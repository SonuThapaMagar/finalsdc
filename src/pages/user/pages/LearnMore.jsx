import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Heart, Home, CheckCircle, Clock, FileText, Search, Menu, X, Shield, Users } from "lucide-react"
import "../../../styles/landing.css"
// import logo from "../images/logo.png"
// import group from "../images/group.png"

export default function LearnMore() {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const adoptionSteps = [
    {
      step: 1,
      title: "Browse & Search",
      description:
        "Explore our extensive database of pets available for adoption. Use our advanced search and filter options to find your perfect match based on breed, age, size, and more.",
      time: "5-10 minutes",
      icon: Search,
    },
    {
      step: 2,
      title: "Connect & Meet",
      description:
        "Contact the shelter or rescue organization to arrange a meeting with your potential pet. This is your chance to get to know each other and see if it's a good fit.",
      time: "1-2 days",
      icon: Heart,
    },
    {
      step: 3,
      title: "Application & Review",
      description:
        "Complete the adoption application. The shelter will review your information, conduct a home visit if required, and ensure you're ready for pet ownership.",
      time: "3-7 days",
      icon: Shield,
    },
    {
      step: 4,
      title: "Adoption & Homecoming",
      description:
        "Once approved, complete the adoption paperwork, pay any fees, and bring your new family member home. We'll provide guidance for a smooth transition.",
      time: "Same day",
      icon: Users,
    },
  ]

  const preparationTips = [
    {
      category: "Home Preparation",
      tips: [
        "Pet-proof your home by removing hazardous items",
        "Set up designated areas for food, water, and rest",
        "Install baby gates if needed for safety",
        "Prepare a comfortable sleeping area",
      ],
    },
    {
      category: "Essential Supplies",
      tips: [
        "Food and water bowls",
        "High-quality pet food",
        "Collar, leash, and ID tags",
        "Toys and enrichment items",
        "Grooming supplies",
      ],
    },
    {
      category: "Health & Safety",
      tips: [
        "Schedule a vet appointment within the first week",
        "Ensure vaccinations are up to date",
        "Consider pet insurance for unexpected costs",
        "Keep emergency vet contact information handy",
      ],
    },
  ]

  const faqs = [
    {
      question: "How much does pet adoption cost?",
      answer:
        "Adoption fees typically range from $50-$300 depending on the pet's age, breed, and medical needs. This fee covers vaccinations, spaying/neutering, and microchipping.",
    },
    {
      question: "How long does the adoption process take?",
      answer:
        "The process usually takes 1-2 weeks from application to bringing your pet home. This includes application review, meet and greet, and home check.",
    },
    {
      question: "Can I return a pet if it doesn't work out?",
      answer:
        "Yes, we have a return policy. We want what's best for both you and the pet. We'll work with you to address any issues or help find a better match.",
    },
    {
      question: "Do you offer support after adoption?",
      answer:
        "We provide ongoing support including training resources, behavioral guidance, and access to our network of veterinarians and pet care professionals.",
    },
  ]

  return (
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

          <div className="hero-content" style={{ textAlign: "center" }}>
            <h1 className="hero-title" style={{ fontSize: "3rem", marginBottom: "1rem" }}>
              Everything You Need to Know About
              <span className="hero-gradient-text"> Pet Adoption</span>
            </h1>
            <p className="hero-subtitle" style={{ maxWidth: "800px", margin: "0 auto" }}>
              Learn about the adoption process, prepare for your new pet, and discover how to provide the best care for
              your furry friend.
            </p>
          </div>
        </div>
      </section>

      {/* Adoption Process */}
      <section className="categories" style={{ background: "white" }}>
        <div className="categories-container">
          <div className="section-header">
            <h2 className="section-title">The Adoption Process</h2>
            <p className="section-subtitle">Follow these simple steps to find and adopt your perfect companion</p>
          </div>

          <div style={{ display: "grid", gap: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
            {adoptionSteps.map((step, index) => (
              <div
                key={step.step}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "2rem",
                  padding: "2rem",
                  background: index % 2 === 0 ? "#f9fafb" : "white",
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
                    color: "white",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                >
                  {step.step}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "600", margin: 0 }}>{step.title}</h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        color: "#6b7280",
                        fontSize: "0.875rem",
                      }}
                    >
                      <Clock size={16} />
                      {step.time}
                    </div>
                  </div>
                  <p style={{ color: "#6b7280", margin: 0, lineHeight: 1.6 }}>{step.description}</p>
                </div>

                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    background: "#ede9fe",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#8b5cf6",
                  }}
                >
                  <step.icon size={24} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preparation Tips */}
      <section className="features">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Preparing for Your New Pet</h2>
            <p className="section-subtitle">
              Essential tips to ensure a smooth transition for you and your new companion
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
            {preparationTips.map((category, index) => (
              <div
                key={category.category}
                style={{
                  background: "white",
                  padding: "2rem",
                  borderRadius: "1rem",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    marginBottom: "1.5rem",
                    color: "#8b5cf6",
                  }}
                >
                  {category.category}
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {category.tips.map((tip, tipIndex) => (
                    <li
                      key={tipIndex}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                        marginBottom: "1rem",
                        color: "#374151",
                      }}
                    >
                      <CheckCircle size={20} style={{ color: "#10b981", marginTop: "0.125rem", flexShrink: 0 }} />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="about" style={{ background: "white" }}>
        <div className="about-container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">Get answers to common questions about pet adoption</p>
          </div>

          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "2rem",
                  padding: "2rem",
                  background: "#f9fafb",
                  borderRadius: "1rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    marginBottom: "1rem",
                    color: "#111827",
                  }}
                >
                  {faq.question}
                </h3>
                <p style={{ color: "#6b7280", margin: 0, lineHeight: 1.6 }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-container">
          <h2>Ready to Start Your Adoption Journey?</h2>
          <p>Browse our available pets and find your perfect companion today!</p>

          <div className="cta-buttons">
            <button className="cta-btn-primary" onClick={() => navigate("/category")}>
              Browse Available Pets
            </button>
            <button className="cta-btn-secondary" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
