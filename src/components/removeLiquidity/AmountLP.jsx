import React from "react";

const AmountLP = ({ value, onChange }) => {
  return (
    <div className="flex justify-between items-center flex-row w-full bg-site-dim border border-transparent hover:border-site-dim2 min-h-[96px] sm:p-8 p-4 rounded-[20px]">
      <input
        placeholder="0.0"
        type="number"
        value={value}
        onChange={onChange}
        className="w-full flex-1 bg-transparent outline-none font-poppins font-black text-2xl text-white"
      />

      <div className="flex flex-row items-center bg-site-dim2 py-2 px-4 rounded-xl font-poppins font-bold text-white cursor-default select-none">
        LP Tokens
      </div>
    </div>
  );
};

export default AmountLP;
