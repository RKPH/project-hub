import React from "react";

const Footer = () => {
    return (
        <footer className="bg-gray-100 text-gray-800 text-sm py-6 md:px-6 lg:px-[100px] 2xl:px-[200px]">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
                <div className="mb-4 md:mb-0">
                    <p className="font-bold">D2F</p>
                    <p>© 2025 D2F. All rights reserved.</p>
                </div>

                <div className="flex space-x-6">
                    <a href="/about" className="hover:underline">About Us</a>
                    <a href="/help" className="hover:underline">Help Center</a>
                    <a href="/privacy" className="hover:underline">Privacy Policy</a>
                    <a href="/terms" className="hover:underline">Terms & Conditions</a>
                </div>

                <div className="flex space-x-4">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                        <img src="https://cdn-icons-png.flaticon.com/512/1384/1384053.png" alt="Facebook" className="h-5 w-5" />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" className="h-5 w-5" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                        <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" className="h-5 w-5" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
