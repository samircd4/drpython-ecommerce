import React from "react";

const Terms = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Page Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-purple-700 text-center">
                Terms & Conditions
            </h1>

            {/* Intro */}
            <p className="text-gray-700 text-lg mb-8 text-center">
                By placing an order on <span className="font-semibold text-purple-600">Sarker Shop</span>, 
                you agree to our purchase, shipping, and return policies. Please review the following terms carefully.
            </p>

            {/* Sections */}
            <div className="space-y-8">
                {/* Ordering */}
                <section className="p-4 rounded-lg border-l-4 border-purple-600 bg-purple-50">
                    <h2 className="text-2xl font-semibold text-purple-700 mb-2 flex items-center gap-2">
                        📦 Ordering
                    </h2>
                    <p className="text-gray-700">
                        Ensure your contact and delivery information is accurate before confirming an order. Orders may be cancelled if items are unavailable.
                    </p>
                </section>

                {/* Payment */}
                <section className="p-4 rounded-lg border-l-4 border-purple-600 bg-purple-50">
                    <h2 className="text-2xl font-semibold text-purple-700 mb-2 flex items-center gap-2">
                        💳 Payment
                    </h2>
                    <p className="text-gray-700">
                        We accept Cash on Delivery and supported digital payment methods. Some orders may require prepayment verification.
                    </p>
                </section>

                {/* Shipping */}
                <section className="p-4 rounded-lg border-l-4 border-purple-600 bg-purple-50">
                    <h2 className="text-2xl font-semibold text-purple-700 mb-2 flex items-center gap-2">
                        🚚 Shipping
                    </h2>
                    <p className="text-gray-700">
                        Standard delivery timelines apply. Delays may occur due to logistics or public holidays. Delivery fees are non-refundable once shipped.
                    </p>
                </section>

                {/* Returns */}
                <section className="p-4 rounded-lg border-l-4 border-purple-600 bg-purple-50">
                    <h2 className="text-2xl font-semibold text-purple-700 mb-2 flex items-center gap-2">
                        🔄 Returns
                    </h2>
                    <p className="text-gray-700">
                        Return requests must be submitted within the policy window with proof of purchase. Items must be unused and in original packaging.
                    </p>
                </section>

                {/* Contact */}
                <section className="p-4 rounded-lg border-l-4 border-purple-600 bg-purple-50">
                    <h2 className="text-2xl font-semibold text-purple-700 mb-2 flex items-center gap-2">
                        ✉️ Contact
                    </h2>
                    <p className="text-gray-700">
                        For any questions, please contact our support team through the <span className="text-purple-600 font-semibold">Contact</span> page.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Terms;
