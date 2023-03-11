// Importamos el componente "Link" de la biblioteca "react-router-dom"
import { Link } from "react-router-dom";
//YO
//import './Header.css';
import logo from "../assets/logo.png";
import "./Header.css";

// Definimos un componente de React llamado "Header"
export const Header = () => {
  // El componente devuelve un elemento "div" que contiene un enlace "Link"
  return (
    <div className="header-container">
      <img src={logo} alt="Logo" className="logo-img" />
      <div className="header-text-container">
        <h1>Build Private Ethereum Networks</h1>
        <Link to="/networkList">Lista de redes</Link>
      </div>
    </div>
  );
};
