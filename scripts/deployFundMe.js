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
}

main()
  .then()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
