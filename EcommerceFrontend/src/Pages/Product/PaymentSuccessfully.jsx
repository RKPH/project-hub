import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AxiosInstance from "../../api/axiosInstance.js";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PaymentResultPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await AxiosInstance.authAxios.get(`/orders/getUserDetailById/${orderId}`);
                setOrder(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching order:", error);
                toast.error("Failed to fetch order details. Please try again later.", {
                    className: "toast-error",
                    style: { backgroundColor: "red", color: "white" },
                });
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    // Track purchase when order is paid
    useEffect(() => {
        if (!order || !order.products || order.payingStatus !== "Paid") return;

        const trackPurchase = async () => {
            const sessionId = user?.sessionID;
            const trackingRequests = order.products.map(async (product) => {
                try {
                    console.log(`Tracking product: ${product.product.name}`);
                    await AxiosInstance.authAxios.post("/tracking", {
                        sessionId,
                        user: user?.user_id,
                        productId: product.product.product_id,
                        product_name: product.product.name,
                        behavior: "purchase",
                    });
                } catch (error) {
                    console.error(`Error tracking ${product.product.name}:`, error.response?.data || error.message);
                }
            });

            await Promise.all(trackingRequests);
        };

        trackPurchase();
    }, [order, user]);

    if (loading) {
        return (
            <div className="min-h-full flex items-center justify-center bg-gray-100 p-5">
                <p>Loading...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-full flex items-center justify-center bg-gray-100 p-5">
                <p>Order not found.</p>
            </div>
        );
    }

    const isSuccess = order.status === "Pending";
    const isPending =  order.status === "Draft";
    const isFailed = order.status === "Failed";

    return (
        <div className="min-h-full flex flex-col items-center justify-center bg-gray-100 p-5">
            <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center border border-black">
                <div className={`mb-6 ${isSuccess ? "text-blue-500" : "text-red-500"}`}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={isSuccess ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M6 18L18 6M6 6l12 12"}
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-800">
                    {isSuccess ? "Payment Successful!" : isPending ? "Payment Pending" : "Payment Failed"}
                </h1>
                <p className="text-gray-600 mt-2">
                    {isSuccess
                        ? "Thank you for your payment. Your transaction has been completed successfully."
                        : isPending
                            ? "Your payment is still processing. Please wait a moment or check back later."
                            : "There was an issue processing your payment. Please try again or contact support."}
                </p>

                <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h2 className="text-lg font-medium text-gray-700">Order Summary</h2>
                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Order Number:</span>
                            <span className="text-black">{order.order_id}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span>Amount:</span>
                            <span>${order.totalPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span>Date:</span>
                            <span>{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span>Payment Status:</span>
                            <span>{order.payingStatus}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    {isFailed && (
                        <button
                            onClick={() => navigate(`/checkout`)}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                        >
                            Try Again
                        </button>
                    )}
                    <button
                        onClick={() => navigate("/")}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentResultPage;