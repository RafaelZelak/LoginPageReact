import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [showLink, setShowLink] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Aguarde...");
    setStatus("pending");
    setShowLink(false);

    if (password !== confirmPassword) {
      setMessage("As senhas não coincidem.");
      setStatus("error");
      setTimeout(() => {
        setShowLink(true);
        setMessage("");
      }, 2000);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStatus("success");
        setTimeout(() => navigate("/login"), 2000); // Redireciona para login após sucesso
      } else {
        setMessage(data.message);
        setStatus("error");
      }
    } catch {
      setMessage("Erro ao conectar com o servidor.");
      setStatus("error");
    }

    setTimeout(() => {
      setShowLink(true);
      setMessage("");
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-700">
      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-xl w-full max-w-md flex flex-col justify-between">
        <h1 className="text-3xl font-semibold text-center text-blue-800 mb-8">
          Crie sua Conta
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Nome Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Confirmar Senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-3 rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-3 mt-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cadastrar
          </button>
        </form>
        {showLink ? (
          <p className="text-center mt-6 text-blue-600">
            Já tem uma conta?{" "}
            <a href="/login" className="font-medium hover:text-blue-800">
              Faça login aqui
            </a>
          </p>
        ) : (
          <p
            className={`mt-4 text-center ${
              status === "success"
                ? "text-green-500"
                : status === "error"
                ? "text-red-500"
                : "text-blue-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default SignupForm;
