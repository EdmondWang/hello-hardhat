// import ethers.js
// create main function
// - init 2 accounts
// - fund contract with first account
// - check balance of contract
// - fund contract with second account
// - check balance of contract
// - check mappings
// execute main function

const { ethers } = require('hardhat');

const WINDOW_SPAN = 300;

async function main() {
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

  const [firstAcct, secondAcct] = await ethers.getSigners();

  console.log('First Account');
  console.log(firstAcct);
  console.log('Second Account');
  console.log(secondAcct);

  // fund contract with first accounts
  let fundTx = await fundMe.fund({ value: ethers.parseEther('0.0005') });
  await fundTx.wait();
  let balanceOfContract = await ethers.provider.getBalance(fundMe.target);
  console.log(`Balance of the contract is ${balanceOfContract}`);

  // fund contract with second accounts
  fundTx = await fundMe.connect(secondAcct).fund({ value: ethers.parseEther('0.001') });
  await fundTx.wait();
  balanceOfContract = await ethers.provider.getBalance(fundMe.target);
  console.log(`Balance of the contract is ${balanceOfContract}`);

  // check mapping
  const firstAcctBalanceInFundMe = await fundMe.fundersToAmount(firstAcct.address);
  const secondAcctBalanceInFundMe = await fundMe.fundersToAmount(secondAcct.address);

  console.log(`Balance of first account ${firstAcct.address} is ${firstAcctBalanceInFundMe}`);
  console.log(`Balance of second account ${secondAcct.address} is ${secondAcctBalanceInFundMe}`);
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
