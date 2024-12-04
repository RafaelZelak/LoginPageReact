import React from 'react';

const Button = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="
        w-full bg-indigo-950 text-white py-3 rounded-lg
        hover:bg-indigo-800 focus:outline-none
        focus:ring-4 focus:ring-indigo-300
        transition-all duration-300
      "
    >
      {children}
    </button>
  );
};

export default Button;
