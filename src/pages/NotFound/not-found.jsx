import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100  flex align-items-center justify-center px-6 ">
      <div
        className={`text-center max-w-md transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* SVG Icon */}
        <div className="mb-8">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            className="mx-auto text-indigo-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Outer circle */}
            <circle cx="60" cy="60" r="50" strokeOpacity="0.2" />

            {/* Proper Question Mark */}
            <path d="M45 45c0-10 8-18 20-18s20 8 20 18c0 10-8 15-15 18-6 3-8 6-8 12v5" />
            <circle cx="60" cy="90" r="4" fill="currentColor" />
          </svg>
        </div>

        {/* 404 Text */}
        <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          404
        </h1>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          This page seems to have skipped the interview.
          <br />
          Let's get you back to practicing!
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="contained"
            onClick={() => navigate("/dashboard")}
            sx={{
              background: "#1976d2",
              "&:hover": {
                background: "#1565c0",
                transform: "translateY(-1px)",
              },
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.5,
            }}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
