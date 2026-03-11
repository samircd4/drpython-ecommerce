import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Calendar as CalendarIcon } from "lucide-react";
import Breadcrumb from "../Components/Layout/Breadcrumb";

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const changeMonth = (offset) => {
        setCurrentDate(new Date(year, month + offset, 1));
    };

    const days = [];
    const emptyDays = firstDayOfMonth(year, month);
    for (let i = 0; i < emptyDays; i++) days.push(null);
    for (let i = 1; i <= daysInMonth(year, month); i++) days.push(i);

    const upcomingEvents = [
        { id: 1, title: "Team Sync", time: "10:00 AM", location: "Zoom", type: "Meeting" },
        { id: 2, title: "Product Launch", time: "02:00 PM", location: "Showroom", type: "Event" },
        { id: 3, title: "Review Orders", time: "11:30 AM", location: "Main Office", type: "Task" },
    ];

    return (
        <main className="p-6">
            <Breadcrumb title="Calendar" paths={["Home", "Calendar"]} />

            <div className="mt-6 flex flex-col lg:flex-row gap-6">
                {/* Main Calendar Card */}
                <div className="flex-1 bg-[#071229] rounded-2xl border border-slate-800 p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600/10 text-blue-500 rounded-xl">
                                <CalendarIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-tight">{monthNames[month]} {year}</h2>
                                <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Manage your schedule</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setCurrentDate(new Date())} className="text-sm font-medium text-slate-400 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">Today</button>
                            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-300"><ChevronLeft className="w-5 h-5" /></button>
                                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-300"><ChevronRight className="w-5 h-5" /></button>
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-slate-800 rounded-xl overflow-hidden border border-slate-800">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                            <div key={day} className="bg-[#0b1326] p-4 text-center text-xs font-black uppercase tracking-widest text-slate-500">
                                {day}
                            </div>
                        ))}
                        {days.map((day, i) => (
                            <div
                                key={i}
                                className={`bg-[#071229] min-h-[100px] p-2 transition-all hover:bg-slate-800/30 group cursor-pointer border-t border-slate-800 ${!day ? 'opacity-20 bg-slate-900/40' : ''}`}
                            >
                                {day && (
                                    <>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`text-sm font-mono ${day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-lg shadow-lg' : 'text-slate-400'}`}>
                                                {day}
                                            </span>
                                        </div>
                                        {day % 7 === 0 && (
                                            <div className="text-[10px] bg-purple-500/10 text-purple-400 p-1 rounded-md mb-1 border border-purple-500/20 truncate font-medium">Meeting @ 10:00</div>
                                        )}
                                        {day % 10 === 0 && (
                                            <div className="text-[10px] bg-emerald-500/10 text-emerald-400 p-1 rounded-md border border-emerald-500/20 truncate font-medium">Order Review</div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Events */}
                <div className="w-full lg:w-80 flex flex-col gap-6">
                    <div className="bg-[#071229] rounded-2xl border border-slate-800 p-6 shadow-xl">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            Upcoming Events
                        </h3>
                        <div className="space-y-4">
                            {upcomingEvents.map(event => (
                                <div key={event.id} className="p-4 bg-[#0b1a2a] rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer group">
                                    <h4 className="text-sm font-bold text-slate-200 mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{event.title}</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                                            <Clock className="w-3 h-3 text-blue-500" />
                                            {event.time}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                                            <MapPin className="w-3 h-3 text-red-500" />
                                            {event.location}
                                        </div>
                                    </div>
                                    <div className={`mt-3 inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${event.type === 'Meeting' ? 'bg-blue-600/10 text-blue-500' :
                                        event.type === 'Event' ? 'bg-purple-600/10 text-purple-500' :
                                            'bg-emerald-600/10 text-emerald-500'
                                        }`}>
                                        {event.type}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Calendar;
