import React from "react";
import "./App.css";

const Header: React.FC = () => {
  return (
    <div style={{ margin: "4rem 0 0 6rem" }}>
      <img
        src={require("./images/logo.svg")}
        alt="Manto logo"
        style={{ width: "20%" }}
      ></img>
    </div>
  );
};

export default Header;
