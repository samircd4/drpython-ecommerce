import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedinIn, FaTwitter, FaEnvelope, FaDribbble, FaArrowLeft, FaBriefcase, FaAward, FaCode, FaCheckCircle } from 'react-icons/fa';
import SEO from '../components/SEO';
import { teamMembers } from '../data/teamData';

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

const TeamMemberDetails = () => {
    const { id } = useParams();
    const member = teamMembers.find(m => m.id === id);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!member) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 text-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full"
                >
                    <h1 className="text-3xl font-black text-gray-900 mb-4">Profile Not Found</h1>
                    <p className="text-gray-500 mb-8 font-medium">The team member profile you're looking for does not exist or has been moved.</p>
                    <Link to="/team" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-200 transition-all transform hover:-translate-y-1">
                        <FaArrowLeft /> View All Team
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-white font-sans selection:bg-purple-100 selection:text-purple-900`}>
            <SEO
                title={`${member.name} | ${member.role} at Sarker Shop`}
                description={member.bio}
                image={member.image}
                url={`https://sarker.shop/team/${member.id}`}
            />

            {/* Immersive Hero Header */}
            <div className="relative h-[35vh] md:h-[45vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent z-10" />
                <motion.img
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    src={member.coverImage}
                    alt="Cover Banner"
                    className="w-full h-full object-cover"
                />

                {/* Back Link Overlay */}
                <div className="absolute top-8 left-4 md:left-8 z-20">
                    <Link to="/team" className="group flex items-center gap-2 text-white/90 hover:text-white font-bold bg-white/10 hover:bg-white/20 backdrop-blur-xl px-5 py-2.5 rounded-2xl transition-all border border-white/20 shadow-xl">
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm tracking-tight">Team Directory</span>
                    </Link>
                </div>

                {/* Background Text Decal (Large Screens Only) */}
                <div className="absolute bottom-4 right-8 z-0 hidden lg:block select-none pointer-events-none">
                    <h2 className="text-white/5 font-black text-[10rem] uppercase leading-none tracking-tighter">
                        {member.name.split(' ')[0]}
                    </h2>
                </div>
            </div>

            {/* Profile Content Wrapper */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-20 md:-mt-32 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Essential Info (Col 4) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-4"
                    >
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-purple-900/5 border border-gray-100 p-8 text-center md:text-left overflow-hidden relative group">
                            {/* Accent Corner */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${member.gradient} opacity-5 rounded-bl-[5rem]`} />

                            <div className="relative z-10">
                                {/* Large Avatar with Shine */}
                                <div className="relative inline-block md:block mx-auto md:mx-0 mb-6">
                                    <div className={`absolute inset-0 bg-gradient-to-tr ${member.gradient} rounded-[2rem] blur-2xl opacity-30 animate-pulse`} />
                                    <div className="relative w-48 h-48 rounded-[2rem] p-1.5 bg-white shadow-xl border border-gray-100 overflow-hidden transform group-hover:rotate-1 transition-transform duration-500">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover rounded-[1.5rem]"
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-11 h-11 bg-white border-4 border-white rounded-full flex items-center justify-center text-white shadow-xl pointer-events-none z-20">
                                        <VerifiedMedalIcon className="w-7 h-7" color="#3B82F6" />
                                    </div>
                                </div>

                                <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{member.name}</h1>
                                <p className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${member.gradient} uppercase tracking-[0.2em] mb-8`}>
                                    {member.role}
                                </p>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition-colors">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white shadow-lg shadow-purple-100`}>
                                            <FaBriefcase size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Experience</p>
                                            <p className="text-gray-900 font-bold">{member.experience}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                            <FaAward size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
                                            <p className="text-gray-900 font-bold">Verified Expert</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    {member.socials.linkedin && (
                                        <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                                            <FaLinkedinIn size={18} />
                                        </a>
                                    )}
                                    {member.socials.github && (
                                        <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-gray-50 hover:bg-gray-900 text-gray-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                                            <FaGithub size={18} />
                                        </a>
                                    )}
                                    {member.socials.twitter && (
                                        <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-sky-50 hover:bg-sky-500 text-sky-500 hover:text-white transition-all flex items-center justify-center shadow-sm">
                                            <FaTwitter size={18} />
                                        </a>
                                    )}
                                    <a href={member.socials.mail} className="w-12 h-12 rounded-xl bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm">
                                        <FaEnvelope size={18} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Detailed Bio & Stats (Col 8) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Summary Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12"
                        >
                            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                <FaCode className="text-purple-600" /> Professional Summary
                            </h3>
                            <p className="text-gray-500 text-lg md:text-xl leading-relaxed font-medium mb-10">
                                {member.bio}
                            </p>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Technical Arsenal</p>
                                <div className="flex flex-wrap gap-2">
                                    {member.expertise.map((skill, i) => (
                                        <span key={i} className={`px-5 py-2.5 rounded-2xl bg-gradient-to-r ${member.bgGradient || 'from-gray-50 to-white'} border border-gray-100 text-gray-600 font-black text-xs shadow-sm shadow-purple-900/5`}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Achievements Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className={`bg-gradient-to-br ${member.gradient} rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden`}
                        >
                            {/* Background Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-20 translate-x-20" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-[60px] translate-y-20 -translate-x-10" />

                            <h3 className="text-2xl font-black mb-10 flex items-center gap-3 relative z-10">
                                <FaAward className="text-white/80" /> Career Milestones
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                {member.achievements.map((ach, i) => (
                                    <div key={i} className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl shrink-0 group-hover:bg-white group-hover:text-purple-600 transition-all duration-300">
                                            {i + 1}
                                        </div>
                                        <p className="text-lg font-bold leading-tight pt-1">
                                            {ach}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamMemberDetails;
