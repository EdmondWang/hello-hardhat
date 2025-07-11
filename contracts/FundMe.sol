// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 1. create a receive money function
// 2. record donater and query
// 3. if achieve target in the locked window, manafuctur could pick monery
// 4. if not achieve target in the loced windiw, investoer could withdraaw money

contract FundMe {
    mapping(address => uint256) public fundersToAmount;

    uint256 MINIMUM_VALUE = 1 * 10**18; // 1 wei USD

    AggregatorV3Interface internal dataFeed;

    uint256 constant TARGET = 10 * 10**18; // 10 wei USD

    address public owner;

    uint256 deploymentTimestamp; // seconds
    uint256 lockTime;

    address erc20Addr;

    bool public getFundSuccess = false;

    constructor(uint256 _lockTime) {
        dataFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        ); // ETH/USD on Seplolia testnet
        owner = msg.sender;

        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }

    function fund() external payable {
        require(convertEthToUsd(msg.value) >= MINIMUM_VALUE, "Send more ETH");
        require(block.timestamp < deploymentTimestamp + lockTime, "Window is closed");
        fundersToAmount[msg.sender] = msg.value;
    }

    function getChainlinkDataFeedLatestAnswer() public view returns (int256) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    // 1 ETH = 2522 USD, on July 5th, 2025
    // 由于chainlink预言机对于获取到的USD的价钱是扩大了10^8方，所以在将ETH转换为USD时，需要除10^8.
    // 这样更容易理解：得出当前eth的实际美元价值 =（ethAmount/10^18) * (ethPrice/10^8)
    // 这里的 (ethPrice/10^8) 是 1 ETH 单价，（ethAmount/10^18)是ETH的数量
    // 所以 这个函数将最终实际美元价值扩大了10^18倍
    // 1 Finney = 2.5 USD, 1000000 Gwei = 2.5USD
    // 500000 Gwei = 1.25 USD
    // 400000 Gwei​ = 1 USD, 0.4 Fenny
    // 3600000 Gwei = 9USD. 3.5 Fenny
    // 250000 Gwei = 0.6125 USD

    function convertEthToUsd(uint256 ethAmount)
        internal
        view
        returns (uint256)
    {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmount * (ethPrice / (10**8));
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    function getFund() external windowClosed onlyOwner {
        require(
            convertEthToUsd(address(this).balance) >= TARGET,
            "Target is not reached"
        );

        // transfer, would revert if error
        // payable(msg.sender).transfer(address(this).balance);

        // send
        // bool success = payable(msg.sender).send(address(this).balance);

        // call
        bool success;
        (success, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );     
        require(success, "transfer transcation is failed");
        fundersToAmount[msg.sender] = 0;
        getFundSuccess = true;
    }

    function refund() external windowClosed {
        require(
            convertEthToUsd(address(this).balance) < TARGET,
            "Target is reached"
        );
        require(fundersToAmount[msg.sender] != 0, "there is no found for you");

        bool success;
        (success, ) = payable(msg.sender).call{
            value: fundersToAmount[msg.sender]
        }("");
        require(success, "transfer transcation is failed");
        fundersToAmount[msg.sender] = 0;
    }

    function setFunderToAmount(address funder, uint256 amount) external {
        require(msg.sender == erc20Addr, "You do not have permission to call this function");
        fundersToAmount[funder] = amount;
    }

    function setErc20addr(address _erc20Addr) public onlyOwner {
        erc20Addr = _erc20Addr;
    }

    modifier windowClosed() {
        require(block.timestamp >= deploymentTimestamp + lockTime, "Window is not closed");
        _; // stands for function logic
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "this function can only be called by owner"
        );
        _;
    }
}
