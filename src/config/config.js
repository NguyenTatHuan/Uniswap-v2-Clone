import { Sepolia } from "@usedapp/core";

export const ROUTER_ADDRESS = '0xf3A2B698D7c3e421579e40C34eDbB9CF1092a824';

export const DAPP_CONFIG = {
    readOnlyChainId: Sepolia.chainId,
    readOnlyUrls: {
        [Sepolia.chainId]: 'https://eth-sepolia.g.alchemy.com/v2/aDW4s8ejPUihC6IBD2Ovm',
    },
};