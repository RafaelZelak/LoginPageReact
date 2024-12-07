import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Home = () => {
  const [userData, setUserData] = useState({
    email: "",
    nome: "",
    tipoUsuario: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserData({
          email: decoded.user.email,
          nome: decoded.user.nome,
          tipoUsuario: decoded.user.tipo_usuario,
        });
      } catch (error) {
        console.error("Erro ao decodificar o token:", error);
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-indigo-950">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
        <h1 className="text-3xl font-semibold mb-4">Bem-vindo à Home!</h1>
        <p className="mb-4">Você está logado como:</p>
        <p>
          <strong>Email:</strong> {userData.email}
        </p>
        <p>
          <strong>Nome:</strong> {userData.nome}
        </p>
        <p>
          <strong>Tipo de Usuário:</strong> {userData.tipoUsuario}
        </p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 mt-4 bg-indigo-500 text-white rounded hover:bg-indigo-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
