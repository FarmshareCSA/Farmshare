//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/ISchemaRegistry.sol";
import "./interfaces/IUserRegistry.sol";

contract UserRegistry is IUserRegistry, Ownable, SchemaResolver {
    string public constant registrationSchema = "address account,string name,bytes32 emailHash,string location,uint8 role";
    bytes32 public immutable registrationSchemaUID;

    mapping(address => bytes32) public userRegistrations;
    mapping(bytes32 => address) public userEmailHashToAddress;

    constructor(IEAS eas, ISchemaRegistry registry) SchemaResolver(eas) Ownable() {
        registrationSchemaUID = registry.register(registrationSchema, this, true);
    }

    // External view functions

    function userRecordByUID(bytes32 userUID) public view returns (UserRecord memory) {
        if(userUID == bytes32(0)) {
            return UserRecord({
                account: address(0),
                name: "",
                emailHash: 0,
                location: "",
                role: UserRole.NONE
            });
        }
        Attestation memory attestation = _eas.getAttestation(userUID);
        (
            address _account, 
            string memory _name, 
            bytes32 _emailHash, 
            string memory _location, 
            UserRole _role
        ) = abi.decode(attestation.data, (address, string, bytes32, string, UserRole));
        return UserRecord({
            account: _account,
			name: _name,
			emailHash: _emailHash,
			location: _location,
			role: _role
        });
    }

    function userRecordByAddress(address user) public view returns (UserRecord memory) {
        return userRecordByUID(userRegistrations[user]);
    }

    function userRecordByEmail(string calldata email) external view returns (UserRecord memory) {
        bytes32 emailHash = keccak256(bytes(email));
        return userRecordByAddress(userEmailHashToAddress[emailHash]);
    } 

    // Internal SchemaResolver functions

	function onAttest(
		Attestation calldata attestation,
		uint256 value
	) internal virtual override returns (bool) {
        require(value == 0, "User registration requires zero value");
        require(attestation.schema == registrationSchemaUID, "Invalid attestation schema");
        (
            address _account, 
            string memory _name, 
            bytes32 _emailHash, 
            string memory _location, 
            UserRole _role
        ) = abi.decode(attestation.data, (address, string, bytes32, string, UserRole));
        require(userRegistrations[_account] == bytes32(0), "User already registered");
        require(userEmailHashToAddress[_emailHash] == address(0), "Email already registered");
        userRegistrations[_account] = attestation.uid;
        userEmailHashToAddress[_emailHash] = _account;
        emit UserRegistered(_account, attestation.uid, _name, _emailHash, _location, _role);
        return true;
    }

	function onRevoke(
		Attestation calldata attestation,
		uint256 value
	) internal virtual override returns (bool) {
        require(value == 0, "User registration requires zero value");
        require(attestation.schema == registrationSchemaUID, "Invalid attestation schema");
        (
            address _account, 
            string memory _name, 
            bytes32 _emailHash, 
            string memory _location, 
            UserRole _role
        ) = abi.decode(attestation.data, (address, string, bytes32, string, UserRole));
        require(userRegistrations[_account] != bytes32(0), "User is not registered");
        require(userEmailHashToAddress[_emailHash] == _account, "Registered email does not match");
        delete userRegistrations[_account];
        delete userEmailHashToAddress[_emailHash];
        emit UserRevoked(_account, attestation.uid, _name, _emailHash, _location, _role);
        return true;
    }
}