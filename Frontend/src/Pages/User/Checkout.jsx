import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import AxiosInstance from "../../api/axiosInstance.js";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal, Box, Button } from "@mui/material";
import axios from "axios";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';

const Order = () => {
    const [orders, setOrders] = useState([]);
    const [order, setOrder] = useState({});
    const user = useSelector((state) => state.auth.user);
    const [selectedOption, setSelectedOption] = useState("economy");

    const formatDate = (daysToAdd) => {
        const date = new Date();
        date.setDate(date.getDate() + daysToAdd);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const deliveryDetails = {
        fast: { price: "$16", detail: `${formatDate(2)}` },
        economy: { price: "$10", detail: `${formatDate(3)}` },
    };

    const sessionID = user?.sessionID;
    const [paymentMethod, setPaymentMethod] = useState("");
    const [shippingFee, setShippingFee] = useState(10); // Renamed from shipmentCost to shippingFee
    const [phone, setPhone] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [addressError, setAddressError] = useState("");
    const [paymentError, setPaymentError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [selectedAddresses, setSelectedAddresses] = useState(null);
    const [chooseAddress, setChooseAddress] = useState({
        city: selectedAddresses?.data?.city || "",
        street: selectedAddresses?.data?.street || "",
        district: selectedAddresses?.data?.district || "",
        ward: selectedAddresses?.data?.ward || "",
        cityCode: selectedAddresses?.data?.cityCode || "",
        districtCode: selectedAddresses?.data?.districtCode || "",
        wardCode: selectedAddresses?.data?.wardCode || "",
        phoneNumber: selectedAddresses?.data?.phoneNumber || "",
    });

    const [newAddress, setNewAddress] = useState({
        city: "",
        street: "",
        district: "",
        ward: "",
        cityCode: "",
        districtCode: "",
        wardCode: "",
        phoneNumber: "",
    });

    const [editedAddress, setEditedAddress] = useState({
        city: "",
        street: "",
        district: "",
        ward: "",
        cityCode: "",
        districtCode: "",
        wardCode: "",
        phoneNumber: "",
    });

    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    useEffect(() => {
        if (selectedAddress) {
            setEditedAddress({
                city: selectedAddresses?.data?.city || "",
                street: selectedAddresses?.data?.street || "",
                district: selectedAddresses?.data?.district || "",
                ward: selectedAddresses?.data?.ward || "",
                cityCode: selectedAddresses?.data?.cityCode || "",
                districtCode: selectedAddresses?.data?.districtCode || "",
                wardCode: selectedAddresses?.data?.wardCode || "",
                phoneNumber: selectedAddresses?.data?.phoneNumber || "",
            });
        }
    }, [selectedAddress]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch("https://provinces.open-api.vn/api/?depth=1");
                const data = await response.json();
                setCities(data || []);
            } catch (error) {
                console.error("Failed to fetch cities:", error);
            }
        };
        fetchCities();
    }, []);

    useEffect(() => {
        if (chooseAddress.cityCode) {
            axios
                .get(`https://provinces.open-api.vn/api/p/${chooseAddress.cityCode}?depth=2`)
                .then((res) => {
                    setDistricts(res.data.districts || []);
                    setWards([]);
                })
                .catch((err) => console.error("Failed to fetch districts:", err));
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [chooseAddress.cityCode]);

    useEffect(() => {
        if (chooseAddress.districtCode) {
            axios
                .get(`https://provinces.open-api.vn/api/d/${chooseAddress.districtCode}?depth=2`)
                .then((res) => setWards(res.data.wards || []))
                .catch((err) => console.error("Failed to fetch wards:", err));
        } else {
            setWards([]);
        }
    }, [chooseAddress.districtCode]);

    const handleAddAddress = async () => {
        try {
            const response = await AxiosInstance.authAxios.post("/address/add", newAddress);
            setAddresses(response.data.shippingAddress.addresses);
            setChooseAddress({});
            setIsAddingNew(false);
            setNewAddress({ street: "", city: "", district: "", ward: "", phoneNumber: "" });
        } catch (error) {
            console.error("Error adding address:", error);
        }
    };

    const fetchAddresses = async () => {
        try {
            const response = await AxiosInstance.authAxios.get("/address");
            const addressList = response.data.addresses || [];
            setAddresses(addressList);
            if (addressList.length > 0) {
                setSelectedAddress(`${addressList[0].street}, ${addressList[0].district}, ${addressList[0].ward}, ${addressList[0].city}`);
                setPhone(addressList[0].phoneNumber);
            } else {
                setSelectedAddress(null);
                setPhone("");
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleSelectAddress = (addr) => {
        const newAddress = `${addr.street}, ${addr.district}, ${addr.ward}, ${addr.city}`;
        setSelectedAddress(newAddress);
        setPhone(addr.phoneNumber);
        setOpenModal(false);
        setAddressError(null);
    };

    const calculateDiscountedTotal = () => {
        const total = calculateTotalPrice();
        return couponCode === "DISCOUNT10" ? total * 0.9 : total;
    };

    const fetchOrders = async () => {
        try {
            const response = await AxiosInstance.authAxios.get("/orders/getUserOrders");
            const data = response.data.data || [];
            const pendingOrders = data.filter((order) => order.status === "Draft");
            setOrders(pendingOrders.flatMap((item) => item.products));
            setOrder(pendingOrders[0]);
        } catch (error) {
            console.error("Error fetching pending orders:", error.message);
        }
    };

    const getShippingCost = () => {
        const priceString = deliveryDetails[selectedOption]?.price || "$0";
        return parseFloat(priceString.replace("$", "")) || 0;
    };

    const location = useLocation();

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (location.state?.refetch) {
            fetchOrders();
        }
    }, [location.state]);

    const calculateTotalPrice = () => {
        const totalProductPrice = orders.reduce((total, order) => {
            return total + order.product.price * order.quantity;
        }, 0);
        return parseFloat(totalProductPrice.toFixed(2));
    };

    const subtotal = calculateTotalPrice();
    const shippingCost = getShippingCost();
    const totalPayment = parseFloat((subtotal + shippingCost).toFixed(2));

    const handlePurchase = async (orderID, selectedAddress, deliverAt, Payingmethod, totalPrice, shippingFee) => {
        try {
            if (!selectedAddress) {
                setAddressError("Please choose an address");
                return;
            }
            if (!Payingmethod) {
                setPaymentError("Please choose a payment method");
                return;
            }

            const payload = {
                userID: user.userID,
                orderId: orderID,
                shippingAddress: selectedAddress,
                phone: phone,
                deliverAt: deliverAt,
                paymentMethod: Payingmethod,
                totalPrice: totalPrice,
                shippingFee: shippingFee, // Add shippingFee to the payload
                sessionID: sessionID,
            };
            console.log("payload: ", payload)
            const response = await AxiosInstance.authAxios.post("/orders/purchase/", payload);

            if (response.status === 200) {
                const responseData = response.data;
                console.log(responseData);
                if (Payingmethod === "momo" && responseData.momoPaymentUrl) {
                    window.location.href = responseData.momoPaymentUrl;
                }
                else if(Payingmethod==="payos") {
                    window.location.href = responseData.data.paymentUrl;
                }
                else {
                    toast.success("Order placed successfully!");
                    window.location.href = `/checkout/result/${orderID}`;
                }
            } else {
                toast.error("Failed to place order. Please try again later.");
            }
        } catch (error) {
            console.error("Failed to place order:", error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || "Failed to place order. Please try again later.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-16 xl:px-32">
            {/* Page Header */}
            <div className="w-full mb-6">
                <Breadcrumbs
                    aria-label="breadcrumb"
                    separator="›"
                    className="text-sm text-gray-600"
                >
                    <Link to="/" className="flex items-center gap-1 text-gray-600 hover:text-red-500">
                        <HomeIcon fontSize="small" />
                        Home
                    </Link>
                    <span className="text-gray-900 font-medium flex items-center gap-1">
                        <ShoppingCartCheckoutIcon fontSize="small" />
                        Checkout
                    </span>
                </Breadcrumbs>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Section: Delivery Method and Order Items */}
                <div className="lg:w-2/3 w-full space-y-6">
                    {/* Delivery Method */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Delivery Method</h2>
                        <div className="space-y-4">
                            <label
                                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors duration-300 ${
                                    selectedOption === "fast" ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="shippingOption"
                                    value="fast"
                                    className="hidden"
                                    checked={selectedOption === "fast"}
                                    onChange={() => {
                                        setSelectedOption("fast");
                                        setShippingFee(16); // Update shippingFee
                                    }}
                                />
                                <div className="flex items-center space-x-3">
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500 text-white">NEW</span>
                                    <span className="text-base text-gray-800">Fast Delivery (2 Days)</span>
                                </div>
                            </label>

                            <label
                                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors duration-300 ${
                                    selectedOption === "economy" ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="shippingOption"
                                    value="economy"
                                    className="hidden"
                                    checked={selectedOption === "economy"}
                                    onChange={() => {
                                        setSelectedOption("economy");
                                        setShippingFee(10); // Update shippingFee
                                    }}
                                />
                                <div className="text-base text-gray-800">Economy Delivery (3 Days)</div>
                            </label>
                        </div>

                        <div className="mt-4 flex justify-between items-center bg-gray-100 p-4 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <span className="text-base font-semibold text-green-600">Delivery On:</span>
                                <span className="text-base text-gray-600">{deliveryDetails[selectedOption].detail}</span>
                            </div>
                            <span className="text-base font-semibold text-gray-800">{deliveryDetails[selectedOption].price}</span>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Order</h2>
                        <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg">
                            {orders.map((order, index) => (
                                <Link
                                    to={`/product/${order?.product?.productID || order.product?.product_id}`}
                                    key={index}
                                    className="flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors duration-300 border-b border-gray-200 last:border-b-0"
                                >
                                    <img
                                        src={order.product.MainImage}
                                        alt={order.product.name}
                                        className="w-16 h-16 rounded-md border border-gray-200 object-cover"
                                    />
                                    <div className="flex-1">
                                        <p className="text-base text-gray-800 font-medium">{order.product.name}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-base text-gray-600">Qty: x{order.quantity}</span>
                                            <span className="text-base text-gray-800 font-semibold">
                                                {(order.product.price * order.quantity).toLocaleString("en-US", { style: 'currency', currency: 'USD' })}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Section: Delivery Address, Payment Method, and Summary */}
                <div className="lg:w-1/3 w-full space-y-6">
                    {/* Delivery Address */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Deliver To</h2>
                            <Link to="/me" className="text-base text-blue-600 hover:underline">Change</Link>
                        </div>
                        <div className="space-y-2">
                            <p className="text-base text-gray-800 font-semibold truncate">{user?.name || user?.user?.name}</p>
                            <p className="text-base text-blue-600">Phone: {phone || "No phone number"}</p>
                            {addressError && <p className="text-base text-red-500">{addressError}</p>}
                            <p className="text-base text-gray-800">
                                <span className="font-semibold text-gray-800">Address: </span>
                                <span className={selectedAddress ? "text-gray-800" : "text-gray-500"}>
                                    {selectedAddress || "No address selected"}
                                </span>
                            </p>
                            <button
                                onClick={() => setOpenModal(true)}
                                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-base font-semibold hover:bg-blue-700 transition duration-300"
                            >
                                Add New Address
                            </button>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h2>
                        {paymentError && <p className="text-base text-red-500 mb-2">{paymentError}</p>}
                        <div className="space-y-4">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="radio"
                                    id="cod"
                                    name="paymentMethod"
                                    value="cod"
                                    className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-blue-500"
                                    onChange={() => {
                                        setPaymentError("");
                                        setPaymentMethod("cod");
                                    }}
                                />
                                <span className="text-base text-gray-800">Cash on Delivery (COD)</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="radio"
                                    id="momo"
                                    name="paymentMethod"
                                    value="momo"
                                    className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-blue-500"
                                    onChange={() => {
                                        setPaymentError("");
                                        setPaymentMethod("momo");
                                    }}
                                />
                                <div className="flex items-center">
                                    <img
                                        src="https://i.pinimg.com/736x/56/3f/f3/563ff3678a3f880cbf06cd4fde819440.jpg"
                                        alt="MoMo Logo"
                                        className="w-6 h-6 mr-2"
                                    />
                                    <span className="text-base text-gray-800">MoMo</span>
                                </div>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="radio"
                                    id="payos"
                                    name="paymentMethod"
                                    value="payos"
                                    className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-blue-500"
                                    onChange={() => {
                                        setPaymentError("");
                                        setPaymentMethod("payos");
                                    }}
                                />
                                <div className="flex items-center">
                                    <img
                                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs9ULmmyJBs3PlqlSpI_pJTDenFeJFhi8UAQ&s"
                                        alt="MoMo Logo"
                                        className="w-6 h-6 mr-2"
                                    />
                                    <span className="text-base text-gray-800">Payos</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
                        <div className="space-y-2 text-base text-gray-800">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{subtotal.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping Cost:</span>
                                <span>{shippingFee.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                            </div>
                            <div className="border-t border-gray-200 my-2"></div>
                            <div className="flex justify-between font-semibold">
                                <span>Total Payment:</span>
                                <span>{totalPayment.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                            </div>
                        </div>
                        <button
                            className="w-full mt-4 px-4 py-3 bg-red-600 text-white rounded-lg text-base font-semibold hover:bg-red-700 transition duration-300"
                            onClick={() => {
                                console.log("Shipping Fee before handlePurchase:", shippingFee); // Debug log
                                handlePurchase(
                                    order?.order_id,
                                    selectedAddress,
                                    deliveryDetails[selectedOption].detail,
                                    paymentMethod,
                                    calculateDiscountedTotal() + shippingFee,
                                    shippingFee
                                );
                            }}
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            </div>

            {/* Address Selection Modal */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                    {!isAddingNew ? (
                        <>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Select an Address</h2>
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
                                {addresses.length > 0 ? (
                                    addresses.map((addr) => {
                                        const isSelected = selectedAddress === `${addr.street}, ${addr.district}, ${addr.ward}, ${addr.city}`;
                                        return (
                                            <div
                                                key={addr.id}
                                                className={`p-3 border-b cursor-pointer rounded-lg transition-colors duration-300 ${
                                                    isSelected ? "bg-blue-50 text-blue-800 font-semibold" : "hover:bg-gray-100"
                                                }`}
                                                onClick={() => handleSelectAddress(addr)}
                                            >
                                                <p className="text-base text-gray-800">{`${addr.street}, ${addr.district}, ${addr.ward}, ${addr.city}`}</p>
                                                <p className="text-base text-gray-600">Phone: {addr.phoneNumber}</p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-base text-gray-500">No addresses available</p>
                                )}
                            </div>
                            <button
                                onClick={() => setIsAddingNew(true)}
                                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-base font-semibold hover:bg-blue-700 transition duration-300"
                            >
                                Add New Address
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Address</h2>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    value={newAddress.street || ""}
                                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Phone Number"
                                    value={newAddress.phoneNumber || ""}
                                    onChange={(e) => {
                                        const input = e.target.value;
                                        if (!/^\d*$/.test(input)) {
                                            setPhoneError("Phone number must contain only numbers.");
                                        } else if (input.length < 10 || input.length > 11) {
                                            setPhoneError("Phone number must be 10-11 digits long.");
                                        } else {
                                            setPhoneError("");
                                        }
                                        setNewAddress({ ...newAddress, phoneNumber: input });
                                    }}
                                    className={`w-full p-3 border rounded-lg text-base focus:outline-none focus:ring-2 ${
                                        phoneError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                />
                                {phoneError && <p className="text-base text-red-500">{phoneError}</p>}
                                <select
                                    value={chooseAddress.cityCode || ""}
                                    onChange={(e) => {
                                        const selectedCityCode = e.target.value;
                                        const selectedCity = cities.find((city) => city.code == selectedCityCode);
                                        setChooseAddress({ cityCode: selectedCityCode, districtCode: "", wardCode: "" });
                                        setNewAddress({
                                            ...newAddress,
                                            city: selectedCity ? selectedCity.name : "",
                                            cityCode: selectedCityCode,
                                            district: "",
                                            districtCode: "",
                                            ward: "",
                                            wardCode: "",
                                        });
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select City</option>
                                    {cities.map((city) => (
                                        <option key={city.code} value={city.code}>{city.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={chooseAddress.districtCode || ""}
                                    onChange={(e) => {
                                        const selectedDistrictCode = e.target.value;
                                        const selectedDistrict = districts.find((district) => district.code == selectedDistrictCode);
                                        setChooseAddress({ ...chooseAddress, districtCode: selectedDistrictCode, wardCode: "" });
                                        setNewAddress({
                                            ...newAddress,
                                            district: selectedDistrict ? selectedDistrict.name : "",
                                            districtCode: selectedDistrictCode,
                                            ward: "",
                                            wardCode: "",
                                        });
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={!chooseAddress.cityCode}
                                >
                                    <option value="">Select District</option>
                                    {districts.map((district) => (
                                        <option key={district.code} value={district.code}>{district.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={chooseAddress.wardCode || ""}
                                    onChange={(e) => {
                                        const WardCode = e.target.value;
                                        const selectedWard = wards.find((ward) => ward.code == WardCode);
                                        setChooseAddress({ ...chooseAddress, wardCode: WardCode });
                                        setNewAddress({ ...newAddress, ward: selectedWard ? selectedWard.name : "", wardCode: WardCode });
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={!chooseAddress.districtCode}
                                >
                                    <option value="">Select Ward</option>
                                    {wards.map((ward) => (
                                        <option key={ward.code} value={ward.code}>{ward.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    onClick={() => setIsAddingNew(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-base hover:bg-gray-300 transition duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddAddress}
                                    disabled={
                                        !newAddress.street?.trim() ||
                                        !newAddress.phoneNumber?.trim() ||
                                        !newAddress.cityCode?.trim() ||
                                        !newAddress.districtCode?.trim() ||
                                        !newAddress.wardCode?.trim()
                                    }
                                    className={`px-4 py-2 rounded-lg text-base ${
                                        !newAddress.street?.trim() ||
                                        !newAddress.phoneNumber?.trim() ||
                                        !newAddress.cityCode?.trim() ||
                                        !newAddress.districtCode?.trim() ||
                                        !newAddress.wardCode?.trim()
                                            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    } transition duration-300`}
                                >
                                    Add
                                </button>
                            </div>
                        </>
                    )}
                </Box>
            </Modal>
        </div>
    );
};

export default Order;