import React from "react";
import { CircleDollarSign, ShoppingCart, CircleUserRound, Star } from "lucide-react";

const StatCard = ({ title, value, change, icon: Icon, gradient, iconBg, iconColor, badgeBg }) => (
    <div className={`p-4 rounded-lg text-slate-100 ${gradient}`}>
        <p className="text-lg font-semibold">{title}</p>
        <div className="flex items-center justify-between">
            <p className="text-2xl font-bold mt-2">{value}</p>
            <Icon
                className={`${iconBg} ${iconColor} opacity-80 px-1 rounded-md`}
                size={35}
            />
        </div>
        <div className="mt-5 flex items-center gap-2">
            <p className={`${badgeBg} inline-block py-1 px-2 rounded-md font-bold text-xs`}>
                {change}
            </p>
            <p className="font-bold opacity-70 text-sm">Last Month</p>
        </div>
    </div>
);

const StatsGrid = ({ stats }) => {
    const defaultStats = [
        {
            title: "Total Revenue",
            value: "৳0",
            change: "0%",
            icon: CircleDollarSign,
            gradient: "bg-gradient-to-r from-[#13b58b] to-[#0ea5a8]",
            iconBg: "bg-[#096e55]",
            iconColor: "text-[#0effc3]",
            badgeBg: "bg-[#187d44]"
        },
        {
            title: "Total Orders",
            value: "0",
            change: "0%",
            icon: ShoppingCart,
            gradient: "bg-gradient-to-r from-[#7c3aed] to-[#ec4899]",
            iconBg: "bg-[#340876]",
            iconColor: "text-[#e9d8ec]",
            badgeBg: "bg-[#7c07d5]"
        },
        {
            title: "Total Customers",
            value: "0",
            change: "0%",
            icon: CircleUserRound,
            gradient: "bg-gradient-to-r from-[#2563eb] to-[#06b6d4]",
            iconBg: "bg-[#06518f]",
            iconColor: "text-[#0adaff]",
            badgeBg: "bg-[#0f44a7]"
        },
        {
            title: "Total Reviews",
            value: "0",
            change: "0%",
            icon: Star,
            gradient: "bg-gradient-to-r from-[#f09205] to-[#b7ae55]",
            iconBg: "bg-[#9d6d07]",
            iconColor: "text-[#453d04]",
            badgeBg: "bg-[#886c09]"
        }
    ];

    const displayStats = stats ? defaultStats.map((s, i) => ({
        ...s,
        value: stats[i]?.value || s.value,
        change: stats[i]?.change || s.change
    })) : defaultStats;

    return (
        <div className="rounded-xl bg-[#071229] p-3 shadow-md border border-slate-800/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {displayStats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>
        </div>
    );
};

export default StatsGrid;