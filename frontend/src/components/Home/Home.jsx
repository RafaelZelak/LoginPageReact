import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Home = () => {
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Pegar o token do localStorage
    const token = localStorage.getItem("token");

    if (token) {
      try {
        // Decodificar o token para obter os dados do usuário
        const decoded = jwtDecode(token);
        setUserEmail(decoded.email);
      } catch (error) {
        console.error("Erro ao decodificar o token:", error);
        navigate("/"); // Redirecionar para o login em caso de erro
      }
    } else {
      navigate("/"); // Redirecionar para o login se o token não existir
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
        <p className="mb-4">Você está logado como: <strong>{userEmail}</strong></p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
