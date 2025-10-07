import { Sepolia } from "@usedapp/core";

export const ROUTER_ADDRESS = '0x1AEd4e3238A34BAfDA2067188Fac957C0B7D51Ea';

export const DAPP_CONFIG = {
    readOnlyChainId: Sepolia.chainId,
    readOnlyUrls: {
        [Sepolia.chainId]: 'https://eth-sepolia.g.alchemy.com/v2/aDW4s8ejPUihC6IBD2Ovm',
    },
};