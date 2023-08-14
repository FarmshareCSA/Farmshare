//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./interfaces/IUserRegistry.sol";
import "./interfaces/IFarmRegistry.sol";

contract FarmShareTokens is ERC1155 {
    IUserRegistry public userRegistry;
    IFarmRegistry public farmRegistry;

    constructor(
        IUserRegistry _userRegistry,
        IFarmRegistry _farmRegistry
    ) ERC1155("FarmShareTokens") {
        userRegistry = _userRegistry;
        farmRegistry = _farmRegistry;
    }

    function mint(address to, uint256 id, uint256 amount) public {
        bytes32 farmUID = bytes32(id);
        FarmRecord memory farmRecord = farmRegistry.farmRecordByUID(farmUID);
        require(farmRecord.farmOwner != address(0), "Farm not found");
        require(msg.sender == farmRecord.farmOwner, "Only farm owner can mint shares");
        _mint(to, id, amount, "");
    }
}