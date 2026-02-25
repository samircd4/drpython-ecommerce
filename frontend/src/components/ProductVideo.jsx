import React, { useState, useEffect } from 'react';
import { FaRobot, FaPlay, FaMagic } from 'react-icons/fa';
import api from "../api/client";

const ProductVideo = ({ videoUrl }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedVideo, setGeneratedVideo] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminStatus = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const res = await api.get('/customers/me/');
                if (res.data && (res.data.is_staff || res.data.is_staff)) {
                    setIsAdmin(true);
                }
            } catch (err) {
                // Not admin or error
            }
        };
        checkAdminStatus();
    }, []);

    // Use prop URL or default to the sample YouTube video provided
    const sampleVideoUrl = "https://www.youtube.com/watch?v=hVkcZzSJLBI";
    const activeVideoUrl = generatedVideo || videoUrl || sampleVideoUrl;

    // Helper function to get embed URL if it's a YouTube link
    const getEmbedUrl = (url) => {
        if (!url) return null;

        // Handle standard YouTube URLs
        if (url.includes('youtube.com/watch?v=')) {
            return url.replace('watch?v=', 'embed/');
        }

        // Handle short YouTube URLs
        if (url.includes('youtu.be/')) {
            return url.replace('youtu.be/', 'youtube.com/embed/');
        }

        // If it's already an embed URL or other format, return as is
        return url;
    };

    const handleGenerateVideo = () => {
        setIsGenerating(true);
        // Simulate API call for AI generation
        setTimeout(() => {
            setIsGenerating(false);
            // For demo purposes, we alert. In real app, this would setGeneratedVideo(newUrl)
            alert("AI Video generation request sent! This feature is coming soon.");
        }, 2500);
    };

    const embedUrl = getEmbedUrl(activeVideoUrl);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Video Player Section */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5">
                <div className="aspect-w-16 aspect-h-9 w-full relative">
                    <iframe
                        src={embedUrl}
                        title="Product Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-[500px] border-none"
                    ></iframe>

                    {/* Overlay badge for video type */}
                    <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm backdrop-blur-md ${activeVideoUrl === sampleVideoUrl ? "bg-red-600/90" : "bg-purple-600/90"
                            }`}>
                            {activeVideoUrl === sampleVideoUrl ? "In-Depth Review" : "AI Generated"}
                        </span>
                    </div>
                </div>
            </div>

            {/* AI Generator Control Panel - Admin Only */}
            {isAdmin && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                <FaMagic size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">Generate AI Product Video</h4>
                                <p className="text-gray-500 text-sm mt-1">
                                    Create a stunning 30-second promotional video instantly using our advanced AI engine.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerateVideo}
                            disabled={isGenerating}
                            className={`
                            relative overflow-hidden group px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all 
                            flex items-center gap-3 whitespace-nowrap cursor-pointer
                            ${isGenerating
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-purple-500/30 transform hover:-translate-y-0.5"
                                }
                        `}
                        >
                            {isGenerating ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    <span>Generating Magic...</span>
                                </>
                            ) : (
                                <>
                                    <FaRobot size={18} />
                                    <span>Generate Video</span>
                                </>
                            )}

                            {/* Shine effect */}
                            {!isGenerating && (
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductVideo;
