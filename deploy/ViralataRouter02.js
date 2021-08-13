const { WNATIVE } = require("@viralatafinance/viralataswap-sdk");
const { ethers } = require("hardhat");

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

  const Router = await ethers.getContractFactory("ViralataRouter02")

  const router = await Router.attach("0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac");
};

module.exports.tags = ["ViralataRouter02", "AMM"];
module.exports.dependencies = ["ViralataFactory"];