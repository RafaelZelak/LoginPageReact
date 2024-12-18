import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginPage/LoginForm/LoginForm";
import SignupForm from "./components/Signup/SignupForm"; // Importação do SignupForm
import Home from "./components/Home/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatPage from "./components/Chat/ChatPage"; // Importação do ChatPage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} /> {/* Nova rota adicionada */}
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
              <ChatPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
