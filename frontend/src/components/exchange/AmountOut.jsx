import React, { useEffect, useRef, useState } from "react";
import { useAmountsOut, useOnClickOutside } from "../../utils/helpers";
import { formatUnits } from "ethers/lib/utils";
import { chevronDown } from "../../assets";

const AmountOut = ({
  fromToken,
  toToken,
  amountIn,
  pairContract,
  currencyValue,
  onSelect,
  currencies,
}) => {
  const [showList, setShowList] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState("Select");
  const ref = useRef();

  const amountOut =
    useAmountsOut(pairContract, amountIn, fromToken, toToken) ?? 0;

  useOnClickOutside(ref, () => setShowList(false));

  useEffect(() => {
    if (Object.keys(currencies).includes(currencyValue)) {
      setActiveCurrency(currencies[currencyValue]);
    } else {
      setActiveCurrency("Select");
    }
  }, [currencyValue, currencies]);

  return (
    <div className="flex justify-between items-center flex-row w-full min-w-full bg-site-dim border-[1px] border-transparent hover:border-site-dim2 min-h-[96px] sm:p-8 p-4 rounded-[20px]">
      <input
        placeholder="0.0"
        type="number"
        value={formatUnits(amountOut)}
        className="w-full flex-1 bg-transparent outline-none font-poppins font-black text-2xl text-white"
        disabled
      />

      <div className="relative" onClick={() => setShowList(!showList)}>
        <button className="flex flex-row items-center bg-site-dim2 py-2 px-4 rounded-xl font-poppins font-bold text-white cursor-pointer">
          {activeCurrency}
          <img
            src={chevronDown}
            alt="cheveron-down"
            className={`w-4 h-4 object-contain ml-2 ${
              showList ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
        {showList && (
          <ul
            ref={ref}
            className="absolute z-10 right-0 bg-site-black border-[1px] border-site-dim2 w-full mt-2 rounded-lg min-w-[170px] max-h-36 overflow-y-auto hide-scrollbar"
          >
            {Object.entries(currencies).map(([token, tokenSymbol], index) => (
              <li
                key={index}
                className="font-poppins font-medium text-base text-white hover:text-dim-white px-5 py-3 hover:bg-site-dim2 cursor-pointer"
                onClick={() => {
                  if (typeof onSelect === "function") onSelect(token);
                  setActiveCurrency(tokenSymbol);
                  setShowList(false);
                }}
              >
                {tokenSymbol}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AmountOut;
