import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

const SearchableSelect = ({ 
    label, 
    options = [], 
    value, 
    onChange, 
    placeholder = "Select...", 
    disabled = false,
    required = false,
    icon: Icon = null
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    const filteredOptions = options.filter(option => 
        (option.name || option.label || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedOption = options.find(opt => (opt.name || opt.label) === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange(option.name || option.label);
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className="space-y-2 relative" ref={dropdownRef}>
            {label && (
                <label className="text-sm font-medium text-slate-400">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            
            <div 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    flex items-center justify-between w-full px-4 py-2.5 
                    bg-slate-900/50 border rounded-xl text-sm transition-all cursor-pointer
                    ${disabled ? 'opacity-50 cursor-not-allowed border-slate-700' : 'hover:border-blue-500/50 border-slate-700'}
                    ${isOpen ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : ''}
                    ${selectedOption ? 'text-slate-200' : 'text-slate-500'}
                `}
            >
                <div className="flex items-center gap-3 truncate">
                    {Icon && <Icon className="w-4 h-4 text-slate-500" />}
                    <span>{selectedOption ? (selectedOption.name || selectedOption.label) : placeholder}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : 'text-slate-500'}`} />
            </div>

            {isOpen && (
                <div className="absolute z-[100] mt-2 w-full bg-[#0b1a2a] border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Filter options..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-900/30 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-blue-500/50"
                            />
                        </div>
                    </div>
                    
                    <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, idx) => {
                                const isSelected = (option.name || option.label) === value;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleSelect(option)}
                                        className={`
                                            flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors
                                            ${isSelected ? 'bg-blue-600/10 text-blue-400 font-bold' : 'text-slate-300 hover:bg-slate-800'}
                                        `}
                                    >
                                        <span className="truncate">{option.name || option.label}</span>
                                        {isSelected && <Check className="w-4 h-4" />}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-4 py-8 text-center text-slate-500 text-xs italic">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
