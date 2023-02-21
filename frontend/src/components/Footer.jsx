import logoFooter from "../assets/instagram.png";
import './Footer.css';


export const Footer = () => {
    return (
      <div className="footer">
        <p>
          <a href="/quienes-somos">Quienes somos</a> |{" "}
          <a href="/privacidad">Privacidad</a> |{" "}
          <a href="/terminos-y-condiciones">Términos y condiciones</a>
          <a href="https://www.instagram.com/"target="_blank"><img src={logoFooter} alt="Logo del footer"style={{ width: "25px", height: "25px" }} /></a>
          {/*<a href="/instagram"><img src={logoFooter} alt="LogoFooter" className="logo-instagram" /></a>*/}
        </p>
      </div>
    );
  };
  