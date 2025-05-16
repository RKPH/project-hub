import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyUser } from '../../Redux/AuthSlice.js'; // Import the verifyUser async thunk
import { toast } from 'react-toastify';
import {Link, useNavigate} from 'react-router-dom'; // If you want to navigate after successful verification

export function VerifyPage() {
    const [verificationCode, setVerificationCode] = useState('');
    const { isLoading, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!verificationCode) {
            toast.error('Please enter the verification code');
            return;
        }

        dispatch(verifyUser({ verificationCode }))
            .unwrap()
            .then((result) => {
                toast.success(result.message || 'Verification successful');
                navigate('/'); // Redirect to homepage or login after success
            })
            .catch((err) => {
                toast.error(err || 'Verification failed');
            });
    };

    return (
        <div
            className="h-screen bg-cover bg-center flex items-center flex-col"
            style={{
                backgroundImage: `url('https://media.cntraveler.com/photos/5eb18e42fc043ed5d9779733/16:9/w_4288,h_2412,c_limit/BlackForest-Germany-GettyImages-147180370.jpg')`,
            }}
        >
            <div className="w-full flex flex-col justify-center text-center items-center mb-8">
                <Link to="/">
                    <img
                        src="https://micro-front-end-sport-ecommerce-homepage.vercel.app//logo.png"
                        alt="Logo"
                        className="h-24 mb-4"
                    />
                </Link>
                <span className="text-2xl text-black font-bold">
                    Welcome to sport ecommerce
                </span>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-8 shadow-lg max-w-md w-full">
                <h3 className="text-3xl text-blue-gray-800 mb-2 text-center">
                    Verify Your Account
                </h3>
                <p className="mb-16 text-gray-600 text-center text-lg">
                    Enter your verification code to verify your account
                </p>
                <form onSubmit={handleSubmit} className="mx-auto max-w-md text-left">
                    <div className="mb-6">
                        <label
                            htmlFor="verificationCode"
                            className="block font-medium text-gray-900 mb-2"
                        >
                            Verification Code
                        </label>
                        <input
                            id="verificationCode"
                            type="text"
                            placeholder="Enter the code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition mt-6"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Verifying...' : 'Verify'}
                    </button>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </form>
            </div>
        </div>
    );
}

export default VerifyPage;
