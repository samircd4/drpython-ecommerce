import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext.jsx'
import ItemTable from '../components/cart/ItemTable.jsx'
import EmptyCart from '../components/cart/EmptyCart.jsx'
import TakaIcon from '../components/TakaIcon.jsx'

const Cart = () => {
    const { cartItem, updateQuantity, deleteItem } = useCart()
    const navigate = useNavigate()

    const subtotal = cartItem.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
    const taxRate = 0.0
    const tax = subtotal * taxRate
    const total = subtotal + tax

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-6xl mx-auto px-4 min-h-[60vh]"
        >
            <motion.h1 variants={itemVariants} className="text-2xl md:text-3xl font-bold mb-8 text-neutral-800 uppercase tracking-tight">Shopping Cart</motion.h1>

            {cartItem.length === 0 ? (
                <motion.div variants={itemVariants}>
                    <EmptyCart
                        title="Your cart is empty"
                        description="Looks like you haven't added any premium products to your cart yet. Let's find something amazing for you!"
                        buttonText="START SHOPPING"
                    />
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <ItemTable
                            items={cartItem}
                            onDecrease={(id, vid) => updateQuantity(id, "decrease", null, vid)}
                            onIncrease={(id, vid) => updateQuantity(id, "increase", null, vid)}
                            onSet={(id, qty, vid) => updateQuantity(id, "set", qty, vid)}
                            onRemove={(id, vid) => deleteItem(id, vid)}
                        />
                    </motion.div>

                    {/* Summary */}
                    <motion.div variants={itemVariants} className="bg-white border rounded-lg p-4 h-fit">
                        <h2 className="text-lg font-semibold mb-3 text-neutral-800">Order Summary</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium flex items-center gap-1 whitespace-nowrap">
                                    <TakaIcon size={14} />
                                    {Number(subtotal).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                                <span className="font-medium flex items-center gap-1 whitespace-nowrap"><TakaIcon size={14} /> {Number(tax).toLocaleString()}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between">
                                <span className="text-gray-800 font-semibold">Total</span>
                                <span className="text-gray-900 font-bold flex items-center gap-1 whitespace-nowrap"><TakaIcon size={16} /> {Number(total).toLocaleString()}</span>
                            </div>
                        </div>
                        <button
                            className="mt-4 w-full px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                            onClick={() => navigate('/checkout')}
                        >
                            Proceed to Checkout
                        </button>
                    </motion.div>
                </div>
            )}
        </motion.div>
    )
}

export default Cart
