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
      <div className="flex flex-row justify-center items-center sm:gap-12 gap-8 relative">
        <button
          onClick={() => navigate("/pools")}
          className="font-poppins font-bold text-lg text-white cursor-pointer"
        >
          Pool
        </button>
        <div className="relative group">
          <button className="font-poppins font-bold text-lg text-white cursor-pointer">
            Liquidity
          </button>
          <div className="absolute top-full left-0 mt-2 w-32 bg-gray-800 text-white rounded-2xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <button
              onClick={() => navigate("/liquidity/add")}
              className="block w-full text-left px-4 py-2 rounded-2xl cursor-pointer hover:bg-gray-700"
            >
              Add
            </button>
            <button
              onClick={() => navigate("/liquidity/remove")}
              className="block w-full text-left px-4 py-2 rounded-2xl cursor-pointer hover:bg-gray-700"
            >
              Remove
            </button>
          </div>
        </div>
        <WalletButton />
      </div>
    </header>
  );
};

export default Header;
