import React from 'react';

const Button = ({ children, onClick, darkMode }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full py-3 rounded-lg transition-all duration-300
        ${
          darkMode
            ? 'bg-indigo-700 text-white hover:bg-indigo-600 focus:ring-indigo-300'
            : 'bg-indigo-950 text-white hover:bg-indigo-800 focus:ring-indigo-300'
        }
      `}
    >
      {children}
    </button>
  );
};

export default Button;
