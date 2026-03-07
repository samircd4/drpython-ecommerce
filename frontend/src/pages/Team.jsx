import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaArrowRight, FaLinkedinIn, FaGithub, FaTwitter, FaEnvelope, FaDribbble } from 'react-icons/fa';
import SEO from '../components/SEO';
import { teamMembers } from '../data/teamData';

// --- Components ---

/**
 * Exact Medal Component from User SVG
 */
const VerifiedMedalIcon = ({ className = "w-5 h-5", color = "#FFD700" }) => (
    <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 384 512"
        className={className}
        style={{ color: color }}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M97.12 362.63c-8.69-8.69-4.16-6.24-25.12-11.85-9.51-2.55-17.87-7.45-25.43-13.32L1.2 448.7c-4.39 10.77 3.81 22.47 15.43 22.03l52.69-2.01L105.56 507c8 8.44 22.04 5.81 26.43-4.96l52.05-127.62c-10.84 6.04-22.87 9.58-35.31 9.58-19.5 0-37.82-7.59-51.61-21.37zM382.8 448.7l-45.37-111.24c-7.56 5.88-15.92 10.77-25.43 13.32-21.07 5.64-16.45 3.18-25.12 11.85-13.79 13.78-32.12 21.37-51.62 21.37-12.44 0-24.47-3.55-35.31-9.58L252 502.04c4.39 10.77 18.44 13.4 26.43 4.96l36.25-38.28 52.69 2.01c11.62.44 19.82-11.27 15.43-22.03zM263 340c15.28-15.55 17.03-14.21 38.79-20.14 13.89-3.79 24.75-14.84 28.47-28.98 7.48-28.4 5.54-24.97 25.95-45.75 10.17-10.35 14.14-25.44 10.42-39.58-7.47-28.38-7.48-24.42 0-52.83 3.72-14.14-.25-29.23-10.42-39.58-20.41-20.78-18.47-17.36-25.95-45.75-3.72-14.14-14.58-25.19-28.47-28.98-27.88-7.61-24.52-5.62-44.95-26.41-10.17-10.35-25-14.4-38.89-10.61-27.87 7.6-23.98 7.61-51.9 0-13.89-3.79-28.72.25-38.89 10.61-20.41 20.78-17.05 18.8-44.94 26.41-13.89 3.79-24.75 14.84-28.47 28.98-7.47 28.39-5.54 24.97-25.95 45.75-10.17 10.35-14.15 25.44-10.42 39.58 7.47 28.36 7.48 24.4 0 52.82-3.72 14.14.25 29.23 10.42 39.59 20.41 20.78 18.47 17.35 25.95 45.75 3.72 14.14 14.58 25.19 28.47 28.98C104.6 325.96 106.27 325 121 340c13.23 13.47 33.84 15.88 49.74 5.82a39.676 39.676 0 0 1 42.53 0c15.89 10.06 36.5 7.65 49.73-5.82zM97.66 175.96c0-53.03 42.24-96.02 94.34-96.02s94.34 42.99 94.34 96.02-42.24 96.02-94.34 96.02-94.34-42.99-94.34-96.02z"></path>
    </svg>
);

/**
 * Noise Overlay Component
 * Creates a premium film grain texture
 */
const NoiseOverlay = () => (
    <div
        className="fixed inset-0 pointer-events-none z-[100] opacity-[0.035]"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
    />
);

/**
 * Animated Background Blobs
 */
const BackgroundBlobs = () => (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
            animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
                scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/40 rounded-full blur-[120px]"
        />
        <motion.div
            animate={{
                x: [0, -80, 0],
                y: [0, 100, 0],
                scale: [1, 1.1, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px]"
        />
        <motion.div
            animate={{
                x: [0, 50, 0],
                y: [0, -50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-rose-100/30 rounded-full blur-[100px]"
        />
    </div>
);

// --- Main Page ---

const Team = () => {
    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            <SEO
                title="Our Executive Team - Sarker Shop"
                description="Meet the world-class visionaries building the future of e-commerce in Bangladesh."
                url="https://sarker.shop/team"
            />

            <NoiseOverlay />
            <BackgroundBlobs />

            <div className="max-w-[1500px] mx-auto relative z-10 pt-4">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-black text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-purple-500/20"
                    >
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        Executive Intelligence
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className="text-4xl md:text-7xl font-black text-gray-900 tracking-tight leading-[0.9] mb-6"
                    >
                        Building the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">Standard of Excellence</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-gray-400 font-bold uppercase tracking-widest text-xs"
                    >
                        Architecting the future of retail across Bangladesh
                    </motion.p>
                </div>

                {/* Team Grid: 2 columns mobile, 5 columns large screen */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8"
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.08
                            }
                        }
                    }}
                >
                    {teamMembers.map((member) => (
                        <motion.div
                            key={member.id}
                            variants={{
                                hidden: { opacity: 0, y: 30, scale: 0.9 },
                                show: { opacity: 1, y: 0, scale: 1 }
                            }}
                        >
                            <Link
                                to={`/team/${member.id}`}
                                className="group block h-full bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-gray-100 hover:border-purple-300 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative cursor-pointer"
                            >
                                {/* Solid Divider Accent Top */}
                                <div className={`h-24 w-full bg-gradient-to-tr ${member.gradient} relative overflow-hidden border-b-2 border-gray-100`}>
                                    <div className="absolute top-2 right-4 opacity-10 font-black text-white text-5xl italic tracking-tighter">
                                        #{member.id.split('-').pop().toUpperCase()}
                                    </div>
                                </div>

                                <div className="px-5 pb-8 text-center flex flex-col items-center">
                                    {/* Profile Image */}
                                    <div className="relative w-28 h-28 -mt-14 mb-5 z-10 p-2 bg-white rounded-[2rem] shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-6 border border-gray-50">
                                        <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                                loading="lazy"
                                            />
                                        </div>
                                        {/* Verified Medal Badge */}
                                        <div className="absolute bottom-0 -right-1 w-9 h-9 bg-white border-4 border-white rounded-full flex items-center justify-center text-white shadow-xl pointer-events-none z-20">
                                            <VerifiedMedalIcon className="w-6 h-6" color="#3B82F6" />
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-purple-600 transition-colors mb-1">
                                        {member.name}
                                    </h3>

                                    {/* Role */}
                                    <p className={`text-[10px] font-black uppercase tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r ${member.gradient} mb-4`}>
                                        {member.role}
                                    </p>

                                    {/* Mini-bio */}
                                    <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2 px-1">
                                        {member.bio}
                                    </p>

                                    {/* Expertise Quick Tags */}
                                    <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                                        {member.expertise.slice(0, 3).map((skill, i) => (
                                            <span key={i} className="px-2 py-0.5 rounded-md bg-gray-50/80 border border-gray-100 text-[9px] font-bold text-gray-500 uppercase tracking-tight">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Experience pill */}
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50/50 border border-gray-100 text-gray-400 group-hover:text-purple-700 group-hover:bg-purple-50 group-hover:border-purple-100 transition-all mb-4">
                                        <FaBriefcase size={10} />
                                        <span className="text-[10px] font-black">{member.experience}</span>
                                    </div>

                                    {/* Social Icons (Secondary Actions) */}
                                    <div className="flex items-center justify-center gap-3 mt-auto pt-6 border-t border-gray-50/50 w-full" onClick={(e) => e.stopPropagation()}>
                                        {member.socials.linkedin && (
                                            <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-600 transition-all hover:scale-125">
                                                <FaLinkedinIn size={16} />
                                            </a>
                                        )}
                                        {member.socials.github && (
                                            <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-900 transition-all hover:scale-125">
                                                <FaGithub size={16} />
                                            </a>
                                        )}
                                        <a href={member.socials.mail} className="text-gray-300 hover:text-rose-500 transition-all hover:scale-125">
                                            <FaEnvelope size={16} />
                                        </a>
                                    </div>
                                </div>

                                {/* Hover Animated Glow Border */}
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-400/20 rounded-[2.5rem] transition-all duration-700 pointer-events-none" />
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Visual Accent Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-24 text-center pb-12"
                >
                    <div className="w-px h-24 bg-gradient-to-b from-gray-200 to-transparent mx-auto mb-8" />
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.5em]">
                        Sarker Shop Internal Directory • 2026 Edition
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Team;
