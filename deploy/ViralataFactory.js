// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash
// const {
//     bytecode,
//     abi,
//   } = require("../deployments/ropsten/ViralataFactory.json");
  
  module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
  }) {
    const { deploy } = deployments;
  
    const { deployer, dev } = await getNamedAccounts();
  
    const Factory = await ethers.getContractFactory("ViralataFactory")

    const factory = await Factory.attach("0x1421bDe4B10e8dd459b3BCb598810B1337D56842")
  };
  
  module.exports.tags = ["ViralataFactory", "AMM"];