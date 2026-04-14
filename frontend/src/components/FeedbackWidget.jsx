import { useState, useRef } from 'react';
import { X, Bug, Zap, Shield, Eye, Lightbulb, Upload, CheckCircle, Loader2, ChevronDown, MessageSquare } from 'lucide-react';
import { createFeedback } from '../api/feedbackApi';

const TYPE_OPTIONS = [
    { value: 'feedback', label: 'Feedback', icon: MessageSquare, color: '#06b6d4' },
    { value: 'bug', label: 'Bug Report', icon: Bug, color: '#f87171' },
    { value: 'ui', label: 'UI Issue', icon: Eye, color: '#c084fc' },
    { value: 'performance', label: 'Performance', icon: Zap, color: '#facc15' },
    { value: 'security', label: 'Security', icon: Shield, color: '#fb923c' },
    { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: '#60a5fa' },
];

const INITIAL_FORM = {
    name: '', email: '', title: '', type: 'feedback',
    message: '', screenshot: null,
};

export default function FeedbackWidget({ onClose, inline = false, referrer = null }) {
    const [form, setForm] = useState({ ...INITIAL_FORM });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [preview, setPreview] = useState(null);
    const fileRef = useRef(null);

    const set = (key, val) => {
        setForm(p => ({ ...p, [key]: val }));
        setErrors(p => ({ ...p, [key]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email';
        if (!form.title.trim()) e.title = 'Title is required';
        if (!form.message.trim()) e.message = 'Please describe the issue';
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleFile = (file) => {
        if (!file) return;
        set('screenshot', file);
        const reader = new FileReader();
        reader.onload = e => setPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await createFeedback(form);
            setSuccess(true);
        } catch (err) {
            const data = err?.response?.data;
            if (data && typeof data === 'object') {
                setErrors(data);
            } else {
                setErrors({ _general: 'Something went wrong. Please try again.' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setForm({ ...INITIAL_FORM });
        setSuccess(false);
        setErrors({});
        setPreview(null);
    };

    const formContent = (
        <>
            {success ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Feedback Submitted!</h3>
                    <p className="text-slate-400 text-sm mb-6">
                        Thank you for helping us improve. Our team will review your report.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleReset}
                            className="px-5 py-2.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/40 rounded-xl text-sm text-slate-300 transition-colors cursor-pointer"
                        >
                            Submit Another
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm text-white font-medium transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {errors._general && (
                        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
                            {errors._general}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Your Name *
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => set('name', e.target.value)}
                            placeholder="Enter your full name"
                            className={`w-full px-3 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors ${errors.name ? 'border-red-500/60' : 'border-slate-700/40'
                                }`}
                        />
                        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => set('email', e.target.value)}
                            placeholder="your.email@example.com"
                            className={`w-full px-3 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors ${errors.email ? 'border-red-500/60' : 'border-slate-700/40'
                                }`}
                        />
                        {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Issue Type
                        </label>
                        <div className="grid grid-cols-6 gap-2">
                            {TYPE_OPTIONS.map(opt => {
                                const Icon = opt.icon;
                                const active = form.type === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => set('type', opt.value)}
                                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${active
                                            ? 'border-opacity-60 text-white shadow-md'
                                            : 'border-slate-700/40 text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                                            }`}
                                        style={active ? {
                                            borderColor: `${opt.color}60`,
                                            backgroundColor: `${opt.color}15`,
                                            color: opt.color,
                                        } : {}}
                                    >
                                        <Icon className="w-4 h-4" style={active ? { color: opt.color } : {}} />
                                        <span className="text-[10px] leading-none">{opt.label.split(' ')[0]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => set('title', e.target.value)}
                            placeholder="Brief description of the issue"
                            className={`w-full px-3 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors ${errors.title ? 'border-red-500/60' : 'border-slate-700/40'
                                }`}
                        />
                        {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Description *
                        </label>
                        <textarea
                            value={form.message}
                            onChange={e => set('message', e.target.value)}
                            rows={4}
                            placeholder="Describe the issue in detail. What happened? What did you expect?"
                            className={`w-full px-3 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none ${errors.message ? 'border-red-500/60' : 'border-slate-700/40'
                                }`}
                        />
                        {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
                    </div>

                    {/* Screenshot */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Screenshot <span className="text-slate-600 normal-case font-normal">(optional)</span>
                        </label>
                        {preview ? (
                            <div className="relative group rounded-xl overflow-hidden border border-slate-700/40">
                                <img src={preview} alt="Preview" className="w-full max-h-40 object-contain bg-slate-900" />
                                <button
                                    type="button"
                                    onClick={() => { setPreview(null); set('screenshot', null); }}
                                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-lg text-white hover:bg-red-600/60 transition-colors cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="w-full py-6 border-2 border-dashed border-slate-700/50 hover:border-blue-500/40 rounded-xl text-slate-500 hover:text-slate-400 transition-colors flex flex-col items-center gap-2 cursor-pointer"
                            >
                                <Upload className="w-5 h-5" />
                                <span className="text-xs">Click to upload image</span>
                            </button>
                        )}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleFile(e.target.files[0])}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 rounded-xl text-sm text-slate-400 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bug className="w-4 h-4" />}
                            {submitting ? 'Submitting…' : 'Submit Feedback'}
                        </button>
                    </div>
                </form>
            )}
        </>
    );

    if (inline) {
        return (
            <div className="w-full">
                <div className="px-6 py-5">
                    {formContent}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-lg bg-[#0d1b2e] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40 bg-gradient-to-r from-[#0d1b2e] to-[#091525] shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                            <Bug className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">Report an Issue</h2>
                            <p className="text-xs text-slate-400">Help us improve your experience</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {formContent}
                </div>
            </div>
        </div>
    );
}
