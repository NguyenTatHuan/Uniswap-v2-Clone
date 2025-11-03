const { ethers } = require("hardhat");
const { expect } = require("chai");
const { getCreate2Address } = require("./shared/utilities");

describe("UniswapV2Factory", function () {
    let Factory, factory;
    let Token, token0, token1;
    let wallet, other;

    beforeEach(async function () {
        [wallet, other] = await ethers.getSigners();

        Factory = await ethers.getContractFactory("UniswapV2Factory");
        factory = await Factory.deploy(wallet.address);
        await factory.waitForDeployment();

        Token = await ethers.getContractFactory("ERC20");
        token0 = await Token.deploy(ethers.parseEther("1000000"));
        await token0.waitForDeployment();

        token1 = await Token.deploy(ethers.parseEther("1000000"));
        await token1.waitForDeployment();
    })

    it('feeTo, feeToSetter, allPairsLength', async () => {
        expect(await factory.feeTo()).to.equal(ethers.ZeroAddress);
        expect(await factory.feeToSetter()).to.equal(wallet.address);
        expect(await factory.allPairsLength()).to.equal(0);
    })

    async function createPair([tokenA, tokenB]) {
        const bytecode = (await ethers.getContractFactory("UniswapV2Pair")).bytecode;
        const create2Address = getCreate2Address(factory.target, [tokenA, tokenB], bytecode);
        await expect(factory.createPair(tokenA, tokenB))
            .to.emit(factory, 'PairCreated')
            .withArgs(
                tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenA : tokenB,
                tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenB : tokenA,
                create2Address,
                1
            );

        await expect(factory.createPair(tokenA, tokenB)).to.be.revertedWith("UniswapV2: PAIR_EXISTS");
        await expect(factory.createPair(tokenB, tokenA)).to.be.revertedWith("UniswapV2: PAIR_EXISTS");

        expect(await factory.getPair(tokenA, tokenB)).to.equal(create2Address);
        expect(await factory.getPair(tokenB, tokenA)).to.equal(create2Address);
        expect(await factory.allPairs(0)).to.equal(create2Address);
        expect(await factory.allPairsLength()).to.equal(1);

        const pair = await ethers.getContractAt("UniswapV2Pair", create2Address);
        expect(await pair.factory()).to.equal(factory.target);
        expect(await pair.token0()).to.equal(tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenA : tokenB);
        expect(await pair.token1()).to.equal(tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenB : tokenA);
    }

    it('createPair', async () => {
        await createPair([token0.target, token1.target]);
    })

    it('createPair:reverse', async () => {
        await createPair([token1.target, token0.target]);
    })

    it('createPair:gas', async () => {
        const tx = await factory.createPair(token0.target, token1.target);
        const receipt = await tx.wait();
        expect(receipt.gasUsed).to.equal(3557961n);
    });

    it('setFeeTo', async () => {
        await expect(factory.connect(other).setFeeTo(other.address)).to.be.revertedWith('UniswapV2: FORBIDDEN');
        await factory.setFeeTo(wallet.address);
        expect(await factory.feeTo()).to.equal(wallet.address);
    });

    it('setFeeToSetter', async () => {
        await expect(factory.connect(other).setFeeToSetter(other.address)).to.be.revertedWith('UniswapV2: FORBIDDEN');
        await factory.setFeeToSetter(other.address);
        expect(await factory.feeToSetter()).to.equal(other.address);
        await expect(factory.setFeeToSetter(wallet.address)).to.be.revertedWith('UniswapV2: FORBIDDEN');
    });
});
