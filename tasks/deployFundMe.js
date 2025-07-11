const { task } = require('hardhat/config');

const WINDOW_SPAN = 300;

async function verifyFundMe(fundMeAddr, args) {
  await hre.run('verify:verify', {
    address: fundMeAddr,
    constructorArguments: args,
  });
}

task('deployFundMe', 'deploy FundMe contract').setAction(async (taskArgs, hre) => {
  // create factory
  const fundMeFactory = await ethers.getContractFactory('FundMe');
  console.log('contract deploying');

  // deploy contract via factory
  const fundMe = await fundMeFactory.deploy(WINDOW_SPAN); // 5 minutes

  // wait for verification, broadcast, into block chain
  await fundMe.waitForDeployment();
  console.log(`contract has been deployed successfully, contract address is ${fundMe.target}`);

  // verify fundMe
  if (hre.network.config.chainId === 11155111 && process.env.ETHERSCAN_API_TOKEN) {
    console.log('Waiting for 5 confirmations');
    await fundMe.deploymentTransaction().wait(5);
    await verifyFundMe(fundMe.target, [WINDOW_SPAN]);
  } else {
    console.log('verification skipped');
  }
});

module.exports = {};
