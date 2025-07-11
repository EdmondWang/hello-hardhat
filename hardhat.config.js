require('@nomicfoundation/hardhat-toolbox');
require('@chainlink/env-enc').config();

const { META_MASK_PRIVATE_KEY, SEPOLIA_URL, ETHERSCAN_API_TOKEN } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'hardhat', // could change to sepolia
  solidity: '0.8.28',
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [META_MASK_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_TOKEN,
  },
};
