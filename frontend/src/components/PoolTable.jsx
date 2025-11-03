import React from "react";
import { useTokenBalance } from "@usedapp/core";
import { formatUnits } from "ethers/lib/utils";

const PoolsTable = ({ pools, account }) => {
  if (!pools || pools.length === 0) {
    return <p className="text-center text-gray-400 py-10">No pools found.</p>;
  }

  return (
    <div className="overflow-x-auto w-full bg-[#0d1117] border border-[#1c1f26] rounded-3xl shadow-lg">
      <table className="w-full text-sm text-gray-300">
        <thead className="bg-[#161b22] text-gray-400 uppercase text-xs font-bold">
          <tr>
            <th className="py-3 px-4 text-left">Pair</th>
            <th className="py-3 px-4 text-right">Reserve 0</th>
            <th className="py-3 px-4 text-right">Reserve 1</th>
            <th className="py-3 px-4 text-right">Price</th>
            <th className="py-3 px-4 text-right">Total Supply</th>
            <th className="py-3 px-4 text-right">Your LP</th>
            <th className="py-3 px-4 text-right">Your Share</th>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool, i) => {
            const {
              address,
              token0Symbol,
              token1Symbol,
              reserve0,
              reserve1,
              price,
              totalSupply,
            } = pool;

            const userLPTokenBigNumber = useTokenBalance(address, account);
            const userLPToken = userLPTokenBigNumber
              ? parseFloat(formatUnits(userLPTokenBigNumber, 18))
              : 0;
            const share =
              totalSupply > 0
                ? ((userLPToken / totalSupply) * 100).toFixed(4)
                : "0.0000";

            return (
              <tr
                key={i}
                className="border-t border-[#1f2937] hover:bg-[#1a1f2b] transition-colors"
              >
                <td className="py-3 px-4 text-white font-medium">
                  {token0Symbol}/{token1Symbol}
                  <p
                    title={address}
                    className="text-gray-500 text-xs mt-1 truncate max-w-[100px]"
                  >
                    {address.slice(0, 10)}...
                  </p>
                </td>
                <td className="py-3 px-4 text-right text-white">
                  {reserve0.toFixed(4)} {token0Symbol}
                </td>
                <td className="py-3 px-4 text-right text-white">
                  {reserve1.toFixed(4)} {token1Symbol}
                </td>
                <td className="py-3 px-4 text-right text-white">
                  {price.toFixed(4)}
                </td>
                <td className="py-3 px-4 text-right text-gray-300">
                  {totalSupply.toFixed(4)}
                </td>
                <td className="py-3 px-4 text-right text-gray-300">
                  {userLPToken ? userLPToken.toFixed(4) : 0}
                </td>
                <td className="py-3 px-4 text-right text-green-400">
                  {share}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PoolsTable;
