import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './AuthContext';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './App.css';

const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId={clientID}>
    <AuthProvider>
      <BrowserRouter> 
        <App />
      </BrowserRouter>
    </AuthProvider>
  </GoogleOAuthProvider>
);
