import React from "react";

const Card = ({ 
  children, 
  className = "", 
  onClick, 
  hover = true,
  padding = "md" 
}) => {
  const paddings = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 ${
        hover ? "hover:bg-gray-800 hover:border-gray-600 transition-all duration-200 cursor-pointer" : ""
      } ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
