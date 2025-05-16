import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUserApi, getUserProfile } from "../Redux/AuthSlice.js";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import axios from "axios";
import { io } from "socket.io-client";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import LoginIcon from "@mui/icons-material/Login";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Tippy from "@tippyjs/react/headless";
import { Drawer } from "@mui/material";

const socket = io("https://backend.d2f.io.vn", {
  withCredentials: true,
  autoConnect: false,
  transports: ['polling', 'websocket'], // Ensure polling fallback
  reconnection: false, // Disable auto-reconnect to prevent refresh loops
  // rejectUnauthorized: false // Uncomment for testing with self-signed SSL (not for production)
});

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Memoized Cart Icon
const CartIcon = memo(() => {
  const cartCount = useSelector((state) => state.cart.totalItems, shallowEqual);
  return (
      <Link to="/cart" className="relative text-gray-800 hover:text-black">
        <ShoppingCartIcon />
        {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {cartCount}
        </span>
        )}
      </Link>
  );
});

// Memoized Notification Icon with Dropdown (Updated UI)
const NotificationIcon = memo(({ notifications, setNotifications, unreadCount, setUnreadCount }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleIconClick = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = (index) => {
    setNotifications((prevNotifications) =>
        prevNotifications.map((notif, i) =>
            i === index ? { ...notif, isRead: true } : notif
        )
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  const markAllAsRead = () => {
    setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
      <Tippy
          visible={isOpen}
          onClickOutside={() => setIsOpen(false)}
          interactive
          placement="bottom-end"
          render={(attrs) => (
              <div
                  className="bg-white w-80 sm:w-96 border border-gray-200 rounded-xl shadow-xl max-h-[28rem] overflow-y-auto p-4 animate-[fadeIn_0.3s_ease-out]"
                  tabIndex="-1"
                  {...attrs}
              >
                {/* Header Section */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  {notifications.length > 0 && (
                      <div className="flex gap-2">
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          Mark All as Read
                        </button>
                        <button
                            onClick={clearAllNotifications}
                            className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                  )}
                </div>

                {/* Notification Items */}
                {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                        <div
                            key={index}
                            className={`flex items-start gap-3 p-3 rounded-lg mb-2 last:mb-0 transition-all duration-200 ${
                                notification.isRead
                                    ? "bg-gray-50 hover:bg-gray-100"
                                    : "bg-blue-50 border border-blue-200 hover:bg-blue-100"
                            }`}
                        >
                          <div className="flex-1">
                            <Link
                                to={`/order/${notification.orderId}`}
                                className="block"
                                onClick={() => {
                                  if (!notification.isRead) {
                                    markAsRead(index);
                                  }
                                  setIsOpen(false);
                                }}
                            >
                              <p className="text-sm text-gray-800 leading-tight">
                                Order #{notification.orderId}
                              </p>
                              <p className="text-sm text-gray-600">
                                Your order is <span className="font-semibold text-blue-600">{notification.newStatus}</span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {(() => {
                                  const now = new Date();
                                  const updatedAt = new Date(notification.updatedAt);
                                  const diffInHours = Math.floor((now - updatedAt) / (1000 * 60 * 60));
                                  const diffInDays = Math.floor(diffInHours / 24);

                                  if (diffInDays > 0) {
                                    return `${diffInDays} Days ago`;
                                  } else {
                                    return `${diffInHours} Hours ago`;
                                  }
                                })()}
                              </p>
                            </Link>
                          </div>
                          {!notification.isRead && (
                              <button
                                  onClick={() => markAsRead(index)}
                                  className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors"
                              >
                                Mark as Read
                              </button>
                          )}
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center py-6">
                      <p className="text-sm text-gray-500 italic">No new notifications</p>
                    </div>
                )}
              </div>
          )}
      >
        <div
            className="relative text-gray-800 hover:text-black cursor-pointer"
            onClick={handleIconClick}
        >
          <NotificationsIcon />
          {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {unreadCount}
          </span>
          )}
        </div>
      </Tippy>
  );
});

// Memoized User Menu
const UserMenu = memo(({ user, dispatch, navigate }) => {
  return (
      <Tippy
          render={(attrs) => (
              <div className="bg-white w-[200px] border rounded-md shadow-md py-3 text-sm" tabIndex="-1" {...attrs}>
                <Link to="/me" className="block hover:bg-gray-200 w-full p-2 mb-2">My Profile</Link>
                <Link to="/orders" className="block hover:bg-gray-200 w-full p-2 mb-2">My Orders</Link>
                <button
                    className="block w-full text-left hover:bg-gray-200 p-2"
                    onClick={() => {
                      dispatch(logoutUserApi());
                      navigate("/login");
                    }}
                >
                  Logout
                </button>
              </div>
          )}
          interactive
          placement="bottom-end"
      >
        <div className="flex items-center gap-x-2 cursor-pointer p-3 rounded-md hover:bg-gray-200">
          <img src={user?.avatar} className="w-10 h-10 rounded-full" alt="" />
          <span className="hidden lg:block">{user?.name || "Unknown User"}</span>
        </div>
      </Tippy>
  );
});

// Memoized Search Result Item
const SearchResultItem = memo(({ product, onClick }) => (
    <Link
        to={`/product/${product.product_id}`}
        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
        onClick={onClick}
    >
      <img src={product?.MainImage} alt={product.name} className="w-10 h-10 object-cover rounded" />
      <span>{product.name}</span>
    </Link>
));

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated, shallowEqual);
  const user = useSelector((state) => state.auth.user, shallowEqual);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [inputWidth, setInputWidth] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const abortControllerRef = useRef(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 1500);

  // Fetch search results with cancellation and minimum length check
  const fetchSearchResults = useCallback(async (term) => {
    if (term.trim() === "" || term.length < 4) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setShowDropdown(true);

    try {
      const response = await axios.get(
          `https://backend.d2f.io.vn/api/v1/products/search?query=${encodeURIComponent(term)}`,
          { signal }
      );
      setSearchResults(response.data.data.results);
      setShowDropdown(true);
    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }
      console.error("Error fetching search results:", error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle search term changes
  useEffect(() => {
    fetchSearchResults(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchSearchResults]);

  // Clean up AbortController on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Update input width
  useEffect(() => {
    const updateWidth = () => {
      if (searchInputRef.current) setInputWidth(searchInputRef.current.offsetWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated && !user) {
        await dispatch(getUserProfile());
      }
    };
    fetchUserProfile();
  }, [isAuthenticated, user, dispatch]);

  // Connect to Socket.IO and listen for order status updates
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      socket.connect();

      socket.emit("join", user.id);

      socket.on("orderStatusUpdated", (data) => {
        const {id, orderId, newStatus, updatedAt } = data;
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          {id, orderId, newStatus, updatedAt, isRead: false },
        ]);
        setUnreadCount((prev) => prev + 1);
      });

      socket.on("connect", () => {
        socket.emit("join", user.id);
      });

      socket.on("disconnect", () => {
        console.log("Socket.IO disconnected");
      });

      return () => {
        socket.off("orderStatusUpdated");
        socket.off("connect");
        socket.off("disconnect");
        socket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  // Handle key down (Enter key)
  const handleKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter" && searchTerm.trim()) {
          e.preventDefault();
          navigate(`/products/search?query=${encodeURIComponent(searchTerm.trim())}`);
          setSearchTerm("");
          setSearchResults([]);
          setShowDropdown(false);
        }
      },
      [searchTerm, navigate]
  );

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setSearchResults([]);
    setShowDropdown(false);
  }, []);

  return (
      <header className="w-full h-[132px] bg-black">
        {/* Top Announcement Bar */}
        <div className="w-full h-10 bg-black flex items-center justify-center">
        <span className="md:text-base text-xs text-gray-500">
          {isAuthenticated ? `Welcome, ${user?.name || "User"}` : (
              <>
                Sign up and get 10% off on your first order.{" "}
                <Link to="/login" className="underline text-white">Sign up now</Link>
              </>
          )}
        </span>
        </div>

        {/* Main Header */}
        <div className="w-full h-[92px] bg-white flex items-center justify-between gap-x-2 px-4 md:px-6 lg:px-[100px] 2xl:px-[200px]">
          {/* Burger Menu for Mobile */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(true)}>
              <MenuIcon className="h-7 w-7 text-gray-700" />
            </button>
          </div>

          {/* Sidebar Menu */}
          <Drawer anchor="left" open={menuOpen} onClose={() => setMenuOpen(false)}>
            <div className="w-64 h-full bg-white p-5">
              <div className="flex justify-end">
                <button onClick={() => setMenuOpen(false)}>
                  <CloseIcon className="text-gray-600" />
                </button>
              </div>
              <nav className="flex flex-col mt-4 space-y-4">
                <Link onClick={() => setMenuOpen(false)} to="/about">About us</Link>
                <Link to="/about">Contact us</Link>
              </nav>
            </div>
          </Drawer>

          {/* Logo */}
          <Link to="/">
            <img src="https://micro-front-end-sport-ecommerce-homepage.vercel.app/logo.png" alt="logo" className="h-14 hidden md:block" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-10">
            <Link className="font-semibold text-black flex items-center gap-2" to="/about">About us</Link>
            <Link className="font-semibold text-black flex items-center gap-2" to="/contact">Contact us</Link>
          </div>

          {/* Search Bar */}
          <Tippy
              visible={showDropdown && (isLoading || searchResults.length > 0)}
              interactive
              onClickOutside={() => setShowDropdown(false)}
              placement="bottom-start"
              render={(attrs) => (
                  <div
                      className="bg-white border rounded-md shadow-md max-h-80 overflow-y-auto py-2"
                      tabIndex="-1"
                      ref={dropdownRef}
                      style={{ width: `${inputWidth}px` }}
                      {...attrs}
                  >
                    {isLoading ? (
                        <p className="px-4 py-2 text-gray-500">Loading...</p>
                    ) : searchResults.length > 0 ? (
                        searchResults.map((product) => (
                            <SearchResultItem
                                key={product._id}
                                product={product}
                                onClick={() => {
                                  setSearchTerm("");
                                  setSearchResults([]);
                                  setShowDropdown(false);
                                }}
                            />
                        ))
                    ) : (
                        <p className="px-4 py-2 text-gray-500">No results found</p>
                    )}
                  </div>
              )}
          >
            <div className="relative md:w-1/3 lg:w-1/3 3xl:w-1/2 w-1/2">
              <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for products"
                  className="border w-full bg-[#F0F0F0] h-12 border-gray-300 p-2 pl-12 rounded-xl"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
              />
              <SearchIcon className="absolute left-4 top-3 text-gray-500" />
            </div>
          </Tippy>

          {/* Cart, Notifications & User */}
          <div className="flex items-center md:gap-x-4  ">
            <div className="p-1">
              <CartIcon />
            </div>
            <div className="p-1 border rounded-full">
              <NotificationIcon
                  notifications={notifications}
                  setNotifications={setNotifications}
                  unreadCount={unreadCount}
                  setUnreadCount={setUnreadCount}
              />
            </div>

            {isAuthenticated ? (
                <UserMenu user={user} dispatch={dispatch} navigate={navigate} />
            ) : (
                <Link to="/login" className="flex gap-x-2 items-center hover:bg-gray-200 p-3 rounded-md">
                  <LoginIcon />
                  <span>Login</span>
                </Link>
            )}
          </div>
        </div>
      </header>
  );
};

export default memo(Header);