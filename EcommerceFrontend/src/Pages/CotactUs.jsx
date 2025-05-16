import React, { useState } from "react";
import {
  Breadcrumbs,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email format";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.message.trim() || form.message.trim().length < 10)
      newErrors.message = "Message must be at least 10 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    if (validateForm()) {
      setLoading(true);
      setTimeout(() => {
        console.log("Form submitted:", form);
        setLoading(false);
        setSuccess("Your message has been sent successfully!");
        setForm({ name: "", email: "", phone: "", message: "" });
        setErrors({});
      }, 1500);
    }
  };

  const copyPageInfo = () => {
    navigator.clipboard.writeText("Contact TekNix Technology Corporation");
    alert("Page info copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="w-full h-full flex flex-col md:px-6 lg:px-[100px] 2xl:px-[200px]">
        {/* Breadcrumbs */}
        <div className="mb-8 py-6">
          <Breadcrumbs
            aria-label="breadcrumb"
            separator="›"
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            <Link
              to="/"
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            >
              <HomeIcon fontSize="small" />
              Home
            </Link>
            <span className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-1">
              <ContactMailIcon fontSize="small" />
              Contact
            
            </span>
          </Breadcrumbs>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Get in Touch
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            We're here to assist you. Reach out with any questions or inquiries!
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md space-y-8">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <span className="text-gray-500 dark:text-gray-400">📍</span> Our Office
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                123 Innovation Drive, Silicon Valley, CA 94043
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <span className="text-gray-500 dark:text-gray-400">📞</span> Call Us
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Available 24/7</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                +1 (800) 555-1234
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <span className="text-gray-500 dark:text-gray-400">📩</span> Email Us
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Response within 24 hours</p>
              <p className="text-gray-800 dark:text-gray-200">support@teknix.com</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <span className="text-gray-500 dark:text-gray-400">⏰</span> Business Hours
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Monday - Friday: 8 AM - 6 PM
                <br />
                Saturday: 10 AM - 2 PM
                <br />
                Sunday: Closed
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <span className="text-gray-500 dark:text-gray-400">🔗</span> Follow Us
              </h2>
              <div className="flex space-x-4 mt-3">
                {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map(
                  (Icon, index) => (
                    <a
                      key={index}
                      href="#"
                      className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Icon size={20} />
                    </a>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name *"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email *"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Your Phone *"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <textarea
                    name="message"
                    placeholder="Your Message *"
                    value={form.message}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                    rows="5"
                  ></textarea>
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                  )}
                </div>
              </div>

              {success && (
                <p className="text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 p-3 rounded-lg text-center">
                  {success}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} className="text-white" />
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Google Map Embed */}
        <div className="mt-12">
          <iframe
            className="w-full h-80 rounded-xl shadow-lg"
            src="https://maps.google.com/maps?q=Silicon+Valley,+CA&t=&z=13&ie=UTF8&iwloc=&output=embed"
            allowFullScreen
            loading="lazy"
            title="TekNix Office Location"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
