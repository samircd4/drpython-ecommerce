import React, { useState } from "react";

const Insights = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage("Please select a file first.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const token = localStorage.getItem("access_token");
            console.log(token);


            const res = await fetch("http://localhost:8000/api/import/brands/", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(`Uploaded successfully! Created: ${data.created}`);
            } else {
                setMessage(data.error || "Upload failed");
            }
        } catch (error) {
            setMessage("Something went wrong!");
        }

        setLoading(false);
    };

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent bg-slate-900/50">
            <div className="rounded-xl bg-[#071229] p-6 shadow-md">
                <h2 className="text-2xl font-bold text-slate-100">Insights</h2>
                <p className="mt-2 text-slate-300">Insights and trends.</p>

                {/* Upload Box */}
                <div className="mt-6 p-4 border border-slate-700 rounded-lg">
                    <h3 className="text-slate-200 font-semibold mb-3">
                        Import Excel File
                    </h3>

                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="block w-full text-slate-200 mb-3"
                    />

                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                    >
                        {loading ? "Uploading..." : "Upload"}
                    </button>

                    {message && (
                        <p className="mt-3 text-sm text-slate-300">
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Insights;