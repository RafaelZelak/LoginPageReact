import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const Contact = ({ name, bgColor, onClick, onDelete, onEdit, onProperties, room }) => {

  const [menuOpen, setMenuOpen] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleOptionClick = (action) => {
    action();
    setMenuOpen(false);
  };

  const handleImageUpload = async (file) => {
    if (!room || !room.id) {
      alert("Erro: Sala não encontrada ou inválida.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.post(`http://localhost:5000/chat/upload_image/${room.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Imagem enviada com sucesso!");
      setShowImageModal(false);
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      alert("Erro ao enviar imagem.");
    }
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
    <>
      <div
        className="relative flex items-center space-x-4 cursor-pointer hover:bg-gray-700 p-3 rounded-lg transition duration-300"
        onClick={onClick}
      >
<div
  className={`w-12 h-12 rounded-full ${!room?.image ? bgColor : ""}`}
  style={{
    backgroundImage: room?.image
      ? `url(data:image/${room.image_type || "jpeg"};base64,${room.image})`
      : "",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
></div>
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
                        handleOptionClick(() => setShowImageModal(true));
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

      {/* Modal para Upload de Imagem */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Enviar Imagem</h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files[0])}
              className="mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowImageModal(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Contact;
