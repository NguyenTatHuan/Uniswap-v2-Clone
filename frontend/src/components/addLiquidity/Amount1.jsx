import React, { useEffect, useRef, useState } from "react";
import { useAmount1, useOnClickOutside } from "../../utils/helpers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { chevronDown } from "../../assets";

const Amount1 = ({
  token0,
  token1,
  amount0,
  onChange,
  pairContract,
  currencyValue,
  onSelect,
  currencies,
}) => {
  const [showList, setShowList] = useState(false);
  const [inputValue, setInputValue] = useState("0");
  const [activeCurrency, setActiveCurrency] = useState("Select");
  const ref = useRef();

  const amount1 =
    useAmount1(pairContract, amount0, token0, token1) ?? parseUnits("0");

  useOnClickOutside(ref, () => setShowList(false));

  useEffect(() => {
    if (pairContract && amount1) {
      setInputValue(formatUnits(amount1));
      if (typeof onChange === "function")
        onChange(formatUnits(amount1));
    }
  }, [pairContract, amount1]);

  useEffect(() => {
    if (Object.keys(currencies).includes(currencyValue))
      setActiveCurrency(currencies[currencyValue]);
    else setActiveCurrency("Select");
  }, [currencies, currencyValue]);

  return (
    <div className="flex justify-between items-center flex-row w-full min-w-full bg-site-dim border-[1px] border-transparent hover:border-site-dim2 min-h-[96px] sm:p-8 p-4 rounded-[20px]">
      <input
        placeholder="0.0"
        type="number"
        value={inputValue}
        onChange={(e) => {
          const val = e.target.value;
          setInputValue(val);
          if (!pairContract && typeof onChange === "function") onChange(val);
        }}
        className="w-full flex-1 bg-transparent outline-none font-poppins font-black text-2xl text-white"
        disabled={!!pairContract}
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
            {Object.entries(currencies).map(([token, tokenName], index) => (
              <li
                key={index}
                className="font-poppins font-medium text-base text-white hover:text-dim-white px-5 py-3 hover:bg-site-dim2 cursor-pointer"
                onClick={() => {
                  if (typeof onSelect === "function") onSelect(token);
                  setActiveCurrency(tokenName);
                  setShowList(false);
                }}
              >
                {tokenName}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Amount1;
