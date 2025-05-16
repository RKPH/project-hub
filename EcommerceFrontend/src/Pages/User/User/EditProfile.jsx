import { useState, useEffect } from "react";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import PropTypes from "prop-types";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import axios from "axios";
import { Edit, Delete } from "@mui/icons-material";
import AxiosInstance from "../../../api/axiosInstance.js";

const EditProfile = ({ userDetail, message, loading, handleChange, handleUpdateDetails }) => {
    const [editingFields, setEditingFields] = useState({ name: false });
    const [hasChanges, setHasChanges] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [phoneError, setPhoneError] = useState("");
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [editModal, setEditModal] = useState(false);
    const [chooseAddress, setChooseAddress] = useState({
        city: "",
        street: "",
        district: "",
        ward: "",
        cityCode: "",
        districtCode: "",
        wardCode: "",
        phoneNumber: "",
    });

    const [newAddress, setNewAddress] = useState({
        city: "",
        street: "",
        district: "",
        ward: "",
        cityCode: "",
        districtCode: "",
        wardCode: "",
        phoneNumber: "",
    });

    const [editedAddress, setEditedAddress] = useState({
        city: "",
        street: "",
        district: "",
        ward: "",
        cityCode: "",
        districtCode: "",
        wardCode: "",
        phoneNumber: "",
    });

    const [initialAddress, setInitialAddress] = useState(null);
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    useEffect(() => {
        if (editModal) {
            setInitialAddress(selectedAddress);
            setEditedAddress({
                city: selectedAddress?.city || "",
                street: selectedAddress?.street || "",
                district: selectedAddress?.district || "",
                ward: selectedAddress?.ward || "",
                cityCode: selectedAddress?.cityCode || "",
                districtCode: selectedAddress?.districtCode || "",
                wardCode: selectedAddress?.wardCode || "",
                phoneNumber: selectedAddress?.phoneNumber || "",
            });
            setPhoneError(""); // Reset phoneError when modal opens
        }
    }, [editModal]); // Removed selectedAddress from dependencies

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch("https://provinces.open-api.vn/api/?depth=1");
                const data = await response.json();
                setCities(data || []);
            } catch (error) {
                console.error("Failed to fetch cities:", error);
            }
        };
        fetchCities();
    }, []);

    useEffect(() => {
        if (chooseAddress.cityCode) {
            axios
                .get(`https://provinces.open-api.vn/api/p/${chooseAddress.cityCode}?depth=2`)
                .then((res) => {
                    setDistricts(res.data.districts || []);
                    setWards([]);
                })
                .catch((err) => console.error("Failed to fetch districts:", err));
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [chooseAddress.cityCode]);

    useEffect(() => {
        if (chooseAddress.districtCode) {
            axios
                .get(`https://provinces.open-api.vn/api/d/${chooseAddress.districtCode}?depth=2`)
                .then((res) => setWards(res.data.wards || []))
                .catch((err) => console.error("Failed to fetch wards:", err));
        } else {
            setWards([]);
        }
    }, [chooseAddress.districtCode]);

    const fetchAddresses = async () => {
        try {
            const response = await AxiosInstance.authAxios.get("/address");
            setAddresses(response.data.addresses || []);
        } catch (error) {
            console.error("Error fetching addresses:", error);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const toggleEdit = (field) => {
        setEditingFields((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAvatar(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await AxiosInstance.normalAxios.post("/images/upload", formData);

            const data = response.data; // Axios automatically parses JSON
            console.log(data);
            if (data.imageUrl) {
                handleChange({ target: { name: "avatar", value: data.imageUrl } });
                setHasChanges(true);
            }
        } catch (error) {
            console.error("Error uploading image:", error.message || error);
        }
    };

    const handleAddAddress = async () => {
        try {
            const response = await AxiosInstance.authAxios.post("/address/add", newAddress);
            setAddresses(response.data.shippingAddress.addresses);
            setOpenModal(false);
            setChooseAddress({});
            setNewAddress({ street: "", city: "", district: "", ward: "", phoneNumber: "", cityCode: "", districtCode: "", wardCode: "" });
        } catch (error) {
            console.error("Error adding address:", error);
        }
    };

    const CheckifHasChange = () => {
        return JSON.stringify(selectedAddress) !== JSON.stringify(initialAddress);
    };

    const handleUpdateAddress = async () => {
        try {
            if (!selectedAddress?.cityCode || !selectedAddress?.districtCode || !selectedAddress?.wardCode) {
                alert("Please select city, district, and ward.");
                return;
            }
            if (!selectedAddress?._id) {
                alert("Address ID is missing.");
                return;
            }

            const updatedAddress = {
                addressId: selectedAddress?._id,
                street: selectedAddress.street || "",
                city: selectedAddress.city || "",
                cityCode: selectedAddress.cityCode || "",
                district: selectedAddress.district || "",
                districtCode: selectedAddress.districtCode || "",
                ward: selectedAddress.ward || "",
                wardCode: selectedAddress.wardCode || "",
                phoneNumber: selectedAddress.phoneNumber || "",
            };

            const response = await AxiosInstance.authAxios.put("/address/update", updatedAddress);

            if (response.status === 200) {
                fetchAddresses();
                setEditModal(false);
            } else {
                console.error("Error updating address:", response.data.message);
                alert("Failed to update address. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while updating the address. Please try again.");
        }
    };

    const deleteAddress = async (addressId) => {
        try {
            await AxiosInstance.authAxios.delete(`/address/delete/${addressId}`);
            setAddresses((prevAddresses) => prevAddresses.filter((address) => address._id !== addressId));
        } catch (error) {
            console.error("Error deleting address:", error);
            alert("Failed to delete address. Please try again.");
        }
    };

    return (
        <div className="min-h-fit bg-gray-50 py-8 px-4">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-lg font-semibold text-gray-800">Edit Profile</h1>
                <p className="text-base text-gray-600">Update your personal information and shipping addresses.</p>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Section: Avatar Upload */}
                <div className="lg:w-1/3 w-full bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Picture</h2>
                    <div className="flex flex-col items-center">
                        <label className="relative w-32 h-32 mb-4 cursor-pointer">
                            <img
                                src={avatar || userDetail.avatar || "default-avatar.png"}
                                alt="Avatar"
                                className="w-full h-full rounded-full border-2 border-gray-300 object-cover transition-transform duration-200 hover:scale-105"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200">
                                <ModeEditIcon className="text-white" />
                            </div>
                        </label>
                        <p className="text-base text-gray-600">Click to upload a new avatar</p>
                    </div>
                </div>

                {/* Right Section: Profile Details */}
                <div className="lg:w-2/3 w-full space-y-6">
                    {/* Message */}
                    {message && (
                        <div
                            className={`p-4 rounded-lg text-base text-white ${
                                message.includes("success") ? "bg-green-500" : "bg-red-500"
                            }`}
                        >
                            {message}
                        </div>
                    )}

                    {/* Personal Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
                            <button
                                onClick={() => toggleEdit("name")}
                                className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg text-base text-gray-800 hover:bg-gray-100 transition duration-200"
                            >
                                {editingFields.name ? "Cancel" : <><ModeEditIcon fontSize="small" /> Edit</>}
                            </button>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-base text-gray-600">Full Name</label>
                            {editingFields.name ? (
                                <input
                                    type="text"
                                    value={userDetail.name}
                                    onChange={(e) => {
                                        handleChange({ target: { name: "name", value: e.target.value } });
                                        setHasChanges(true);
                                    }}
                                    onBlur={() => toggleEdit("name")}
                                    className="w-full p-2 border border-blue-500 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                            ) : (
                                <p className="text-base text-gray-800">{userDetail.name}</p>
                            )}
                        </div>
                    </div>

                    {/* Shipping Addresses */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Shipping Addresses</h2>
                            <button
                                onClick={() => setOpenModal(true)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-base font-semibold hover:bg-blue-700 transition duration-200"
                            >
                                Add New Address
                            </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto space-y-4">
                            {addresses.map((address) => (
                                <div
                                    key={address._id}
                                    className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
                                >
                                    <div className="flex-1">
                                        <p className="text-base text-gray-800 font-medium">
                                            {address.street}, {address.district}, {address.ward}, {address.city}
                                        </p>
                                        <p className="text-base text-gray-600">Phone: {address.phoneNumber}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedAddress(address);
                                                if (address.cityCode) {
                                                    axios
                                                        .get(`https://provinces.open-api.vn/api/p/${address.cityCode}?depth=2`)
                                                        .then((res) => {
                                                            setDistricts(res.data.districts || []);
                                                            if (address.districtCode) {
                                                                axios
                                                                    .get(`https://provinces.open-api.vn/api/d/${address.districtCode}?depth=2`)
                                                                    .then((wardRes) => {
                                                                        setWards(wardRes.data.wards || []);
                                                                        setEditModal(true);
                                                                    })
                                                                    .catch((err) => console.error("Failed to fetch wards:", err));
                                                            } else {
                                                                setEditModal(true);
                                                            }
                                                        })
                                                        .catch((err) => console.error("Failed to fetch districts:", err));
                                                } else {
                                                    setDistricts([]);
                                                    setWards([]);
                                                    setEditModal(true);
                                                }
                                            }}
                                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200"
                                        >
                                            <Edit fontSize="small" />
                                        </button>
                                        <button
                                            onClick={() => deleteAddress(address._id)}
                                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition duration-200"
                                        >
                                            <Delete fontSize="small" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => setHasChanges(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-base text-gray-800 hover:bg-gray-100 transition duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                handleUpdateDetails();
                                setHasChanges(false);
                            }}
                            disabled={!hasChanges || loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-base font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition duration-200"
                        >
                            {loading ? "Updating..." : "Update Profile"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Address Modal */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Address</h2>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Street Address"
                            value={newAddress.street || ""}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Phone Number"
                            value={newAddress.phoneNumber || ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (!/^\d{10}$/.test(value)) {
                                    setPhoneError("Phone number must be exactly 10 digits.");
                                } else {
                                    setPhoneError("");
                                }
                                setNewAddress({ ...newAddress, phoneNumber: value });
                            }}
                            className={`w-full p-3 border rounded-lg text-base focus:outline-none focus:ring-2 ${
                                phoneError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                        />
                        {phoneError && <p className="text-base text-red-500">{phoneError}</p>}
                        <select
                            value={chooseAddress.cityCode || ""}
                            onChange={(e) => {
                                const selectedCityCode = e.target.value;
                                const selectedCity = cities.find((city) => city.code.toString() === selectedCityCode);
                                setChooseAddress({ cityCode: selectedCityCode, districtCode: "", wardCode: "" });
                                setNewAddress({
                                    ...newAddress,
                                    city: selectedCity ? selectedCity.name : "",
                                    cityCode: selectedCityCode,
                                    district: "",
                                    districtCode: "",
                                    ward: "",
                                    wardCode: "",
                                });
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select City</option>
                            {cities.map((city) => (
                                <option key={city.code} value={city.code}>{city.name}</option>
                            ))}
                        </select>
                        <select
                            value={chooseAddress.districtCode || ""}
                            onChange={(e) => {
                                const selectedDistrictCode = e.target.value;
                                const selectedDistrict = districts.find((district) => district.code.toString() === selectedDistrictCode);
                                setChooseAddress({ ...chooseAddress, districtCode: selectedDistrictCode, wardCode: "" });
                                setNewAddress({
                                    ...newAddress,
                                    district: selectedDistrict ? selectedDistrict.name : "",
                                    districtCode: selectedDistrictCode,
                                    ward: "",
                                    wardCode: "",
                                });
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!chooseAddress.cityCode}
                        >
                            <option value="">Select District</option>
                            {districts.map((district) => (
                                <option key={district.code} value={district.code}>{district.name}</option>
                            ))}
                        </select>
                        <select
                            value={chooseAddress.wardCode || ""}
                            onChange={(e) => {
                                const WardCode = e.target.value;
                                const selectedWard = wards.find((ward) => ward.code.toString() === WardCode);
                                setChooseAddress({ ...chooseAddress, wardCode: WardCode });
                                setNewAddress({ ...newAddress, ward: selectedWard ? selectedWard.name : "", wardCode: WardCode });
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!chooseAddress.districtCode}
                        >
                            <option value="">Select Ward</option>
                            {wards.map((ward) => (
                                <option key={ward.code} value={ward.code}>{ward.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => setOpenModal(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-base hover:bg-gray-300 transition duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddAddress}
                            disabled={
                                !newAddress.street ||
                                !newAddress.phoneNumber ||
                                !chooseAddress.cityCode ||
                                !chooseAddress.districtCode ||
                                !chooseAddress.wardCode ||
                                phoneError
                            }
                            className={`px-4 py-2 rounded-lg text-base ${
                                !newAddress.street ||
                                !newAddress.phoneNumber ||
                                !chooseAddress.cityCode ||
                                !chooseAddress.districtCode ||
                                !chooseAddress.wardCode ||
                                phoneError
                                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            } transition duration-200`}
                        >
                            Add
                        </button>
                    </div>
                </Box>
            </Modal>

            {/* Edit Address Modal */}
            <Modal open={editModal} onClose={() => setEditModal(false)}>
                <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Address</h2>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Street Address"
                            value={selectedAddress?.street || ""}
                            onChange={(e) => setSelectedAddress({ ...selectedAddress, street: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Phone Number"
                            value={selectedAddress?.phoneNumber || ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (!/^\d{10}$/.test(value)) {
                                    setPhoneError("Phone number must be exactly 10 digits.");
                                } else {
                                    setPhoneError("");
                                }
                                setSelectedAddress({ ...selectedAddress, phoneNumber: value });
                            }}
                            className={`w-full p-3 border rounded-lg text-base focus:outline-none focus:ring-2 ${
                                phoneError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                        />
                        {phoneError && <p className="text-base text-red-500">{phoneError}</p>}
                        <select
                            value={selectedAddress?.cityCode || ""}
                            onChange={(e) => {
                                const selectedCityCode = e.target.value;
                                const selectedCity = cities.find((city) => city.code.toString() === selectedCityCode);
                                setSelectedAddress({
                                    ...selectedAddress,
                                    cityCode: selectedCityCode,
                                    city: selectedCity ? selectedCity.name : "",
                                    districtCode: "",
                                    wardCode: "",
                                });
                                setEditedAddress({ ...selectedAddress, cityCode: selectedCityCode, districtCode: "", wardCode: "" });
                                setDistricts([]);
                                setWards([]);
                                if (selectedCityCode) {
                                    axios
                                        .get(`https://provinces.open-api.vn/api/p/${selectedCityCode}?depth=2`)
                                        .then((res) => setDistricts(res.data.districts || []))
                                        .catch((err) => console.error("Failed to fetch districts:", err));
                                }
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select City</option>
                            {cities.map((city) => (
                                <option key={city.code} value={city.code}>{city.name}</option>
                            ))}
                        </select>
                        <select
                            value={selectedAddress?.districtCode || ""}
                            onChange={(e) => {
                                const selectedDistrictCode = e.target.value;
                                const selectedDistrict = districts.find((district) => district.code.toString() === selectedDistrictCode);
                                setSelectedAddress({
                                    ...selectedAddress,
                                    districtCode: selectedDistrictCode,
                                    district: selectedDistrict ? selectedDistrict.name : "",
                                    wardCode: "",
                                });
                                setEditedAddress({ ...selectedAddress, districtCode: selectedDistrictCode, wardCode: "" });
                                setWards([]);
                                if (selectedDistrictCode) {
                                    axios
                                        .get(`https://provinces.open-api.vn/api/d/${selectedDistrictCode}?depth=2`)
                                        .then((res) => setWards(res.data.wards || []))
                                        .catch((err) => console.error("Failed to fetch wards:", err));
                                }
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!selectedAddress?.cityCode}
                        >
                            <option value="">Select District</option>
                            {districts.map((district) => (
                                <option key={district.code} value={district.code}>{district.name}</option>
                            ))}
                        </select>
                        <select
                            value={selectedAddress?.wardCode || ""}
                            onChange={(e) => {
                                const selectedWardCode = e.target.value;
                                const selectedWard = wards.find((ward) => ward.code.toString() === selectedWardCode);
                                setSelectedAddress({
                                    ...selectedAddress,
                                    wardCode: selectedWardCode,
                                    ward: selectedWard ? selectedWard.name : "",
                                });
                                setEditedAddress({ ...selectedAddress, wardCode: selectedWardCode });
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!selectedAddress?.districtCode}
                        >
                            <option value="">Select Ward</option>
                            {wards.map((ward) => (
                                <option key={ward.code} value={ward.code}>{ward.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => setEditModal(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-base hover:bg-gray-300 transition duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateAddress}
                            disabled={
                                phoneError ||
                                !selectedAddress?.street ||
                                !selectedAddress?.phoneNumber ||
                                !selectedAddress?.cityCode ||
                                !selectedAddress?.districtCode ||
                                !selectedAddress?.wardCode ||
                                !CheckifHasChange()
                            }
                            className={`px-4 py-2 rounded-lg text-base ${
                                phoneError ||
                                !selectedAddress?.street ||
                                !selectedAddress?.phoneNumber ||
                                !selectedAddress?.cityCode ||
                                !selectedAddress?.districtCode ||
                                !selectedAddress?.wardCode ||
                                !CheckifHasChange()
                                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            } transition duration-200`}
                        >
                            Save
                        </button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

EditProfile.propTypes = {
    userDetail: PropTypes.object.isRequired,
    message: PropTypes.string,
    loading: PropTypes.bool,
    handleChange: PropTypes.func.isRequired,
    handleUpdateDetails: PropTypes.func.isRequired,
};

export default EditProfile;