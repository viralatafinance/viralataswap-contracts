const { task } = require("hardhat/config")

const { ethers: { constants: { MaxUint256 }}, ethers} = require("ethers")

task("accounts", "Prints the list of accounts", require("./accounts"))
task("gas-price", "Prints gas price").setAction(async function({ address }, { ethers }) {
  console.log("Gas price", (await ethers.provider.getGasPrice()).toString())
})

task("bytecode", "Prints bytecode").setAction(async function({ address }, { ethers }) {
  console.log("Bytecode", await ethers.provider.getCode(address))
})

task("feeder:feed", "Feed")
.setAction(async function({ feedDev }, { getNamedAccounts, ethers: { BigNumber }, getChainId }) {
  const { deployer, dev } = await getNamedAccounts()

  const feeder = new ethers.Wallet(process.env.FEEDER_PRIVATE_KEY, ethers.provider)

  await (await feeder.sendTransaction({
    to: deployer,
    value: BigNumber.from(1).mul(BigNumber.from(10).pow(18))
  })).wait();
})

task("feeder:return", "Return funds to feeder").setAction(async function({ address }, { ethers: { getNamedSigners } }) {
  const { deployer, dev } = await getNamedSigners()

  await (await deployer.sendTransaction({
    to: process.env.FEEDER_PUBLIC_KEY,
    value: await deployer.getBalance()
  })).wait();

  await (await dev.sendTransaction({
    to: process.env.FEEDER_PUBLIC_KEY,
    value: await dev.getBalance()
  })).wait();
})

task("erc20:approve", "ERC20 approve")
.addParam("token", "Token")
.addParam("spender", "Spender")
.addOptionalParam("deadline", MaxUint256)
.setAction(async function ({ token, spender, deadline }, { ethers: { getNamedSigner } }, runSuper) {
  const erc20 = await ethers.getContractFactory("ViralataERC20")
  
  const slp = erc20.attach(token)   
  
  await (await slp.connect(await getNamedSigner("deployer")).approve(spender, deadline)).wait()    
});

task("factory:set-fee-to", "Factory: set feeTo")
.addParam("feeto", "Fee To")
.setAction(async function ({ feeto }, { ethers: { getNamedSigner, getContract } }, runSuper) {
  const factory = await getContract("ViralataFactory")
  console.log(`Setting factory feeTo to ${feeto} address`)
  await (await factory.connect(await getNamedSigner("deployer")).setFeeTo(feeto)).wait() 
});

task("factory:set-auro-address", "Factory: set AURO address")
.addParam("auro", "AURO token address")
.setAction(async function ({ auro }, { ethers: { getNamedSigner, getContract } }, runSuper) {
  const factory = await getContract("ViralataFactory")
  console.log(`Setting factory AURO address to ${auro}`)
  await (await factory.connect(await getNamedSigner("deployer")).setAuroAddress(auro)).wait()
});

task("factory:create-auro-busd-pair", "Factory: create AURO-BUSD pair")
.addParam("busd", "BUSD token address")
.addParam("auro", "AURO token address")
.setAction(async function ({ busd, auro }, { ethers: { getNamedSigner, getContract } }, runSuper) {
  const factory = await getContract("ViralataFactory")
  console.log(`Creating AURO-BUSD LP pair. BUSD: ${busd} , AURO: ${auro}`)
  await (await factory.connect(await getNamedSigner("deployer")).createPair(auro, busd)).wait()
});

task("factory:create-auro-reau-pair", "Factory: create REAU-AURO pair")
.addParam("auro", "AURO token address")
.setAction(async function ({ auro }, { ethers: { getNamedSigner, getContract } }, runSuper) {
  const factory = await getContract("ViralataFactory")
  const reau = "0x4c79b8c9cB0BD62B047880603a9DEcf36dE28344";
  console.log(`Creating REAU-AURO LP pair. AURO: ${auro} , REAU: ${reau}`)
  await (await factory.connect(await getNamedSigner("deployer")).createPair(reau, auro)).wait()
});

// Farm

task("farm:setup", "AuroDistributor: setup")
.addParam("devaddress", "Developer address")
.addParam("feeaddress", "Address to collect deposit fees")
.setAction(async function ({ devaddress, feeaddress }, { ethers: { getNamedSigner, getContract } }, runSuper) {
  const farm = await getContract("AuroDistributor")
  const auro = await getContract("ViralataSwapToken")
  const connectedFarm = await farm.connect(await getNamedSigner("deployer"));

  console.log(`Setting devAddress to ${devaddress}`);
  await (await connectedFarm.setDevAddress(devaddress)).wait();

  console.log(`Setting feeAddress to ${feeaddress}`);
  await (await connectedFarm.setFeeAddress(feeaddress)).wait();

  console.log(`Giving minter role to farm.`)
  const auroAddress = await (await connectedFarm.auro()).wait();
  const auroContract = await (await auro.attach(auroAddress)).wait();
  const minterRole = await (await auroContract.MINTER_ROLE).wait();
  await (await auroContract.grantRole(minterRole, connectedFarm.address)).wait();
});

task("farm:add-farms", "AuroDistributor: create default farms")
.addParam("auro", "AURO token address")
.addParam("auroreaulp", "AURO/REAU LP token address")
.addParam("aurobnblp", "AURO/BNB LP token address")
.addParam("aurobusdlp", "AURO/BUSD LP token address")
.addParam("reaubusdlp", "REAU/BUSD LP token address")
.setAction(async function ({ auro, auroreaulp, aurobnblp, aurobusdlp, reaubusdlp }, { ethers: { getNamedSigner, getContract } }, runSuper) {
  const farm = await getContract("AuroDistributor")
  const reau = "0x4c79b8c9cB0BD62B047880603a9DEcf36dE28344";

  const connectedFarm = await farm.connect(await getNamedSigner("deployer"));

  console.log(`Creating AURO pool.`)
  await (await connectedFarm.add("165", auro, "0", "15", false)).wait()

  console.log("Creating REAU pool.")
  await (await connectedFarm.add("165", reau, "0", "15", false)).wait()

  console.log("Creating AURO/BNB pool.")
  await (await connectedFarm.add("134", aurobnblp, "0", "15", false)).wait()

  console.log("Creating AURO/BUSD pool.")
  await (await connectedFarm.add("336", aurobusdlp, "0", "15", false)).wait()

  console.log("Creating REAU/AURO pool.")
  await (await connectedFarm.add("100", auroreaulp, "0", "15", false)).wait()

  console.log("Creating REAU/BUSD pool.")
  await (await connectedFarm.add("100", reaubusdlp, "0", "15", false)).wait()
});

task("farm:start", "AuroDistributor: start farming")
.setAction(async function ({}, { ethers: { getNamedSigner, getContract } }, runSuper ) {
  const farm = await getContract("AuroDistributor")
  console.log("Starting farms");
  await (await farm.connect(await getNamedSigner("deployer")).startFarming()).wait()
});

// TODO: Swap?

// TODO: Test
task("router:add-liquidity", "Router add liquidity")
.addParam("tokena", "Token A")
.addParam("tokenb", "Token B")
.addParam("tokenadesired", "Token A Desired")
.addParam("tokenbdesired", "Token B Desired")
.addParam("tokenaminimum", "Token A Minimum")
.addParam("tokenbminimum", "Token B Minimum")
.addParam("to", "To")
.addOptionalParam("deadline", MaxUint256)
.setAction(async function ({ tokena, tokenb, tokenadesired, tokenbdesired, tokenaminimum, tokenbminimum, to, deadline }, { ethers: { getNamedSigner, getContract } }, runSuper) {
  const router = await getContract("ViralataRouter02")
  await run("erc20:approve", { token: tokena, spender: router.address })
  await run("erc20:approve", { token: tokenb, spender: router.address })
  await (await router.connect(await getNamedSigner("deployer")).addLiquidity(tokena, tokenb, tokenadesired, tokenbdesired, tokenaminimum, tokenbminimum, to, deadline)).wait()    
});

// TODO: Test
task("router:add-liquidity-eth", "Router add liquidity eth")
.addParam("token", "Token")
.addParam("tokendesired", "Token Desired")
.addParam("tokenminimum", "Token Minimum")
.addParam("ethminimum", "ETH Minimum")
.addParam("to", "To")
.addOptionalParam("deadline", MaxUint256)
.setAction(async function ({ token, tokendesired, tokenminimum, ethminimum, to, deadline }, { ethers: { getNamedSigner, getContract } }, runSuper) {
  const router = await getContract("ViralataRouter02")
  await run("erc20:approve", { token, spender: router.address })
  await (await router.connect(await getNamedSigner("deployer")).addLiquidityETH(token, tokendesired, tokenminimum, ethminimum, to, deadline)).wait()    
});