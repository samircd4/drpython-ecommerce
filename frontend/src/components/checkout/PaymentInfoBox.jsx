import React from "react";
import { FaMobileAlt, FaMoneyBillWave } from "react-icons/fa";

const PAYMENT_INFO = {
    bkash: {
        title: "Bkash Payment",
        description: "Send your payment to our personal Bkash number: 01781355377",
        icon: <FaMobileAlt className="text-purple-600" />,
    },
    rocket: {
        title: "Rocket Payment",
        description: "Send your payment to our personal Rocket number: 01781355377",
        icon: <FaMobileAlt className="text-purple-600" />,
    },
    nagad: {
        title: "Nagad Payment",
        description: "Send your payment to our personal Nagad number: 01781355377",
        icon: <FaMobileAlt className="text-purple-600" />,
    },
    card_mfs: {
        title: "Card / MFS Payment",
        description: "Use your preferred card or mobile financial service to pay.",
        icon: <FaMoneyBillWave className="text-purple-600" />,
    },
    cod: {
        title: "Cash on Delivery",
        description: "Send the delivery fee ৳120 to our personal Nagad/Rocket/Bkash number: 01781355377",
        icon: <FaMoneyBillWave className="text-purple-600" />,
    },
};

const PaymentInfoBox = ({ method }) => {
    // if (!method || method === "cod") return null; // no box for card_mfs

    const info = PAYMENT_INFO[method];

    return (
        <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-md mb-4 flex items-start gap-3">
            <div className="text-2xl">{info.icon}</div>
            <div>
                <h4 className="font-bold text-purple-700 mb-1">{info.title}</h4>
                <p className="text-gray-700 text-sm">{info.description}</p>
            </div>
        </div>
    );
};

export default PaymentInfoBox;
