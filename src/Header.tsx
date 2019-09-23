import React from "react";
import "./App.css";

const Header: React.FC = () => {
  return (
    <div style={{ paddingTop: "4rem", textAlign: "center" }}>
      <img
        src={require("./images/logo.svg")}
        alt="Manto logo"
        style={{ width: "20%" }}
      ></img>
    </div>
  );
};

export default Header;
