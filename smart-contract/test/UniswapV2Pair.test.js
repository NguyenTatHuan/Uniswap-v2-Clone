const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("UniswapV2Pair", function () {
    let Token, token0, token1;
    let Factory, factory;
    let pair;
    let wallet, other;

    const MINIMUM_LIQUIDITY = 1000n;
    const INITIAL_SUPPLY = ethers.parseEther("1000000");

    beforeEach(async function () {
        [wallet, other] = await ethers.getSigners();

        // Deploy ERC20 tokens
        Token = await ethers.getContractFactory("ERC20");
        token0 = await Token.deploy(INITIAL_SUPPLY);
        await token0.waitForDeployment();
        token1 = await Token.deploy(INITIAL_SUPPLY);
        await token1.waitForDeployment();

        // Deploy Factory
        Factory = await ethers.getContractFactory("UniswapV2Factory");
        factory = await Factory.deploy(wallet.address);
        await factory.waitForDeployment();

        await factory.createPair(token0.target, token1.target);

        const pairAddress = await factory.getPair(token0.target, token1.target);
        pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
    })

    it('mint', async () => {
        const token0Amount = ethers.parseEther("1000");
        const token1Amount = ethers.parseEther("4000");

        await token0.transfer(pair.target, token0Amount)
        await token1.transfer(pair.target, token1Amount)

        const expectedLiquidity = ethers.parseEther("2000");

        await expect(pair.mint(wallet.address))
            .to.emit(pair, 'Transfer')
            .withArgs(ethers.ZeroAddress, ethers.ZeroAddress, MINIMUM_LIQUIDITY)
            .to.emit(pair, 'Transfer')
            .withArgs(ethers.ZeroAddress, wallet.address, expectedLiquidity - MINIMUM_LIQUIDITY)
            .to.emit(pair, 'Sync')
            .withArgs(token0Amount, token1Amount)
            .to.emit(pair, 'Mint')
            .withArgs(wallet.address, token0Amount, token1Amount)

        expect(await pair.totalSupply()).to.equal(expectedLiquidity)
        expect(await pair.balanceOf(wallet.address)).to.equal(expectedLiquidity - MINIMUM_LIQUIDITY)
        expect(await token0.balanceOf(pair.target)).to.equal(token0Amount)
        expect(await token1.balanceOf(pair.target)).to.equal(token1Amount)
        const reserves = await pair.getReserves()
        expect(reserves[0]).to.equal(token0Amount)
        expect(reserves[1]).to.equal(token1Amount)
    })

    async function addLiquidity(token0Amount, token1Amount) {
        await token0.transfer(pair.target, token0Amount);
        await token1.transfer(pair.target, token1Amount);
        await pair.mint(wallet.address);
    }

    it('burn', async () => {
        const token0Amount = ethers.parseEther("3000")
        const token1Amount = ethers.parseEther("3000")
        await addLiquidity(token0Amount, token1Amount)

        const expectedLiquidity = ethers.parseEther("3000")
        await pair.transfer(pair.target, expectedLiquidity - MINIMUM_LIQUIDITY)
        await expect(pair.burn(wallet.address))
            .to.emit(pair, 'Transfer')
            .withArgs(pair.target, ethers.ZeroAddress, expectedLiquidity - MINIMUM_LIQUIDITY)
            .to.emit(token0, 'Transfer')
            .withArgs(pair.target, wallet.address, token0Amount - 1000n)
            .to.emit(token1, 'Transfer')
            .withArgs(pair.target, wallet.address, token1Amount - 1000n)
            .to.emit(pair, 'Sync')
            .withArgs(1000n, 1000n)
            .to.emit(pair, 'Burn')
            .withArgs(wallet.address, token0Amount - 1000n, token1Amount - 1000n, wallet.address)

        expect(await pair.balanceOf(wallet.address)).to.equal(0)
        expect(await pair.totalSupply()).to.equal(MINIMUM_LIQUIDITY)
        expect(await token0.balanceOf(pair.target)).to.equal(1000n)
        expect(await token1.balanceOf(pair.target)).to.equal(1000n)
        const totalSupplyToken0 = await token0.totalSupply()
        const totalSupplyToken1 = await token1.totalSupply()
        expect(await token0.balanceOf(wallet.address)).to.equal(totalSupplyToken0 - 1000n)
        expect(await token1.balanceOf(wallet.address)).to.equal(totalSupplyToken1 - 1000n)
    })
})
