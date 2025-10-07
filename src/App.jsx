import React from "react";
import { uniswapLogo } from "./assets";
import WalletButton from "./components/WalletButton";
import { useEthers } from "@usedapp/core";
import Loader from "./components/Loader";
import Exchange from "./components/Exchange";
import { usePools } from "./hooks/usePools";

const App = () => {
  const { account } = useEthers();
  const [loading, pools] = usePools();

  return (
    <div className="flex justify-center min-h-screen sm:px-16 px-6 bg-site-black">
      <div className="flex justify-between items-center flex-col max-w-[1280px] w-full">
        <header className="flex flex-row justify-between items-center w-full sm:py-10 py-6">
          <img
            src={uniswapLogo}
            alt="uniswap-logo"
            className="w-30 h-30 object-contain"
          />
          <WalletButton />
        </header>

        <div className="flex-1 flex justify-start items-center flex-col w-full mb-10">
          <h1 className="text-white font-poppins font-black text-5xl tracking-wide">
            Uniswap
          </h1>
          <p className="text-dim-white font-poppins font-medium mt-3 text-base">
            Exchange tokens in seconds
          </p>
          <div className="mt-10 w-full flex justify-center">
            <div className="relative md:max-w-[700px] md:min-w-[500px] min-w-full max-w-full gradient-border p-[2px] rounded-3xl">
              <div className="pink_gradient" />
              <div className="w-full min-h-[400px] bg-site-black backdrop-blur-[4px] rounded-3xl shadow-card flex p-10">
                {account ? (
                  loading ? (
                    <Loader title="Loadin pools, please wait!" />
                  ) : (
                    <Exchange pools={pools} />
                  )
                ) : (
                  <Loader title="Please connect your wallet." />
                )}
              </div>
              <div className="blue_gradient" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
