import React, { useState, useMemo, useEffect } from "react";
import { useCart } from "../context/CartContext.jsx";
import axios from "axios";
import api from "../api/client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "../context/UserContext.jsx";
import ItemTable from "../components/cart/ItemTable.jsx";
import DeliveryAddress from "../components/checkout/DeliveryAddress.jsx";
import PaymentMethod from "../components/checkout/PaymentMethod.jsx";
import CheckoutSummary from "../components/checkout/CheckoutSummary.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const Checkout = () => {
    const { cartItem, updateQuantity, deleteItem, clearCart } = useCart();
    const navigate = useNavigate();
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);

    // Redirect to cart if empty
    useEffect(() => {
        if (!isProcessingOrder && cartItem.length === 0) {
            navigate('/cart');
        }
    }, [cartItem.length, navigate, isProcessingOrder]);

    // Delivery address
    const [addressType, setAddressType] = useState("home");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [division, setDivision] = useState("");
    const [district, setDistrict] = useState("");
    const [subDistrict, setSubDistrict] = useState("");
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [saveAddress, setSaveAddress] = useState(false);

    const handleAddressSelect = (addr) => {
        if (addr.full_name) setFullName(addr.full_name);
        if (addr.phone) setPhone(addr.phone);
        if (addr.email) setEmail(addr.email); // Some addresses might have specific email? Usually not in model, but for safety.
        if (addr.address) setAddress(addr.address);
        if (addr.division) setDivision(addr.division);
        if (addr.district) setDistrict(addr.district);
        if (addr.sub_district) setSubDistrict(addr.sub_district);
        if (addr.address_type) setAddressType(addr.address_type.toLowerCase());
    };

    // Payment
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [paymentDetails, setPaymentDetails] = useState({
        paid_from: "",
        transaction_id: "",
    });

    // Voucher/discount
    const [voucher, setVoucher] = useState("");
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const applyVoucher = async () => {
        if (!voucher.trim()) return;

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/orders/validate-coupon/`, {
                code: voucher.trim(),
                subtotal: subtotal
            });

            const data = response.data;
            setDiscount(parseFloat(data.discount_amount));
            setAppliedCoupon(data);
            toast.success(data.message || "Coupon applied!");
        } catch (error) {
            console.error("Coupon error:", error);
            const msg = error.response?.data?.detail || "Invalid coupon code.";
            toast.error(msg);
            setDiscount(0);
            setAppliedCoupon(null);
        } finally {
            setLoading(false);
        }
    };

    const removeVoucher = () => {
        setVoucher("");
        setDiscount(0);
        setAppliedCoupon(null);
    };

    // Terms
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user } = useUser();

    // Auto-fill for authenticated users
    useEffect(() => {
        if (user) {
            if (user.id) {
                localStorage.setItem('user_id', String(user.id));
            }
            // Name
            if (user.name) setFullName(user.name);
            else if (user.username) setFullName(user.username);

            // Email
            if (user.email) setEmail(user.email);

            // Phone
            if (user.phone_number) setPhone(user.phone_number);
            else if (user.phone) setPhone(user.phone);
        }
    }, [user]);

    // Fetch user addresses separately
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            axios.get(`${API_URL}/addresses/`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    const addresses = Array.isArray(res.data) ? res.data : (res.data.results || []);
                    if (addresses.length > 0) {
                        setSavedAddresses(addresses);
                        let foundAddress = addresses.find(addr => addr.is_default) || addresses[0];
                        if (foundAddress) handleAddressSelect(foundAddress);
                    }
                })
                .catch(err => console.error("Error fetching addresses:", err));
        }
    }, []);

    const matchesSavedAddress = useMemo(() => {
        return savedAddresses.some(addr =>
            addr.full_name === fullName &&
            addr.phone === phone &&
            addr.address === address &&
            addr.division === division &&
            addr.district === district &&
            addr.sub_district === subDistrict
        );
    }, [savedAddresses, fullName, phone, address, division, district, subDistrict]);

    const [errors, setErrors] = useState({});

    // Totals (based on selected rows)
    const subtotal = useMemo(() => {
        return cartItem.reduce(
            (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
            0
        );
    }, [cartItem]);
    const deliveryCharge = useMemo(() => {
        const d_name = (district || "").toLowerCase().trim();
        const s_name = (subDistrict || "").toLowerCase().trim();

        if (d_name.includes("kishoreganj")) {
            if (s_name.includes("sadar")) {
                return 0;
            }
            return 60;
        }
        return 120;
    }, [district, subDistrict]);

    const deliveryDiscount = 0;
    const totalPayable = Math.max(
        0,
        subtotal + deliveryCharge - deliveryDiscount - discount
    );

    const validateFields = () => {
        const newErrors = {};
        if (!email) newErrors.email = "Email is required";
        if (!fullName) newErrors.fullName = "Full Name is required";
        if (!phone) newErrors.phone = "Phone is required";
        if (!division) newErrors.division = "Division is required";
        if (!district) newErrors.district = "District is required";
        if (!subDistrict) newErrors.subDistrict = "Sub District is required";
        if (!address) newErrors.address = "Address is required";

        if (paymentMethod !== 'card_mfs') {
            if (!paymentDetails.paid_from) newErrors.paid_from = "Payment number is required";
            if (!paymentDetails.transaction_id) newErrors.transaction_id = "Transaction ID is required";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            // Find first error and focus
            const firstErrorKey = Object.keys(newErrors)[0];
            const element = document.getElementById(firstErrorKey);
            if (element) {
                element.focus();
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            toast.error("Please fill in all required fields");
            return false;
        }
        return true;
    };

    const handlePlaceOrder = async () => {
        if (!validateFields()) {
            return;
        }

        setLoading(true);
        try {
            // Prepare items — prefer variant_id if available
            const itemsInput = cartItem.map(item => (
                item.variant?.id
                    ? { variant_id: item.variant.id, quantity: item.quantity }
                    : { product_id: item.id, quantity: item.quantity }
            ));

            // Create Order Payload
            // Sending address details directly for guest/new address
            // Using specific keys required by backend for guest checkout: full_name, shipping_address
            // Prepare Final Payment Details
            let finalPaymentDetails = { ...paymentDetails };

            // For COD, the amount is usually the delivery charge as per UI
            if (paymentMethod === 'cod') {
                finalPaymentDetails.amount = deliveryCharge;
            } else if (!finalPaymentDetails.amount) {
                // If not COD and amount missing, maybe default to total? 
                // But usually user inputs it. Leaving as is if user didn't input.
            }

            const orderPayload = {
                items_input: itemsInput,
                email: email,
                full_name: fullName,
                phone: phone,
                shipping_address: address,
                division: division,
                district: district,
                sub_district: subDistrict,
                address_type: addressType,
                save_address: saveAddress,

                payment_method: paymentMethod,

                // Financial fields
                delivery_charge: deliveryCharge,
                discount: discount,
                coupon_code: appliedCoupon ? appliedCoupon.code : null,

                // Send details if we have any relevant info (trx, paid_from, or amount)
                // We send it even for COD now because user inputs "Paid From" / "Trx ID" for delivery fee
                payment_details: finalPaymentDetails,
            };

            const response = await api.post('/orders/', orderPayload);

            toast.success("Order placed successfully!");
            setIsProcessingOrder(true);
            clearCart(); // Use the official clearCart function

            const token = localStorage.getItem('access_token');
            if (token) {
                navigate("/dashboard", {
                    state: {
                        newOrder: {
                            total: totalPayable,
                            items_count: itemsInput.length,
                            order_id: response?.data?.id ?? null
                        }
                    }
                });
            } else {
                navigate("/order-success", {
                    state: {
                        email,
                        name: fullName,
                        phone,
                        newOrder: {
                            id: response?.data?.id,
                            total: totalPayable,
                            items_count: itemsInput.length
                        }
                    }
                });
            }

        } catch (error) {
            console.error("Order placement error:", error);

            // Handle server errors (often HTML) gracefully
            if (error.response && error.response.status >= 500) {
                // Check for specific Django "DoesNotExist" HTML response content if possible, 
                // but usually we just see 500. 
                // If the user sees "Product matching query does not exist", it implies a 500/404 from backend logic.
                toast.error("Server error: Some items in your cart may no longer exist. Please clear your cart and try again.");
                return;
            }

            let msg = "Failed to place order. Please try again.";

            if (error.response?.data) {
                if (typeof error.response.data === 'string' && error.response.data.trim().startsWith('<')) {
                    if (error.response.data.includes("Product matching query does not exist")) {
                        msg = "One or more items in your cart are no longer available. Please clear your cart.";
                    } else {
                        msg = `Server Error (${error.response.status}): ${error.response.statusText}`;
                    }
                } else if (error.response.data.detail) {
                    msg = error.response.data.detail;
                } else if (error.response.data.message) {
                    msg = error.response.data.message;
                } else {
                    // Try to extract first validation error
                    const values = Object.values(error.response.data);
                    if (values.length > 0 && Array.isArray(values[0])) {
                        msg = values[0][0]; // "Invalid pk '0'" or "Guest checkout requires..."
                    } else {
                        msg = JSON.stringify(error.response.data);
                    }
                }
            }

            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const clearError = (field) => {
        if (errors[field]) {
            setErrors(prev => {
                const newErr = { ...prev };
                delete newErr[field];
                return newErr;
            });
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-6xl mx-auto px-4"
        >
            <motion.h1 variants={itemVariants} className="text-2xl md:text-3xl font-bold mb-6 text-neutral-800 uppercase">
                Shopping Cart
            </motion.h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column: Cart table + Delivery Address */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <ItemTable
                        items={cartItem}
                        onDecrease={(id, vid) => updateQuantity(id, "decrease", undefined, vid)}
                        onIncrease={(id, vid) => updateQuantity(id, "increase", undefined, vid)}
                        onSet={(id, qty, vid) => updateQuantity(id, "set", qty, vid)}
                        onRemove={(id, vid) => deleteItem(id, vid)}
                    />

                    <DeliveryAddress
                        email={email}
                        fullName={fullName}
                        phone={phone}
                        division={division}
                        district={district}
                        subDistrict={subDistrict}
                        address={address}
                        addressType={addressType}
                        onEmailChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                        onFullNameChange={(e) => { setFullName(e.target.value); clearError('fullName'); }}
                        onPhoneChange={(e) => { setPhone(e.target.value); clearError('phone'); }}
                        onDivisionChange={(e) => { setDivision(e.target.value); clearError('division'); }}
                        onDistrictChange={(e) => { setDistrict(e.target.value); clearError('district'); }}
                        onSubDistrictChange={(e) => { setSubDistrict(e.target.value); clearError('subDistrict'); }}
                        onAddressChange={(e) => { setAddress(e.target.value); clearError('address'); }}
                        onAddressTypeChange={setAddressType}
                        savedAddresses={savedAddresses}
                        onAddressSelect={handleAddressSelect}
                        errors={errors}
                        saveAddress={saveAddress}
                        onSaveAddressChange={setSaveAddress}
                        isAddressFromSaved={matchesSavedAddress}
                    />
                </motion.div>

                {/* Right column: Payment + Summary */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <PaymentMethod
                        paymentMethod={paymentMethod}
                        onChange={setPaymentMethod}
                        paymentDetails={paymentDetails}
                        onDetailsChange={(details) => {
                            setPaymentDetails(details);
                            if (details.paid_from) clearError('paid_from');
                            if (details.transaction_id) clearError('transaction_id');
                        }}
                        totalPayable={totalPayable}
                        deliveryCharge={deliveryCharge}
                        errors={errors}
                    />

                    <CheckoutSummary
                        subtotal={subtotal}
                        deliveryCharge={deliveryCharge}
                        deliveryDiscount={deliveryDiscount}
                        discount={discount}
                        voucher={voucher}
                        appliedCoupon={appliedCoupon}
                        accepted={accepted}
                        loading={loading}
                        onVoucherChange={(e) => setVoucher(e.target.value)}
                        onApplyVoucher={applyVoucher}
                        onRemoveVoucher={removeVoucher}
                        onAcceptedChange={(e) => setAccepted(e.target.checked)}
                        onConfirmOrder={handlePlaceOrder}
                        isPaymentValid={true}
                        onNavigateTerms={() => navigate("/terms")}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Checkout;
