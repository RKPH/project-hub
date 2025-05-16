import React, { useEffect } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import PropTypes from "prop-types";
import Chatbot from "../Components/ChatBot.jsx";

const DefaultLayout = ({ children }) => {


    return (
        <div className="w-full min-h-screen bg-[#efefef] relative">
            <Header />
            <div className="bg-[#efefef] min-h-screen">{children}</div>
            <Chatbot/>
            <Footer />
        </div>
    );
};

DefaultLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default DefaultLayout;
