//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

enum UserRole {
    USER,
    DONOR,
    MANAGER,
    FARMER,
    ADMIN
}

enum TaskStatus {
    TODO,
    INPROGRESS,
    COMPLETE
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
    address payable treasury;
    FarmRecord[] farms;
}

struct ProductType {
    string name;
    string unit;
    string description;
    string imageUrl;
}

struct Task {
    uint id;
    string name;
    string description;
    address creator;
    uint deadline;
    uint reward;
    TaskStatus status;
    bytes32[] attestations;
}
