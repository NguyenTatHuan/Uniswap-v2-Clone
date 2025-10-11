import { Sepolia } from "@usedapp/core";

export const ROUTER_ADDRESS = '0x3381bA7bCF3F34081d607500A772852570900C3F';

export const DAPP_CONFIG = {
    readOnlyChainId: Sepolia.chainId,
    readOnlyUrls: {
        [Sepolia.chainId]: 'https://eth-sepolia.g.alchemy.com/v2/aDW4s8ejPUihC6IBD2Ovm',
    },
};