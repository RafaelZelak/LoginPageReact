import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import Input from "../Input/Input";
import ToggleButton from "../Button/ToggleButton";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [showLink, setShowLink] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Aguarde...");
    setStatus("pending");
    setShowLink(false);

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStatus("success");
        localStorage.setItem("token", data.token); // Salva o token
        setTimeout(() => navigate("/home"), 2000); // Redireciona
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSignupClick = () => {
    navigate("/SignupForm"); // Redireciona para a página de cadastro
  };

  return (
    <div
      className={`flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat ${
        isDarkMode ? "text-white" : "text-indigo-950"
      }`}
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/img/${
          isDarkMode ? "BackgroundDark" : "BackgroundLight"
        }.jpg)`,
      }}
    >
      <div
        className={`${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-indigo-950"
        } bg-opacity-10 backdrop-blur-md p-6 rounded-lg shadow-lg w-full max-w-sm flex flex-col justify-between`}
        style={{ minHeight: "450px" }}
      >
        <h1 className="text-3xl font-semibold text-center mb-6">
          Bem-vindo de volta!
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              darkMode={isDarkMode}
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              darkMode={isDarkMode}
            />
          </div>
          <div className="mt-auto">
            <Button darkMode={isDarkMode}>Entrar</Button>
          </div>
          {showLink ? (
            <a
              href="#"
              onClick={handleSignupClick} // Chamamos a função de redirecionamento
              className={`text-center mt-4 cursor-pointer ${
                isDarkMode ? "text-indigo-300" : "text-indigo-950"
              }`}
            >
              Criar Conta
            </a>
          ) : (
            <p
              className={`mt-4 text-center ${
                status === "success"
                  ? "text-green-500"
                  : status === "error"
                  ? "text-red-500"
                  : isDarkMode
                  ? "text-indigo-300"
                  : "text-indigo-950"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
      <div className="fixed bottom-4 right-4">
        <ToggleButton isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </div>
    </div>
  );
};

export default LoginForm;
