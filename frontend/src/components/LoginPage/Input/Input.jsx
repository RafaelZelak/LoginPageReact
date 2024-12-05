import React from 'react';

const Input = ({ type, placeholder, value, onChange, darkMode }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        w-full p-3 border rounded-lg focus:outline-none focus:opacity-90 transition duration-300 mb-8
        ${
          darkMode
            ? 'border-gray-600 bg-gray-800 text-white focus:ring-indigo-300'
            : 'border-gray-300 bg-white text-black focus:ring-indigo-950'
        }
      `}
    />
  );
};

export default Input;
