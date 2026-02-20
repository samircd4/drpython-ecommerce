import React from "react";
import { FaMobileAlt, FaMoneyBillWave } from "react-icons/fa";
import { SiVisa, SiMastercard } from "react-icons/si";
import PaymentInfoBox from "./PaymentInfoBox";
import Badge from "../Badge";

const PaymentMethod = ({
    paymentMethod,
    onChange,
    onDetailsChange,
    paymentDetails,
    totalPayable,
    errors = {}
}) => {
    const handleDetailChange = (e) => {
        onDetailsChange({
            ...paymentDetails,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-neutral-800">
                Select Payment Method
            </h3>
            <div className="space-y-3">
                <label className="flex items-center justify-between p-2 rounded cursor-pointer">
                    <span className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="pm"
                            value="cod"
                            checked={paymentMethod === "cod"}
                            onChange={(e) => onChange(e.target.value)}
                            className="accent-purple-600 w-4 h-4"
                        />
                        <span>Cash on Delivery</span>
                    </span>
                    <FaMoneyBillWave className="text-purple-500" />
                </label>
                <label className="flex items-center justify-between p-2 rounded cursor-pointer">
                    <span className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="pm"
                            value="bkash"
                            checked={paymentMethod === "bkash"}
                            onChange={(e) => onChange(e.target.value)}
                            className="accent-purple-600 w-4 h-4"
                        />
                        <span>Bkash</span>
                    </span>
                    <FaMobileAlt className="text-purple-500" />
                </label>
                <label className="flex items-center justify-between p-2 rounded cursor-pointer">
                    <span className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="pm"
                            value="nagad"
                            checked={paymentMethod === "nagad"}
                            onChange={(e) => onChange(e.target.value)}
                            className="accent-purple-600 w-4 h-4"
                        />
                        <span>Nagad</span>
                    </span>
                    <FaMobileAlt className="text-purple-500" />
                </label>
                <label className="flex items-center justify-between p-2 rounded cursor-pointer">
                    <span className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="pm"
                            value="rocket"
                            checked={paymentMethod === "rocket"}
                            onChange={(e) => onChange(e.target.value)}
                            className="accent-purple-600 w-4 h-4"
                        />
                        <span>Rocket</span>
                    </span>
                    <FaMobileAlt className="text-purple-500" />
                </label>
                <label className="flex items-center justify-between p-2 rounded cursor-not-allowed">
                    <span className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="pm"
                            value="card_mfs"
                            checked={paymentMethod === "card_mfs"}
                            onChange={(e) => onChange(e.target.value)}
                            className="accent-purple-600 w-4 h-4"
                            disabled={paymentMethod !== "card_mfs"}
                        />
                        <span>Card & MFS <Badge text="beta" /></span>
                    </span>
                    <span className="flex items-center gap-2">
                        <SiVisa className="text-blue-600" />
                        <SiMastercard className="text-purple-500" />
                    </span>
                </label>
            </div>

            {paymentMethod !== "card_mfs" && (
                <div className="mt-4 pt-4 border-t">

                    {/* Payment info box */}
                    <PaymentInfoBox method={paymentMethod} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Paid From <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="paid_from"
                                type="text"
                                name="paid_from"
                                value={paymentDetails.paid_from}
                                onChange={handleDetailChange}
                                placeholder="e.g., 01xxxxxxxxx"
                                className={`w-full border rounded-md px-3 py-2 ${errors.paid_from ? 'border-red-500 focus:ring-red-200' : ''}`}
                            />
                            {errors.paid_from && <p className="text-red-500 text-xs mt-1">{errors.paid_from}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Transaction ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="transaction_id"
                                type="text"
                                name="transaction_id"
                                value={paymentDetails.transaction_id}
                                onChange={handleDetailChange}
                                placeholder="e.g., 8N7F6G5H"
                                className={`w-full border rounded-md px-3 py-2 ${errors.transaction_id ? 'border-red-500 focus:ring-red-200' : ''}`}
                            />
                            {errors.transaction_id && <p className="text-red-500 text-xs mt-1">{errors.transaction_id}</p>}
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 text-lg">
                                ৳
                            </span>
                            <input
                                type="number"
                                name="amount"
                                value={
                                    paymentMethod === 'cod'
                                        ? 120
                                        : paymentDetails.amount ?? totalPayable.toFixed(0)
                                }
                                onChange={handleDetailChange}
                                className="w-full border rounded-md pl-8 pr-3 py-2"
                                readOnly={paymentMethod === 'cod'}
                            />
                        </div>
                    </div>



                </div>
            )}

        </div>
    );
};

export default PaymentMethod;

