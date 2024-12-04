import React from 'react';

const Input = ({ type, placeholder, value, onChange }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="
        w-full p-3 border border-gray-300 rounded-lg
        focus:ring-2 focus:ring-indigo-950 focus:outline-none focus:opacity-90
        hover:opacity-70
        transition duration-300 opacity-50 mb-8
      "
    />
  );
};

export default Input;
