import logo from "/images/logo.png";

function Footer() {
  return (
    <div className="footer">
      <div className="footer-logo">
        <img src={logo} alt="Логотип компании" />
      </div>
      <div className="rights">«Все права защищены»</div>
    </div>
  );
}

export default Footer;
