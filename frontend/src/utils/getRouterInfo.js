import abis from '../abis/abis';

export const getRouterInfo = async (routerAddress, web3) => {
    const router = new web3.eth.Contract(abis.router01, routerAddress);

    return {
        factory: await router.methods.factory().call(),
    }
}