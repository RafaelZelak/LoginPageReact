import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Contact = ({ name, bgColor, onClick, onDelete, onEdit, onProperties }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleOptionClick = (action) => {
    action();
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="relative flex items-center space-x-4 cursor-pointer hover:bg-gray-700 p-3 rounded-lg transition duration-300"
      onClick={onClick}
    >
      <div className={`w-12 h-12 ${bgColor} rounded-full`}></div>
      <span className="text-lg font-medium">{name}</span>
      <div className="absolute inset-y-0 right-3 flex items-center" ref={menuRef}>
        <button
          onClick={toggleMenu}
          className="p-2 rounded-full hover:bg-gray-600 transition duration-300"
        >
          <svg
            className="w-6 h-6 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v.01M12 12v.01M12 18v.01"
            />
          </svg>
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, transformOrigin: "top right" }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full w-48 bg-white rounded-md shadow-lg z-10"
            >
              <ul className="py-1">
                <li>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionClick(onEdit);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Editar
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionClick(onProperties);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Propriedades
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionClick(onDelete);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                  >
                    Apagar
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Contact;
