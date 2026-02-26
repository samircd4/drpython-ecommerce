import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const Addresses = ({
    addresses,
    addressesLoading,
    addressesError,
    addrFullName,
    setAddrFullName,
    addrPhone,
    setAddrPhone,
    addrAddress,
    setAddrAddress,
    addrDivision,
    setAddrDivision,
    addrDistrict,
    setAddrDistrict,
    addrSubDistrict,
    setAddrSubDistrict,
    addrType,
    setAddrType,
    addrDefault,
    setAddrDefault,
    editingAddressId,
    handleAddressSubmit,
    resetAddressForm,
    handleEditAddress,
    handleDeleteAddress,
    handleSetDefault,
}) => {
    const [divisionsList, setDivisionsList] = useState([]);
    const [districtsList, setDistrictsList] = useState([]);
    const [subDistrictsList, setSubDistrictsList] = useState([]);

    // Fetch Divisions on Mount
    useEffect(() => {
        api.get('/divisions/')
            .then(res => setDivisionsList(res.data))
            .catch(err => console.error("Error fetching divisions", err));
    }, []);

    // Fetch Districts when Division changes
    useEffect(() => {
        if (addrDivision) {
            const selectedDiv = divisionsList.find(d => d.name === addrDivision);
            if (selectedDiv) {
                api.get(`/districts/?division_id=${selectedDiv.id}`)
                    .then(res => setDistrictsList(res.data))
                    .catch(err => console.error("Error fetching districts", err));
            }
        } else {
            setDistrictsList([]);
        }
    }, [addrDivision, divisionsList]);

    // Fetch SubDistricts when District changes
    useEffect(() => {
        if (addrDistrict) {
            const selectedDist = districtsList.find(d => d.name === addrDistrict);
            if (selectedDist) {
                api.get(`/sub-districts/?district_id=${selectedDist.id}`)
                    .then(res => setSubDistrictsList(res.data))
                    .catch(err => console.error("Error fetching sub-districts", err));
            }
        } else {
            setSubDistrictsList([]);
        }
    }, [addrDistrict, districtsList]);

    return (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Saved Addresses</h2>
                    {addressesLoading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                        </div>
                    )}
                    {!addressesLoading && addressesError && (
                        <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                            {addressesError}
                        </div>
                    )}
                    {!addressesLoading && !addressesError && (addresses || []).length === 0 && (
                        <div className="text-gray-600">No addresses yet.</div>
                    )}
                    {!addressesLoading && !addressesError && (addresses || []).length > 0 && (
                        <div className="space-y-4">
                            {(addresses || []).map(addr => (
                                <div key={addr.id} className={`border rounded-lg p-4 ${addr.is_default ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="text-sm text-gray-700">
                                            <div className="font-medium">{addr.full_name}</div>
                                            <div>{addr.phone}</div>
                                            <div>{addr.address}</div>
                                            <div>{[addr.sub_district, addr.district, addr.division].filter(Boolean).join(', ')}</div>
                                            {/* <div className="text-xs text-gray-500">Type: {addr.address_type}</div> */}
                                            {addr.is_default && (
                                                <span className="inline-block mt-1 px-2 py-1 text-xs rounded bg-green-100 text-green-800">Default</span>
                                            )}
                                        </div>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditAddress(addr)}
                                                        className="px-2 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAddress(addr)}
                                                        className="px-2 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50 text-xs"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                                {!addr.is_default && (
                                                    <button
                                                        onClick={() => handleSetDefault(addr.id)}
                                                        className="px-2 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs"
                                                    >
                                                        Set Default
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="md:col-span-1">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{editingAddressId ? 'Edit Address' : 'Add Address'}</h2>
                    <form onSubmit={handleAddressSubmit} className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={addrFullName}
                                onChange={(e) => setAddrFullName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={addrPhone}
                                onChange={(e) => setAddrPhone(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                            <select
                                className="w-full border rounded-md px-3 py-2"
                                value={addrDivision}
                                onChange={(e) => {
                                    setAddrDivision(e.target.value);
                                    setAddrDistrict('');
                                    setAddrSubDistrict('');
                                }}
                            >
                                <option value="">Select Division</option>
                                {divisionsList.map(div => (
                                    <option key={div.id} value={div.name}>
                                        {div.name} / {div.bn_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                            <select
                                className="w-full border rounded-md px-3 py-2"
                                value={addrDistrict}
                                onChange={(e) => {
                                    setAddrDistrict(e.target.value);
                                    setAddrSubDistrict('');
                                }}
                                disabled={!addrDivision}
                            >
                                <option value="">Select District</option>
                                {districtsList.map(dist => (
                                    <option key={dist.id} value={dist.name}>
                                        {dist.name} / {dist.bn_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub District</label>
                            <select
                                className="w-full border rounded-md px-3 py-2"
                                value={addrSubDistrict}
                                onChange={(e) => setAddrSubDistrict(e.target.value)}
                                disabled={!addrDistrict}
                            >
                                <option value="">Select Sub District</option>
                                {subDistrictsList.map(sub => (
                                    <option key={sub.id} value={sub.name}>
                                        {sub.name} / {sub.bn_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={addrAddress}
                                onChange={(e) => setAddrAddress(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                className="w-full border rounded-md px-3 py-2"
                                value={addrType}
                                onChange={(e) => setAddrType(e.target.value)}
                            >
                                <option>Home</option>
                                <option>Office</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id="addrDefault"
                                type="checkbox"
                                checked={addrDefault}
                                onChange={(e) => setAddrDefault(e.target.checked)}
                            />
                            <label htmlFor="addrDefault" className="text-sm text-gray-700">Set as default address</label>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {editingAddressId ? 'Update' : 'Add'}
                            </button>
                            <button
                                type="button"
                                onClick={resetAddressForm}
                                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Addresses;

