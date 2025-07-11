const { task } = require('hardhat/config');

task('interactFundMe', 'interact with FundMe contract')
  .addParam('addr', 'fundMe contract address')
  .setAction(async (taskArgs, hre) => {
    const fundMeFactory = await ethers.getContractFactory('FundMe');
    const fundMe = fundMeFactory.attach(taskArgs.addr);
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
  });

module.exports = {};
