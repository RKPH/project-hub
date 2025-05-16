import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Paginition = ({ handlePageChange, currentPage, totalPages }) => {
    const [inputPage, setInputPage] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const handleInputChange = (e) => {
        setInputPage(e.target.value);
    };

    const handleInputSubmit = (e) => {
        e.preventDefault();
        const pageNumber = Number(inputPage);

        if (pageNumber === currentPage) {
            window.scrollTo(0, 0);
            toast.info(`You are already at this page`);
        } else if (pageNumber > 0 && pageNumber <= totalPages) {
            setInputPage("");

            // Preserve current query params and add new page param
            const params = new URLSearchParams(location.search);
            params.set("page", pageNumber);

            handlePageChange(null, pageNumber);
            navigate(`?${params.toString()}`);
        }
    };

    const preserveQuery = (page) => {
        const params = new URLSearchParams(location.search);
        params.set("page", page);
        return `?${params.toString()}`;
    };

    return (
        <div className="pagination-container flex md:flex-row flex-col items-center justify-center text-white">
            <Pagination
                className="flex items-center justify-center text-white "
                color="primary"
                shape="rounded"
                onChange={handlePageChange}
                page={currentPage}
                count={totalPages}
                renderItem={(item) => (
                    <PaginationItem
                        component={Link}
                        className={`text-white dark:text-white font-sansII ${
                            item.type === "previous" || item.type === "next"
                                ? "pagination-icon-bg"
                                : ""
                        }`}
                        to={preserveQuery(item.page)}
                        {...item}
                    />
                )}
            />
            <form onSubmit={handleInputSubmit} className="py-2">
                <input
                    type="number"
                    value={inputPage}
                    onChange={handleInputChange}
                    className="page-input text-black py-1 px-4 border border-black rounded-md dark:bg-[#18191A] dark:text-white md:text-lg text-xs font-sansII font-semibold w-fit text-center"
                    placeholder="Go to page..."
                    min="1"
                    max={totalPages}
                />
                <button
                    type="submit"
                    className="ml-2 px-4 py-1 bg-red-500 text-white rounded md:text-lg text-xs font-sansII font-semibold cursor-pointer"
                >
                    Go
                </button>
            </form>
        </div>
    );
};

Paginition.propTypes = {
    handlePageChange: PropTypes.func.isRequired,
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
};

export default Paginition;
