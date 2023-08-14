//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./interfaces/IUserRegistry.sol";
import "./interfaces/IFarmRegistry.sol";
import "./interfaces/ITaskRegistry.sol";

contract FarmShareTokens is ERC1155 {
    IUserRegistry public userRegistry;
    IFarmRegistry public farmRegistry;
    ITaskRegistry public taskRegistry;

    constructor(
        IUserRegistry _userRegistry,
        IFarmRegistry _farmRegistry,
        ITaskRegistry _taskRegistry
    ) ERC1155("FarmShareTokens") {
        userRegistry = _userRegistry;
        farmRegistry = _farmRegistry;
        taskRegistry = _taskRegistry;
    }

    function mint(address to, uint256 id, uint256 amount) public {
        bytes32 farmUID = bytes32(id);
        FarmRecord memory farmRecord = farmRegistry.farmRecordByUID(farmUID);
        require(farmRecord.farmOwner != address(0), "Farm not found");
        require(
            farmRegistry.authorizedFarmerOrManager(farmUID, msg.sender)
            || msg.sender == address(taskRegistry) && farmRegistry.authorizedFarmerOrManager(farmUID, tx.origin), 
            "Only farm owner or manager can mint shares"
        );
        _mint(to, id, amount, "");
    }
}