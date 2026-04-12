import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import api from '../api/client';
import { toast } from 'react-toastify';
import { Sparkles, Save, RotateCcw } from 'lucide-react';

const DescriptionTab = ({ product, onUpdate }) => {
    const { user } = useUser();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedDescription, setGeneratedDescription] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const isAdmin = !!user?.is_staff;

    const handleGenerate = async () => {
        setIsGenerating(true);
        // Simulate AI generation for now
        setTimeout(() => {
            const mockAIContents = [
                `Elevate your lifestyle with the ${product.name}. Designed for those who demand excellence, this premium product combines cutting-edge technology with elegant aesthetics. Whether you're at work or play, it delivers unparalleled performance and reliability.`,
                `Experience innovation like never before with the ${product.name}. Crafted with precision and high-quality materials, it offers a seamless blend of style and functionality. It's not just a product; it's a statement of quality and sophisticated design.`,
                `The ${product.name} is the ultimate solution for modern needs. Featuring an ergonomic design and intuitive controls, it ensures a superior user experience. Built to last and perform, it's the perfect addition to your core collection.`
            ];
            const randomIndex = Math.floor(Math.random() * mockAIContents.length);
            setGeneratedDescription(mockAIContents[randomIndex]);
            setShowPreview(true);
            setIsGenerating(false);
            toast.info("AI Description generated! Review and submit.");
        }, 1500);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await api.patch(`/products/${product.slug || product.id}/`, {
                description: generatedDescription
            });
            toast.success("Description updated successfully!");
            if (onUpdate) onUpdate(response.data);
            setShowPreview(false);
        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Failed to update description.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setGeneratedDescription('');
        setShowPreview(false);
    };

    return (
        <div className="space-y-6">
            <div className="prose max-w-none text-gray-600 bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative group overflow-hidden">
                {/* Decorative background for description */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>

                <h4 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                    Product Description
                </h4>

                <div className="relative z-10">
                    {product.description ? (
                        <div 
                            className="whitespace-pre-line leading-relaxed description-content prose max-w-none" 
                            dangerouslySetInnerHTML={{ __html: product.description }} 
                        />
                    ) : (
                        <p className="text-gray-400 italic">No description available for this product.</p>
                    )}
                </div>

                {isAdmin && !showPreview && (
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-bold shadow-lg hover:shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate AI Description
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* AI Generated Preview Section */}
            {showPreview && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 shadow-inner relative">
                        <div className="absolute -top-3 left-6 px-3 py-1 bg-purple-600 text-white text-xs font-black uppercase tracking-widest rounded-md shadow-sm">
                            AI Preview
                        </div>

                        <div className="mt-2 text-purple-900">
                            <textarea
                                value={generatedDescription}
                                onChange={(e) => setGeneratedDescription(e.target.value)}
                                className="w-full bg-white border border-purple-200 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 outline-none min-h-[150px] text-gray-700 leading-relaxed transition-shadow"
                                placeholder="Edit the generated description if needed..."
                            />
                        </div>

                        <div className="mt-6 flex flex-wrap gap-4 items-center justify-between">
                            <p className="text-sm text-purple-600 font-medium">
                                You can edit this text before saving it to the product.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 font-bold transition-colors cursor-pointer"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Discard
                                </button>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !generatedDescription.trim()}
                                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg font-bold shadow-md hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DescriptionTab;
