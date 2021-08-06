const { task } = require("hardhat/config")

const { ethers: { constants: { MaxUint256 }}} = require("ethers")

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
.setAction(async function (taskArgs, { ethers: { getNamedSigner } }, runSuper) {

  const { token, spender } = taskArgs;
  let { deadline } = taskArgs;
  const erc20 = await ethers.getContractFactory("UniswapV2ERC20")
  
  const slp = erc20.attach(token)

  if (!deadline) deadline = MaxUint256;
  
  console.log('args approve: ', taskArgs);

  await (await slp.connect(await getNamedSigner("dev")).approve(spender, deadline)).wait()    
});

task("factory:set-fee-to", "Factory set fee to")
.addParam("feeTo", "Fee To")
.setAction(async function ({ feeTo }, { ethers: { getNamedSigner } }, runSuper) {
  const factory = await ethers.getContract("UniswapV2Factory")
  console.log(`Setting factory feeTo to ${feeTo} address`)
  await (await factory.connect(await getNamedSigner('dev')).setFeeTo(feeTo)).wait() 
});

// TODO: Swap?

// TODO: Test
task("router:add-liquidity", "Router add liquidity")
.addParam("tokenA", "Token A")
.addParam("tokenB", "Token B")
.addParam("tokenADesired", "Token A Desired")
.addParam("tokenBDesired", "Token B Desired")
.addParam("tokenAMinimum", "Token A Minimum")
.addParam("tokenBMinimum", "Token B Minimum")
.addParam("to", "To")
.addOptionalParam("deadline", MaxUint256)
.setAction(async function ({ tokenA, tokenB, tokenADesired, tokenBDesired, tokenAMinimum, tokenBMinimum, to, deadline }, { ethers: { getNamedSigner } }, runSuper) {
  const router = await ethers.getContract("UniswapV2Router")
  await run("erc20:approve", { token: tokenA, spender: router.address })
  await run("erc20:approve", { token: tokenB, spender: router.address })
  await (await router.connect(await getNamedSigner("dev")).addLiquidity(tokenA, tokenB, tokenADesired, tokenBDesired, tokenAMinimum, tokenBMinimum, to, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")).wait()    
});

task("router:add-liquidity-eth", "Router add liquidity eth")
.addParam("token", "Token")
.addParam("tokendesired", "Token Desired")
.addParam("tokenminimum", "Token Minimum")
.addParam("ethminimum", "ETH Minimum")
.addParam("to", "To")
.addOptionalParam("deadline", MaxUint256)
.setAction(async function (taskArgs, { ethers: { getNamedSigner } }, runSuper) {

    const { token, tokendesired, tokenminimum, ethminimum, to } = taskArgs;
    let { deadline } = taskArgs;

    if (!deadline) {
        deadline = Date.now() + 1000000
    }

    console.log('args add: ', deadline);

  const router = await ethers.getContract("UniswapV2Router02")
  await run("erc20:approve", { token, spender: router.address })
  await (await router.connect(await getNamedSigner("dev")).addLiquidityETH(token, tokendesired, tokenminimum, ethminimum, to, deadline)).wait()    
});