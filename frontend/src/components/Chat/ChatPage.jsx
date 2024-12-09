import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Conectar ao servidor Socket.IO

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const username = "Usuário"; // Substitua isso pelas informações reais do usuário, se disponíveis

  useEffect(() => {
    // Receber mensagens do servidor
    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      // Enviar mensagem ao servidor
      socket.emit("send_message", { username, message });
      setMessage(""); // Limpar o campo de mensagem
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-indigo-950">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-semibold mb-4">Chat em Tempo Real</h1>
        <div className="h-64 overflow-y-auto border p-2 rounded mb-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div key={index} className="mb-2">
              <strong>{msg.username}:</strong> {msg.message}
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow p-2 border rounded-l"
            placeholder="Digite sua mensagem"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-indigo-500 text-white rounded-r hover:bg-indigo-700"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
