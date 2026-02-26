import React from 'react';

const Spacification = ({ specifications }) => {
    // If no real specifications are passed, fallback to some defaults or show empty
    const specs = (specifications && specifications.length > 0)
        ? (() => {
            const out = [];
            const seen = new Set();
            for (const s of specifications) {
                const label = s.key ?? s.label ?? '';
                const value = s.value ?? '';
                const key = `${label}:${value}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    out.push({ label, value });
                }
            }
            return out;
        })()
        : [
            { label: 'Brand', value: 'Sarker Shop' },
            { label: 'Model', value: '2026 Edition' },
            { label: 'Material', value: 'Premium Cotton Blend' },
            { label: 'Size', value: 'S, M, L, XL, XXL' },
            { label: 'Color', value: 'Navy Blue, Charcoal, Olive' },
            { label: 'Care', value: 'Machine wash cold, tumble dry low' },
        ];

    return (
        <div className="w-full lg:max-w-3xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl">
            <h2 className="text-xl md:text-3xl font-bold text-gray-800 py-4 md:mb-6 text-center tracking-wide">
                Product Specification
            </h2>
            <div className="overflow-hidden rounded-lg md:rounded-xl border border-purple-500 mx-0">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gradient-to-r from-purple-500 to-purple-700 text-white">
                            <th className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm font-semibold uppercase tracking-wider">Feature</th>
                            <th className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm font-semibold uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {specs?.map((item, idx) => (
                            <tr
                                key={idx}
                                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    } hover:bg-purple-200 transition-colors duration-200`}
                            >
                                <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm font-medium text-gray-700 border-r border-gray-100">
                                    {item.label}
                                </td>
                                <td className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm text-gray-600">
                                    {item.value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Spacification;
