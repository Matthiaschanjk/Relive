import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import './App.css'
import Login from'./login.jsx';
import Home from './home.jsx';
import ErrorPage from './Error.jsx';
import Nus from "./nus.jsx"
import Ntu from "./ntu.jsx"
import Smu from "./smu.jsx"
import Reviews from "./reviews.jsx"
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './AuthContext';

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
          {/* Dynamic Route Path for school and course */}
          <Route path=":school/:course" element={<Reviews />} />
          {/* Catch URL Errors and render ErrorPage */}
          <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
const clientID = import.meta.env.GOOGLE_CLIENT_ID;
root.render(
    <GoogleOAuthProvider clientId= {clientID}>
      <AuthProvider>
      <App />
      </AuthProvider>
    </GoogleOAuthProvider>
);
