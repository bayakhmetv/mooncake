function Home() {
  const scrollToProducts = () => {
    const element = document.getElementById("products-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="home-content">
      <div className="container">
        <div className="home-box">
          <div className="home-info">
            <h1 className="home-title">
              Магия вкуса <br></br> в каждом кусочке
            </h1>
            <p className="home-text">Сладкие моменты освещающие ваш день</p>
            <div className="home-action">
              <button className="button" onClick={scrollToProducts}>
                Заказать
              </button>
            </div>
          </div>
          <img
            src="images/main-photo.png"
            alt="Кондитер"
            className="home-image"
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
