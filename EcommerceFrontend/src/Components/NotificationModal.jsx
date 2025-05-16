import React, { useEffect, useRef } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import DangerousIcon from '@mui/icons-material/Dangerous';
import { motion } from 'framer-motion';

const NotificationModal = ({ message, onClose, title, type }) => {
    const modalRef = useRef(null);

    // Focus the modal when it opens for accessibility
    useEffect(() => {
        modalRef.current?.focus();
    }, []);

    // Determine if this is an error modal
    const isError = type === 'error';

    // Dynamic styles based on type
    const headerStyles = isError
        ? 'bg-red-50 border-b border-red-200 text-red-800' // Error header
        : 'bg-green-50 border-b border-green-200 text-green-800'; // Success header

    const iconStyles = isError
        ? 'text-red-600' // Error icon
        : 'text-green-600'; // Success icon

    const buttonStyles = isError
        ? 'border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500' // Error button
        : 'border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500'; // Success button

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                ref={modalRef}
                tabIndex={-1}
                className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md mx-4 overflow-hidden"
            >
                {/* Header */}
                <div className={`flex items-center gap-3 p-5 ${headerStyles}`}>
                    {isError ? (
                        <DangerousIcon className={`w-7 h-7 ${iconStyles}`} />
                    ) : (
                        <CheckIcon className={`w-7 h-7 ${iconStyles}`} />
                    )}
                    <h2 className="text-xl font-bold">{title}</h2>
                </div>

                {/* Body */}
                <div className="p-5 text-gray-600">
                    <p className="text-base leading-relaxed">{message}</p>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 bg-gray-50 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        aria-label="Close notification modal"
                        className={`px-5 py-2 border rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonStyles}`}
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default NotificationModal;