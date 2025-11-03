import {
  ERC20,
  useContractFunction,
  useEthers,
  useTokenAllowance,
  useTokenBalance,
} from "@usedapp/core";
import { parseUnits } from "ethers/lib/utils";
import React, { useState, useEffect } from "react";
import {
  findPoolByTokens,
  getAvailableTokens,
  getCounterpartTokens,
  getFailureMessage,
  getSuccessMessage,
  isOperationPending,
} from "../../utils/helpers";
import { Contract, ethers } from "ethers";
import { ROUTER_ADDRESS } from "../../config/config";
import abis from "../../abis/abis";
import AmountIn from "./AmountIn";
import AmountOut from "./AmountOut";
import Balance from "../Balance";

const Exchange = ({ pools }) => {
  const { account, library } = useEthers();
  const [fromValue, setFromValue] = useState("0");
  const [fromToken, setFromToken] = useState(pools[0].token0Address); // initialFromToken
  const [decimalsFrom, setDecimalsFrom] = useState(18);
  const [toToken, setToToken] = useState("");
  const [resetState, setResetState] = useState(false);

  const fetchDecimals = async () => {
    if (!library) return;
    try {
      const fromTokenContract = new ethers.Contract(
        fromToken,
        ERC20.abi,
        library
      );
      const decimalsFromValue = await fromTokenContract.decimals();
      setDecimalsFrom(decimalsFromValue);
    } catch (error) {
      console.error("Error fetching decimals:", error);
    }
  };

  useEffect(() => {
    fetchDecimals();
  }, [fromToken, library]);

  const fromValueBigNumber = parseUnits(fromValue || "0", decimalsFrom); // converse the string to bigNumber
  const availableTokens = getAvailableTokens(pools);
  const counterpartTokens = getCounterpartTokens(pools, fromToken);
  const pairAddress =
    findPoolByTokens(pools, fromToken, toToken)?.address ?? "";

  const routerContract = new Contract(
    ROUTER_ADDRESS,
    abis.router01,
    library?.getSigner()
  );
  const fromTokenContract = new Contract(
    fromToken,
    ERC20.abi,
    library?.getSigner()
  );

  const tokenAllowance =
    useTokenAllowance(fromToken, account, ROUTER_ADDRESS) ||
    parseUnits("0", decimalsFrom);
  const approvedNeeded = fromValueBigNumber.gt(tokenAllowance);
  const formValueIsGreaterThan0 = fromValueBigNumber.gt(
    parseUnits("0", decimalsFrom)
  );
  const hasEnoughBalance = fromValueBigNumber.lte(
    useTokenBalance(fromToken, account) ?? parseUnits("0", decimalsFrom)
  );

  // approve initiating a contract call (similar to use state) -> gives the state and the sender...
  const { state: swapApproveState, send: swapApproveSend } =
    useContractFunction(fromTokenContract, "approve", {
      transactionName: "onApproveRequested",
      gasLimitBufferPercentage: 10,
    });

  // swap initiating a contract call (similar to use state) -> gives the state and the sender...
  const { state: swapExecuteState, send: swapExecuteSend } =
    useContractFunction(routerContract, "swapExactTokensForTokens", {
      transactionName: "swapExactTokensForTokens",
      gasLimitBufferPercentage: 10,
    });

  const isApproving = isOperationPending(swapApproveState);
  const isSwapping = isOperationPending(swapExecuteState);
  const canApprove = !isApproving && approvedNeeded;
  const canSwap =
    !approvedNeeded &&
    !isSwapping &&
    formValueIsGreaterThan0 &&
    hasEnoughBalance;

  const successMessage = getSuccessMessage(swapApproveState, swapExecuteState);
  const failureMessage = getFailureMessage(swapApproveState, swapExecuteState);

  const onApproveRequested = () => {
    swapApproveSend(ROUTER_ADDRESS, ethers.constants.MaxUint256);
  };

  const onSwapRequested = () => {
    swapExecuteSend(
      fromValueBigNumber,
      0,
      [fromToken, toToken],
      account,
      Math.floor(Date.now() / 1000) + 60 * 20,
      { gasLimit: 5_000_000 }
    ).then((_) => {
      setFromValue("0");
    });
  };

  const onFromValueChange = (value) => {
    const trimmedValue = value.trim();

    try {
      trimmedValue && parseUnits(value, decimalsFrom);
      setFromValue(value);
    } catch (e) {}
  };

  useEffect(() => {
    if (swapExecuteState.status === "Success") {
      setTimeout(() => {
        setResetState(true);
        setFromToken(pools[0].token0Address);
        setFromValue("0");
        setToToken("");
      }, 2000);
    }

    if (failureMessage || swapApproveState.status === "Success") {
      setTimeout(() => {
        setResetState(true);
      }, 2000);
    }
  }, [failureMessage, swapApproveState.status, swapExecuteState.status]);

  return (
    <div className="flex flex-col w-full items-center">
      <div className="mb-8">
        <AmountIn
          value={fromValue}
          onChange={onFromValueChange}
          currencyValue={fromToken}
          onSelect={(value) => setFromToken(value)}
          currencies={availableTokens}
          isSwapping={isSwapping && hasEnoughBalance}
        />
        <Balance tokenBalance={useTokenBalance(fromToken, account)} />
      </div>

      <div className="mb-8 w-[100%]">
        <AmountOut
          fromToken={fromToken}
          toToken={toToken}
          amountIn={fromValueBigNumber}
          pairContract={pairAddress}
          currencyValue={toToken}
          onSelect={(value) => setToToken(value)}
          currencies={counterpartTokens}
        />
        <Balance tokenBalance={useTokenBalance(toToken, account)} />
      </div>

      {approvedNeeded && !isSwapping ? (
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
          disabled={!canSwap}
          onClick={onSwapRequested}
          className={`${
            canSwap ? "bg-site-pink text-white" : "bg-site-dim2 text-site-dim2"
          } border-none outline-none px-6 py-2 font-poppins font-bold text-lg rounded-2xl leading-[24px] transition-all min-h-[56px] cursor-pointer`}
        >
          {isSwapping
            ? "Swapping..."
            : hasEnoughBalance
            ? "Swap"
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

export default Exchange;
