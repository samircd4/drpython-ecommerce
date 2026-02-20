import React, { useState } from "react";
import api from "../api/client";
import { toast } from "react-toastify";
import {
    FaEnvelope,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaFacebookF,
    FaFacebookMessenger,
    FaWhatsapp,
    FaComments,
    FaPaperPlane,
} from "react-icons/fa";

const Contact = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "Web Contact", // Default subject
        message: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/contact/', formData);
            if (response.status === 201) {
                toast.success("Thank you for contacting us! We'll get back to you soon.");
                setFormData({ name: "", email: "", subject: "Web Contact", message: "" });
            }
        } catch (error) {
            console.error("Contact form error:", error);
            toast.error("Failed to send message. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const contactMethods = [
        {
            icon: <FaEnvelope />,
            title: "Email Us",
            value: "support@sarkershop.com",
            color: "bg-blue-100 text-blue-600",
            link: "mailto:support@sarkershop.com"
        },
        {
            icon: <FaPhoneAlt />,
            title: "Call Us",
            value: "+880 1781 355 377",
            color: "bg-green-100 text-green-600",
            link: "tel:+8801781355377"
        },
        {
            icon: <FaMapMarkerAlt />,
            title: "Visit Us",
            value: "Islami Super Market, Kishoreganj, Bangladesh",
            color: "bg-purple-100 text-purple-600",
            link: "#"
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero Header */}
            <div className="bg-purple-700 py-20 px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                        Get in Touch
                    </h1>
                    <p className="text-purple-100 text-lg max-w-2xl mx-auto">
                        We'd love to hear from you. Whether you have a question about our products,
                        pricing, or just want to say hi, our team is ready to answer all your questions.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Contact Info Column */}
                    <div className="lg:col-span-1 space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        {/* Quick Info Cards */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Contact Information</h3>
                            <div className="space-y-6">
                                {contactMethods.map((method, index) => (
                                    <a
                                        key={index}
                                        href={method.link}
                                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${method.color} group-hover:scale-110 transition-transform duration-300`}>
                                            {method.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">{method.title}</p>
                                            <p className="text-gray-800 font-semibold">{method.value}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Connect With Us</h3>
                            <div className="flex justify-between gap-2">
                                <a
                                    href="https://www.facebook.com/shopsarker"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 gap-2"
                                >
                                    <FaFacebookF size={20} />
                                    <span className="text-xs font-medium">Facebook</span>
                                </a>
                                <a
                                    href="https://m.me/shopsarker"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300 gap-2"
                                >
                                    <FaFacebookMessenger size={20} />
                                    <span className="text-xs font-medium">Messenger</span>
                                </a>
                                <a
                                    href="https://wa.me/+8801781355377"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl bg-green-50 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-300 gap-2"
                                >
                                    <FaWhatsapp size={20} />
                                    <span className="text-xs font-medium">WhatsApp</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form Column */}
                    <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="bg-white rounded-2xl shadow-xl shadow-purple-900/5 p-8 border border-gray-100 h-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Send us a Message</h2>
                            <p className="text-gray-500 mb-8">Fill up the form and our team will get back to you within 24 hours.</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Message</label>
                                    <textarea
                                        name="message"
                                        placeholder="How can we help you?"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full md:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <FaPaperPlane className="text-sm" />
                                        {loading ? "Sending..." : "Send Message"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>

                {/* Map Section */}
                <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-purple-600" />
                        Find Us on Map
                    </h2>
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                        {/* Overlay for interaction hint */}
                        <div className="absolute inset-0 pointer-events-none border-[6px] border-white/50 rounded-2xl z-10 shadow-inner"></div>

                        <iframe
                            title="Office Location"
                            src="https://maps.google.com/maps?q=Islami+Super+Market,+Kishoreganj,&t=&z=15&ie=UTF8&iwloc=&output=embed"
                            width="100%"
                            height="450"
                            style={{ border: 0, borderRadius: '1rem' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
