import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PropTypes from "prop-types";

const BrowseByTypes = ({ types }) => {
    const [hovered, setHovered] = useState(false);
    const productListRef = useRef(null);

    const handleNext = () => {
        if (productListRef.current) {
            const itemWidth = productListRef.current.firstChild?.offsetWidth || 0;
            const visibleItems = Math.floor(productListRef.current.offsetWidth / itemWidth);
            const scrollDistance = itemWidth * visibleItems;
            productListRef.current.scrollBy({
                left: scrollDistance,
                behavior: "smooth",
            });
        }
    };

    const handlePrevious = () => {
        if (productListRef.current) {
            const itemWidth = productListRef.current.firstChild?.offsetWidth || 0;
            const visibleItems = Math.floor(productListRef.current.offsetWidth / itemWidth);
            const scrollDistance = itemWidth * visibleItems;
            productListRef.current.scrollBy({
                left: -scrollDistance,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="w-full min-h-fit flex flex-col gap-y-8 bg-white mt-10 p-6 rounded-xl shadow-lg">
            <div className="w-full flex items-center gap-x-2">
                <div className="w-[20px] h-[40px] bg-red-500 rounded-md"></div>
                <span className="text-sm text-red-600 font-semibold">All types</span>
            </div>

            <div
                className="relative w-full"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <ul
                    ref={productListRef}
                    className={`grid grid-flow-col auto-cols-max gap-x-4 overflow-x-auto pb-6 ${
                        hovered ? "custom-scrollbar" : "custom-scrollbar-hidden"
                    }`}
                >
                    {types.map((type) => (
                        <Link
                            to={`/products/type/${type.raw_type}`}
                            key={type._id || type.id}
                            className="flex-shrink-0 w-44 h-52 flex flex-col items-center justify-center border border-gray-300 rounded-xl shadow-lg bg-white transform transition-all hover:scale-105 hover:shadow-2xl hover:bg-gray-50"
                        >
                            <img
                                src={type.image || "/placeholder-image.jpg"}
                                alt={type.name}
                                className="w-32 h-32 object-contain rounded-lg shadow-md transition-all duration-300 ease-in-out"
                            />
                            <span className="mt-3 text-lg font-semibold text-center text-gray-800">
                                {type.name}
                            </span>
                        </Link>
                    ))}
                </ul>
                {hovered && (
                    <button
                        onClick={handlePrevious}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/40 backdrop-blur-lg border border-white/50 rounded-full p-3 shadow-lg text-gray-800 hover:bg-white/60 transition-all duration-300"
                    >
                        <ArrowBackIcon />
                    </button>
                )}
                {hovered && (
                    <button
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/40 backdrop-blur-lg border border-white/50 rounded-full p-3 shadow-lg text-gray-800 hover:bg-white/60 transition-all duration-300"
                    >
                        <ArrowForwardIcon />
                    </button>
                )}
            </div>
        </div>
    );
};

// Define PropTypes for validation
BrowseByTypes.propTypes = {
    types: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            raw_type: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            image: PropTypes.string,
        })
    ).isRequired, // Array of type objects
};

export default BrowseByTypes;
