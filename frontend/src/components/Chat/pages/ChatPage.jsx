import React, { useState, useEffect } from "react";
import axios from "axios";
import Contact from "../components/Contact";
import socket from "../utils/socket";
import { getUserFromToken } from "../utils/auth";
import "../styles/ChatPage.css";

const ChatPage = () => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para controlar a visibilidade do menu lateral

  const user = getUserFromToken();

  useEffect(() => {
    if (!user) {
      console.error("[SOCKET.IO] Usuário não autenticado.");
      return;
    }

    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:5000/chat/rooms");
        setRooms(response.data);
      } catch (error) {
        console.error("[FETCH] Erro ao carregar salas:", error);
      }
    };

    fetchRooms();

    const handleMessage = (data) => {
      if (data.room_id === currentRoom?.id) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, [user, currentRoom]);

  const handleSelectRoom = async (room) => {
    setCurrentRoom(room);
    setIsSidebarOpen(false); // Fechar o menu ao selecionar uma sala no celular

    socket.emit("join_room", { room_id: room.id });

    try {
      const response = await axios.get(
        `http://localhost:5000/chat/room/${room.id}/messages`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("[FETCH] Erro ao carregar mensagens da sala:", error);
    }
  };

  const confirlgeleteRoom = (roomId) => {
    setShowDeletePopup(true);
    setRoomToDelete(roomId);
  };

  const handleDeleteRoom = async () => {
    try {
      await axios.delete(`http://localhost:5000/chat/delete_room/${roomToDelete}`);
      setRooms(rooms.filter((room) => room.id !== roomToDelete));
      if (currentRoom?.id === roomToDelete) {
        setCurrentRoom(null);
        setMessages([]);
      }
      setShowDeletePopup(false);
    } catch (error) {
      console.error("[FETCH] Erro ao apagar sala:", error);
      alert("Erro ao apagar sala.");
    }
  };

  const handleSendMessage = () => {
    if (message.trim() !== "" && user && currentRoom) {
      const payload = {
        user_id: user.id,
        username: user.nome,
        message,
        room_id: currentRoom.id,
      };

      socket.emit("send_message", payload);

      setMessage("");
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      const response = await axios.post("http://localhost:5000/chat/create_room", {
        name: newRoomName,
      });
      setRooms([...rooms, response.data]);
      setNewRoomName("");
    } catch (error) {
      console.error("[FETCH] Erro ao criar sala:", error);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row">
      {/* Botão para abrir o menu lateral no celular */}
      <button
    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    className={`fixed top-1 left-1 bg-gray-800 text-white rounded-lg lg:hidden z-20 h-12 w-12 flex items-center justify-center transition-all duration-300 delay-70 ${
      isSidebarOpen ? "left-[16.25rem]" : "left-4"
    }`}
  >
    ☰
  </button>
      {/* Menu lateral */}
      <div
        className={`fixed inset-y-0 left-0 bg-gray-800 text-white w-80 p-6 flex flex-col space-y-8 shadow-lg overflow-y-auto lg:relative lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-10`}
        >
        <h2 className="text-2xl font-semibold text-gray-200">Salas</h2>
        <div className="space-y-6">
          {rooms.map((room) => (
            <Contact
              key={room.id}
              name={room.name}
              bgColor="bg-blue-600"
              onClick={() => handleSelectRoom(room)}
              onDelete={() => confirlgeleteRoom(room.id)}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="flex-grow p-2 rounded-lg text-black bg-gray-100 opacity-50 hover:opacity-100 focus:opacity-90 focus:outline-none focus:ring-0 transition duration-500"
            placeholder="Nova sala"
          />
          <button
            onClick={handleCreateRoom}
            className="px-4 py-2 bg-green-500 rounded-lg text-white hover:bg-green-600 opacity-50 hover:opacity-100 focus:opacity-90 focus:outline-none focus:ring-0 transition duration-500"
          >
            +
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 bg-gradient-to-br from-blue-200 via-blue-100 to-blue-200 pt-5 overflow-hidden">
      {currentRoom ? (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-white p-12 rounded-lg shadow-xl w-full max-w-6xl mx-auto mb-5">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">
                Chat: {currentRoom.name}
            </h1>
            <div className="barraRolagem h-[70vh] overflow-y-auto border border-gray-300 p-4 rounded-lg mb-6 bg-gray-50 shadow-inner">
                {messages.length === 0 ? (
                <p className="text-gray-500">Nenhuma mensagem ainda.</p>
                ) : (
                messages.map((msg) => (
                    <div
                    key={msg.id || Math.random()}
                    className={`mb-4 flex ${
                        msg.username === user.nome ? "justify-end" : "justify-start"
                    }`}
                    >
                    <div
                        className={`message-bubble shadow-lg text-white ${
                        msg.username === user.nome
                            ? "bg-sky-600/90 self-end"
                            : "bg-gray-600 self-start"
                        }`}
                    >
                        <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-200">{msg.username}</span>
                        <span className="text-xs text-gray-300">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            })}
                        </span>
                        </div>
                        <p className="text-base">{msg.message}</p>
                    </div>
                    </div>
                ))
                )}
            </div>
            <div className="flex gap-4 items-center">
                <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    e.preventDefault(); // Evita quebra de linha no campo de texto
                    const button = e.currentTarget.nextElementSibling; // Obtém o botão de envio
                    if (button) {
                        button.classList.add("animate-press");
                        handleSendMessage();
                        setTimeout(() => button.classList.remove("animate-press"), 200);
                    }
                    }
                }}
                className="flex-grow p-4 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
                placeholder="Digite sua mensagem"
                />
                <button
                onClick={(e) => {
                    const button = e.currentTarget;
                    if (button) {
                    button.classList.add("animate-press");
                    handleSendMessage();
                    setTimeout(() => button.classList.remove("animate-press"), 200);
                    }
                }}
                className="p-1.5 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
                >
                <img
                    src="/img/send-icon.svg"
                    alt="Enviar"
                    className="w-11 h-11"
                />
                </button>
            </div>
            </div>
        </div>
        ) : (
        <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-lg">Selecione uma sala</p>
        </div>
        )}
      </div>

      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Apagar sala de chat?
            </h2>
            <p className="text-gray-600 mb-6">
              Esta ação não pode ser desfeita. Deseja continuar?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteRoom}
                className="px-4 py-2 bg-red-300 hover:bg-red-600 rounded-lg text-white"
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

export default ChatPage;
