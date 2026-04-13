import React from "react";
import { FaMoneyBillWave } from "react-icons/fa";
import BKashIcon from "../../assets/BKash.svg";
import NagadIcon from "../../assets/Nagad.svg";
import RocketIcon from "../../assets/Rocket.svg";
import { useConfig } from "../../context/ConfigContext";

const PaymentInfoBox = ({ method, deliveryCharge }) => {
    const { config } = useConfig();
    const symbol = config?.currency_symbol || "৳";

    const info = {
        bkash: {
            title: "Bkash Payment",
            description: `Send your payment to our personal Bkash number: ${config?.bkash_number || "01926108816"}`,
            icon: <img src={BKashIcon} alt="Bkash" className="h-8 w-auto object-contain" />,
        },
        rocket: {
            title: "Rocket Payment",
            description: `Send your payment to our personal Rocket number: ${config?.rocket_number || "01781355377"}`,
            icon: <img src={RocketIcon} alt="Rocket" className="h-8 w-auto object-contain" />,
        },
        nagad: {
            title: "Nagad Payment",
            description: `Send your payment to our personal Nagad number: ${config?.nagad_number || "01926108816"}`,
            icon: <img src={NagadIcon} alt="Nagad" className="h-8 w-auto object-contain" />,
        },
        card_mfs: {
            title: "Card / MFS Payment",
            description: "Use your preferred card or mobile financial service to pay.",
            icon: <FaMoneyBillWave className="text-purple-600" />,
        },
        cod: {
            title: "Cash on Delivery",
            description: `Send the delivery fee ${symbol}${deliveryCharge || 120} to our personal Bkash/Nagad number: ${config?.bkash_number || config?.nagad_number || "01926108816"}`,
            icon: <FaMoneyBillWave className="text-purple-600" />,
        },
    }[method];

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
