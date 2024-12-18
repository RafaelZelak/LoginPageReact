import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import './ChatPage.css'

const socket = io("http://localhost:5000");

const Contact = ({ name, bgColor, onClick, onDelete }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center space-x-4 cursor-pointer hover:bg-gray-700 p-3 rounded-lg transition duration-300 relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div className={`w-12 h-12 ${bgColor} rounded-full`}></div>
      <span className="text-lg font-medium">{name}</span>
      {hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-3 opacity-20 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-sm shadow-md hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition-opacity duration-300"
          >
          Apagar
        </button>
      )}
    </div>
  );
};

const ChatPage = () => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token)?.user : null;

  useEffect(() => {
    if (!user) {
      console.error("Usuário não autenticado.");
      return;
    }

    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:5000/chat/rooms");
        setRooms(response.data);
      } catch (error) {
        console.error("Erro ao carregar salas:", error);
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
    try {
      const response = await axios.get(
        `http://localhost:5000/chat/room/${room.id}/messages`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Erro ao carregar mensagens da sala:", error);
    }
  };

  const confirmDeleteRoom = (roomId) => {
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
      console.error("Erro ao apagar sala:", error);
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
        created_at: new Date().toISOString(),
      };

      socket.emit("send_message", payload);
      setMessages((prevMessages) => [...prevMessages, payload]);
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
      console.error("Erro ao criar sala:", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-600 via-sky-400 to-sky-300 flex overflow-hidden">
      <div className="w-80 bg-gray-800 text-white p-6 flex flex-col space-y-8 shadow-lg overflow-y-auto max-h-screen">
        <h2 className="text-2xl font-semibold text-gray-200">Salas</h2>
        <div className="space-y-6">
          {rooms.map((room) => (
            <Contact
              key={room.id}
              name={room.name}
              bgColor="bg-blue-600"
              onClick={() => handleSelectRoom(room)}
              onDelete={() => confirmDeleteRoom(room.id)}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="flex-grow p-2 rounded-md text-gray-800"
            placeholder="Nova sala"
          />
          <button
            onClick={handleCreateRoom}
            className="px-4 py-2 bg-green-500 rounded-lg text-white hover:bg-green-600"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex-1 bg-gradient-to-br from-blue-200 via-blue-100 to-blue-200 p-6 overflow-hidden">
        {currentRoom ? (
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">
              Chat: {currentRoom.name}
            </h1>
            <div className="h-[700px] overflow-y-auto border border-gray-300 p-4 rounded-lg mb-6 bg-gray-50 shadow-inner">
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
                      className={`max-w-lg p-4 rounded-lg text-white ${
                        msg.username === user.nome
                          ? "bg-sky-600/90"
                          : "bg-gray-600"
                      }`}
                    >
                      <strong>{msg.username}:</strong>
                      <p>{msg.message}</p>
                      <div className="text-sm text-gray-300">
                        {new Date(msg.created_at).toLocaleString()}
                      </div>
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
                className="flex-grow p-4 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
                placeholder="Digite sua mensagem"
              />
                <button
                  onClick={(e) => {
                    const button = e.currentTarget;
                    if (button) {
                      button.classList.add('animate-press');
                      handleSendMessage();
                      setTimeout(() => button.classList.remove('animate-press'), 200);
                    }
                  }}
                  className="p-1.5 bg-blue-600 rounded-full shadow-md hover:bg-blue-700 transition duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
                >
                  <img
                    src="/img/send-icon.svg"
                    alt="Enviar"
                    className="w-11 h-11"
                  />
                </button>
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
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteRoom}
                className="px-4 py-2 bg-red-300 hover:bg-red-600 rounded-md text-white"
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
