import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import {jwtDecode} from "jwt-decode";
import axios from "axios";

const socket = io("http://localhost:5000");

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token)?.user : null;

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      console.error("Usuário não autenticado.");
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:5000/chat/load_messages");
        if (isMounted) setMessages(response.data);
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
      }
    };

    fetchMessages();

    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => {
        if (prevMessages.some((msg) => msg.id === data.id)) return prevMessages;
        return [...prevMessages, data];
      });
    });

    return () => {
      isMounted = false;
      socket.off("receive_message");
    };
  }, [user]);

  const handleSendMessage = () => {
    if (message.trim() !== "" && user) {
      const payload = { user_id: user.id, username: user.nome, message };
      socket.emit("send_message", payload);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-indigo-950">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-semibold mb-4">Chat em Tempo Real</h1>
        <div className="h-64 overflow-y-auto border p-2 rounded mb-4 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-500">Nenhuma mensagem ainda.</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="mb-2">
                <strong>{msg.username}:</strong> {msg.message}
                <div className="text-sm text-gray-500">{new Date(msg.created_at).toLocaleString()}</div>
              </div>
            ))
          )}
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