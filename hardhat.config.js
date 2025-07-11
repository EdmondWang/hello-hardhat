require('@nomicfoundation/hardhat-toolbox');
require('@chainlink/env-enc').config();
require('./tasks');

const { PRIVATE_KEY_1, PRIVATE_KEY_2, SEPOLIA_URL, ETHERSCAN_API_TOKEN } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'hardhat', // could change to sepolia
  solidity: '0.8.28',
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY_1, PRIVATE_KEY_2],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_TOKEN,
    },
  },
};
