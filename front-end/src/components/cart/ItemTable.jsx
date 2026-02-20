import React from "react";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom"

const ItemTable = ({
    items,
    onDecrease,
    onIncrease,
    onSet,
    onRemove,
}) => {
    return (
        <div className="bg-white border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 items-center px-4 py-3 border-b text-gray-700 gap-x-2">
                <div className="col-span-1"></div>
                <div className="col-span-4 font-medium">Product</div>
                <div className="col-span-2 font-medium text-center">Price</div>
                <div className="col-span-1 font-medium text-center">Qty.</div>
                <div className="col-span-2 font-medium text-right">Total</div>
                <div className="col-span-2 font-medium text-center">Action</div>
            </div>
            <div className="divide-y">
                {items.map((item) => (
                    <div
                        key={`${item.id}:${item.variant?.id ?? 'base'}`}
                        className="grid grid-cols-12 items-center px-4 py-3 gap-x-2"
                    >
                        <div className="col-span-2 flex items-center">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded"
                            />
                        </div>
                        <div className="col-span-3">
                            <div className="text-sm md:text-base font-semibold text-gray-800">
                                <Link to={`/products/${item.slug}`}>{item.name}</Link>
                                <p className="ml-1 text-xs text-gray-500">
                                    {item.variant?.color ? `${item.variant?.color}` : ''} {item.variant?.ram ? `${item.variant?.ram}GB` : ''}{item.variant?.storage ? `/${item.variant?.storage}GB` : ''}
                                </p>
                            </div>
                        </div>
                        <div className="col-span-2 text-center text-gray-800 pr-2">
                            {item.price}
                        </div>
                        <div className="col-span-2">
                            <div className="flex items-center justify-center gap-1">
                                <button
                                    aria-label="Decrease quantity"
                                    className="w-7 h-7 rounded-md text-purple-600 flex items-center justify-center text-xs cursor-pointer"
                                    onClick={() => onDecrease(item.id, item.variant?.id ?? null)}
                                >
                                    <FaMinus size={12} />
                                </button>
                                <input
                                    className="min-w-10 w-14 text-center text-md border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => onSet(item.id, Number(e.target.value), item.variant?.id ?? null)}
                                />
                                <button
                                    aria-label="Increase quantity"
                                    className="w-7 h-7 rounded-md text-purple-600 flex items-center justify-center text-xs cursor-pointer"
                                    onClick={() => onIncrease(item.id, item.variant?.id ?? null)}
                                >
                                    <FaPlus size={12} />
                                </button>
                            </div>
                        </div>
                        <div className="col-span-2 text-right font-medium">
                            {((item.price || 0) * (item.quantity || 0)).toFixed(0)}
                        </div>
                        <div className="col-span-1 text-center">
                            <button
                                aria-label={`Remove ${item.name}`}
                                className="p-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                                onClick={() => onRemove(item.id, item.variant?.id ?? null)}
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ItemTable;
