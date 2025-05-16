import { useState, useEffect, useCallback } from "react";
import AxiosInstance from "../../api/axiosInstance.js";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { updateCart } from "../../Redux/CartSlice.js";
import SliceOfProduct from "../../Components/SliceOfProduct.jsx";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from '@mui/icons-material/Category';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import Rating from "@mui/material/Rating";
import { Link } from "react-router-dom";
import { Skeleton } from "@mui/material";

// Helper function to clean HTML tags and decode HTML entities
const cleanHtml = (text) => {
    if (!text || typeof text !== "string") return text;
    let cleaned = text.replace(/<\/?[^>]+(>|$)/g, "");
    const entities = {
        " ": " ",
        "&mbsp;": " ",
        "&": "&",
        "<": "<",
        ">": ">",
        '"': '"',
        "'": "'"
    };
    Object.keys(entities).forEach(entity => {
        cleaned = cleaned.replace(new RegExp(entity, "g"), entities[entity]);
    });
    cleaned = cleaned.replace(/&[^;]+;/g, " ");
    return cleaned.trim();
};

const DetailProduct = () => {
    const { id } = useParams();
    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);
    const [error2, setError2] = useState(null);
    const [error3, setError3] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loading2, setLoading2] = useState(true);
    const [loading3, setLoading3] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [value, setValue] = useState(1);
    const [mainImage, setMainImage] = useState("");
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [uiRecommendedProducts, setUiRecommendedProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const dispatch = useDispatch();

    // Debug auth state
    console.log("Auth State:", { isAuthenticated, user });

    const fetchAnonymousRecommendedProducts = async () => {
        console.log("Fetching anonymous recommendations");
        setLoading2(true);
        try {
            const request = { product_id: id };
            const response = await AxiosInstance.normalAxios.post(`/products/anonymous_recommendations`, request);
            setError2(null);
            setUiRecommendedProducts(response?.data?.data || []);
        } catch (error) {
            setError2(error.response?.data?.message || "An error occurred");
            setUiRecommendedProducts([]);
        } finally {
            setLoading2(false);
        }
    };

    const fetchSessionBaseRecommendedProducts = async () => {
        console.log("Fetching session-based recommendations");
        setLoading2(true);
        try {
            const request = {
                user_id: user.user_id,
                product_id: id,
            };
            const response = await AxiosInstance.normalAxios.post(`/products/recommendations`, request);
            setError2(null);
            setUiRecommendedProducts(response?.data?.data || []);
        } catch (error) {
            setError2(error.response?.data?.message || "An error occurred");
            setUiRecommendedProducts([]);
        } finally {
            setLoading2(false);
        }
    };

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await AxiosInstance.normalAxios.get(`/products/${id}`);
            const fetchedProduct = response?.data?.data;
            setProduct(fetchedProduct);
            setMainImage(fetchedProduct?.MainImage);
            setError(null);
        } catch (error) {
            setError(error.response?.data?.message || "An error occurred");
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendedProducts = async () => {
        console.log("Fetching similarity recommendations");
        setLoading3(true);
        try {
            const response = await AxiosInstance.normalAxios.post(`/products/predict/${id}`);
            setError3(null);
            setRecommendedProducts(response?.data?.data || []);
        } catch (error) {
            setError3(error.response?.data?.message || "An error occurred");
            setRecommendedProducts([]);
        } finally {
            setLoading3(false);
        }
    };

    const fetchReviews = async () => {
        setReviewsLoading(true);
        try {
            const { data } = await AxiosInstance.normalAxios.get(`/reviews/${id}/reviews`);
            if (data.reviews.length > 0) {
                const formattedReviews = data.reviews.map(review => ({
                    id: review._id,
                    name: review.name,
                    user: review?.user || { name: "Anonymous", avatar: "default-avatar.png" },
                    rating: review.rating,
                    comment: review.comment,
                    date: new Date(review.date).toISOString().split("T")[0]
                }));
                setReviews(formattedReviews);
            } else {
                setReviews([]);
            }
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error("Error fetching reviews:", error);
            }
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    const trackBehavior = async (id, product_name, event_type) => {
        try {
            const sessionId = user?.sessionID;
            const userId = user?.user_id;
            if (!sessionId || !userId) {
                console.error("Session ID or User ID is missing!");
                return;
            }
            await AxiosInstance.authAxios.post("/tracking", {
                sessionId,
                user: userId,
                productId: id,
                product_name,
                behavior: event_type,
            });
        } catch (error) {
            console.error("Error tracking view behavior:", error);
        }
    };

    // Fetch product and reviews
    useEffect(() => {
        let isMounted = true;

        const initialize = async () => {
            try {
                // Reset states
                setProduct(null);
                setError(null);
                setMainImage("");
                setLoading(true);
                setReviews([]);
                setReviewsLoading(true);
                setValue(1);
                window.scroll(0, 0);

                // Fetch product and reviews concurrently
                await Promise.all([fetchProduct(), fetchReviews()]);
            } catch (error) {
                if (isMounted) {
                    console.error("Error during initialization:", error);
                    setError(error.message || "An error occurred");
                }
            }
        };

        initialize();

        return () => {
            isMounted = false;
        };
    }, [id]);

    // Fetch recommendations
    // Replace your recommendation fetching useEffect with this:
    useEffect(() => {
        let isMounted = true;
        let controller = new AbortController();

        const fetchRecommendations = async () => {
            try {
                setRecommendedProducts([]);
                setUiRecommendedProducts([]);
                setError2(null);
                setError3(null);
                setLoading2(true);
                setLoading3(true);

                // Only fetch recommendations when we have the final auth state
                if (isAuthenticated === undefined) return;

                // Fetch content-based recommendations (always)
                await fetchRecommendedProducts();

                // Fetch collaborative recommendations based on auth state
                if (isAuthenticated) {
                    console.log("Fetching session-based recommendations");
                    await fetchSessionBaseRecommendedProducts();
                } else {
                    console.log("Fetching anonymous recommendations");
                    await fetchAnonymousRecommendedProducts();
                }
            } catch (error) {
                if (isMounted && error.name !== 'AbortError') {
                    console.error("Error fetching recommendations:", error);
                }
            } finally {
                if (isMounted) {
                    setLoading2(false);
                    setLoading3(false);
                }
            }
        };

        fetchRecommendations();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [id, isAuthenticated, user?.user_id]); // Only re-run when these change

    const HandleAddToCart = useCallback(
        async (product_name) => {
            if (!isAuthenticated) return toast.error("You must be logged in to add items to the cart.");
            try {
                const data = { productId: id, quantity: value };
                const response = await AxiosInstance.authAxios.post(`/cart/add`, data);
                dispatch(updateCart(response.data.Length));
                toast.success("Product added to your cart!");
                trackBehavior(id, product_name, "cart");
            } catch (error) {
                toast.error(error.response?.data?.message || "An error occurred");
            }
        },
        [isAuthenticated, id, value, dispatch]
    );

    const incrementQuantity = () => {
        setValue(prevValue => Math.min(prevValue + 1, product?.stock || 100));
    };

    const decrementQuantity = () => {
        setValue(prevValue => Math.max(prevValue - 1, 1));
    };

    const capitalizeWords = (str) => {
        if (!str) return "N/A";
        return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    };

    const parseDescription = (description) => {
        if (!description || typeof description !== "string") return [];
        const cleanDescription = cleanHtml(description);
        const commaCount = (cleanDescription.match(/,/g) || []).length;
        const hasMultipleCommas = commaCount >= 2;

        if (hasMultipleCommas) {
            const items = cleanDescription.split(",").filter(item => item.trim() !== "");
            const parsedItems = items.map(item => {
                const [key, ...valueParts] = item.split(":");
                if (!key || !valueParts.length) return null;
                return {
                    key: key.trim(),
                    value: valueParts.join(":").trim()
                };
            }).filter(item => item !== null);
            return parsedItems.length > 0 ? parsedItems : [{ key: "", value: cleanDescription.replace(/\n/g, "<br />") }];
        } else {
            const lines = cleanDescription.split("\n").filter(line => line.trim() !== "");
            if (lines.length > 1) {
                const parsedItems = lines.map((line, index) => {
                    const [key, ...valueParts] = line.split(":");
                    if (!key || !valueParts.length) {
                        if (index > 0 && parsedItems[index - 1]) {
                            parsedItems[index - 1].value += `<br />${line.trim()}`;
                            return null;
                        }
                        return { key: "", value: line.trim() };
                    }
                    return {
                        key: key.trim(),
                        value: valueParts.join(":").trim()
                    };
                }).filter(item => item !== null);

                if (parsedItems.every(item => item.key === "")) {
                    return [{ key: "", value: cleanDescription.replace(/\n/g, "<br />") }];
                }
                return parsedItems;
            }
            return [{ key: "", value: cleanDescription }];
        }
    };

    const getAllDetails = () => {
        const baseDetails = [
            { key: "Brand", value: product?.brand },
            { key: "Category", value: product?.category },
            { key: "Type", value: product?.type }
        ];
        const descriptionDetails = parseDescription(product?.description);
        const validDescriptionDetails = descriptionDetails.filter(item => item.key !== "");
        const cleanedDescriptionDetails = validDescriptionDetails.map(item => ({
            key: item.key,
            value: cleanHtml(item.value).replace(/\n/g, " ")
        }));
        return [...baseDetails];
    };

    // Render breadcrumb
    const renderBreadcrumb = () => {
        if (loading) {
            return (
                <div className="mb-6 p-4" aria-busy="true">
                    <Skeleton animation="wave" variant="text" width={200} height={24} />
                </div>
            );
        }
        return (
            <div className="mb-6 p-4">
                <Breadcrumbs
                    aria-label="breadcrumb"
                    separator="›"
                    className="text-sm text-gray-600 dark:text-gray-400"
                >
                    <Link
                        to="/"
                        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    >
                        <HomeIcon fontSize="small" />
                        Home
                    </Link>
                    <Link
                        to={`/products/category/${product?.category}`}
                        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    >
                        <CategoryIcon fontSize="small" />
                        {product?.category || "Category"}
                    </Link>
                    <Link
                        to={`/products/type/${product?.type}`}
                        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    >
                      
                        {product?.type || "Type"}
                    </Link>
                    <span className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-1">
                        <ShoppingBagIcon fontSize="small" />
                        {product?.name || "Product"}
                 
                    </span>
                </Breadcrumbs>
            </div>
        );
    };

    // Render product details
    const renderProductDetails = () => {
        if (loading) {
            return (
                <div className="w-full flex flex-col md:flex-row mb-8 bg-white p-5 rounded-xl shadow-lg" aria-busy="true">
                    <div className="w-full md:w-1/2 flex flex-col">
                        <Skeleton animation="wave" variant="rectangular" width="100%" height={450} />
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col px-5 md:px-12">
                        <Skeleton animation="wave" variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                        <Skeleton animation="wave" variant="text" width={100} height={20} sx={{ mb: 2 }} />
                        <Skeleton animation="wave" variant="text" width={80} height={28} sx={{ mb: 2 }} />
                        <div className="w-full h-[1px] bg-gray-200 my-1"></div>
                        <div className="flex items-center justify-between gap-x-6 my-4 py-3">
                            <Skeleton animation="wave" variant="rectangular" width="33%" height={48} />
                            <Skeleton animation="wave" variant="rectangular" width="50%" height={48} />
                        </div>
                        <div className="w-full flex flex-col gap-y-4 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-x-4">
                                <Skeleton animation="wave" variant="rectangular" width={24} height={24} />
                                <div>
                                    <Skeleton animation="wave" variant="text" width={120} height={20} />
                                    <Skeleton animation="wave" variant="text" width={200} height={16} />
                                </div>
                            </div>
                            <div className="w-full h-[1px] bg-gray-200"></div>
                            <div className="flex items-center gap-x-4">
                                <Skeleton animation="wave" variant="rectangular" width={24} height={24} />
                                <div>
                                    <Skeleton animation="wave" variant="text" width={120} height={20} />
                                    <Skeleton animation="wave" variant="text" width={200} height={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        if (error) return <div className="text-red-600 p-4">Error: {error}</div>;
        if (!product) return <div className="text-gray-500 p-4">Product not found</div>;

        return (
            <div className="w-full flex flex-col md:flex-row mb-8 bg-white p-5 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                <div className="w-full md:w-1/2 flex flex-col">
                    <div className="w-full flex items-stretch">
                        <div className="w-full flex items-center justify-center overflow-hidden rounded-xl">
                            <img
                                src={
                                    mainImage ||
                                    "https://media.istockphoto.com/id/1401333142/vector/closed-vertical-paperback-booklet-catalog-or-magazine-mockup.jpg?s=612x612&w=0&k=20&c=7FFo2ih-wr8Nt_X2c1iXgTCXe8765bDedunURQDLMNk="
                                }
                                alt={product.name}
                                className="h-auto max-h-[450px] w-full object-contain border-2 border-gray-200 shadow-md transition-transform duration-300 ease-in-out transform hover:scale-105"
                            />
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/2 flex flex-col px-5 md:px-12">
                    <div className="w-full flex flex-col h-full">
                        <div className="flex w-full flex-col gap-y-4 mb-4">
                            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight dark:text-gray-100">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-x-3 text-gray-500 dark:text-gray-400">
                                <Rating
                                    name="half-rating-read"
                                    size="small"
                                    defaultValue={product.rating}
                                    precision={0.5}
                                    readOnly
                                />
                                <span>({reviews.length})</span>
                            </div>
                            <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                                ${product.price.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-full h-[1px] bg-gray-200 my-1"></div>
                        <div className="flex items-center justify-between gap-x-6 my-4 py-3">
                            <div className="flex items-center justify-between w-full lg:w-1/3 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={decrementQuantity}
                                    className="w-1/3 h-12 flex justify-center items-center text-2xl font-semibold text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                                >
                                    -
                                </button>
                                <div className="w-1/3 h-12 flex justify-center items-center border-l border-r border-gray-300 text-xl text-gray-800">
                                    {value}
                                </div>
                                <button
                                    onClick={incrementQuantity}
                                    className="w-1/3 h-12 flex justify-center items-center text-2xl font-semibold text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                                >
                                    +
                                </button>
                            </div>
                            <button
                                onClick={() => HandleAddToCart(product.name)}
                                className="w-full lg:w-1/2 h-12 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200"
                            >
                                Add to Cart
                            </button>
                        </div>
                        <div className="w-full flex flex-col gap-y-4 border border-gray-200 rounded-lg p-4 shadow-md">
                            <div className="flex items-center gap-x-4">
                                <LocalShippingOutlinedIcon className="text-gray-700" fontSize="large" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Free Delivery</h3>
                                    <p className="text-sm text-gray-600">
                                        <a href="#" className="text-blue-600 underline">
                                            Enter your postal code for Delivery Availability
                                        </a>
                                    </p>
                                </div>
                            </div>
                            <div className="w-full h-[1px] bg-gray-200"></div>
                            <div className="flex items-center gap-x-4">
                                <ReplayOutlinedIcon className="text-gray-700" fontSize="large" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Return Delivery</h3>
                                    <p className="text-sm text-gray-600">
                                        Free 30 Days Delivery Returns.{" "}
                                        <a href="#" className="text-blue-600 underline">Details</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render description and details
    const renderDescriptionAndDetails = () => {
        if (loading) {
            return (
                <div className="w-full flex flex-col md:flex-row gap-x-3" aria-busy="true">
                    <div className="w-full md:w-2/3 mb-6 bg-white rounded-xl flex flex-col py-4 px-6 shadow-sm">
                        <Skeleton animation="wave" variant="text" width={150} height={28} sx={{ mb: 2 }} />
                        <div className="flex py-2">
                            <Skeleton animation="wave" variant="text" width={100} height={16} sx={{ mr: 2 }} />
                            <Skeleton animation="wave" variant="text" width="60%" height={16} />
                        </div>
                        <div className="flex py-2">
                            <Skeleton animation="wave" variant="text" width={100} height={16} sx={{ mr: 2 }} />
                            <Skeleton animation="wave" variant="text" width="60%" height={16} />
                        </div>
                        <div className="flex py-2">
                            <Skeleton animation="wave" variant="text" width={100} height={16} sx={{ mr: 2 }} />
                            <Skeleton animation="wave" variant="text" width="60%" height={16} />
                        </div>
                    </div>
                    <div className="w-full md:w-1/3 mb-6 bg-gray-50 rounded-xl flex flex-col py-4 px-6 shadow-sm">
                        <Skeleton animation="wave" variant="text" width={100} height={28} sx={{ mb: 2 }} />
                        <div className="flex py-2">
                            <Skeleton animation="wave" variant="text" width={100} height={16} sx={{ mr: 2 }} />
                            <Skeleton animation="wave" variant="text" width="60%" height={16} />
                        </div>
                        <div className="flex py-2">
                            <Skeleton animation="wave" variant="text" width={100} height={16} sx={{ mr: 2 }} />
                            <Skeleton animation="wave" variant="text" width="60%" height={16} />
                        </div>
                        <div className="flex py-2">
                            <Skeleton animation="wave" variant="text" width={100} height={16} sx={{ mr: 2 }} />
                            <Skeleton animation="wave" variant="text" width="60%" height={16} />
                        </div>
                    </div>
                </div>
            );
        }
        if (!product) return null;

        return (
            <div className="w-full flex flex-col md:flex-row gap-x-3">
                <div className="w-full md:w-2/3 mb-6 bg-white rounded-xl flex flex-col py-4 px-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <h1 className="text-xl font-bold text-gray-800 mb-4">Description</h1>
                    {product.description ? (
                        <div className="flex flex-col">
                            {parseDescription(product.description).map((item, index) => (
                                <div
                                    key={index}
                                    className="flex odd:bg-gray-50 even:bg-gray-100 py-2 hover:bg-gray-200 transition-colors duration-150"
                                >
                                    {item.key ? (
                                        <>
                                            <span className="font-medium text-gray-700 w-40">{item.key}</span>
                                            <span
                                                className="font-normal text-gray-600 break-words"
                                                dangerouslySetInnerHTML={{ __html: item.value }}
                                            />
                                        </>
                                    ) : (
                                        <span
                                            className="font-normal text-gray-600 break-words"
                                            dangerouslySetInnerHTML={{ __html: item.value }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No description available.</p>
                    )}
                </div>
                <div className="w-full md:w-1/3 mb-6 bg-gray-50 rounded-xl flex flex-col py-4 px-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Details</h1>
                    <div className="flex flex-col">
                        {getAllDetails().map((detail, index) => (
                            <div
                                key={index}
                                className="flex odd:bg-gray-50 even:bg-gray-100 py-2 hover:bg-gray-200 transition-shadow duration-150"
                            >
                                <span className="font-medium text-gray-700 w-40">{detail.key}</span>
                                <span className="font-normal text-gray-600 break-words">
                                    {capitalizeWords(detail.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Render "You may also like" recommendations
    const renderYouMayAlsoLike = () => {
        return (
            <div className="w-full mb-6 bg-white rounded-xl flex-col py-4 px-6">
                <h1 className="text-xl font-bold text-gray-800 mb-4">You may also like</h1>
                {error2 && <div className="text-red-600 mb-2">{error2}</div>}
                <SliceOfProduct
                    products={uiRecommendedProducts}
                    TrackViewBehavior={trackBehavior}
                    isLoading={loading2}
                />
            </div>
        );
    };

    // Render "Similarity products" recommendations
    const renderSimilarityProducts = () => {
        return (
            <div className="w-full mb-6 bg-white rounded-xl flex-col py-4 px-6">
                <h1 className="text-xl font-bold text-gray-800 mb-4">Similarity products</h1>
                {error3 && <div className="text-red-600 mb-2">{error3}</div>}
                <SliceOfProduct
                    products={recommendedProducts}
                    TrackViewBehavior={trackBehavior}
                    isLoading={loading3}
                />
            </div>
        );
    };

    // Render reviews
    const renderReviews = () => {
        if (reviewsLoading) {
            return (
                <div className="w-full mb-6 bg-white rounded-xl flex-col py-4 px-6" aria-busy="true">
                    <Skeleton animation="wave" variant="text" width={150} height={28} sx={{ mb: 2 }} />
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="border-b pb-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <Skeleton animation="wave" variant="circular" width={40} height={40} />
                                    <div>
                                        <Skeleton animation="wave" variant="text" width={100} height={20} />
                                        <Skeleton animation="wave" variant="text" width={80} height={20} />
                                    </div>
                                </div>
                                <Skeleton animation="wave" variant="text" width={80} height={16} />
                            </div>
                            <Skeleton animation="wave" variant="text" width="80%" height={16} />
                            <Skeleton animation="wave" variant="text" width="60%" height={16} />
                        </div>
                    ))}
                </div>
            );
        }
        return (
            <div className="w-full mb-6 bg-white rounded-xl flex-col py-4 px-6">
                <h1 className="text-xl font-bold text-gray-800 mb-4">Customer Reviews</h1>
                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <div className="text-center text-gray-500">
                            <p>No reviews available.</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div
                                key={review.id}
                                className="border-b pb-4 hover:bg-gray-50 transition-all duration-200 ease-in-out"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={review.user.avatar}
                                            alt={review.name}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                        />
                                        <span className="font-semibold text-gray-800">{review.user.name}</span>
                                        <Rating
                                            name="read-only"
                                            value={review.rating}
                                            readOnly
                                            precision={0.5}
                                            size="small"
                                        />
                                    </div>
                                    <span className="text-sm text-gray-500">{review.date}</span>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col md:px-6 lg:px-[100px] 2xl:px-[200px]">
            {renderBreadcrumb()}
            {renderProductDetails()}
            {renderDescriptionAndDetails()}
            {renderYouMayAlsoLike()}
            {renderSimilarityProducts()}
            {renderReviews()}
        </div>
    );
};

export default DetailProduct;
