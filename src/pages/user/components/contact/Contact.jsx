import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import "../../../../styles/landing.css";
import LandingFooter from "../Footer/LandingFooter";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex flex-col">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 py-14 mb-10">
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-lg">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 font-medium max-w-2xl mb-2 drop-shadow">
              Have questions about adoption? Need help finding the perfect pet?
              We're here to help make your adoption journey smooth and
              successful.
            </p>
          </div>
        </div>

        <div className="max-w-5xl w-full mx-auto px-4 flex flex-col md:flex-row gap-10 mb-16">
          {/* Contact Information */}
          <div className="flex-1 flex flex-col gap-8 justify-between">
            <div className="bg-white/90 rounded-xl p-8 border border-purple-100 flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">
                Contact Information
              </h2>
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="text-gray-600">info@petadopt.com</p>
                  <p className="text-sm text-gray-500">
                    We'll respond within 24 hours
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Phone</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                  <p className="text-sm text-gray-500">Mon-Fri: 9AM-6PM EST</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Address</h3>
                  <p className="text-gray-600">
                    123 Pet Street
                    <br />
                    Animal City, AC 12345
                  </p>
                  <p className="text-sm text-gray-500">
                    Visit by appointment only
                  </p>
                </div>
              </div>
            </div>
            {/* FAQ Quick Links */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-100 rounded-xl p-6 flex flex-col gap-2">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Help</h3>
              <p className="text-gray-700 text-sm mb-2">
                Looking for answers to common questions? Check out our FAQ
                section first.
              </p>
              <Link
                to="/learn-more"
                className="text-purple-600 hover:text-indigo-700 font-medium text-sm"
              >
                View FAQ →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
