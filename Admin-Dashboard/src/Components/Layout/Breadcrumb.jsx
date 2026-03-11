import React from "react";

const Breadcrumb = ({ title = "", paths = [] }) => {
    return (
        <div className="sm:px-0">
            <div className="rounded-xl bg-[#112960] p-1 sm:p-2 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="w-full sm:w-auto">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-100 truncate">{title}</h2>
                </div>

                <div className="w-full sm:w-auto text-sm text-slate-300">
                    {paths && paths.length > 0 && (
                        <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                            {paths.map((p, idx) => (
                                <span key={p} className={"text-sm cursor-pointer " + (idx === paths.length - 1 ? "text-slate-200 font-semibold" : "text-sky-500")}>
                                    {p}
                                    {idx < paths.length - 1 && <span className="mx-2 text-slate-500">~</span>}
                                </span>
                            ))}
                        </nav>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Breadcrumb;
