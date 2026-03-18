import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Are You Sure!", 
    message = "Want to delete this item?", 
    confirmText = "DELETE",
    cancelText = "CLOSE",
    isLoading = false 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-modal-backdrop" 
                onClick={!isLoading ? onClose : undefined} 
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-[#071229] border border-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center animate-modal-content">
                
                {/* Warning Icon - Burst Shape */}
                <div className="relative mb-6">
                    {/* Background burst effect using a rotate transform on two squares or a specific polygon */}
                    <div className="w-16 h-16 bg-red-600 rounded-xl rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                        <AlertTriangle className="w-8 h-8 text-white -rotate-45" strokeWidth={3} />
                    </div>
                </div>

                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                    {title}
                </h2>
                
                <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex w-full gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
