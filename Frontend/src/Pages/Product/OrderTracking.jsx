import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Badge, Button, IconButton, Tooltip } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CancelIcon from "@mui/icons-material/Cancel";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { Steps } from "antd";
import AxiosInstance from "../../api/axiosInstance";

const { Step } = Steps;

const OrderTracking = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Predefined steps for the order lifecycle (excluding Cancelled by default)
    const baseOrderSteps = [
        { title: "Pending", description: "Order placed and awaiting confirmation" },
        { title: "Confirmed", description: "Order confirmed by the seller" },
        { title: "Delivering", description: "Order is being shipped" },
        { title: "Delivered", description: "Order delivered to the customer" },
    ];

    // Map order status to step index
    const getCurrentStepIndex = (status, isCancelled) => {
        if (isCancelled) {
            return baseOrderSteps.length; // "Cancelled" is the last step if present
        }
        switch (status) {
            case "Pending":
                return 0;
            case "Confirmed":
                return 1;
            case "Delivering":
                return 2;
            case "Delivered":
                return 3;
            default:
                return 0; // Fallback to "Pending"
        }
    };

    // Format date with Vietnam time (UTC+7)
    const formatDateWithTime = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date)) return dateString; // Return original string if already formatted
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

    // Fetch order details
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await AxiosInstance.authAxios.get(`/orders/getUserDetailById/${orderId}`);
                setOrder(response.data.data);
                console.log("Order history:", response.data.data.history); // Debug history
            } catch (error) {
                console.error("Failed to fetch order details", error);
                setError("Failed to load order details. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        if (orderId) fetchOrder();
    }, [orderId]);

    // Copy Order ID to clipboard
    const copyOrderId = () => {
        navigator.clipboard.writeText(order.order_id);
        alert("Order ID copied to clipboard!");
    };

    // Status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case "Delivered":
                return "success";
            case "Cancelled":
            case "CancelledByAdmin":
                return "error";
            case "Processing":
                return "warning";
            default:
                return "info";
        }
    };

    // Generate steps with status based on current order status
    const generateSteps = () => {
        if (!order) return [];
        const isCancelled = order.status === "Cancelled" || order.status === "CancelledByAdmin";
        // Include "Cancelled" step only if order is cancelled
        const orderSteps = isCancelled
            ? [...baseOrderSteps, { title: "Cancelled", description: "Order was cancelled" }]
            : baseOrderSteps;
        const currentStepIndex = getCurrentStepIndex(order.status, isCancelled);

        return orderSteps.map((step, index) => {
            let status = "wait";
            if (index < currentStepIndex) status = "finish";
            else if (index === currentStepIndex) status = "process";

            // Flexible matching for history entries
            const historyEntry = order.history?.find(h => {
                const action = h.action.toLowerCase().trim();
                const title = step.title.toLowerCase();
                if (title === "delivering") {
                    return (
                        action.includes("delivering") ||
                        action.includes("shipped") ||
                        action.includes("in transit") ||
                        action.includes("delivery")
                    );
                }
                if (title === "pending") {
                    return (
                        action.includes("pending") ||
                        action.includes("placed") ||
                        action.includes("processing")
                    );
                }
                return action.includes(title);
            });

            // Debug if no history entry found
            if (!historyEntry && step.title === "Pending") {
                console.log(`No history entry found for step: ${step.title}, history:`, order.history);
            }

            // Use history date, fallback to order.createdAt or "N/A"
            const date = historyEntry
                ? historyEntry.date
                : step.title === "Pending" && order.createdAt
                    ? formatDateWithTime(order.createdAt)
                    : order.updatedAt
                        ? formatDateWithTime(order.updatedAt)
                        : "N/A";

            return {
                title: step.title,
                description: `${step.description} (${date})`,
                status,
            };
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-red-600 text-lg font-medium">{error}</p>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => window.location.reload()}
                        className="mt-4"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center py-8 w-full px-4 md:px-6 lg:px-[100px] 2xl:px-[200px] bg-gray-100">
            {/* Breadcrumbs */}
            <div className="w-full mb-6">
                <Breadcrumbs
                    aria-label="breadcrumb"
                    separator="›"
                    className="text-sm text-gray-600"
                >
                    <Link to="/" className="flex items-center gap-1 text-gray-600 hover:text-red-600">
                        <HomeIcon fontSize="small" />
                        Home
                    </Link>
                    <Link to="/orders" className="flex items-center gap-1 text-gray-600 hover:text-red-600">
                        <ShoppingCartIcon fontSize="small" />
                        Orders
                    </Link>
                    <span className="text-gray-900 font-medium flex items-center gap-1">
                        Order ID: {order.order_id}
                        <Tooltip title="Copy Order ID">
                            <IconButton onClick={copyOrderId} size="small" className="ml-1">
                                <ContentCopyIcon fontSize="small" className="text-gray-600" />
                            </IconButton>
                        </Tooltip>
                    </span>
                </Breadcrumbs>
            </div>

            {/* Order Header */}
            <div className="w-full bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-semibold text-gray-900">Tracking Order: #{order?.order_id}</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p className="text-base font-medium text-gray-900">{formatDateWithTime(order?.createdAt)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">
                            {order?.status === "Delivered" ? "Delivered At" : "Estimated Delivery"}
                        </p>
                        <p className={`text-base font-medium ${order?.status === "Delivered" ? "text-green-600" : "text-gray-900"}`}>
                            {formatDateWithTime(order?.DeliveredAt)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Recipient & Payment Details */}
            <div className="w-full bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <PersonIcon className="text-red-600" />
                    Recipient Details
                </h2>
                <div className="mt-4 space-y-3 text-gray-900">
                    <p><span className="font-medium text-gray-600">Shipping Address:</span> {order?.shippingAddress}</p>
                    <p><span className="font-medium text-gray-600">Payment Method:</span> {order?.PaymentMethod}</p>
                    <p><span className="font-medium text-gray-600">Payment Status:</span> {order?.payingStatus}</p>
                </div>
            </div>

            {/* Order Status */}
            <div className="w-full bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <LocalShippingIcon className="text-red-600" />
                    Order Status
                </h2>
                <p className="mt-4 text-gray-900 flex items-center gap-x-7">
                    <span className="font-medium text-gray-600">Status:</span>{" "}
                    <Badge badgeContent={order?.status} color={getStatusColor(order?.status)} className="ml-8" />
                </p>

                {(order?.status === "Cancelled" || order?.status === "CancelledByAdmin") && (
                    <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg space-y-2">
                        <p className="text-red-600 font-medium flex items-center gap-2">
                            <CancelIcon />
                            {order?.status === "CancelledByAdmin" ? "This order was cancelled by an admin." : "This order was cancelled."}
                        </p>
                        <p><span className="font-medium text-gray-600">Reason:</span> {order?.cancellationReason}</p>
                        <p><span className="font-medium text-gray-600">Refund Status:</span> {order?.refundStatus}</p>

                        {order?.refundInfo && (
                            <div className="mt-4 p-4 bg-white border rounded-lg">
                                <p className="font-semibold mb-2 text-gray-900">Refund Bank Details</p>
                                <p><span className="font-medium text-gray-600">Account Name:</span> {order.refundInfo.accountName}</p>
                                <p><span className="font-medium text-gray-600">Bank Name:</span> {order.refundInfo.bankName}</p>
                                <p><span className="font-medium text-gray-600">Account Number:</span> {order.refundInfo.accountNumber}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Order History - Ant Design Steps with Dot Style */}
            <div className="w-full bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <LocalShippingIcon className="text-red-600" />
                    Order History
                </h2>
                <div className="mt-4">
                    <Steps
                        direction="vertical"
                        progressDot
                        current={getCurrentStepIndex(order?.status, order?.status === "Cancelled" || order?.status === "CancelledByAdmin")}
                        className="custom-steps"
                        items={generateSteps()}
                    />
                </div>
            </div>

            {/* Product List */}
            <div className="w-full bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <ShoppingCartIcon className="text-red-600" />
                    Ordered Products
                </h2>
                <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order?.products?.map((product, index) => (
                        <li
                            key={index}
                            className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-lg transition-shadow duration-300 bg-white"
                        >
                            <img
                                src={product.product.MainImage}
                                alt={product.product.name}
                                className="w-20 h-20 object-cover rounded-md"
                            />
                            <div className="flex-1">
                                <p className="font-medium text-base text-gray-900">{product.product.name}</p>
                                <p className="text-sm text-gray-600">Price: ${product.product.price}</p>
                                <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                                <Link
                                    to={`/product/${product.product.product_id}`}
                                    className="text-red-600 text-sm hover:underline mt-1 inline-block"
                                >
                                    View Product
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default OrderTracking;