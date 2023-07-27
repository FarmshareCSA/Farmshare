//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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
    bool completed;
    bytes32[] attestations;
}
