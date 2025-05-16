import React from "react";
import { Link } from "react-router-dom";
import { Breadcrumbs, IconButton, Tooltip } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const AboutUs = () => {
  const copyPageInfo = () => {
    navigator.clipboard.write("About TekNix Technology Corporation");
    alert("Page info copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Container */}
      <div className="w-full h-full flex flex-col md:px-6 lg:px-[100px] 2xl:px-[200px]">
        {/* Breadcrumbs */}
        <div className="w-full mb-8 py-6">
          <Breadcrumbs
            aria-label="breadcrumb"
            separator="›"
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            <Link
              to="/"
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            >
              <HomeIcon fontSize="small" />
              Home
            </Link>
            <span className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-1">
              <InfoIcon fontSize="small" />
              About
            
            </span>
          </Breadcrumbs>
        </div>

        {/* Our Story Section */}
        <section className="mb-16 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Our Story
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Established in 2018, TekNix Technology Corporation is a global leader in AI and cloud computing, based in Silicon Valley. Our mission is to accelerate human progress through innovative technology, delivering transformative solutions to over 5,000 businesses across 25 countries.
              <br /><br />
              From advanced AI algorithms to robust IoT ecosystems, TekNix pioneers scalable platforms that redefine industries. With a commitment to sustainability and digital transformation, we empower organizations to thrive in the modern era, driving efficiency and innovation at every step.
            </p>
          </div>
          <div className="lg:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1535223289827-42f1e9919769?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
              alt="TekNix Innovation"
              className="w-full h-80 object-cover rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </section>

        {/* Vision & Impact Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Our Vision & Impact
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Pioneering Innovation</h3>
              <p className="text-gray-600 dark:text-gray-400">
                TekNix develops state-of-the-art AI models and cloud infrastructure, enabling businesses to harness data-driven insights. Our platforms power everything from predictive analytics to smart manufacturing, revolutionizing operational efficiency.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Global Reach</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Operating in 25 countries, TekNix serves diverse industries, including healthcare, finance, and logistics. Our solutions have impacted over 10 million users, fostering sustainable growth and digital empowerment worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🌍", value: "25+", label: "Countries Served" },
              { icon: "📊", value: "10M+", label: "Users Impacted" },
              { icon: "🔧", value: "100+", label: "AI Solutions Deployed" },
              { icon: "💸", value: "$150M+", label: "Annual Revenue" },
            ].map((stat, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl">
                  {stat.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose TekNix?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: "Cutting-Edge AI",
                desc: "Leverage our advanced AI to optimize processes and drive innovation.",
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                ),
                title: "24/7 Support",
                desc: "Our dedicated team ensures seamless integration and ongoing support.",
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                ),
                title: "Scalable Infrastructure",
                desc: "Our cloud solutions grow with your business, ensuring flexibility.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;