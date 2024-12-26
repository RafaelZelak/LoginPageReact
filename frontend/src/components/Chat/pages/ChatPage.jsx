import React, { useState, useEffect } from "react"; // Importação do React e hooks necessários
import axios from "axios"; // Importação do Axios para chamadas HTTP
import Contact from "../components/Contact"; // Importação do componente Contact
import Message from "../components/Message"; // Importação do componente Message
import socket from "../utils/socket"; // Importação da instância do socket
import { getUserFromToken } from "../utils/auth"; // Função para obter dados do usuário a partir do token
import "../styles/ChatPage.css"; // Importação do arquivo de estilos

const ChatPage = () => { // Declaração do componente funcional ChatPage
  const [rooms, setRooms] = useState([]); // Estado para armazenar as salas
  const [currentRoom, setCurrentRoom] = useState(null); // Estado para a sala selecionada atualmente
  const [messages, setMessages] = useState([]); // Estado para armazenar as mensagens da sala atual
  const [message, setMessage] = useState(""); // Estado para a mensagem que o usuário está digitando
  const [newRoomName, setNewRoomName] = useState(""); // Estado para o nome de uma nova sala
  const [showDeletePopup, setShowDeletePopup] = useState(false); // Estado para controlar o popup de exclusão
  const [roomToDelete, setRoomToDelete] = useState(null); // Estado para a sala a ser deletada
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para controlar a visibilidade do menu lateral

  const user = getUserFromToken(); // Obtém o usuário a partir do token

  useEffect(() => { // Efeito colateral para inicialização e configuração do socket
    if (!user) { // Verifica se o usuário está autenticado
      console.error("[SOCKET.IO] Usuário não autenticado.");
      return;
    }

    const fetchRooms = async () => { // Função para buscar as salas disponíveis
      try {
        const response = await axios.get("http://localhost:5000/chat/rooms"); // Requisição para obter salas
        setRooms(response.data); // Atualiza o estado com as salas recebidas
      } catch (error) {
        console.error("[FETCH] Erro ao carregar salas:", error); // Loga erros caso ocorram
      }
    };

    fetchRooms(); // Chama a função para buscar salas

    const handleMessage = (data) => { // Manipulador para novas mensagens recebidas pelo socket
      if (data.room_id === currentRoom?.id) { // Verifica se a mensagem pertence à sala atual
        setMessages((prevMessages) => [...prevMessages, data]); // Adiciona a mensagem ao estado
      }
    };

    const handleEditedMessage = (editedMessage) => { // Manipulador para mensagens editadas
      setMessages((prevMessages) =>
        prevMessages.map((msg) => // Atualiza a mensagem editada no estado
          msg.id === editedMessage.id ? { ...msg, message: editedMessage.message } : msg
        )
      );
    };

    socket.on("receive_message", handleMessage); // Registra o evento de novas mensagens
    socket.on("message_edited", handleEditedMessage); // Registra o evento de mensagens editadas

    return () => { // Limpeza ao desmontar o componente
      socket.off("receive_message", handleMessage); // Remove o evento de novas mensagens
      socket.off("message_edited", handleEditedMessage); // Remove o evento de mensagens editadas
    };
  }, [user, currentRoom]); // Efeito executado quando o usuário ou sala atual mudam

  const handleSelectRoom = async (room) => { // Função para selecionar uma sala
    setCurrentRoom(room); // Define a sala atual
    setIsSidebarOpen(false); // Fecha o menu lateral no modo mobile

    socket.emit("join_room", { room_id: room.id }); // Emite evento para entrar na sala via socket

    try {
      const response = await axios.get( // Busca as mensagens da sala selecionada
        `http://localhost:5000/chat/room/${room.id}/messages`
      );
      setMessages(response.data); // Atualiza o estado com as mensagens recebidas
    } catch (error) {
      console.error("[FETCH] Erro ao carregar mensagens:", error.response?.data || error);
      alert("Não foi possível carregar as mensagens da sala. Tente novamente mais tarde.");
    }
  };

  const handleDeleteMessage = async (messageId) => { // Função para deletar uma mensagem
    try {
      await axios.delete(`http://localhost:5000/chat/delete_message/${messageId}`); // Faz a requisição para deletar a mensagem
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId)); // Remove a mensagem do estado
    } catch (error) {
      console.error("[FETCH] Erro ao apagar mensagem:", error); // Loga erro se ocorrer
      alert("Erro ao apagar mensagem."); // Alerta ao usuário
    }
  };

  const confirlgeleteRoom = (roomId) => { // Configura o estado para deletar uma sala
    setShowDeletePopup(true); // Mostra o popup de exclusão
    setRoomToDelete(roomId); // Define a sala a ser deletada
  };

  const handleDeleteRoom = async () => { // Função para deletar uma sala
    try {
      await axios.delete(`http://localhost:5000/chat/delete_room/${roomToDelete}`); // Faz a requisição para deletar a sala
      setRooms(rooms.filter((room) => room.id !== roomToDelete)); // Remove a sala do estado
      if (currentRoom?.id === roomToDelete) { // Verifica se a sala atual é a deletada
        setCurrentRoom(null); // Limpa a sala atual
        setMessages([]); // Limpa as mensagens
      }
      setShowDeletePopup(false); // Esconde o popup de exclusão
    } catch (error) {
      console.error("[FETCH] Erro ao apagar sala:", error); // Loga erro se ocorrer
      alert("Erro ao apagar sala."); // Alerta ao usuário
    }
  };

  const handleSendMessage = () => { // Função para enviar uma mensagem
    if (message.trim() !== "" && user && currentRoom) { // Verifica se os dados são válidos
      const payload = { // Prepara o payload
        user_id: user.id,
        username: user.nome,
        message,
        room_id: currentRoom.id,
      };

      socket.emit("send_message", payload); // Emite o evento via socket
      setMessage(""); // Limpa o campo de mensagem
    }
  };

  const handleCreateRoom = async () => { // Função para criar uma nova sala
    if (!newRoomName.trim()) return; // Retorna se o nome for inválido

    try {
      const response = await axios.post("http://localhost:5000/chat/create_room", { // Faz a requisição para criar a sala
        name: newRoomName,
      });
      setRooms([...rooms, response.data]); // Adiciona a nova sala ao estado
      setNewRoomName(""); // Limpa o campo de nome
    } catch (error) {
      console.error("[FETCH] Erro ao criar sala:", error); // Loga erro se ocorrer
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
                    <Message
                      key={msg.id}
                      msg={msg}
                      user={user}
                      onDelete={handleDeleteMessage}
                    />
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
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-grow p-4 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
                  placeholder="Digite sua mensagem"
                />
                <button
                  onClick={handleSendMessage}
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
