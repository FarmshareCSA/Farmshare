//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

enum UserRole {
    NONE,
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
    bytes32 emailHash;
    string location;
    UserRole role;
}

struct FarmRecord {
    string farmName;
    address farmOwner;
    string description;
    string country;
    string state;
    string postalCode;
    string websiteUrl;
    string imageUrl;
}

struct Community {
    bytes32 uid;
    string name;
    string description;
    string country;
    string state;
    string postalCode;
    address payable treasury;
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
    uint startTime;
    uint endTime;
    bool recurring;
    uint frequency;
    uint reward;
}
