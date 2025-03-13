require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Ensure dotenv is required

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY], // Ensure your private key is here
    },
  },
};
