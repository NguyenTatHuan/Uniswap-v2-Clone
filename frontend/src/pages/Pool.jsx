import React from "react";
import PoolsTable from "../components/PoolTable";
import Loader from "../components/Loader";

const Pool = ({ account, loading, pools }) => {
  return (
    <div className="flex flex-col items-center w-full mb-10">
      <h1 className="text-white font-poppins font-black text-5xl tracking-wide">
        Uniswap
      </h1>
      <p className="text-dim-white font-poppins font-medium mt-3 text-base">
        All Liquidity Pools Overview
      </p>
      <div className="mt-10 w-full flex justify-center">
        <div
          className={`relative ${
            loading ? "md:max-w-[700px]" : "md:max-w-[1200px] w-full"
          } md:min-w-[500px] min-w-full gradient-border p-[2px] rounded-3xl`}
        >
          <div className="pink_gradient" />
          <div
            className={`${
              loading || !account ? "min-h-[400px] flex" : "w-full max-h-[400px]"
            } bg-site-black backdrop-blur-[4px] rounded-3xl shadow-card overflow-y-auto hide-scrollbar`}
          >
            {!account ? (
              <Loader title="Please connect your wallet." />
            ) : loading ? (
              <Loader title="Loading pools, please wait!" />
            ) : (
              <PoolsTable pools={pools} account={account} />
            )}
          </div>
          <div className="blue_gradient" />
        </div>
      </div>
    </div>
  );
};

export default Pool;
