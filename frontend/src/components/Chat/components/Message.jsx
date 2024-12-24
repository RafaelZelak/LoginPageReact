import React, { useState } from 'react';

const Message = ({ msg, user, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showArrow, setShowArrow] = useState(false);

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const handleDelete = () => {
    onDelete(msg.id);
    setShowMenu(false);
  };

  const handleMouseEnter = () => setShowArrow(true);
  const handleMouseLeave = () => {
    setShowArrow(false);
    setShowMenu(false);
  };

  return (
    <div
      className={`mb-4 flex ${msg.username === user.nome ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`relative message-bubble shadow-lg text-white ${
          msg.username === user.nome ? 'bg-sky-600/90 self-end' : 'bg-gray-600 self-start'
        }`}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-200">{msg.username}</span>
          <span className="text-xs text-gray-300">
            {new Date(msg.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <p className="text-base">{msg.message}</p>
        {showArrow && (
          <div className="absolute top-0 right-0 mt-2">
            <button
              onClick={toggleMenu}
              className="focus:outline-none p-1"
              aria-label="Opções"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`absolute top-8 right-0 bg-white shadow-lg rounded-lg p-2 z-10 transition-transform duration-300 ease-in-out transform ${
                showMenu ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
              }`}
            >
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
