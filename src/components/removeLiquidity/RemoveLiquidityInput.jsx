import React, { useState, useEffect } from "react";
import PairInput from "./PairInput";
import AmountLP from "./AmountLP";

const RemoveLiquidityInput = ({ pools }) => {
  const [selectedPool, setSelectedPool] = useState(null);
  const [amountLP, setAmountLP] = useState("");

  useEffect(() => {
    console.log("selectedPool:", selectedPool);
  }, [selectedPool]);

  return (
    <div className="flex flex-col w-full items-center">
      <div className="mb-8 w-[100%]">
        <PairInput
          pairValue={selectedPool?.pairAddress || ""}
          pools={pools}
          onSelect={(pairAddress) => {
            const found = pools.find((p) => p.pairAddress === pairAddress);
            if (found) {
              setSelectedPool(found);
            } else {
              setSelectedPool(null);
            }
          }}
        />
      </div>

      <div className="mb-8 w-[100%]">
        <AmountLP
          value={amountLP}
          onChange={(e) => setAmountLP(e.target.value)}
        />
      </div>
    </div>
  );
};

export default RemoveLiquidityInput;
