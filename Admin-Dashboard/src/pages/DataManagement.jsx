import React, { useState } from "react";

const DataManagement = () => {
    const [selectedModel, setSelectedModel] = useState("products");
    const [exportFormat, setExportFormat] = useState("xlsx");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const models = [
        { id: "products", name: "Products" },
        { id: "brands", name: "Brands" },
        { id: "customers", name: "Customers" },
        { id: "reviews", name: "Reviews" },
    ];

    const exportFormats = [
        { id: "xlsx", name: "Excel (.xlsx)" },
        { id: "csv", name: "CSV (.csv)" },
        { id: "json", name: "JSON (.json)" },
    ];

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage({ text: "", type: "" });
    };

    const handleExport = () => {
        const token = localStorage.getItem("access_token");
        // Removed trailing slash logic as per previous backend fix
        const url = `http://localhost:8000/api/data-mgmt/export-file/${selectedModel}?format=${exportFormat}`;
        
        fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error("Export failed");
            return response.blob();
        })
        .then(blob => {
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${selectedModel}.${exportFormat}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
            setMessage({ text: "Export successful! Check your downloads.", type: "success" });
        })
        .catch(error => {
            console.error("Export error:", error);
            setMessage({ text: "Failed to export data. Please try again.", type: "error" });
        });
    };


    const handleImport = async () => {
        if (!file) {
            setMessage({ text: "Please select a file first.", type: "error" });
            return;
        }

        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const formData = new FormData();
            formData.append("file", file);

            const token = localStorage.getItem("access_token");

            // Added data-mgmt path
            const res = await fetch(`http://localhost:8000/api/data-mgmt/import-file/${selectedModel}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ text: `Uploaded successfully! Created ${data.created} records.`, type: "success" });
                setFile(null);
                // Clear the file input visually
                const fileInput = document.getElementById("importFileInput");
                if(fileInput) fileInput.value = "";
            } else {
                setMessage({ text: data.error || "Upload failed. Invalid format or data.", type: "error" });
            }
        } catch (error) {
            setMessage({ text: "Something went wrong during import!", type: "error" });
        }

        setLoading(false);
    };

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent bg-slate-900/50">
            <div className="rounded-xl bg-[#071229] p-6 shadow-md max-w-4xl mx-auto border border-slate-800">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-100">Data Management</h2>
                    <p className="mt-2 text-slate-400">Import and export platform entities seamlessly across multiple formats.</p>
                </div>

                <div className="mt-6 mb-8 bg-slate-800/30 p-5 rounded-xl border border-slate-700">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Target Data Module</label>
                    <select
                        value={selectedModel}
                        onChange={(e) => {
                            setSelectedModel(e.target.value);
                            setMessage({ text: "", type: "" });
                        }}
                        className="w-full md:w-1/2 bg-slate-900 border border-slate-600 text-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    >
                        {models.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Export Box */}
                    <div className="p-6 border border-slate-700/60 hover:border-slate-600 rounded-xl bg-slate-800/20 transition-colors flex flex-col h-full">
                        <div className="flex items-center mb-3">
                            <h3 className="text-lg text-slate-100 font-semibold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export Data
                            </h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-6 flex-grow">
                            Download all current <strong>{models.find(m => m.id === selectedModel)?.name}</strong> from the database. The system will generate a <strong>{exportFormats.find(f => f.id === exportFormat)?.name}</strong> file containing complete records including <strong>absolute media URLs</strong>.
                        </p>
                        
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Export Format</label>
                            <select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                {exportFormats.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <button
                            onClick={handleExport}
                            className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors border border-slate-600 flex justify-center items-center gap-2 mt-auto"
                        >
                            <span>Download {exportFormats.find(f => f.id === exportFormat)?.id.toUpperCase()}</span>
                        </button>
                    </div>

                    {/* Import Box */}
                    <div className="p-6 border border-slate-700/60 hover:border-slate-600 rounded-xl bg-slate-800/20 transition-colors flex flex-col h-full">
                        <div className="flex items-center mb-3">
                            <h3 className="text-lg text-slate-100 font-semibold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Import Data
                            </h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-6 flex-grow">
                            Bulk upload new <strong>{models.find(m => m.id === selectedModel)?.name}</strong> to the database. Supported formats include <span className="font-mono text-xs bg-slate-800 p-1 rounded">.csv</span>, <span className="font-mono text-xs bg-slate-800 p-1 rounded">.json</span>, and <span className="font-mono text-xs bg-slate-800 p-1 rounded">.xlsx</span>.
                        </p>

                        <div className="mt-auto">
                            <input
                                id="importFileInput"
                                type="file"
                                accept=".xlsx,.xls,.csv,.json"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-slate-300 mb-4 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-900/40 file:text-blue-200 hover:file:bg-blue-900/60 cursor-pointer transition-colors"
                            />

                            <button
                                onClick={handleImport}
                                disabled={loading || !file}
                                className={`w-full px-4 py-3 font-medium rounded-lg transition-all flex justify-center items-center gap-2 ${loading || !file ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 border border-blue-500'}`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing Upload...
                                    </>
                                ) : (
                                    <span>Upload to {models.find(m => m.id === selectedModel)?.name}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {message.text && (
                    <div className={`mt-8 p-4 rounded-lg border flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-900/20 border-emerald-800/50 text-emerald-300' : 'bg-red-900/20 border-red-800/50 text-red-300'}`}>
                        {message.type === 'success' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        )}
                        <span>{message.text}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataManagement;
