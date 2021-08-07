// const { WNATIVE } = require("@sushiswap/sdk");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy } = deployments;
  
    const { deployer, dev } = await getNamedAccounts();

    const auroAddress = (await deployments.get("ViralataSwapToken")).address;
  
    await deploy("AuroDistributor", {
      from: deployer,
      args: [auroAddress, "60000000000000000000"],
      log: true,
      deterministicDeployment: false,
    });
  };
  
  module.exports.tags = ["AuroDistributor", "Farming"];
  module.exports.dependencies = ["ViralataSwapToken"];