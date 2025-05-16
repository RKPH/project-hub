import { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance.js"; // Import the Axios instance

export function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Use Axios instance to make the POST request
            await axiosInstance.normalAxios.post("/auth/forgot-password", { email });

            // Axios automatically parses the JSON response, so no need for response.json()
            alert("Email sent! Check your email.");
        } catch (err) {
            // Error message is already processed by the Axios interceptor
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="h-screen flex items-center justify-center bg-cover bg-center px-4 sm:px-6 lg:px-8"
            style={{ backgroundImage: `url('https://media.cntraveler.com/photos/5eb18e42fc043ed5d9779733/16:9/w_4288,h_2412,c_limit/BlackForest-Germany-GettyImages-147180370.jpg')` }}
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
                        Forgot Your Password?
                    </h2>
                    <p className="text-gray-700 mt-1">
                        Enter your email to receive a reset code.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-gray-900 font-medium mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Reset Code"}
                    </button>
                </form>

                <div className="mt-5 text-sm flex flex-col sm:flex-row justify-between">
                    <Link to="/login" className="text-gray-700 hover:underline">
                        Back to Login
                    </Link>
                    <Link to="/register" className="text-gray-700 hover:underline">
                        Don't have an account? Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;