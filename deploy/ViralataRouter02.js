// const { WNATIVE } = require("@sushiswap/sdk");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const chainId = await getChainId();

  let wethAddress;

//   if (chainId === "31337") {
//     wethAddress = (await deployments.get("WETH9Mock")).address;
//   } else if (chainId in WNATIVE) {
//     wethAddress = WNATIVE[chainId].address;
//   } else {
//     throw Error("No WNATIVE!");
//   }

  if (chainId === "97") {
      wethAddress = "0xae13d989dac2f0debff460ac112a837c89baa7cd";
  } else if (chainId === "3") {
      wethAddress = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
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
module.exports.dependencies = ["ViralataSwapToken", "ViralataFactory"];