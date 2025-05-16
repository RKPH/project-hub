import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance.js"; // Import the Axios instance
import NotificationModal from "../../Components/NotificationModal.jsx"; // Import the NotificationModal component

export function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordShown, setPasswordShown] = useState(false);
    const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [modalType, setModalType] = useState("success"); // Can be "success" or "error"
    const navigate = useNavigate();
    const { token } = useParams(); // Extract token from URL path

    const togglePasswordVisibility = () => setPasswordShown((prev) => !prev);
    const toggleConfirmPasswordVisibility = () => setConfirmPasswordShown((prev) => !prev);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate that passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            // Use Axios instance to make the POST request
            const response = await axiosInstance.normalAxios.post("/auth/reset-password", {
                token,
                password,
            });

            // Show success modal instead of alert
            setModalTitle("Success");
            setModalMessage("Password reset successful! Please log in.");
            setModalType("success");
            setShowModal(true);
        } catch (err) {
            // Show error modal instead of setting error state
            setModalTitle("Error");
            setModalMessage(err.message || "Password reset failed. Please try again.");
            setModalType("error");
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    // Handle modal close
    const handleModalClose = () => {
        setShowModal(false);
        if (modalType === "success") {
            navigate("/login"); // Navigate to login only on success
        }
    };

    return (
        <div
            className="h-screen flex items-center justify-center bg-cover bg-center px-4 sm:px-6 lg:px-8"
            style={{
                backgroundImage: `url('https://media.cntraveler.com/photos/5eb18e42fc043ed5d9779733/16:9/w_4288,h_2412,c_limit/BlackForest-Germany-GettyImages-147180370.jpg')`,
            }}
        >
            <div className="w-full max-w-md bg-white bg-opacity-30 backdrop-blur-md rounded-lg p-6 sm:p-8 shadow-xl">
                <div className="flex flex-col items-center text-center mb-6">
                    <Link to="/">
                        <img
                            src="https://micro-front-end-sport-ecommerce-homepage.vercel.app/logo.png"
                            alt="Logo"
                            className="h-20 sm:h-24 mb-3"
                        />
                    </Link>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Reset Your Password
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* New Password */}
                    <div className="relative">
                        <label htmlFor="password" className="block text-gray-900 font-medium mb-1">
                            New Password
                        </label>
                        <input
                            id="password"
                            type={passwordShown ? "text" : "password"}
                            className="w-full px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                        >
                            {passwordShown ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="h-5 w-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="h-5 w-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <label htmlFor="confirmPassword" className="block text-gray-900 font-medium mb-1">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type={confirmPasswordShown ? "text" : "password"}
                            className="w-full px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="********"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                        >
                            {confirmPasswordShown ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="h-5 w-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="h-5 w-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <div className="mt-5 text-sm flex flex-col sm:flex-row justify-between">
                    <Link to="/login" className="text-gray-700 hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>

            {/* Notification Modal */}
            {showModal && (
                <NotificationModal
                    title={modalTitle}
                    message={modalMessage}
                    type={modalType}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
}

export default ResetPassword;