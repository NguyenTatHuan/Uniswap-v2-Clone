import React from "react";
import { uniswapLogo } from "../assets";
import { useNavigate } from "react-router-dom";
import WalletButton from "./WalletButton";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="flex flex-row justify-between items-center w-full py-6">
      <img
        src={uniswapLogo}
        alt="uniswap-logo"
        className="w-30 h-30 object-contain cursor-pointer"
        onClick={() => navigate("/")}
      />
      <WalletButton />
    </header>
  );
};

export default Header;
