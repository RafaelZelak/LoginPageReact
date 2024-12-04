import React, { useState } from 'react';
import Button from '../Button/Button';
import Input from '../Input/Input';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(''); // Status da resposta do backend
  const [showLink, setShowLink] = useState(true); // Controla se o link "Criar Conta" aparece

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Aguarde...');
    setStatus('pending'); // Define como "pendente" enquanto espera a resposta
    setShowLink(false); // Substitui o link imediatamente ao enviar

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStatus('success');
      } else {
        setMessage(data.message);
        setStatus('error');
      }
    } catch {
      setMessage('Erro ao conectar com o servidor.');
      setStatus('error');
    }

    // Restaura o link "Criar Conta" após 2 segundos
    setTimeout(() => {
      setShowLink(true);
      setMessage(''); // Limpa a mensagem após restaurar o link
    }, 2000);
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/img/BackgroundLight.jpg)`,
      }}
    >
      <div
        className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg shadow-lg w-full max-w-sm flex flex-col justify-between"
        style={{ minHeight: '450px' }}
      >
        <h1 className="text-3xl font-semibold text-center text-indigo-950 mb-12 mt-6">
          Bem-vindo de volta!
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mt-auto">
            <Button>Entrar</Button>
          </div>
          {showLink ? (
            <a href="#" className="text-center mt-4 cursor-pointer">
              Criar Conta
            </a>
          ) : (
            <p
              className={`mt-4 text-center ${
                status === 'success'
                  ? 'text-green-500'
                  : status === 'error'
                  ? 'text-red-500'
                  : 'text-indigo-950'
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
