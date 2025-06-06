import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import './App.css'
import Login from'./login.jsx';
import Home from "./home.jsx";
import ErrorPage from './Error.jsx';
import Nus from "./nus.jsx"
import Ntu from "./ntu.jsx"
import Smu from "./smu.jsx"
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Login />} />
          <Route path="home" element={<Home />} />
          <Route path="nus" element={<Nus />} />
          <Route path="ntu" element={<Ntu />} />
          <Route path="smu" element={<Smu />} />
          <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
