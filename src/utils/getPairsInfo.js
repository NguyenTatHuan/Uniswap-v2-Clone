import { formatUnits } from 'ethers/lib/utils';
import abis from '../abis/abis';

export const getPairsInfo = async (pairAddresses, web3) => {
    const pairsInfo = [];
    const pairABI = abis.pair;
    const tokenABI = abis.erc20;

    for (let i = 0; i < pairAddresses.length; i++) {
        const pairAddress = pairAddresses[i];
        const pair = new web3.eth.Contract(pairABI, pairAddress);

        const token0Address = await pair.methods.token0().call();
        const token1Address = await pair.methods.token1().call();

        const token0Contract = new web3.eth.Contract(tokenABI, token0Address);
        const token1Contract = new web3.eth.Contract(tokenABI, token1Address);

        const token0Name = await token0Contract.methods.name().call();
        const token1Name = await token1Contract.methods.name().call();

        const token0Symbol = await token0Contract.methods.symbol().call();
        const token1Symbol = await token1Contract.methods.symbol().call();

        const reserves = await pair.methods.getReserves().call();
        const reserve0BigNumber = reserves._reserve0;
        const reserve1BigNumber = reserves._reserve1;
        const reserve0 = parseFloat(formatUnits(reserve0BigNumber, 18));
        const reserve1 = parseFloat(formatUnits(reserve1BigNumber, 18));
        const price = reserve1 / reserve0;

        const totalSupplyBigNumber = await pair.methods.totalSupply().call();
        const totalSupply = parseFloat(formatUnits(totalSupplyBigNumber, 18));

        pairsInfo.push({
            address: pairAddress,
            token0Address,
            token1Address,
            token0Name,
            token1Name,
            token0Symbol,
            token1Symbol,
            reserve0,
            reserve1,
            price,
            totalSupply
        })
    }

    return pairsInfo;
}