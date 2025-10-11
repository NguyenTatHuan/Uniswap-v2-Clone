import React from "react";
import { useEthers } from "@usedapp/core";
import { usePools } from "./hooks/usePools";
import Header from "./components/Header";
import Home from "./components/Home";
import { Route, Routes } from "react-router-dom";
import AddLiquidity from "./components/AddLiquidity";

const App = () => {
  const { account } = useEthers();
  const [loading, pools] = usePools();

  return (
    <div className="flex justify-center min-h-screen sm:px-16 px-6 bg-site-black">
      <div className="flex justify-between items-center flex-col max-w-[1280px] w-full">
        <Header />
        <Routes>
          <Route
            path="/"
            element={<Home account={account} loading={loading} pools={pools} />}
          />
          <Route
            path="/liquidity/add"
            element={<AddLiquidity account={account} />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
