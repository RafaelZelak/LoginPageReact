import React, { useState } from 'react';

const Message = ({ msg, user, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(msg.message);

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const handleDelete = () => {
    onDelete(msg.id);
    setShowMenu(false);
    setShowConfirm(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedMessage(msg.message); // Preenche o estado com o texto atual.
    setShowMenu(false); // Fecha o menu ao editar.
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/chat/edit_message/${msg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: editedMessage }),
      });

      if (response.ok) {
        setIsEditing(false);
        msg.message = editedMessage; // Atualiza localmente.
      } else {
        alert('Erro ao salvar edição');
      }
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
      alert('Erro ao salvar edição');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedMessage(msg.message); // Restaura o texto original.
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
          <span className="text-xs text-gray-300 mr-2">
            {new Date(msg.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div>
          {isEditing ? (
            <div className="flex flex-col items-stretch gap-2">
              <textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className="w-full p-2 rounded text-black bg-gray-100 shadow-inner resize-none focus:outline-none"
                style={{
                  minHeight: '40px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Salvar
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-2 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-base">{msg.message}</p>
          )}
        </div>

        {showArrow && msg.username === user.nome && (
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
              <button className="text-gray-500 hover:text-gray-700">Info</button>
              <br />
              <button
                onClick={handleEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                Editar
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tem certeza que deseja apagar a mensagem?</h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
