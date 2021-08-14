// const { WNATIVE } = require("@sushiswap/sdk");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy } = deployments;
  
    const { deployer } = await getNamedAccounts();
  
    await deploy("ViralataSwapToken", {
      from: deployer,
      args: ['0xA58B6fC9264ce507d0B0B477ceE31674341CB27e'], //BSC TRUSTED FORWARDER
      log: true,
      deterministicDeployment: false,
    });
  };
  
  module.exports.tags = ["ViralataSwapToken", "ERC20"];