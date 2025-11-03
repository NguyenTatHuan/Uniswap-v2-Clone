# 🦄 Uniswap V2 Clone

Professional, well-documented implementation of a Uniswap V2–style Automated Market Maker (AMM). This repository is intended for learning, experimentation, and local testing of core DEX concepts: factory/pair architecture, constant-product swaps, liquidity provision, and router logic.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Repository Structure](#repository-structure)
* [Requirements](#requirements)
* [Quick Start](#quick-start)
* [Local Development & Tasks](#local-development--tasks)

  * [Install dependencies](#install-dependencies)
  * [Compile contracts](#compile-contracts)
  * [Run tests](#run-tests)
  * [Run a local node](#run-a-local-node)
  * [Deploy to network (example: Sepolia)](#deploy-to-network-example-sepolia)
* [Usage Examples](#usage-examples)
* [Contract Summary & Design](#contract-summary--design)
* [Security Considerations & Caveats](#security-considerations--caveats)
* [Testing & Auditing](#testing--auditing)
* [Contributing](#contributing)
* [License](#license)
* [Author & Contact](#author--contact)
* [Acknowledgements & References](#acknowledgements--references)

---

## Project Overview

This repository reproduces the main components of **Uniswap V2** — a constant-product automated market maker (AMM) — for educational and experimental use. It implements the factory/pair/router pattern that enables creating token pairs, adding/removing liquidity, and swapping tokens.

> **Important**: This project is for learning and research. It is **not** audited for production use and should **never** be used with real funds without a professional audit.

---

## Features

* Factory contract to create and manage token pairs
* Pair contract implementing constant-product (x * y = k) AMM logic
* Router contract for convenient swaps and liquidity operations
* ERC-20 helper tokens (for testing) and utilities
* Unit tests for core flows (mint/burn/swap)
* Deployment scripts for local and test networks

---

## Tech Stack

* **Solidity** `^0.8.x` — Smart contracts
* **Hardhat** — Build, test, scripts (adaptable to Truffle/Foundry if preferred)
* **Ethers.js** — Scripts & interactions
* **Node.js / npm** — Tooling
* **OpenZeppelin** — ERC-20 reference implementations for safe tokens (optional)

---

## Repository Structure

```
contracts/
  ├─ interfaces/          # External/internal interfaces
  ├─ libraries/           # Math and helper libraries (e.g., SafeMath-like utils)
  ├─ test/                # Test ERC20 tokens
  └─ core-contracts/      # Factory, Pair, Router contracts

scripts/
  └─ deploy.js            # Example deployment script

test/
  └─ *.test.js            # Unit tests

hardhat.config.js
package.json
README.md
LICENSE
```

---

## Requirements

* Node.js >= 18 (or LTS)
* npm >= 8
* Git
* An RPC provider (e.g., Alchemy, Infura) for testnet/mainnet deployments

---

## Quick Start

1. **Clone repository**

```bash
git clone https://github.com/NguyenTatHuan/Uniswap-v2-Clone.git
cd Uniswap-v2-Clone
```

2. **Install dependencies**

```bash
npm install
```

3. **Compile contracts**

```bash
npx hardhat compile
```

4. **Run tests**

```bash
npx hardhat test
```

---

## Local Development & Tasks

### Install dependencies

```bash
npm ci
```

### Compile contracts

```bash
npx hardhat compile
```

### Run tests

```bash
npx hardhat test
```

### Run a local Hardhat node (recommended for manual testing)

```bash
npx hardhat node
```

Then in another terminal you can deploy to local network:

```bash
npx hardhat run --network localhost scripts/deploy.js
```

### Deploy to network (example: Sepolia)

1. Create a `.env` file in the repository root and add the following keys (example):

```env
# .env
RPC_URL_SEPOLIA="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
PRIVATE_KEY="0xYOUR_PRIVATE_KEY"
ETHERSCAN_API_KEY="your-etherscan-key"   # Optional: for verification
```

> Keep your private key secure. **Never** commit `.env` or private keys to source control.

2. Example deploy command (Hardhat):

```bash
npx hardhat run --network sepolia scripts/deploy.js
```

3. Verify contracts (if using Etherscan / block explorer API):

```bash
npx hardhat verify --network sepolia <DEPLOYED_ADDRESS> "Constructor arg 1" "Constructor arg 2"
```

---

## Usage Examples

After deployment you can interact with the contracts via:

* **Hardhat scripts** (`scripts/` folder)
* **Etherscan (Read/Write Contract)** if the contract is verified
* A minimal front-end using Ethers.js or Web3.js to call `router.swapExactTokensForTokens`, `factory.createPair`, `pair.mint`, etc.

Example: swap flow (high-level)

1. Approve router to spend token A
2. Call `router.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline)`

---

## Contract Summary & Design

* **Factory**: creates `Pair` contracts and keeps a registry of all pairs. Responsible for deterministic pair addressing (CREATE2) in Uniswap V2.
* **Pair**: ERC-20 LP token + core AMM logic. Manages reserves, mint/burn, and the `swap` function. Implements price accumulators for oracles.
* **Router**: convenience layer — handles path routing, token approvals, and multi-call flows.

Key design choices:

* Use `unchecked` arithmetic where safe and Solidity 0.8 overflow checks are undesirable for gas.
* Follow Uniswap V2 semantics for fee-on-transfer handling if implemented.

---

## Security Considerations & Caveats

* **NOT AUDITED** — Do not use with real funds.
* Re-entrancy protections should be in place where applicable.
* Carefully review `transfer`/`transferFrom` assumptions (fee-on-transfer tokens may break naive logic).
* Consider adding pause, admin, and emergency withdraw functions for experimental deployments.
* Use OpenZeppelin libraries for battle-tested ERC-20 behavior where possible.

---

## Testing & Auditing

* Write unit tests that cover core flows: pair creation, adding/removing liquidity, swaps with edge cases (zero reserves, small amounts, fee math), and price accumulators.
* Use property-based testing to stress arithmetic invariants (e.g., constant product never decreases improperly).
* Run static analysis tools: Slither, MythX, or other security scanners.

---

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/some-feature`
3. Add tests for new behavior
4. Open a Pull Request with a clear description and test results

Please follow secure coding practices and document design decisions.

---

## License

This project is released under the **MIT License**. See the `LICENSE` file for details.

---

## Author & Contact

**Nguyen Tat Huan** — GitHub: `@NguyenTatHuan`

If you want me to add:

* a sample frontend (React + Ethers.js) README section
* step-by-step deployment scripts for specific networks (Sepolia, Goerli, etc.)
* a CI workflow (GitHub Actions) for tests and contract verification

tell me and I will include them.

---

## Acknowledgements & References

* This repository is inspired by and educationally based on the Uniswap V2 whitepaper and reference implementation.
* Useful references: Uniswap V2 codebase, OpenZeppelin contracts, Hardhat docs.
