import { useState } from "react";

export default function CopyableText({ value, label }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!value) return;
        try {
            if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(value);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = value;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
        } catch (e) {
            console.error("Copy failed:", e);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {label && (
                <span className="font-semibold text-purple-700">
                    {label}:
                </span>
            )}

            <span className="text-purple-800 font-medium">
                {value || "N/A"}
            </span>

            <button
                onClick={handleCopy}
                className="text-xs px-2 py-1 rounded bg-purple-100 hover:bg-purple-200 text-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-500 transition cursor-pointer"
                aria-label={`Copy ${label || "text"}`}
            >
                {copied ? (
                    // ✅ Copied icon
                    <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    // 📋 Copy icon
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                    </svg>
                )}
            </button>
        </div>
    );
}
