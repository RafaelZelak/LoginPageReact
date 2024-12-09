import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginPage/LoginForm/LoginForm";
import Home from "./components/Home/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatPage from "./components/Chat/ChatPage"; // Importando o ChatPage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />  {/* Adicionando a rota do chat */}
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
