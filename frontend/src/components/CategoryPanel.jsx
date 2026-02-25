import React, { useEffect, useState } from 'react'
import { MdApps, MdDevices, MdSettings, MdHome, MdWork } from 'react-icons/md'

const categoryIconMap = {
    Electronics: MdDevices,
    Accessories: MdSettings,
    Home: MdHome,
    Office: MdWork,
    All: MdApps,
}

const CategoryPanel = ({
    open,
    onClose,
    categories,
    selectedCategory,
    onSelectCategory,
}) => {
    const [showPanel, setShowPanel] = useState(false)
    const [animationClass, setAnimationClass] = useState('')

    useEffect(() => {
        if (open) {
            setShowPanel(true)
            setAnimationClass('animate-slide-in-right')
        } else {
            setAnimationClass('animate-slide-out-right')
            const t = setTimeout(() => setShowPanel(false), 300)
            return () => clearTimeout(t)
        }
    }, [open])

    if (!showPanel) return null

    return (
        <div className="fixed inset-0 z-50" onClick={onClose}>
            <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
            <div
                className={`absolute right-0 top-0 h-full w-full sm:w-80 bg-white shadow-xl border-l border-gray-200 ${animationClass}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b bg-purple-600 text-white">
                    <h2 className="text-lg font-semibold">Categories</h2>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 cursor-pointer"
                        aria-label="Close categories panel"
                    >
                        Close
                    </button>
                </div>
                <div className="p-3 overflow-y-auto h-[calc(100%-56px)]">
                    <ul className="space-y-1">
                        {categories.map((cat) => {
                            const category = cat.name

                            const isActive = selectedCategory === category
                            const Icon = categoryIconMap[category] || MdApps
                            return (
                                <li key={category}>
                                    <button
                                        onClick={() => {
                                            onSelectCategory(category)
                                            onClose()
                                        }}
                                        className={`flex w-full text-left px-3 py-2 rounded-md border transition-colors ${isActive ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:bg-purple-200 text-gray-800'} cursor-pointer`}
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            {cat.logo ? (
                                                <img
                                                    src={cat.logo}
                                                    alt={cat.name}
                                                    className="w-5 h-5 object-contain"
                                                />
                                            ) : (
                                                <span className="text-lg">📱</span> // Fallback icon
                                            )}
                                        </span>
                                        <span className="ml-2">{category}</span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default CategoryPanel
