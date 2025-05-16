import PropTypes from "prop-types";
import { Card } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import AxiousInstance from "../api/axiosInstance.js";

const ProductCard = ({ product }) => {
    const {
        _id,
        name,
        price,
        category,
        MainImage
    } = product;

    // Fallback for image src if `productImage` array is empty
    const imgSrc = MainImage || "path/to/fallback/image.jpg"; // Default fallback image

    // Extract authentication state and user data
    const {  user ,sessionID , isLoggedid} = useSelector((state) => state.auth);

    // Function to track view behavior
    const trackViewBehavior = async () => {
        try {
            const sessionId = sessionID; // Retrieve sessionId from Redux store
            const userId = user?.id || user?.user?.id; // Retrieve userId from Redux store

            if (!sessionId || !userId) {
                console.error("Session ID or User ID is missing!");
                return;
            }

            // Make the API call to track behavior
            await AxiousInstance.authAxios.post("/tracking", {
                isLoggedid,
                sessionId,
                user: userId,
                productId: _id,
                behavior: "view",
            });

            console.log("User behavior tracked successfully!");
        } catch (error) {
            console.error("Error tracking view behavior:", error);
        }
    };

    return (
        <Link
            to={`/product/${_id}`}
            onClick={trackViewBehavior} // Call tracking when the product is clicked
        >
            <Card className="flex-shrink-0 w-72 rounded-md overflow-hidden hover:border-black mb-2 shadow-none">
                {/* Product Image */}
                <div className="relative aspect-square flex items-center justify-center bg-gray-100">
                    <picture>
                        {productImage && productImage.length > 0 ? (
                            productImage.map((src, index) => (
                                <source
                                    key={index}
                                    srcSet={src}
                                    media="(min-width: 600px)"
                                    width="1050"
                                    height="1400"
                                />
                            ))
                        ) : (
                            <source srcSet={imgSrc} />
                        )}
                        <img
                            src={imgSrc}
                            alt={name}
                            className="object-cover h-full w-full"
                            loading="lazy"
                            fetchPriority="auto"
                            width="1050"
                            height="1400"
                        />
                    </picture>
                </div>

                {/* Product Content */}
                <div className="p-1 px-3 text-left flex flex-col space-y-1">
                    <span className="text-base font-medium truncate">{price.toLocaleString()}₫</span>
                    <span className="text-base text-gray-800 font-bold truncate">{name}</span>
                    <span className="text-sm text-gray-500">{category}</span>
                </div>
            </Card>
        </Link>
    );
};

// PropTypes validation to ensure proper props are passed
ProductCard.propTypes = {
    product: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        subcategory: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        brand: PropTypes.string.isRequired,
        sport: PropTypes.string,
        price: PropTypes.number.isRequired,
        image: PropTypes.string.isRequired,
        productImage: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
};

export default ProductCard;
