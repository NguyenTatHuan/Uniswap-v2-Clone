import React, { useState, useEffect } from "react";
import Balance from "../Balance";
import {
  ERC20,
  useContractFunction,
  useEthers,
  useTokenAllowance,
  useTokenBalance,
} from "@usedapp/core";
import { tokens } from "../../config/tokens";
import { parseUnits } from "ethers/lib/utils";
import { ROUTER_ADDRESS } from "../../config/config";
import { Contract, ethers } from "ethers";
import abis from "../../abis/abis";
import {
  findPoolByTokens,
  getFailureMessage,
  getSuccessMessage,
  isOperationPending,
} from "../../utils/helpers";
import Amount0 from "./Amount0";
import Amount1 from "./Amount1";

const AddLiquidityInput = ({ pools }) => {
  const { account, library } = useEthers();

  const [token0, setToken0] = useState(Object.keys(tokens)[0]);
  const [token1, setToken1] = useState(Object.keys(tokens)[1]);
  const [amount0, setAmount0] = useState("0");
  const [amount1, setAmount1] = useState("0");
  const [decimals0, setDecimals0] = useState(18);
  const [decimals1, setDecimals1] = useState(18);
  const [resetState, setResetState] = useState(false);

  const filteredTokensForToken1 = Object.fromEntries(
    Object.entries(tokens).filter(([key]) => key !== token0)
  );

  const fetchDecimals = async () => {
    if (!library) return;
    try {
      const token0Contract = new ethers.Contract(token0, ERC20.abi, library);
      const token1Contract = new ethers.Contract(token1, ERC20.abi, library);
      const decimals0Value = await token0Contract.decimals();
      const decimals1Value = await token1Contract.decimals();
      setDecimals0(decimals0Value);
      setDecimals1(decimals1Value);
    } catch (error) {
      console.error("Error fetching decimals:", error);
    }
  };

  useEffect(() => {
    fetchDecimals();
  }, [token0, token1, library]);

  const pairAddress = findPoolByTokens(pools, token0, token1)?.address ?? "";

  const amount0BigNumber = parseUnits(amount0 || "0", decimals0);
  const amount1BigNumber = parseUnits(amount1 || "0", decimals1);

  const token0Allowance = useTokenAllowance(token0, account, ROUTER_ADDRESS);
  const token1Allowance = useTokenAllowance(token1, account, ROUTER_ADDRESS);
  const token0Balance = useTokenBalance(token0, account);
  const token1Balance = useTokenBalance(token1, account);

  const allowance0 = token0Allowance || parseUnits("0", decimals0);
  const allowance1 = token1Allowance || parseUnits("0", decimals1);
  const balance0 = token0Balance || parseUnits("0", decimals0);
  const balance1 = token1Balance || parseUnits("0", decimals1);

  const approvedToken0Needed = amount0BigNumber.gt(allowance0);
  const approvedToken1Needed = amount1BigNumber.gt(allowance1);

  const formValueIsGreaterThan0 =
    amount0BigNumber.gt(parseUnits("0", decimals0)) &&
    amount1BigNumber.gt(parseUnits("0", decimals1));

  const hasEnoughBalance =
    amount0BigNumber.lte(balance0) && amount1BigNumber.lte(balance1);

  const routerContract = new Contract(
    ROUTER_ADDRESS,
    abis.router01,
    library?.getSigner()
  );
  const token0Contract = new Contract(token0, ERC20.abi, library?.getSigner());
  const token1Contract = new Contract(token1, ERC20.abi, library?.getSigner());

  const { state: addApproveState0, send: addApproveSend0 } =
    useContractFunction(token0Contract, "approve", {
      transactionName: "onApproveToken0Requested",
      gasLimitBufferPercentage: 10,
    });

  const { state: addApproveState1, send: addApproveSend1 } =
    useContractFunction(token1Contract, "approve", {
      transactionName: "onApproveToken1Requested",
      gasLimitBufferPercentage: 10,
    });

  const { state: addExecuteState, send: addExecuteSend } = useContractFunction(
    routerContract,
    "addLiquidity",
    {
      transactionName: "addLiquidity",
      gasLimitBufferPercentage: 10,
    }
  );

  const isApproving =
    isOperationPending(addApproveState0) ||
    isOperationPending(addApproveState1);
  const isAdding = isOperationPending(addExecuteState);

  const canApprove =
    !isApproving && (approvedToken0Needed || approvedToken1Needed);

  const canAddLiquidity =
    !approvedToken0Needed &&
    !approvedToken1Needed &&
    !isAdding &&
    formValueIsGreaterThan0 &&
    hasEnoughBalance;

  const successMessage = getSuccessMessage(
    addApproveState0,
    addApproveState1,
    addExecuteState
  );
  const failureMessage = getFailureMessage(
    addApproveState0,
    addApproveState1,
    addExecuteState
  );

  const onApproveRequested = () => {
    if (approvedToken0Needed)
      addApproveSend0(ROUTER_ADDRESS, ethers.constants.MaxUint256);
    if (approvedToken1Needed)
      addApproveSend1(ROUTER_ADDRESS, ethers.constants.MaxUint256);
  };

  const onAddLiquidityRequested = async () => {
    if (!library || !account) return;

    let [tokenA, tokenB] =
      token0.toLowerCase() > token1.toLowerCase()
        ? [token1, token0]
        : [token0, token1];

    let [amountADesired, amountBDesired] =
      token0.toLowerCase() > token1.toLowerCase()
        ? [amount1BigNumber, amount0BigNumber]
        : [amount0BigNumber, amount1BigNumber];

    const factoryContract = new ethers.Contract(
      await routerContract.factory(),
      abis.factory,
      library.getSigner()
    );
    const pairAddress = await factoryContract.getPair(tokenA, tokenB);

    const amountAMin =
      pairAddress === ethers.ZeroAddress
        ? 0n
        : amountADesired.mul(995).div(1000);
    const amountBMin =
      pairAddress === ethers.ZeroAddress
        ? 0n
        : amountBDesired.mul(995).div(1000);

    try {
      await addExecuteSend(
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        account,
        Math.floor(Date.now() / 1000) + 60 * 20,
        { gasLimit: 5_000_000 }
      );
      setAmount0("0");
      setAmount1("0");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (addExecuteState.status === "Success") {
      setTimeout(() => {
        setResetState(true);
        setAmount0("0");
        setAmount1("0");
        setToken0(Object.keys(tokens)[0]);
        setToken1(Object.keys(tokens)[1]);
      }, 2000);
    }

    if (
      failureMessage ||
      addApproveState0.status === "Success" ||
      addApproveState1.status === "Success"
    ) {
      setTimeout(() => {
        setResetState(true);
      }, 2000);
    }
  }, [
    failureMessage,
    addApproveState0.status,
    addApproveState1.status,
    addExecuteState.status,
  ]);

  return (
    <div className="flex flex-col w-full items-center">
      <div className="mb-8">
        <Amount0
          value={amount0}
          onChange={(value) => setAmount0(value.trim())}
          currencyValue={token0}
          onSelect={(value) => setToken0(value)}
          currencies={tokens}
        />
        <Balance tokenBalance={token0Balance} />
      </div>

      <div className="mb-8 w-[100%]">
        <Amount1
          token0={token0}
          token1={token1}
          amount0={amount0BigNumber}
          onChange={(value) => setAmount1(value.trim())}
          pairContract={pairAddress}
          currencyValue={token1}
          onSelect={(value) => setToken1(value)}
          currencies={filteredTokensForToken1}
        />
        <Balance tokenBalance={token1Balance} />
      </div>

      {canApprove ? (
        <button
          disabled={!canApprove}
          onClick={onApproveRequested}
          className={`${
            canApprove
              ? "bg-site-pink text-white"
              : "bg-site-dim2 text-site-dim2"
          } border-none outline-none px-6 py-2 font-poppins font-bold text-lg rounded-2xl leading-[24px] transition-all min-h-[56px] cursor-pointer`}
        >
          {isApproving ? "Approving..." : "Approve"}
        </button>
      ) : (
        <button
          disabled={!canAddLiquidity}
          onClick={onAddLiquidityRequested}
          className={`${
            canAddLiquidity
              ? "bg-site-pink text-white"
              : "bg-site-dim2 text-site-dim2"
          } border-none outline-none px-6 py-2 font-poppins font-bold text-lg rounded-2xl leading-[24px] transition-all min-h-[56px] cursor-pointer`}
        >
          {isAdding
            ? "Adding..."
            : hasEnoughBalance
            ? "Add Liquidity"
            : "Insufficient balance"}
        </button>
      )}

      {failureMessage && !resetState ? (
        <p className="font-poppins font-lg text-red-600 font-bold mt-7">
          {failureMessage}
        </p>
      ) : successMessage ? (
        <p className="font-poppins font-lg text-green-600 font-bold mt-7">
          {successMessage}
        </p>
      ) : (
        ""
      )}
    </div>
  );
};

export default AddLiquidityInput;
