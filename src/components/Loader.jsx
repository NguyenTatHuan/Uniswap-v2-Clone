import React from "react";
import { ethereumLogo } from "../assets";

const Loader = ({ title }) => {
  return (
    <div className="flex justify-center items-center flex-col w-full min-h-full">
      <img
        src={ethereumLogo}
        alt="etherium-logo"
        className="w-56 h-56 object-contain"
      />
      <p className="font-poppins font-normal text-dim-white text-lg text-center mt-10">
        {title}
      </p>
    </div>
  );
};

export default Loader;
