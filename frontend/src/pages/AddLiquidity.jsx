import React from "react";
import AddLiquidityInput from "../components/addLiquidity/AddLiquidityInput";
import Loader from "../components/Loader";

const AddLiquidity = ({ account, loading, pools }) => {
  return (
    <div className="flex flex-col items-center w-full mb-10">
      <h1 className="text-white font-poppins font-black text-5xl tracking-wide">
        Uniswap
      </h1>
      <p className="text-dim-white font-poppins font-medium mt-3 text-base">
        Add Liquidity in seconds
      </p>
      <div className="mt-10 w-full flex justify-center">
        <div className="relative md:max-w-[700px] md:min-w-[500px] min-w-full gradient-border p-[2px] rounded-3xl">
          <div className="pink_gradient" />
          <div className="w-full min-h-[400px] bg-site-black backdrop-blur-[4px] rounded-3xl shadow-card flex p-10">
            {!account ? (
              <Loader title="Please connect your wallet." />
            ) : loading ? (
              <Loader title="Loading pools, please wait!" />
            ) : (
              <AddLiquidityInput pools={pools} />
            )}
          </div>
          <div className="blue_gradient" />
        </div>
      </div>
    </div>
  );
};

export default AddLiquidity;
