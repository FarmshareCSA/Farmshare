//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Common.sol";

interface IUserRegistry {
    enum UserRole {
        ADMIN,
        FARMER,
        MANAGER,
        USER,
        DONOR
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
    }

    struct Community {
        string name;
        string description;
        string location;
        address treasury;
        UserRecord[] users;
        UserRecord[] farmers;
        UserRecord[] managers;
        UserRecord[] donors;
        FarmRecord[] farms;
    }

    event UserRegistered(address account, string email, UserRole role);
    event FarmRegistered(string farmName, address farmOwner);

    function registerUserSelf(
        string memory _name, 
        string memory _email,
        string memory _phone,
        string memory _location,
        UserRole _role
    ) external returns (bool);

    function registerUserOnBehalfOf(
        address _userAddress,
        string memory _name,
        string memory _email,
        string memory _phone,
        string memory _location,
        UserRole _role
    ) external returns (bool);

    function registerFarm(
        address _farmOwner,
        string memory _farmName,
        string memory _description,
        string memory _location,
        string memory _imageUrl,
        string[] memory _socialAccounts
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

    function addFarmProducts(ProductType[] memory _products) external;

    function removeFarmProduct(uint index) external;
}