import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import AxiosInstance from "../../api/axiosInstance.js";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import DeleteIcon from "@mui/icons-material/Delete";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import SliceOfProduct from "../../Components/SliceOfProduct.jsx";
import { getUserProfile } from "../../Redux/AuthSlice.js";
import axios from "axios";

const Cart = () => {
  const { sessionID } = useSelector((state) => state.auth);
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // State for selected items
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user); // Redux state for the logged-in user
  const [error2, setError2] = useState(null);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [cartRecommendedProducts, setCartRecommendedProducts] = useState([]);
  const [loading2, setLoading2] = useState(false);
  const dispatch = useDispatch();

  const trackBehavior = async (id, product_name, event_type) => {
    try {
      const sessionId = user.sessionID;
      const userId = user?.id || user?.user?.id;

      if (!sessionId || !userId) {
        console.error("Session ID or User ID is missing!");
        return;
      }

      await AxiosInstance.authAxios.post("/tracking", {
        sessionId,
        user: userId,
        productId: id,
        product_name: product_name,
        behavior: event_type,
      });
    } catch (error) {
      return error;
    }
  };

  const fetchCart = async () => {
    try {
      const response = await AxiosInstance.authAxios.get("/cart/get");
      const items = response.data.data || [];
      setCartItems(items);
    } catch (error) {
      return error;
    }
  };

  const UpdateCart = async (cartItemID, quantity) => {
    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    try {
      await AxiosInstance.authAxios.put(`/cart/update`, {
        cartItemID,
        quantity,
      });
      fetchCart();
    } catch (error) {
      toast.error(error.response.data.message);
      return error;
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(itemId)) {
        return prevSelectedItems.filter((id) => id !== itemId); // Deselect if already selected
      }
      return [...prevSelectedItems, itemId]; // Add to selected items
    });
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    }
    fetchTrendingProducts();
  }, [user]);

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchCartBasedRecommendations();
    } else {
      setCartRecommendedProducts([]); // Clear recommendations if cart is empty
    }
  }, [cartItems.length]); // Trigger when cart items change

  const fetchTrendingProducts = async () => {
    try {
      const response = await axios.get(
        "https://backend.d2f.io.vn/api/v1/products/trending"
      );
      setTrendingProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching trending products:", error.message || error);
    }
  };

  const fetchCartBasedRecommendations = async () => {
    
    setLoading2(true); // Start loading before the request

    try {
      // Extract product IDs from cart items
      const cartProductIds = cartItems.map(item => item.productID);

      if (!cartProductIds.length) {
        setCartRecommendedProducts([]);
        setLoading2(false);
        return;
      }

      const request = {
        cart_items: cartProductIds, // Array of product IDs in the cart
        k: 10 // Number of recommendations to fetch (default to 5)
      };

      // Make the request to the cart-recommendations endpoint
      const response = await AxiosInstance.normalAxios.post(
        `/products/cart-recommendations`,
        request
      );

      setError2(null); // Clear any previous errors

      // Extract the recommended products from the response
      const recommendedProducts = response?.data?.data?.recommendations|| [];
      console.log(recommendedProducts)
    
 
      setCartRecommendedProducts(recommendedProducts); // Set recommended products
      setLoading2(false); // Stop loading
    } catch (error) {
      setError2(error.response?.data?.message || "An error occurred while fetching recommendations");
      setLoading2(false); // Stop loading on error
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, cartItem) => {
      if (cartItem.product && selectedItems.includes(cartItem._id)) {
        return total + cartItem.product.price * cartItem.quantity;
      }
      return total;
    }, 0);
  };

  const handleDeleteItem = async (cartItemID) => {
    console.log("Deleting item:", cartItemID);
    try {
      await AxiosInstance.authAxios.delete(`/cart/delete`, {
        data: { cartItemID }, // Pass the cart item ID in the request body
      });
      dispatch(getUserProfile());
      // Update the cartItems state locally
      setCartItems((prevCartItems) =>
        prevCartItems.filter((item) => item._id !== cartItemID)
      );
    } catch (error) {
      toast.error("Failed to remove the item");
      return error;
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedItems.length) {
      alert("Please select items to proceed with checkout!");
      return;
    }

    try {
      const shippingAddress = `${user?.address?.street || user?.user?.address?.street}, ${user?.address?.city || user?.user?.address?.city}`;
      const PaymentMethod = "COD";

      const products = cartItems
        .filter((item) => selectedItems.includes(item._id)) // Only selected items
        .map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        }));

      const orderData = {
        user: user._id || user?.user?._id,
        shippingAddress,
        PaymentMethod,
        products,
      };

      await AxiosInstance.authAxios.post("/orders/addOrder", orderData);

      selectedItems.forEach((itemId) => {
        const item = cartItems.find((item) => item._id === itemId);
        const productId = item.productID;
        const productName = item.product.name;
        trackBehavior(productId, productName, "purchase");
      });
      navigate("/checkout", { state: { refetch: true, orders: cartItems } });
    } catch (error) {
      return error;
    }
  };

  const trackViewBehavior = async (id, product_name, event_type) => {
    try {
      const sessionId = sessionID;
      const userId = user?.id || user?.user?.id;

      if (!sessionId || !userId) {
        return;
      }

      await AxiosInstance.authAxios.post("/tracking", {
        sessionId,
        user: userId,
        productId: id,
        product_name: product_name,
        behavior: event_type,
      });
    } catch (error) {
      return error;
    }
  };

  return (
    <div className="min-h-screen flex items-center py-6 w-full flex-col 3xl:px-[200px] md:px-6 lg:px-[100px] 2xl:px-[200px]">
      <div className="w-full mb-6">
        <Breadcrumbs aria-label="breadcrumb" separator="›" className="text-sm text-gray-600">
          <Link to="/" className="flex items-center gap-1 text-gray-600 hover:text-red-500">
            <HomeIcon fontSize="small" />
            Home
          </Link>
          <span className="text-gray-900 font-medium flex items-center gap-1">
            <ShoppingCartIcon fontSize="small" />
            Cart
          </span>
        </Breadcrumbs>
      </div>
      {cartItems.length > 0 ? (
        <div className="flex flex-col w-full">
          {/* Table for larger screens */}
          <div className="hidden md:block w-full min-h-fit max-h-[500px] overflow-y-auto">
            <table className="w-full text-left border-separate border-spacing-y-4 border-spacing-x-0">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4">Select</th>
                  <th className="py-2 px-4">Product</th>
                  <th className="py-2 px-4">Price</th>
                  <th className="py-2 px-4">Quantity</th>
                  <th className="py-2 px-4">Subtotal</th>
                  <th className="py-2 px-4">
                    <DeleteIcon />
                  </th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id} className="bg-white">
                    <td className="py-2 px-4">
                      <input
                        id="cb3"
                        type="checkbox"
                        className="text-red-500 focus:ring-red-500"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => handleSelectItem(item._id)}
                      />
                    </td>
                    <td className="flex items-center space-x-4">
                      <Link
                        className="py-2 px-2 flex items-center space-x-4"
                        to={`/product/${item.product.product_id}`}
                        onClick={() =>
                          trackBehavior(item.product.product_id, item.product.name, "view")
                        }
                      >
                        <img
                          src={item.product.MainImage}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded text-[0px]"
                        />
                        <div className="flex flex-col">
                          <span className="text-lg font-semibold">{item.product.name}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="py-2 px-4">${item.product.price}</td>
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            UpdateCart(item._id, Math.max(item.quantity - 1, 1))
                          }
                          className="w-7 h-7 bg-gray-100 text-gray-800 hover:bg-gray-300 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-7 h-7 border flex items-center justify-center text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => UpdateCart(item._id, item.quantity + 1)}
                          className="w-7 h-7 bg-gray-100 text-gray-800 hover:bg-gray-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      ${(item.product.price.toFixed(2) * item.quantity).toFixed(2)}
                    </td>
                    <td className="py-2 px-4">
                      <button
                        className="text-red-500"
                        onClick={() => handleDeleteItem(item._id)}
                      >
                        <DeleteIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card layout for mobile */}
          <div className="md:hidden w-full">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-4 mb-4 shadow-lg rounded-lg border border-gray-200 relative">
                <div className="flex justify-between items-start">
                  {/* Column 1: Image and Checkbox */}
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item._id)}
                      onChange={() => handleSelectItem(item._id)}
                      className="mr-2 focus:ring-red-500 text-red-500"
                    />
                    <img
                      src={item.product.MainImage}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>

                  {/* Column 2: Name, Delete Icon, Price, and Quantity */}
                  <div className="flex flex-col flex-grow ml-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold">{item.product.name}</span>
                      <button
                        className="text-red-500"
                        onClick={() => handleDeleteItem(item._id)}
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-base font-semibold">
                        Price: ${(item.product.price.toFixed(2) * item.quantity).toFixed(2)}
                      </span>
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            UpdateCart(item._id, Math.max(item.quantity - 1, 1))
                          }
                          className="w-7 h-7 bg-gray-100 text-gray-800 hover:bg-gray-300 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-7 h-7 border flex items-center justify-center text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => UpdateCart(item._id, item.quantity + 1)}
                          className="w-7 h-7 bg-gray-100 text-gray-800 hover:bg-gray-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full p-4 bg-white shadow-md rounded-lg mt-4">
            <h2 className="text-base md:text-lg font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-semibold">{selectedItems.length}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Total Price:</span>
              <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="w-full flex items-center justify-between mt-4">
              {/* Choose All Checkbox */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                  className="text-red-500 focus:ring-red-500"
                  onChange={() => {
                    if (selectedItems.length === cartItems.length) {
                      // Unselect all
                      setSelectedItems([]);
                    } else {
                      // Select all
                      setSelectedItems(cartItems.map((item) => item._id));
                    }
                  }}
                />
                <span className="text-sm text-gray-600">Choose All</span>
              </label>

              {/* Checkout Button */}
              <button
                onClick={handleCreateOrder}
                className="py-2 px-6 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>

          {/* Cart-Based Recommended Products */}
          <div className="w-full mt-10">
            <div className="w-full mb-5 flex gap-y-5 bg-white rounded-xl flex-col py-4 px-4">
              <h1 className="text-xl text-black font-normal w-full text-start">You may also like</h1>
              <SliceOfProduct
                products={cartRecommendedProducts}
                TrackViewBehavior={trackViewBehavior}
                isLoading={loading2}
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex bg-white w-full min-h-[100px] flex-col items-center justify-center gap-y-2 p-4">
            <img
              src="https://salt.tikicdn.com/ts/upload/43/fd/59/6c0f335100e0d9fab8e8736d6d2fbcad.png"
              alt="empty cart"
              className="w-1/12"
            />
            <h1 className="text-xl font-semibold">Your cart is empty</h1>
            <span>View our recommended products below</span>
          </div>
          <div className="w-full mt-10">
            <div className="w-full mb-5 flex gap-y-5 bg-white rounded-xl flex-col py-4 px-4">
              <h1 className="text-xl text-black font-semibold w-full text-start">Best Selling Products</h1>
              <SliceOfProduct products={trendingProducts} TrackViewBehavior={trackViewBehavior} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;