import React from "react";

const CheckoutSummary = ({
    subtotal,
    deliveryCharge,
    discount,
    voucher,
    appliedCoupon,
    accepted,
    loading,
    onVoucherChange,
    onApplyVoucher,
    onRemoveVoucher,
    onAcceptedChange,
    onConfirmOrder,
    onNavigateTerms,
    isPaymentValid = true
}) => {
    const totalPayable = Math.max(
        0,
        (subtotal || 0) + (deliveryCharge || 0) - (discount || 0)
    );

    return (
        <div className="bg-white border rounded-lg p-4 h-fit">
            <h2 className="text-lg font-semibold mb-3 text-neutral-800">
                Checkout Summary
            </h2>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">৳ {Number(subtotal || 0).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Charge</span>
                    <span className="font-medium">৳ {deliveryCharge}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium">৳ {discount}</span>
                </div>
            </div>

            {appliedCoupon ? (
                <div className="mt-3 p-2 bg-purple-50 border border-purple-100 rounded-md flex justify-between items-center animate-in fade-in slide-in-from-top-1">
                    <div className="flex flex-col">
                        <span className="text-xs text-purple-600 font-semibold uppercase">Coupon Applied</span>
                        <span className="text-sm font-bold text-neutral-800">{appliedCoupon.code}</span>
                    </div>
                    <button
                        onClick={onRemoveVoucher}
                        className="p-1 hover:bg-purple-200 rounded-full text-purple-600 transition-colors cursor-pointer"
                        title="Remove coupon"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            ) : (
                <div className="mt-3 flex items-center gap-2">
                    <input
                        className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-600 outline-none transition-all"
                        placeholder="Have a voucher code?"
                        value={voucher}
                        onChange={onVoucherChange}
                        onKeyPress={(e) => e.key === 'Enter' && onApplyVoucher()}
                    />
                    <button
                        className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition-colors active:scale-95 font-medium"
                        onClick={onApplyVoucher}
                        disabled={!voucher.trim() || loading}
                    >
                        Apply
                    </button>
                </div>
            )}

            <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-semibold">
                        Total Payable
                    </span>
                    <span className="text-gray-900 font-bold">
                        ৳ {totalPayable.toFixed(0)}
                    </span>
                </div>
            </div>

            <div className="mt-3 text-sm">
                <label className="inline-flex items-start gap-2">
                    <div className="relative w-5 h-5 flex-shrink-0 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={onAcceptedChange}
                            className="sr-only"
                        />
                        <div className={`w-full h-full rounded-md border-2 flex items-center justify-center transition-all duration-200 ${accepted ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300 hover:border-purple-400'}`}>
                            {accepted && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <span className="flex items-center gap-2">
                        <span className="text-red-600 font-bold text-lg">*</span> I agree to the{" "}
                        <button type="button" className="text-purple-600 underline cursor-pointer" onClick={onNavigateTerms}>
                            Terms and Conditions
                        </button>
                    </span>
                </label>
            </div>

            <button
                className="mt-4 w-full px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
                disabled={!accepted || loading || !isPaymentValid}
                onClick={onConfirmOrder}
            >
                {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    "Confirm Order"
                )}
            </button>
        </div>
    );
};

export default CheckoutSummary;

