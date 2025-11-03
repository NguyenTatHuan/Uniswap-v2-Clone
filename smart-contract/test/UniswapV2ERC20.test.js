const { ethers } = require("hardhat");
const { expect } = require("chai");
const { PERMIT_TYPEHASH, getDomainSeparator } = require("./shared/utilities");

describe("UniswapV2ERC20", function () {
    let wallet, token, other;
    const TOTAL_SUPPLY = ethers.parseEther("10000");
    const TEST_AMOUNT = ethers.parseEther("10");

    beforeEach(async function () {
        [wallet, other] = await ethers.getSigners();
        const ERC20Factory = await ethers.getContractFactory("ERC20");
        token = await ERC20Factory.deploy(TOTAL_SUPPLY);
        await token.waitForDeployment();
    });

    it("name, symbol, decimals, totalSupply, balanceOf, DOMAIN_SEPARATOR, PERMIT_TYPEHASH", async function () {
        expect(await token.name()).to.equal("Uniswap V2");
        expect(await token.symbol()).to.equal("UNI-V2");
        expect(await token.decimals()).to.equal(18n);
        expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY);
        expect(await token.balanceOf(wallet.address)).to.equal(TOTAL_SUPPLY);
        expect(await token.DOMAIN_SEPARATOR()).to.equal(await getDomainSeparator(await token.name(), await token.getAddress(), ethers.provider))
        expect(await token.PERMIT_TYPEHASH()).to.equal(PERMIT_TYPEHASH)
    });

    it('approve', async () => {
        await expect(token.approve(other.address, TEST_AMOUNT))
            .to.emit(token, 'Approval')
            .withArgs(wallet.address, other.address, TEST_AMOUNT)
        expect(await token.allowance(wallet.address, other.address)).to.equal(TEST_AMOUNT)
    })

    it('transfer', async () => {
        await expect(token.transfer(other.address, TEST_AMOUNT))
            .to.emit(token, 'Transfer')
            .withArgs(wallet.address, other.address, TEST_AMOUNT)
        expect(await token.balanceOf(wallet.address)).to.equal(TOTAL_SUPPLY - TEST_AMOUNT)
        expect(await token.balanceOf(other.address)).to.equal(TEST_AMOUNT)
    })

    it('transfer:fail', async () => {
        await expect(token.transfer(other.address, TOTAL_SUPPLY + 1n)).to.be.reverted
        await expect(token.connect(other).transfer(wallet.address, 1)).to.be.reverted
    })

    it('transferFrom', async () => {
        await token.approve(other.address, TEST_AMOUNT)
        await expect(token.connect(other).transferFrom(wallet.address, other.address, TEST_AMOUNT))
            .to.emit(token, 'Transfer')
            .withArgs(wallet.address, other.address, TEST_AMOUNT)
        expect(await token.allowance(wallet.address, other.address)).to.equal(0)
        expect(await token.balanceOf(wallet.address)).to.equal(TOTAL_SUPPLY - TEST_AMOUNT)
        expect(await token.balanceOf(other.address)).to.equal(TEST_AMOUNT)
    })

    it('transferFrom:max', async () => {
        await token.approve(other.address, ethers.MaxUint256)
        await expect(token.connect(other).transferFrom(wallet.address, other.address, TEST_AMOUNT))
            .to.emit(token, 'Transfer')
            .withArgs(wallet.address, other.address, TEST_AMOUNT)
        expect(await token.allowance(wallet.address, other.address)).to.equal(ethers.MaxUint256)
        expect(await token.balanceOf(wallet.address)).to.equal(TOTAL_SUPPLY - TEST_AMOUNT)
        expect(await token.balanceOf(other.address)).to.equal(TEST_AMOUNT)
    })

    it('permit', async () => {
        const { v, r, s } = ethers.Signature.from(await wallet.signTypedData(
            {
                name: await token.name(),
                version: '1',
                chainId: (await ethers.provider.getNetwork()).chainId,
                verifyingContract: await token.getAddress()
            },
            {
                Permit: [
                    { name: 'owner', type: 'address' },
                    { name: 'spender', type: 'address' },
                    { name: 'value', type: 'uint256' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'deadline', type: 'uint256' }
                ]
            },
            {
                owner: wallet.address,
                spender: other.address,
                value: TEST_AMOUNT,
                nonce: await token.nonces(wallet.address),
                deadline: ethers.MaxUint256
            }
        ));

        await expect(token.permit(wallet.address, other.address, TEST_AMOUNT, ethers.MaxUint256, v, r, s))
            .to.emit(token, 'Approval')
            .withArgs(wallet.address, other.address, TEST_AMOUNT)
        expect(await token.allowance(wallet.address, other.address)).to.equal(TEST_AMOUNT)
        expect(await token.nonces(wallet.address)).to.equal(1n)
    })
});
