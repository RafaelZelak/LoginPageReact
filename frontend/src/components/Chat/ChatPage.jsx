import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const socket = io("http://localhost:5000");

const Contact = ({ name, bgColor, onClick }) => (
  <div
    className="flex items-center space-x-4 cursor-pointer hover:bg-gray-700 p-3 rounded-lg transition duration-300"
    onClick={onClick}
  >
    <div className={`w-12 h-12 ${bgColor} rounded-full`}></div>
    <span className="text-lg font-medium">{name}</span>
  </div>
);

const ChatPage = () => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newRoomName, setNewRoomName] = useState("");

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

  const handleSendMessage = () => {
    if (message.trim() !== "" && user && currentRoom) {
      const payload = {
        user_id: user.id,
        username: user.nome,
        message,
        room_id: currentRoom.id,
        created_at: new Date().toISOString(), // Inclui timestamp localmente
      };

      // Emite mensagem via WebSocket
      socket.emit("send_message", payload);

      // Atualiza o estado local imediatamente
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
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">
            {currentRoom ? `Chat: ${currentRoom.name}` : "Selecione uma sala"}
          </h1>

          <div className="h-[700px] overflow-y-auto border border-gray-300 p-4 rounded-lg mb-6 bg-gray-50 shadow-inner">
            {messages.length === 0 ? (
              <p className="text-gray-500">Nenhuma mensagem ainda.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id || Math.random()} // Evitar problemas com mensagens sem ID
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

          {currentRoom && (
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-grow p-4 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
                placeholder="Digite sua mensagem"
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Enviar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
