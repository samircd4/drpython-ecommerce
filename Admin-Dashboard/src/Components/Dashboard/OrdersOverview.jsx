import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";

const OrdersOverview = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const data = [
        { label: "Pending", value: 547, percentage: 20, color: "#3b82f6", bgClass: "bg-blue-500" },
        { label: "Shipped", value: 398, percentage: 28, color: "#a855f7", bgClass: "bg-purple-500" },
        { label: "Recieved", value: 605, percentage: 31, color: "#10b981", bgClass: "bg-emerald-500" },
        { label: "Cancelled", value: 249, percentage: 13, color: "#ef4444", bgClass: "bg-red-500" },
        { label: "Refunded", value: 176, percentage: 9, color: "#f59e0b", bgClass: "bg-amber-500" },
    ];

    const size = 220;
    const center = size / 2;
    const outerRadius = 100;
    const innerRadius = 45;

    // Helper to calculate arc path
    const getArcPath = (startAngle, endAngle, outerR, innerR) => {
        const x1 = center + outerR * Math.cos(startAngle);
        const y1 = center + outerR * Math.sin(startAngle);
        const x2 = center + outerR * Math.cos(endAngle);
        const y2 = center + outerR * Math.sin(endAngle);
        const x3 = center + innerR * Math.cos(endAngle);
        const y3 = center + innerR * Math.sin(endAngle);
        const x4 = center + innerR * Math.cos(startAngle);
        const y4 = center + innerR * Math.sin(startAngle);

        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

        return [
            `M ${x1} ${y1}`,
            `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${x3} ${y3}`,
            `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
            `Z`
        ].join(" ");
    };

    const handleMouseMove = (e) => {
        setTooltipPos({ x: e.clientX, y: e.clientY });
    };

    let cumulativeAngle = -Math.PI / 2;

    return (
        <div className="bg-[#071229] border border-slate-800 rounded-xl p-6 text-white shadow-lg h-full flex flex-col relative overflow-visible">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Orders Overview</h2>
                <button className="text-slate-400 hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Tooltip Popover */}
            {hoveredIndex !== null && (
                <div
                    className="fixed z-50 pointer-events-none transition-transform duration-75 ease-out"
                    style={{
                        left: tooltipPos.x + 15,
                        top: tooltipPos.y + 15,
                    }}
                >
                    <div className="bg-[#0b1a2a] border border-slate-700/50 backdrop-blur-xl rounded-xl p-3 shadow-2xl min-w-[140px] border-l-4" style={{ borderColor: data[hoveredIndex].color }}>
                        <div className="flex items-center justify-between gap-4 mb-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-inter">{data[hoveredIndex].label}</span>
                            <span className="text-[10px] font-black text-white px-1.5 py-0.5 rounded bg-white/5">{data[hoveredIndex].percentage}%</span>
                        </div>
                        <div className="text-xl font-black text-white tracking-tight">
                            {data[hoveredIndex].value}
                            <span className="text-xs text-slate-500 font-medium ml-1">Orders</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative flex-1 flex items-center justify-center py-4">
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="overflow-visible"
                    onMouseMove={handleMouseMove}
                >
                    {data.map((item, index) => {
                        const angle = (item.percentage / 100) * 2 * Math.PI;
                        const startAngle = cumulativeAngle;
                        const endAngle = startAngle + angle;
                        cumulativeAngle = endAngle;

                        const pathData = getArcPath(startAngle, endAngle, outerRadius, innerRadius);

                        const labelAngle = startAngle + angle / 2;
                        const labelRadius = (outerRadius + innerRadius) / 2;
                        const lx = center + labelRadius * Math.cos(labelAngle);
                        const ly = center + labelRadius * Math.sin(labelAngle);

                        const isHovered = hoveredIndex === index;

                        return (
                            <g
                                key={index}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="cursor-pointer transition-all duration-300"
                                style={{
                                    transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                                    transformOrigin: `${center}px ${center}px`
                                }}
                            >
                                <path
                                    d={pathData}
                                    fill={item.color}
                                    stroke="#071229"
                                    strokeWidth="3"
                                    className="transition-all duration-300"
                                    style={{
                                        filter: isHovered ? 'brightness(1.2) drop-shadow(0 0 8px ' + item.color + '44)' : 'none'
                                    }}
                                />
                                <text
                                    x={lx}
                                    y={ly}
                                    fill="white"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="text-[11px] font-black pointer-events-none select-none"
                                >
                                    {item.percentage}%
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className="mt-6 space-y-4">
                {data.map((item, index) => (
                    <div
                        key={index}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={`flex items-center justify-between py-2 transition-all duration-200 cursor-pointer rounded-lg px-2 ${hoveredIndex === index ? 'bg-slate-800/40 translate-x-1' : ''
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center">
                                <div className={`w-3 h-3 rounded-full ${item.bgClass} shadow-[0_0_8px] shadow-${item.bgClass.replace('bg-', '')}`} />
                            </div>
                            <span className={`text-sm font-medium transition-colors ${hoveredIndex === index ? 'text-white' : 'text-slate-300'}`}>
                                {item.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-black text-white">{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrdersOverview;
