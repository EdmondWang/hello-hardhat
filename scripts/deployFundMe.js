const { ethers } = require('hardhat');

async function main() {
  // create factory
  const fundMeFactory = await ethers.getContractFactory('FundMe');
  console.log('contract deploying');

  // deploy contract via factory
  const fundMe = await fundMeFactory.deploy(10);

  // wait for verification, broadcast, into block chain
  await fundMe.waitForDeployment();
  console.log(`contract has been deployed successfully, contract address is ${fundMe.target}`);

  // verify fundMe
  if (hre.network.config.chainId === 11155111 && process.env.ETHERSCAN_API_TOKEN) {
    console.log('Waiting for 5 confirmations');
    await fundMe.deploymentTransaction().wait(5);
    await verifyFundMe(fundMe.target, [10]);
  } else {
    console.log('verification skipped');
  }
}

async function verifyFundMe(fundMeAddr, args) {
  await hre.run('verify:verify', {
    address: fundMeAddr,
    constructorArguments: args,
  });
}

main()
  .then()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
