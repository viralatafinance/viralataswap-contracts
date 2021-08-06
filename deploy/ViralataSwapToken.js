// const { WNATIVE } = require("@sushiswap/sdk");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy } = deployments;
  
    const { deployer, dev } = await getNamedAccounts();
  
    await deploy("ViralataSwapToken", {
      from: deployer,
      args: [dev],
      log: true,
      deterministicDeployment: false,
    });
  };
  
  module.exports.tags = ["ViralataSwapToken", "ERC20"];