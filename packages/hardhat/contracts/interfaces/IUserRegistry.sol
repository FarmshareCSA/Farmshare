//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Common.sol";

interface IUserRegistry {
    event UserRegistered(address account, string email, UserRole role);
    event UserPendingApproval(address account, string email, UserRole role);
    event FarmRegistered(string farmName, address farmOwner, uint communityId);

    function userRecordByAddress(address _address) external view returns (UserRecord memory);
    function userRecordByEmail(string memory _email) external view returns (UserRecord memory);
    function farmRecordByOwner(address _owner) external view returns (FarmRecord memory);
    function farmRecordByName(string memory _name) external view returns (FarmRecord memory);
    
    function registerUserSelf(
        string memory _name, 
        string memory _email,
        string memory _phone,
        string memory _location,
        UserRole _role,
        string memory _communityName
    ) external returns (bool);

    function registerUserOnBehalfOf(
        address _userAddress,
        string memory _name,
        string memory _email,
        string memory _phone,
        string memory _location,
        UserRole _role,
        string memory _communityName
    ) external returns (bool);

    function approvePendingUser(uint index) external;

    function registerFarm(
        address _farmOwner,
        string memory _farmName,
        string memory _description,
        string memory _location,
        string memory _imageUrl,
        string[] memory _socialAccounts,
        string memory _communityName
    ) external returns (bool);

    function updateUserRecord(
        string memory _newName,
        string memory _newEmail,
        string memory _newPhone,
        string memory _newLocation
    ) external returns (UserRecord memory);

    function updateFarmRecord(
        string memory _newDescription,
        string memory _newLocation,
        string memory _newImageUrl,
        string[] memory _newSocialAccounts
    ) external returns (FarmRecord memory);

    function setCommunityRegistry(address _communityRegistry) external;
}