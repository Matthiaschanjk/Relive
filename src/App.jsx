import { Routes, Route } from "react-router-dom";
import Login from './login.jsx';
import Home from './home.jsx';
import ErrorPage from './Error.jsx';
import Nus from "./nus.jsx";
import Ntu from "./ntu.jsx";
import Smu from "./smu.jsx";
import Reviews from "./reviews.jsx";

export default function App() {
  return (
    <Routes>
      <Route index element={<Login />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Login />} />
      <Route path="home" element={<Home />} />
      <Route path="nus" element={<Nus />} />
      <Route path="ntu" element={<Ntu />} />
      <Route path="smu" element={<Smu />} />
      <Route path=":school/:course" element={<Reviews />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
