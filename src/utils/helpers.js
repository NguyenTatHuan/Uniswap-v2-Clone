import { useCall } from "@usedapp/core";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { useEffect } from "react"
import abis from "../abis/abis";
import { ROUTER_ADDRESS } from "../config/config";

export const getAvailableTokens = (pools) =>
    pools.reduce((prev, curr) => {
        prev[curr.token0Address] = curr.token0Symbol;
        prev[curr.token1Address] = curr.token1Symbol;
        return prev;
    }, {});

export const getCounterpartTokens = (pools, fromToken) => pools
    .filter((cur) => cur.token0Address === fromToken || cur.token1Address)
    .reduce((prev, curr) => {
        if (curr.token0Address === fromToken) {
            prev[curr.token1Address] = curr.token1Symbol;
        } else if (curr.token1Address === fromToken) {
            prev[curr.token0Address] = curr.token0Symbol;
        }
        return prev;
    }, {});

export const findPoolByTokens = (pools, fromToken, toToken) => {
    if (!Array.isArray(pools) || !fromToken || !toToken) return undefined;

    return pools.find((cur) =>
        (cur.token0Address === fromToken && cur.token1Address === toToken) ||
        (cur.token1Address === fromToken && cur.token0Address === toToken)
    );
};

export const isOperationPending = (operationState) => operationState.status === "PendingSignature" || operationState.status === "Mining";
export const isOperationFailed = (operationState) => operationState.status === "Fail" || operationState.status === "Exception";
export const isOperationSucceeded = (operationState) => operationState.status === "Success";

export const getFailureMessage = (...states) => {
    if (states.some((state) => isOperationPending(state))) return undefined;

    const failedState = states.find((state) => isOperationFailed(state));

    if (failedState) {
        return `${failedState.transactionName || "Transaction"} failed - ${failedState.errorMessage || ""}`;
    }

    return undefined;
};

export const getSuccessMessage = (...states) => {
    if (states.some((state) => isOperationPending(state))) return undefined;

    const succeededState = [...states].reverse().find((state) => isOperationSucceeded(state));

    if (succeededState) {
        return `${succeededState.transactionName || "Transaction"} executed successfully`;
    }

    return undefined;
};

export const useAmountsOut = (pairAddress, amountIn, fromToken, toToken) => {
    const isValidAmountIn = amountIn.gt(parseUnits("0"));
    const areParamsValid = !!(pairAddress && isValidAmountIn && fromToken && toToken);

    const { error, value } =
        useCall(
            areParamsValid && {
                contract: new Contract(ROUTER_ADDRESS, abis.router01),
                method: "getAmountsOut",
                args: [amountIn, [fromToken, toToken]],
            }
        ) ?? {};
    return error ? parseUnits("0", 18) : value?.[0]?.[1];
}

export const useOnClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) return;
            handler(event);
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler])
}

export const useAmount1 = (pairAddress, amount0, token0, token1) => {
    const isValidAmount0 = amount0.gt(parseUnits("0"));
    const areParamsValid = !!(pairAddress && isValidAmount0 && token0 && token1);

    const { value, error } =
        useCall(
            areParamsValid && {
                contract: new Contract(pairAddress, abis.pair),
                method: "getReserves",
                args: [],
            }
        ) ?? {};

    if (error || !value) return parseUnits("0");

    let [reserve0, reserve1] = value;
    if (token0.toLowerCase() > token1.toLowerCase()) [reserve0, reserve1] = [reserve1, reserve0]; // ensure reverse0 is always for token0
    if (reserve0.isZero()) return parseUnits("0");
    const amount1 = amount0.mul(reserve1).div(reserve0);
    return amount1;
}