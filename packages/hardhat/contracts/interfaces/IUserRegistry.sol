//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Common.sol";

interface IUserRegistry {
    enum UserRole {
        USER,
        DONOR,
        MANAGER,
        FARMER,
        ADMIN
    }

    struct UserRecord {
        address account;
        string name;
        string email;
        string phone;
        string location;
        UserRole role;
    }

    struct FarmRecord {
        string farmName;
        address farmOwner;
        string description;
        string location;
        string imageUrl;
        string[] socialAccounts;
        uint communityId;
    }

    struct Community {
        uint id;
        string name;
        string description;
        string location;
        address treasury;
        mapping(UserRole => UserRecord[]) membersByRole;
        FarmRecord[] farms;
    }

    event UserRegistered(address account, string email, UserRole role);
    event FarmRegistered(string farmName, address farmOwner, uint communityId);
    event CommunityRegistered(string name, string location, address creator, address treasury);
    event UserJoinedCommunity(address user, string communityName, UserRole role);
    event UserRemovedFromCommunity(address user, string communityName);

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

    function addUserToCommunity(address _newMember, string memory _communityName) external;

    function removeUserFromCommunity(string memory _communityName, UserRole _role, uint256 index) external;

    function addFarmProducts(ProductType[] memory _products) external;

    function removeFarmProduct(uint index) external;
}