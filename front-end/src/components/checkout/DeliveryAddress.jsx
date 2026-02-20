import React, { useState, useEffect } from "react";
import { FaHome, FaBuilding, FaCheck, FaChevronDown } from "react-icons/fa";
import api from "../../api/client";

const DeliveryAddress = ({
    email,
    fullName,
    phone,
    division,
    district,
    subDistrict,
    address,
    addressType,
    onEmailChange,
    onFullNameChange,
    onPhoneChange,
    onDivisionChange,
    onDistrictChange,
    onSubDistrictChange,
    onAddressChange,
    onAddressTypeChange,
    savedAddresses = [],
    onAddressSelect,
    errors = {},
    saveAddress,
    onSaveAddressChange,
    isAddressFromSaved
}) => {
    const [divisionsList, setDivisionsList] = useState([]);
    const [districtsList, setDistrictsList] = useState([]);
    const [subDistrictsList, setSubDistrictsList] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Fetch Divisions on Mount
    useEffect(() => {
        api.get('/divisions/')
            .then(res => setDivisionsList(res.data))
            .catch(err => console.error("Error fetching divisions", err));
    }, []);

    // Fetch Districts when Division changes
    useEffect(() => {
        if (division) {
            const selectedDiv = divisionsList.find(d => d.name === division);
            if (selectedDiv) {
                api.get(`/districts/?division_id=${selectedDiv.id}`)
                    .then(res => setDistrictsList(res.data))
                    .catch(err => console.error("Error fetching districts", err));
            }
        } else {
            setDistrictsList([]);
        }
    }, [division, divisionsList]);

    // Fetch SubDistricts when District changes
    useEffect(() => {
        if (district) {
            const selectedDist = districtsList.find(d => d.name === district);
            if (selectedDist) {
                api.get(`/sub-districts/?district_id=${selectedDist.id}`)
                    .then(res => setSubDistrictsList(res.data))
                    .catch(err => console.error("Error fetching sub-districts", err));
            }
        } else {
            setSubDistrictsList([]);
        }
    }, [district, districtsList]);

    return (
        <div className="mt-6 bg-white border rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
                <h2 className="text-xl font-bold text-neutral-800">
                    Delivery Address
                </h2>

                {savedAddresses.length > 0 && (
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="bg-purple-50 text-purple-700 px-4 py-2 rounded-md border border-purple-200 text-sm font-semibold flex items-center gap-2 hover:bg-purple-100 transition-colors"
                        >
                            Use Saved Address <FaChevronDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsDropdownOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto p-2 space-y-2">
                                    <div className="text-xs font-bold text-gray-400 px-2 py-1 uppercase border-b mb-1">
                                        Your Saved Addresses
                                    </div>
                                    {savedAddresses.map((addr) => {
                                        const isSelected =
                                            addr.full_name === fullName &&
                                            addr.phone === phone &&
                                            addr.address === address &&
                                            addr.division === division &&
                                            addr.district === district &&
                                            addr.sub_district === subDistrict;

                                        return (
                                            <div
                                                key={addr.id}
                                                onClick={() => {
                                                    onAddressSelect(addr);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-purple-500 hover:bg-purple-50 group ${isSelected ? 'border-purple-500 bg-purple-50' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-bold uppercase py-0.5 px-1.5 rounded ${isSelected ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`}>
                                                            {addr.address_type}
                                                        </span>
                                                        {isSelected && <FaCheck className="text-purple-600 text-xs" />}
                                                    </div>
                                                    {addr.is_default && (
                                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">DEFAULT</span>
                                                    )}
                                                </div>
                                                <div className={`text-sm font-bold group-hover:text-purple-800 ${isSelected ? 'text-purple-800' : 'text-gray-800'}`}>{addr.full_name}</div>
                                                <div className="text-xs text-gray-500">{addr.phone}</div>
                                                <div className="text-xs text-gray-600 line-clamp-2 mt-1">
                                                    {addr.address}, {addr.sub_district}, {addr.district}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                </label>
                <input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    className={`w-full border rounded-md px-3 py-2 ${errors.email ? 'border-red-500 focus:ring-red-200' : ''}`}
                    value={email}
                    onChange={onEmailChange}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        placeholder="Full Name"
                        className={`w-full border rounded-md px-3 py-2 ${errors.fullName ? 'border-red-500 focus:ring-red-200' : ''}`}
                        value={fullName}
                        onChange={onFullNameChange}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="phone"
                        type="text"
                        placeholder="Ex:01xxxxxxxxx"
                        className={`w-full border rounded-md px-3 py-2 ${errors.phone ? 'border-red-500 focus:ring-red-200' : ''}`}
                        value={phone}
                        onChange={onPhoneChange}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Division <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="division"
                        className={`w-full border rounded-md px-3 py-2 ${errors.division ? 'border-red-500 focus:ring-red-200' : ''}`}
                        value={division}
                        onChange={(e) => {
                            onDivisionChange(e);
                            // Reset dependent fields
                            onDistrictChange({ target: { value: "" } });
                            onSubDistrictChange({ target: { value: "" } });
                        }}
                    >
                        <option value="">Select Division</option>
                        {divisionsList.map((div) => (
                            <option key={div.id} value={div.name}>
                                {div.name} / {div.bn_name}
                            </option>
                        ))}
                    </select>
                    {errors.division && <p className="text-red-500 text-xs mt-1">{errors.division}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        District <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="district"
                        className={`w-full border rounded-md px-3 py-2 ${errors.district ? 'border-red-500 focus:ring-red-200' : ''}`}
                        value={district}
                        onChange={(e) => {
                            onDistrictChange(e);
                            onSubDistrictChange({ target: { value: "" } });
                        }}
                        disabled={!division}
                    >
                        <option value="">Select District</option>
                        {districtsList.map((dist) => (
                            <option key={dist.id} value={dist.name}>
                                {dist.name} / {dist.bn_name}
                            </option>
                        ))}
                    </select>
                    {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sub District <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="subDistrict"
                        className={`w-full border rounded-md px-3 py-2 ${errors.subDistrict ? 'border-red-500 focus:ring-red-200' : ''}`}
                        value={subDistrict}
                        onChange={onSubDistrictChange}
                        disabled={!district}
                    >
                        <option value="">Select Sub District</option>
                        {subDistrictsList.map((sub) => (
                            <option key={sub.id} value={sub.name}>
                                {sub.name} / {sub.bn_name}
                            </option>
                        ))}
                    </select>
                    {errors.subDistrict && <p className="text-red-500 text-xs mt-1">{errors.subDistrict}</p>}
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                </label>
                <input
                    id="address"
                    type="text"
                    placeholder="House no. / Building / Street"
                    className={`w-full border rounded-md px-3 py-2 ${errors.address ? 'border-red-500 focus:ring-red-200' : ''}`}
                    value={address}
                    onChange={onAddressChange}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
            <div className="flex flex-wrap gap-3 items-center justify-between mt-6">
                <div className="flex gap-3">
                    <button
                        className={`px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 ${addressType === "home" ? "" : "opacity-70"}`}
                        onClick={() => onAddressTypeChange("home")}
                    >
                        <FaHome /> Home{" "}
                        {addressType === "home" && <FaCheck className="ml-1" />}
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 ${addressType === "office" ? "" : "opacity-70"}`}
                        onClick={() => onAddressTypeChange("office")}
                    >
                        <FaBuilding /> Office{" "}
                        {addressType === "office" && <FaCheck className="ml-1" />}
                    </button>
                </div>

                {localStorage.getItem('access_token') && !isAddressFromSaved && (
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={saveAddress}
                                onChange={(e) => onSaveAddressChange(e.target.checked)}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-neutral-300 checked:bg-purple-600 checked:border-purple-600 transition-all"
                            />
                            <svg
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-neutral-700 group-hover:text-purple-700 transition-colors">
                            Save this address for later
                        </span>
                    </label>
                )}
            </div>
        </div>
    );
};

export default DeliveryAddress;

