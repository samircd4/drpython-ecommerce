import React, { useState } from "react";
import api from "../api/axiosConfig";

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
        { id: "categories", name: "Categories" },
        { id: "orders", name: "Orders" },
        { id: "payment_infos", name: "Payment Infos" },
        { id: "coupons", name: "Coupons" },
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

    // ✅ EXPORT USING AXIOS
    const handleExport = async () => {
        try {
            setMessage({ text: "", type: "" });

            const response = await api.get(
                `/export/${selectedModel}`,
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `${selectedModel}.${exportFormat}`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(downloadUrl);

            setMessage({
                text: "Export successful! Check your downloads.",
                type: "success",
            });
        } catch (error) {
            console.error("Export error:", error);
            setMessage({
                text: "Failed to export data. Please try again.",
                type: "error",
            });
        }
    };

    // ✅ IMPORT USING AXIOS
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

            const response = await api.post(
                `/import/${selectedModel}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const data = response.data;

            setMessage({
                text: `Uploaded successfully! Created ${data.created} records.`,
                type: "success",
            });

            setFile(null);

            const fileInput = document.getElementById("importFileInput");
            if (fileInput) fileInput.value = "";
        } catch (error) {
            console.error("Import error:", error);

            const errorMsg =
                error.response?.data?.error ||
                "Upload failed. Invalid format or data.";

            setMessage({ text: errorMsg, type: "error" });
        }

        setLoading(false);
    };

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent bg-slate-900/50">
            <div className="rounded-xl bg-[#071229] p-6 shadow-md max-w-4xl mx-auto border border-slate-800">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-100">
                        Data Management
                    </h2>
                    <p className="mt-2 text-slate-400">
                        Import and export platform entities seamlessly across multiple formats.
                    </p>
                </div>

                {/* MODEL SELECT */}
                <div className="mt-6 mb-8 bg-slate-800/30 p-5 rounded-xl border border-slate-700">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Target Data Module
                    </label>
                    <select
                        value={selectedModel}
                        onChange={(e) => {
                            setSelectedModel(e.target.value);
                            setMessage({ text: "", type: "" });
                        }}
                        className="w-full md:w-1/2 bg-slate-900 border border-slate-600 text-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {models.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* EXPORT */}
                    <div className="p-6 border border-slate-700 rounded-xl bg-slate-800/20 flex flex-col">
                        <h3 className="text-lg text-slate-100 font-semibold mb-4">
                            Export Data
                        </h3>

                        <select
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded-lg p-2.5 mb-4"
                        >
                            {exportFormats.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleExport}
                            className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                        >
                            Download {exportFormat.toUpperCase()}
                        </button>
                    </div>

                    {/* IMPORT */}
                    <div className="p-6 border border-slate-700 rounded-xl bg-slate-800/20 flex flex-col">
                        <h3 className="text-lg text-slate-100 font-semibold mb-4">
                            Import Data
                        </h3>

                        <input
                            id="importFileInput"
                            type="file"
                            accept=".xlsx,.xls,.csv,.json"
                            onChange={handleFileChange}
                            className="mb-4 text-slate-300"
                        />

                        <button
                            onClick={handleImport}
                            disabled={loading || !file}
                            className={`w-full px-4 py-3 rounded-lg ${
                                loading || !file
                                    ? "bg-slate-800 text-slate-500"
                                    : "bg-blue-600 hover:bg-blue-500 text-white"
                            }`}
                        >
                            {loading ? "Uploading..." : "Upload"}
                        </button>
                    </div>
                </div>

                {/* MESSAGE */}
                {message.text && (
                    <div
                        className={`mt-6 p-4 rounded ${
                            message.type === "success"
                                ? "bg-green-900 text-green-300"
                                : "bg-red-900 text-red-300"
                        }`}
                    >
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataManagement;