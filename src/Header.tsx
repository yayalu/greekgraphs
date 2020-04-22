import React from "react";
import "./App.css";

const Header: React.FC = () => {
  return (
    <img
      src={require("./images/logo.svg")}
      alt="Manto logo"
      style={{ width: "20%" }}
    ></img>
  );
};

export default Header;
