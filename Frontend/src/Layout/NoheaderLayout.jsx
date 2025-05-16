// src/Layouts/DefaultLayout.jsx

import React, { lazy, Suspense } from "react";
import "tailwindcss/tailwind.css";
import PropTypes from "prop-types";


const NoheaderLayout = ({ children }) => {
 

  return (
    <div className="w-full min-h-screen">
      {/* Reset ErrorBoundary key when path changes */}

      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </div>
  );
};

NoheaderLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default NoheaderLayout;
