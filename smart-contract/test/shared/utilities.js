const { keccak256, toUtf8Bytes, AbiCoder, getAddress, solidityPacked } = require("ethers");

const PERMIT_TYPEHASH = keccak256(
    toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
)

async function getDomainSeparator(name, tokenAddress, provider) {
    const abiCoder = new AbiCoder();
    const { chainId } = await provider.getNetwork();
    return keccak256(
        abiCoder.encode(
            ["bytes32", "bytes32", "bytes32", "uint256", "address"],
            [
                keccak256(toUtf8Bytes("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")),
                keccak256(toUtf8Bytes(name)),
                keccak256(toUtf8Bytes("1")),
                chainId,
                tokenAddress
            ]
        )
    );
}

function getCreate2Address(factoryAddress, [tokenA, tokenB], bytecode) {
    const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
    const create2Inputs = [
        '0xff',
        factoryAddress,
        keccak256(solidityPacked(['address', 'address'], [token0, token1])),
        keccak256(bytecode)
    ];
    const sanitizedInputs = '0x' + create2Inputs.map(i => i.slice(2)).join('');
    return getAddress('0x' + keccak256(sanitizedInputs).slice(-40));
}

module.exports = {
    PERMIT_TYPEHASH,
    getDomainSeparator,
    getCreate2Address
}