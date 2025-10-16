import React from "react";
import { useEthers } from "@usedapp/core";
import { usePools } from "./hooks/usePools";
import Header from "./components/Header";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import AddLiquidity from "./pages/AddLiquidity";
import RemoveLiquidity from "./pages/RemoveLiquidity";
import Pool from "./pages/Pool";

const App = () => {
  const { account } = useEthers();
  const [loading, pools] = usePools();

  return (
    <div className="flex justify-center min-h-screen sm:px-16 px-6 bg-site-black">
      <div className="flex items-center flex-col max-w-[1280px] w-full">
        <Header />
        <Routes>
          <Route
            path="/"
            element={<Home account={account} loading={loading} pools={pools} />}
          />
          <Route
            path="/liquidity/add"
            element={
              <AddLiquidity account={account} loading={loading} pools={pools} />
            }
          />
          <Route
            path="/liquidity/remove"
            element={
              <RemoveLiquidity
                account={account}
                loading={loading}
                pools={pools}
              />
            }
          />
          <Route
            path="/pools"
            element={<Pool account={account} loading={loading} pools={pools} />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
