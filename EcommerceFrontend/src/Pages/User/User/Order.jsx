import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import NotificationModal from "../../../Components/NotificationModal.jsx";
import { Link } from "react-router-dom";
import PaymentsIcon from "@mui/icons-material/Payments";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "../../../api/axiosInstance.js";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";

const OrderList = () => {
    const [openModal, setOpenModal] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState("all");
    const [orderID, setOrderID] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState("");
    const [Orders, setOrders] = useState([]);
    const [cancelReason, setCancelReason] = useState("");
    const [orderToCancel, setOrderToCancel] = useState(null);
    const user = useSelector((state) => state.auth.user);
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolderName, setAccountHolderName] = useState("");
    const [reviewError, setReviewError] = useState("");
    const [customCancelReason, setCustomCancelReason] = useState("");
    const [openNotiModal, setOpenNotiModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [modalType, setModalType] = useState("");

    const handleOpenRefundModal = (orderId) => {
        setOrderToCancel(orderId);
        setRefundModalOpen(true);
    };

    const handleCloseRefundModal = () => {
        setRefundModalOpen(false);
        setBankName("");
        setAccountNumber("");
        setAccountHolderName("");
        setOrderToCancel(null);
    };

    const handleSubmitRefundDetails = async () => {
        if (!bankName || !accountNumber || !accountHolderName) {
            toast.error("Please fill in all refund details.");
            return;
        }

        try {
            const response = await axiosInstance.authAxios.post(`/orders/${orderToCancel}/refund-details`, {
                bankName,
                accountNumber,
                accountHolderName,
            });

            if (response.status === 200) {
                toast.success("Refund bank details submitted successfully!");
                fetchOrders();
            } else {
                toast.error("Failed to submit refund details.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit refund details.");
        }

        handleCloseRefundModal();
    };

    const handleOpenModal = async (orderID, product) => {
        setOrderID(orderID);
        setSelectedProduct(product);
        try {
            const response = await axiosInstance.authAxios.get(`/orders/${orderID}/products/${product.product_id}/review`);

            if (response.status === 200) {
                const reviewData = response.data;
                setUserRating(reviewData.review.rating);
                setUserReview(reviewData.review.comment);
                setReviewError("");
            } else {
                setUserRating(0);
                setUserReview("");
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setUserRating(0);
                setUserReview("");
            } else {
                console.error("Error fetching review:", error);
            }
        }

        setOpenModal(true);
    };

    const fetchOrders = async () => {
        try {
            const response = await axiosInstance.authAxios.get("/orders/getUserOrders");
            const allOrders = response.data.data || [];
            const filteredOrders = selectedTab === "all"
                ? allOrders
                : allOrders.filter(order => order.status === selectedTab);
            setOrders(filteredOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Failed to fetch orders.");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [selectedTab]);

    const handleCloseModal = () => {
        setOpenModal(false);
        setUserRating(0);
        setUserReview("");
    };

    const handleOpenCancelModal = (orderId) => {
        setOrderToCancel(orderId);
        setCancelModalOpen(true);
    };

    const handleCloseNotiModal = () => {
        setOpenNotiModal(false);
    };

    const handleCloseCancelModal = () => {
        setCancelModalOpen(false);
        setCancelReason("");
        setCustomCancelReason("");
        setOrderToCancel(null);
    };

    const handleCancelOrder = async () => {
        if (!orderToCancel || !cancelReason) {
            toast.error("Please select a reason for cancellation.");
            return;
        }

        const finalReason = cancelReason === "Other" ? customCancelReason : cancelReason;

        if (cancelReason === "Other" && !customCancelReason) {
            toast.error("Please specify your reason for cancellation.");
            return;
        }

        try {
            const response = await axiosInstance.authAxios.post(
                `/orders/cancle/${orderToCancel}`,
                { reason: finalReason }
            );

            if (response.status === 200) {
                toast.success("Order cancelled successfully.");

                const cancelledOrder = Orders.find(order => order.order_id === orderToCancel);

                if (
                    (cancelledOrder?.PaymentMethod === "payos" || cancelledOrder?.PaymentMethod === "momo") &&
                    !cancelledOrder.refundInfo
                ) {
                    handleOpenRefundModal(orderToCancel);
                } else {
                    fetchOrders();
                    setOrderToCancel(null);
                }
            } else {
                toast.error("Failed to cancel order.");
            }
        } catch (error) {
            console.error("Error cancelling order:", error);
            toast.error(error.response?.data?.message || "Failed to cancel order.");
        }

        setCancelModalOpen(false);
        setCancelReason("");
        setCustomCancelReason("");
    };

    const handleSubmitReview = async () => {
        if (userReview.length < 25) {
            setReviewError("Review must be at least 25 characters long.");
            return;
        }
        if (!user) {
            toast.error("You must be logged in to submit a review.");
            return;
        }
        if (userRating === 0) {
            toast.error("Please select a rating.");
            return;
        }
        if (!userReview) {
            toast.error("Please enter a review.");
            return;
        }

        const newReview = {
            name: user.name || "Anonymous",
            orderID: orderID,
            user: user,
            rating: userRating,
            comment: userReview,
            date: new Date().toISOString().split("T")[0],
        };

        try {
            await axiosInstance.authAxios.post(`/reviews/${selectedProduct?.product_id}/add`, newReview);
            setModalMessage("You have successfully added review.");
            setModalTitle("Success");
            setModalType("success");
            setOpenNotiModal(true);
        } catch (error) {
            console.error("Error submitting review:", error);
            setModalMessage(error.response?.data?.message || "Failed to submit review.");
            setModalTitle("Error");
            setModalType("error");
            setOpenNotiModal(true);
        }

        setUserRating(0);
        setUserReview("");
        setOpenModal(false);
    };

    const formatDateWithTime = (dateString) => {
        const date = new Date(dateString);
        const offset = 7 * 60 * 60 * 1000; // Vietnam time offset (UTC+7)
        const localDate = new Date(date.getTime() + offset);

        const hours = String(localDate.getUTCHours()).padStart(2, "0");
        const minutes = String(localDate.getUTCMinutes()).padStart(2, "0");
        const seconds = String(localDate.getUTCSeconds()).padStart(2, "0");
        const day = String(localDate.getUTCDate()).padStart(2, "0");
        const month = String(localDate.getUTCMonth() + 1).padStart(2, "0");
        const year = String(localDate.getUTCFullYear()).slice(-2);

        return `${hours}:${minutes}:${seconds}, ${month}/${day}/${year}`;
    };

    return (
        <div className="min-h-[500px] bg-gray-50 p-6 rounded-lg shadow-lg px-4 sm:px-6 lg:px-[100px] 3xl:px-[200px]">
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
                        Orders
                    </span>
                </Breadcrumbs>
            </div>
            <div className="bg-white w-full py-4 rounded-lg mt-4">
                <div className="flex space-x-6 p-4 items-center overflow-x-auto">
                    {["all", "Pending", "Confirmed", "Delivering", "Delivered", "Cancelled"].map((tab) => (
                        <div
                            key={tab}
                            className={`cursor-pointer mb-4 ${selectedTab === tab ? "text-red-600 font-semibold border-b-2 border-red-600" : "text-gray-600"}`}
                            onClick={() => setSelectedTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                {Orders.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center mt-5">
                        <img
                            src="https://frontend.tikicdn.com/_desktop-next/static/img/account/empty-order.png"
                            alt="Empty Orders"
                            className="w-40 h-40"
                        />
                        <p className="text-gray-500 text-lg mt-4">You have no orders yet</p>
                    </div>
                ) : (
                    Orders.map((order, index) => (
                        <div
                            key={index}
                            className="w-full min-h-[120px] bg-white border border-gray-200 my-4 p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300"
                        >
                            <div className="flex justify-between items-center border-b border-gray-200 py-3 gap-x-4">
                                {order.status === "Draft" && (
                                    <>
                                        <div className="flex items-center">
                                            <PaymentsIcon className="mr-2 text-gray-400" />
                                            Draft
                                        </div>
                                        <Link to="/checkout" className="text-sm text-blue-500 hover:text-blue-600">
                                            Checkout
                                        </Link>
                                    </>
                                )}

                                {order.status === "Pending" && (
                                    <>
                                        <div className="flex items-center">
                                            <LocalShippingIcon className="mr-2 text-gray-400" />
                                            {order.status}
                                        </div>
                                        <div className="flex items-center gap-x-4">
                                            <button
                                                onClick={() => handleOpenCancelModal(order.order_id)}
                                                className="text-red-500 border px-3 py-1 rounded-lg"
                                            >
                                                Cancel Order
                                            </button>
                                        </div>
                                    </>
                                )}

                                {order.status === "Confirmed" && (
                                    <div className="flex items-center text-blue-500">
                                        <CheckCircleIcon className="mr-2" />
                                        Confirmed
                                    </div>
                                )}

                                {order.status === "Delivering" && (
                                    <div className="flex items-center text-blue-600">

                                    <LocalShippingIcon className="mr-2" />
                                    Delivering
                                    </div>
                                    )}

                                {order.status === "Delivered" && (
                                    <div className="flex items-center text-green-500">
                                        <CheckCircleIcon className="mr-2" />
                                        Delivered
                                    </div>
                                )}

                                {(order.status === "Cancelled" || order.status === "CancelledByAdmin") && (
                                    <div className="flex items-center text-red-500">
                                        Cancelled
                                    </div>
                                )}
                            </div>

                            {order.status !== "Draft" && (
                                <div className="flex justify-between items-center py-2 text-sm text-gray-600">
                                    <div>
                                        <span className="font-medium">Order Date:</span> {formatDateWithTime(order.createdAt)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Total Price:</span> ${order.totalPrice?.toFixed(2) || "0.00"}
                                    </div>
                                </div>
                            )}

                            <ul className="w-full mt-3">
                                {order?.products?.map((product, index) => (
                                    <li
                                        key={index}
                                        className="flex justify-between items-center p-3 hover:bg-gray-100 rounded-lg transition duration-200"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Link
                                                to={`/product/${product.product?.product_id}`}
                                                className="flex items-center space-x-4"
                                            >
                                                <img
                                                    src={product.product?.MainImage || "/placeholder.png"}
                                                    alt={product.product?.name || "Product Image"}
                                                    className="w-20 h-20 rounded-md border object-cover"
                                                />
                                                <div>
                                                    <p className="text-base text-gray-800 font-medium">
                                                        {product.product?.name || "Unknown Product"}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Quantity: {product.quantity || 1}</p>
                                                </div>
                                            </Link>
                                        </div>

                                        {order.status === "Delivered" && (
                                            <button
                                                onClick={() => handleOpenModal(order._id, product.product)}
                                                className="text-sm text-red-500 hover:text-red-600"
                                            >
                                                Leave a Review
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            {order.status !== "Draft" && (
                                <div className="mt-4 flex justify-end space-x-3">
                                    {(order.status === "Cancelled" || order.status === "CancelledByAdmin") &&
                                        (order.PaymentMethod === "BankTransfer" || order.PaymentMethod === "momo") &&
                                        !order.refundInfo && (
                                            <button
                                                onClick={() => handleOpenRefundModal(order.order_id)}
                                                className="inline-block bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                                            >
                                                Submit Refund Details
                                            </button>
                                        )}
                                    <Link
                                        to={`/order/${order.order_id}`}
                                        className="inline-block bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                                    >
                                        View Detail
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {openNotiModal && (
                <NotificationModal
                    message={modalMessage}
                    onClose={handleCloseNotiModal}
                    title={modalTitle}
                    type={modalType}
                />
            )}

            <Modal open={cancelModalOpen} onClose={handleCloseCancelModal}>
                <section
                    className="p-6 bg-white rounded-md shadow-lg w-96 relative"
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        resize: "none",
                    }}
                >
                    <header>
                        <h3 className="text-lg font-semibold">Reason for Cancellation</h3>
                    </header>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleCancelOrder();
                        }}
                    >
                        <fieldset className="my-4">
                            <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700">
                                Reason
                            </label>
                            <select
                                id="cancel-reason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="mt-1 block w-full p-2 border border-red-500 rounded-md focus:outline-none focus:ring focus:ring-red-300"
                            >
                                <option value="">Select a reason</option>
                                <option value="Changed Mind">Changed Mind</option>
                                <option value="Found Better Price">Found Better Price</option>
                                <option value="Ordered by Mistake">Ordered by Mistake</option>
                                <option value="Other">Other</option>
                            </select>
                        </fieldset>

                        {cancelReason === "Other" && (
                            <div className="mt-4">
                                <label htmlFor="custom-reason" className="block text-sm font-medium text-gray-700">
                                    Please specify your reason
                                </label>
                                <textarea
                                    id="custom-reason"
                                    value={customCancelReason}
                                    onChange={(e) => setCustomCancelReason(e.target.value)}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-red-300"
                                    placeholder="Type your reason here..."
                                    rows={3}
                                    style={{
                                        resize: "none",
                                    }}
                                />
                            </div>
                        )}

                        <footer className="mt-4 flex justify-end gap-2">
                            <Button
                                onClick={handleCloseCancelModal}
                                variant="outlined"
                                color="error"
                            >
                                Close
                            </Button>

                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    backgroundColor: "red",
                                    color: "white",
                                    "&:hover": { backgroundColor: "darkred" },
                                }}
                            >
                                Confirm
                            </Button>
                        </footer>
                    </form>
                </section>
            </Modal>

            <Modal open={openModal} onClose={handleCloseModal}>
                <Box
                    className="p-6 bg-white rounded-md shadow-lg w-96 mx-auto flex flex-col gap-4"
                    style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                >
                    <h3 className="text-lg font-semibold">Leave a Review</h3>

                    {selectedProduct && (
                        <div className="flex items-center gap-4">
                            <img
                                src={selectedProduct.MainImage || "/placeholder.png"}
                                alt={selectedProduct.name || "Product Image"}
                                className="w-16 h-16 rounded-md border object-cover"
                            />
                            <div>
                                <h3 className="text-lg font-semibold">{selectedProduct.name || "Product Name"}</h3>
                            </div>
                        </div>
                    )}

                    <Rating
                        value={userRating}
                        precision={0.5}
                        onChange={(e, newValue) => setUserRating(newValue)}
                    />
                    <textarea
                        className="border border-gray-300 p-2 w-full"
                        placeholder="Write your review here..."
                        value={userReview}
                        onChange={(e) => setUserReview(e.target.value)}
                        style={{ height: "100px", resize: "none", overflow: "auto" }}
                    ></textarea>

                    {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}

                    <div className="flex justify-end gap-2">
                        <Button
                            onClick={handleCloseModal}
                            variant="outlined"
                            color="error"
                        >
                            Close
                        </Button>

                        <Button
                            onClick={handleSubmitReview}
                            variant="contained"
                            sx={{
                                backgroundColor: "red",
                                color: "white",
                                "&:hover": { backgroundColor: "darkred" },
                            }}
                        >
                            Submit
                        </Button>
                    </div>
                </Box>
            </Modal>

            <Modal open={refundModalOpen} onClose={handleCloseRefundModal}>
                <section
                    className="p-6 bg-white rounded-lg shadow-lg w-96"
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    <header className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Submit Refund Details</h3>
                        <p className="text-sm text-gray-600">Please enter your bank information for the refund process.</p>
                    </header>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmitRefundDetails();
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                            <input
                                type="text"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                                placeholder="Enter bank name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Account Number</label>
                            <input
                                type="number"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                                placeholder="Enter account number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                            <input
                                type="text"
                                value={accountHolderName}
                                onChange={(e) => setAccountHolderName(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                                placeholder="Enter account holder name"
                            />
                        </div>

                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                type="button"
                                onClick={handleCloseRefundModal}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </section>
            </Modal>
        </div>
    );
};

export default OrderList;