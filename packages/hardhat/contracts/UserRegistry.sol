//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/ISchemaRegistry.sol";
import "./interfaces/IUserRegistry.sol";

contract UserRegistry is IUserRegistry, Ownable, SchemaResolver {
    string public constant schema = "address account,string name,string email,string phone,string location,uint8 role";
    bytes32 public immutable schemaUID;

    mapping(address => bytes32) public userRegistrations;
    mapping(string => address) public userEmailToAddress;

    constructor(IEAS eas, ISchemaRegistry registry) SchemaResolver(eas) Ownable() {
        schemaUID = registry.register(schema, this, true);
    }

    function userRecordByAddress(address user) public view returns (UserRecord memory) {
        require(userRegistrations[user] != bytes32(0), "User is not registered");
        Attestation memory attestation = _eas.getAttestation(userRegistrations[user]);
        (
            address _account, 
            string memory _name, 
            string memory _email, 
            string memory _phone, 
            string memory _location, 
            UserRole _role
        ) = abi.decode(attestation.data, (address, string, string, string, string, UserRole));
        return UserRecord({
            account: _account,
			name: _name,
			email: _email,
			phone: _phone,
			location: _location,
			role: _role
        });
    }

    function userRecordByEmail(string calldata email) external view returns (UserRecord memory) {
        return userRecordByAddress(userEmailToAddress[email]);
    } 

	function onAttest(
		Attestation calldata attestation,
		uint256 value
	) internal virtual override returns (bool) {
        require(value == 0, "User registration requires zero value");
        (
            address _account, 
            string memory _name, 
            string memory _email, 
            string memory _phone, 
            string memory _location, 
            UserRole _role
        ) = abi.decode(attestation.data, (address, string, string, string, string, UserRole));
        require(userRegistrations[_account] == bytes32(0), "User already registered");
        require(userEmailToAddress[_email] == address(0), "Email already registered");
        userRegistrations[_account] = attestation.uid;
        userEmailToAddress[_email] = _account;
        emit UserRegistered(_account, _name, _email, _phone, _location, _role);
        return true;
    }

	function onRevoke(
		Attestation calldata attestation,
		uint256 value
	) internal virtual override returns (bool) {
        require(value == 0, "User registration requires zero value");
        (
            address _account, 
            string memory _name, 
            string memory _email, 
            string memory _phone, 
            string memory _location, 
            UserRole _role
        ) = abi.decode(attestation.data, (address, string, string, string, string, UserRole));
        require(userRegistrations[_account] != bytes32(0), "User is not registered");
        require(userEmailToAddress[_email] == _account, "Registered email does not match");
        delete userRegistrations[_account];
        delete userEmailToAddress[_email];
        emit UserRevoked(_account, _name, _email, _phone, _location, _role);
        return true;
    }
}