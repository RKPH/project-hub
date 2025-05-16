import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Rating from "@mui/material/Rating";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Skeleton from "@mui/material/Skeleton";

const SliceOfProduct = ({ products, TrackViewBehavior, isLoading = false }) => {
    const [hovered, setHovered] = useState(false);
    const productListRef = useRef(null);

    const handleNext = () => {
        if (productListRef.current) {
            const itemWidth = productListRef.current.firstChild?.offsetWidth || 0;
            const visibleItems = Math.floor(productListRef.current.offsetWidth / itemWidth);
            const scrollDistance = itemWidth * visibleItems;
            productListRef.current.scrollBy({ left: scrollDistance, behavior: "smooth" });
        }
    };

    const handlePrevious = () => {
        if (productListRef.current) {
            const itemWidth = productListRef.current.firstChild?.offsetWidth || 0;
            const visibleItems = Math.floor(productListRef.current.offsetWidth / itemWidth);
            const scrollDistance = itemWidth * visibleItems;
            productListRef.current.scrollBy({ left: -scrollDistance, behavior: "smooth" });
        }
    };

    return (
        <div
            className="relative w-full"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <ul
                ref={productListRef}
                className={`w-full flex gap-x-1 overflow-x-auto pb-5 ${
                    hovered ? "custom-scrollbar" : "custom-scrollbar-hidden"
                }`}
            >
                {isLoading
                    ? Array.from({ length: 10 }).map((_, index) => (
                        <div
                            className="w-40 sm:w-52 flex-shrink-0 border border-gray-300 rounded-lg p-2"
                            key={index}
                        >
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={200}
                                className="rounded-[20px]"
                            />
                            <div className="flex flex-col mt-4">
                                <Skeleton variant="text" width="80%" />
                                <Skeleton variant="text" width="60%" />
                                <Skeleton variant="text" width="40%" />
                            </div>
                        </div>
                    ))
                    : products.map((product) => (
                        <Link
                            onClick={() => {
                                TrackViewBehavior(
                                    product?.product_id || product?.product_id,
                                    product?.name || product?.productDetails?.name,
                                    "view"
                                );
                            }}
                            to={`/product/${product?.product_id || product?.product_id}`}
                            className="w-40 sm:w-52 md:w-52 lg:w-60 xl:w-52 flex-shrink-0 border border-gray-300 hover:shadow-lg flex flex-col justify-between h-[350px]"
                            key={product?.productID || product.product_id}
                        >
                            {/* Product Image */}
                            <div className="w-full h-[200px] bg-gray-200 overflow-hidden">
                                <img
                                    src={product?.MainImage || product?.productDetails?.MainImage}
                                    alt={product?.name || product?.productDetails?.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Product Content */}
                            <div className="flex flex-col flex-grow p-2 gap-y-2">

                                {/* Product Name */}
                                <div className="h-[20px] overflow-hidden flex items-start">
                                    <span className="font-normal text-base hover:underline line-clamp-2">
                                        {product?.name || product?.productDetails?.name}
                                    </span>
                                </div>

                                {/* Rating */}
                                <div className="h-[20px] flex items-center">
                                    <Rating
                                        name="half-rating-read"
                                        size="small"
                                        defaultValue={product?.rating || product?.productDetails?.rating}
                                        precision={0.5}
                                        readOnly
                                    />
                                </div>

                                {/* Brand - placed directly above price */}
                                <div className="text-sm text-gray-600">
                                    {product?.productDetails?.brand
                                        ? `Brand: ${product?.productDetails?.brand}`
                                        : `Brand: ${product?.brand}`}
                                </div>

                                {/* Price */}
                                <div className="h-[30px] flex items-center">
                                    <span className="font-bold text-lg">
                                        ${product?.price || product?.productDetails?.price}
                                    </span>
                                </div>

                                {/* Total Interactions (views) - optional, at the very bottom */}
                                {product?.totalInteractions > 0 && (
                                    <div className="text-sm text-gray-600">
                                        {`${product.totalInteractions} views`}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
            </ul>

            {/* Previous Button */}
            {hovered && (
                <button
                    onClick={handlePrevious}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 rounded-full p-2 shadow-lg"
                >
                    <ArrowBackIcon />
                </button>
            )}

            {/* Next Button */}
            {hovered && (
                <button
                    onClick={handleNext}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 rounded-full p-2 shadow-lg"
                >
                    <ArrowForwardIcon />
                </button>
            )}
        </div>
    );
};

SliceOfProduct.propTypes = {
    products: PropTypes.arrayOf(
        PropTypes.shape({
            productID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            product_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            name: PropTypes.string,
            price: PropTypes.number,
            MainImage: PropTypes.string,
            rating: PropTypes.number,
        })
    ).isRequired,
    TrackViewBehavior: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

export default SliceOfProduct;
