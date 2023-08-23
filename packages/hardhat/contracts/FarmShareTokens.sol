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

    function name(uint256 tokenId) public view returns (string memory) {
        string memory farmName = farmRegistry.farmRecordByUID(bytes32(tokenId)).farmName;
        return string(abi.encodePacked(farmName, " Share"));
    }

    function decimals() public pure returns (uint) {
        return 2;
    }

    function mint(address to, uint256 id, uint256 amount, bytes calldata data) public {
        bytes32 farmUID = bytes32(id);
        FarmRecord memory farmRecord = farmRegistry.farmRecordByUID(farmUID);
        require(farmRecord.farmOwner != address(0), "Farm not found");
        require(
            farmRegistry.authorizedFarmerOrManager(farmUID, msg.sender)
            || msg.sender == address(taskRegistry), 
            "Only farm owner or manager can mint shares"
        );
        _mint(to, id, amount, data);
    }

    function _beforeTokenTransfer(
        address, 
        address, 
        address to, 
        uint256[] memory, 
        uint256[] memory, 
        bytes memory
    ) internal virtual override {
        // if (to != address(0) && to != address(taskRegistry)) {
        //     // Check if receiver address is a registered user
        //     bytes32 userUID = userRegistry.userRegistrations(to);
        //     require(userUID != bytes32(0), "Receiver must be a registered user");
        // }
    }
}