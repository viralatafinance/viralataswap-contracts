const { WNATIVE } = require("@viralatafinance/viralataswap-sdk");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const chainId = await getChainId();

  let wethAddress;

  if (chainId === "31337") {
    wethAddress = (await deployments.get("WETH9Mock")).address;
  } else if (chainId in WNATIVE) {
    wethAddress = WNATIVE[chainId].address;
  } else {
    throw Error("No WNATIVE!");
  }

  const factoryAddress = (await deployments.get("ViralataFactory")).address;

  await deploy("ViralataRouter02", {
    from: deployer,
    args: [factoryAddress, wethAddress],
    log: true,
    deterministicDeployment: false,
  });
};

module.exports.tags = ["ViralataRouter02", "AMM"];
module.exports.dependencies = ["ViralataFactory"];