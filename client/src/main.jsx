import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom"; // Оборачиваем приложение в Router

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById("root")
);
