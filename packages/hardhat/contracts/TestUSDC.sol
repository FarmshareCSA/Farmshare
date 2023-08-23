//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}

    function drip() external {
        _mint(msg.sender, 100 * decimals());
    }
}