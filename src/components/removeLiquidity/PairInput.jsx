import React, { useRef, useState } from "react";
import { useOnClickOutside } from "../../utils/helpers";
import { chevronDown } from "../../assets";

const PairInput = ({ selectedPool, pools, onSelect }) => {
  const [showList, setShowList] = useState(false);
  const ref = useRef();

  useOnClickOutside(ref, () => setShowList(false));

  const activeLabel = selectedPool
    ? `${selectedPool.token0Symbol}/${selectedPool.token1Symbol}`
    : "Select Pool";

  return (
    <div className="flex justify-between items-center flex-row w-full min-w-full bg-site-dim border-[1px] border-transparent hover:border-site-dim2 min-h-[96px] sm:p-8 p-4 rounded-[20px]">
      <input
        placeholder="USDT/USDC"
        type="text"
        value={selectedPool ? activeLabel : ""}
        className="w-full flex-1 bg-transparent outline-none font-poppins font-black text-2xl text-white"
        disabled
      />

      <div className="relative" ref={ref}>
        <button
          type="button"
          className="flex flex-row items-center bg-site-dim2 py-2 px-4 rounded-xl font-poppins font-bold text-white cursor-pointer"
          onClick={() => setShowList((prev) => !prev)}
        >
          {activeLabel}
          <img
            src={chevronDown}
            alt="chevron-down"
            className={`w-4 h-4 object-contain ml-2 transition-transform duration-200 ${
              showList ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {showList && (
          <ul className="absolute z-10 right-0 bg-site-black border-[1px] border-site-dim2 w-full mt-2 rounded-lg min-w-[170px] max-h-36 overflow-y-auto hide-scrollbar">
            {pools.map((pool, index) => (
              <li
                key={index}
                className="font-poppins font-medium text-base text-white hover:text-dim-white px-5 py-3 hover:bg-site-dim2 cursor-pointer"
                onClick={() => {
                  setShowList(false);
                  if (typeof onSelect === "function") onSelect(pool);
                }}
              >
                {pool.token0Symbol}/{pool.token1Symbol}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PairInput;
