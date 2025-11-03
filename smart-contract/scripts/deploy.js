const { ethers } = require("hardhat");

async function main() {
    // deploy 10 tokens
    const Token = await ethers.getContractFactory("ERC20Token");
    const tokens = [["MyUSDT", "USDT"], ["MyUSDC", "USDC"], ["MyDAI", "DAI"], ["MyWBTC", "WBTC"], ["MyLINK", "LINK"], ["MyMKR", "MKR"], ["MyUNI", "UNI"], ["MyCOMP", "COMP"], ["MyBAT", "BAT"], ["MyAMPL", "AMPL"],];
    for (let i = 0; i < tokens.length; i++) {
        const [name, symbol] = tokens[i];
        const token = await Token.deploy(name, symbol, ethers.parseEther("10000"));
        await token.waitForDeployment();
        //console.log(`${symbol}:`, token.target);
    }

    // address of deployed tokens - address of your wallet
    const [wallet] = await ethers.getSigners();
    //console.log("Wallet:", wallet.address);

    // deploy factory
    const Factory = await ethers.getContractFactory("UniswapV2Factory");
    const factory = await Factory.deploy(wallet.address);
    await factory.waitForDeployment();
    //console.log("Factory:", factory.target);

    // deploy WETH
    const WETH = await ethers.getContractFactory("WETH9");
    const weth = await WETH.deploy();
    await weth.waitForDeployment();
    //console.log("WETH:", weth.target);

    // deploy router
    const Router01 = await ethers.getContractFactory("UniswapV2Router01");
    const router01 = await Router01.deploy(factory.target, weth.target);
    await router01.waitForDeployment();
    //console.log("Router01:", router01.target);

    const Router02 = await ethers.getContractFactory("UniswapV2Router02");
    const router02 = await Router02.deploy(factory.target, weth.target);
    await router02.waitForDeployment();
    //console.log("Router02:", router02.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});