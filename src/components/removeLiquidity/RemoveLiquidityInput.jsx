import React, { useEffect, useState } from "react";
import PairInput from "./PairInput";
import AmountLP from "./AmountLP";
import Balance from "../Balance";
import {
  useContractFunction,
  useEthers,
  useTokenAllowance,
  useTokenBalance,
} from "@usedapp/core";
import { ROUTER_ADDRESS } from "../../config/config";
import abis from "../../abis/abis";
import { Contract, ethers } from "ethers";
import {
  getFailureMessage,
  getSuccessMessage,
  isOperationPending,
} from "../../utils/helpers";
import { parseUnits } from "ethers/lib/utils";

const RemoveLiquidityInput = ({ pools }) => {
  const { account, library } = useEthers();
  const [selectedPool, setSelectedPool] = useState(pools[0]);
  const [amountLP, setAmountLP] = useState("");
  const [decimalsLP, setDecimalsLP] = useState(18);
  const [resetState, setResetState] = useState(false);

  const lpTokenAddress = selectedPool?.address;
  const fetchDecimals = async () => {
    if (!library || !lpTokenAddress) return;
    try {
      const contract = new ethers.Contract(lpTokenAddress, abis.erc20, library);
      const decimalsValue = await contract.decimals();
      setDecimalsLP(decimalsValue);
    } catch (err) {
      console.error("Error fetching decimals:", err);
    }
  };

  useEffect(() => {
    fetchDecimals();
  }, [lpTokenAddress, library]);

  const routerContract = new Contract(
    ROUTER_ADDRESS,
    abis.router01,
    library?.getSigner()
  );
  const lpTokenContract = new Contract(
    lpTokenAddress,
    abis.erc20,
    library?.getSigner()
  );

  const lpTokenBalance = useTokenBalance(lpTokenAddress, account);
  const lpTokenAllowance =
    useTokenAllowance(lpTokenAddress, account, ROUTER_ADDRESS) ||
    parseUnits("0", decimalsLP);

  const amountLPBigNumber = parseUnits(amountLP || "0", decimalsLP);
  const neededApprove = amountLPBigNumber.gt(lpTokenAllowance);
  const hasEnoughLPToken = amountLPBigNumber.lte(
    lpTokenBalance ?? parseUnits("0", decimalsLP)
  );
  const isInputValid = amountLPBigNumber.gt(parseUnits("0", decimalsLP));

  const { state: removeApproveState, send: removeApproveSend } =
    useContractFunction(lpTokenContract, "approve", {
      transactionName: "onApproveRequested",
      gasLimitBufferPercentage: 10,
    });

  const { state: removeExecuteState, send: removeExecuteSend } =
    useContractFunction(routerContract, "removeLiquidity", {
      transactionName: "removeLiquidity",
      gasLimitBufferPercentage: 10,
    });

  const isApproving = isOperationPending(removeApproveState);
  const isRemoving = isOperationPending(removeExecuteState);

  const canApprove = neededApprove && !isApproving;
  const canRemove =
    !neededApprove &&
    !isRemoving &&
    isInputValid &&
    hasEnoughLPToken &&
    selectedPool;

  const successMessage = getSuccessMessage(
    removeApproveState,
    removeExecuteState
  );
  const failureMessage = getFailureMessage(
    removeApproveState,
    removeExecuteState
  );

  const onApproveRequested = () => {
    removeApproveSend(ROUTER_ADDRESS, ethers.constants.MaxUint256);
  };

  const onRemoveRequested = () => {
    if (!selectedPool) return;
    removeExecuteSend(
      selectedPool.token0Address,
      selectedPool.token1Address,
      amountLPBigNumber,
      0,
      0,
      account,
      Math.floor(Date.now() / 1000) + 60 * 20,
      { gasLimit: 5_000_000 }
    ).then((_) => {
      setAmountLP("0");
    });
  };

  useEffect(() => {
    if (removeExecuteState.status === "Success") {
      setTimeout(() => {
        setResetState(true);
        setSelectedPool(pools[0]);
        setAmountLP("0");
      }, 2000);
    }

    if (
      failureMessage ||
      removeApproveState.status === "Success" ||
      removeApproveState.status === "Fail" ||
      removeExecuteState.status === "Fail"
    ) {
      setTimeout(() => {
        setResetState(true);
      }, 2000);
    }
  }, [failureMessage, removeApproveState.status, removeExecuteState.status]);

  return (
    <div className="flex flex-col w-full items-center">
      <div className="mb-8 w-[100%]">
        <PairInput
          selectedPool={selectedPool}
          pools={pools}
          onSelect={(pool) => setSelectedPool(pool)}
        />
      </div>

      <div className="mb-8 w-[100%]">
        <AmountLP
          value={amountLP}
          onChange={(e) => setAmountLP(e.target.value)}
        />
        <Balance tokenBalance={lpTokenBalance} />
      </div>

      {neededApprove ? (
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
          disabled={!canRemove}
          onClick={onRemoveRequested}
          className={`${
            canRemove
              ? "bg-site-pink text-white"
              : "bg-site-dim2 text-site-dim2"
          } border-none outline-none px-6 py-2 font-poppins font-bold text-lg rounded-2xl leading-[24px] transition-all min-h-[56px] cursor-pointer`}
        >
          {isRemoving
            ? "Removing..."
            : hasEnoughLPToken
            ? "Remove Liquidity"
            : "Insufficient LP"}
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

export default RemoveLiquidityInput;
