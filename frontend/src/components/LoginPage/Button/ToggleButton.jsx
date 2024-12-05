// src/components/LoginPage/Button/ToggleButton.jsx
import React from 'react';

const ToggleButton = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      {/* Input controlado */}
      <input
        type="checkbox"
        checked={isDarkMode}
        onChange={toggleDarkMode}
        className="sr-only peer"
      />
      {/* Contêiner deslizante */}
      <div
        className="
          relative w-11 h-6 bg-gray-200 peer-focus:outline-none
          rounded-full peer dark:bg-gray-700
          peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
          peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px]
          after:start-[2px] after:bg-white after:border-gray-300 after:border
          after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600
          peer-checked:bg-blue-600
        "
      ></div>
    </label>
  );
};

export default ToggleButton;
