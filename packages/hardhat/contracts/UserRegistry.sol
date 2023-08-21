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
    string public constant updateSchema = "address newAccount,string newName,bytes32 newEmailHash,string newLocation, uint8 newRole";
    bytes32 public immutable updateSchemaUID;
    string public constant skillRecordSchema = "string skill";
    bytes32 public immutable skillRecordSchemaUID;
    string public constant userSkillSchema = "bytes32 skillUID,bytes32 userUID,string skillName";
    bytes32 public immutable userSkillSchemaUID;
    string public constant skillEndorsementSchema = "bytes32 userSkillUID,bytes32 userUID,bytes32 endorserUID";
    bytes32 public immutable skillEndorsementSchemaUID;

    mapping(address => bytes32) public userRegistrations;
    mapping(bytes32 => bytes32) public registrationUpdatesByOriginalUID;
    mapping(bytes32 => address) public userEmailHashToAddress;
    mapping(string => bytes32) public skillRecordsBySkillName;
    mapping(bytes32 => mapping(string => bytes32)) public userSkillUIDByUserAndSkillName;

    constructor(IEAS eas, ISchemaRegistry registry) SchemaResolver(eas) Ownable() {
        registrationSchemaUID = registry.register(registrationSchema, this, true);
        updateSchemaUID = registry.register(updateSchema, this, true);
        skillRecordSchemaUID = registry.register(skillRecordSchema, this, true);
        userSkillSchemaUID = registry.register(userSkillSchema, this, true);
        skillEndorsementSchemaUID = registry.register(skillEndorsementSchema, this, true);
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
        if (registrationUpdatesByOriginalUID[userUID] != bytes32(0)) {
            userUID = registrationUpdatesByOriginalUID[userUID];
            Attestation memory updateAttestation = _eas.getAttestation(userUID);
            (
                _account, 
                _name, 
                _emailHash, 
                _location,
                _role
            ) = abi.decode(updateAttestation.data, (address, string, bytes32, string, UserRole));
        }
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
        require(value == 0, "User registry attestations require zero value");
        if (attestation.schema == registrationSchemaUID) {
            // Attestation is for a new user registration
            (
                address _account, 
                string memory _name, 
                bytes32 _emailHash, 
                string memory _location, 
                UserRole _role
            ) = abi.decode(attestation.data, (address, string, bytes32, string, UserRole));
            require(_account != address(0), "Account cannot be zero address");
            require(bytes(_name).length > 0, "Name cannot be empty");
            require(_emailHash != bytes32(0), "Email hash cannot be empty");
            require(_role != UserRole.NONE, "Role must be specified");
            require(userRegistrations[_account] == bytes32(0), "User already registered");
            require(userEmailHashToAddress[_emailHash] == address(0), "Email already registered");
            userRegistrations[_account] = attestation.uid;
            userEmailHashToAddress[_emailHash] = _account;
            emit UserRegistered(_account, attestation.uid, _name, _emailHash, _location, _role);
            return true;
        } else if (attestation.schema == updateSchemaUID) {
            // Attestation is for updating an existing user record
            (
                address _newAccount, 
                string memory _newName, 
                bytes32 _newEmailHash, 
                string memory _newLocation,
                UserRole _newRole
            ) = abi.decode(attestation.data, (address, string, bytes32, string, UserRole));
            require(_newAccount != address(0), "Account cannot be zero address");
            require(bytes(_newName).length > 0, "Name cannot be empty");
            require(_newEmailHash != bytes32(0), "Email hash cannot be empty");
            require(
                userRegistrations[_newAccount] == bytes32(0) ||
                userRegistrations[_newAccount] == attestation.refUID, 
                "New account already registered to another user"
            );
            UserRecord memory originalRecord = userRecordByUID(attestation.refUID);
            require(originalRecord.account == attestation.attester, "Only original account can update");
            registrationUpdatesByOriginalUID[attestation.refUID] = attestation.uid;
            if (originalRecord.emailHash != _newEmailHash) {
                userEmailHashToAddress[_newEmailHash] = _newAccount;
                userEmailHashToAddress[originalRecord.emailHash] = address(0);
            }
            if (originalRecord.account != _newAccount) {
                userRegistrations[originalRecord.account] = bytes32(0);
                userRegistrations[_newAccount] = attestation.refUID;
            }
            emit UserUpdated(
                attestation.refUID,
                attestation.uid,
                _newAccount,
                _newName,
                _newEmailHash,
                _newLocation,
                _newRole
            );
            return true;
        } else if (attestation.schema == skillRecordSchemaUID) {
            // Attestation is for a new skill record
            string memory newSkill = abi.decode(attestation.data, (string));
            require(bytes(newSkill).length > 0, "Skill cannot be empty");
            require(
                attestation.recipient == address(this), 
                "User registry must be recipient of new skill record attestation"
            );
            require(skillRecordsBySkillName[newSkill] == bytes32(0), "Skill already recorded");
            skillRecordsBySkillName[newSkill] = attestation.uid;
            return true;
        } else if (attestation.schema == userSkillSchemaUID) {
            // Attestation is for recording a user's skill
            (
                bytes32 _skillUID,
                bytes32 _userUID,
            ) = abi.decode(attestation.data, (bytes32, bytes32, string));
            require(attestation.refUID == _skillUID, "Invalid reference UID");
            Attestation memory skillRecord = _eas.getAttestation(_skillUID);
            string memory skillName = abi.decode(skillRecord.data, (string));
            require(bytes(skillName).length > 0, "Skill not found");
            require(
                userSkillUIDByUserAndSkillName[_userUID][skillName] == bytes32(0), 
                "User has already claimed this skill"
            );
            UserRecord memory userRecord = userRecordByUID(_userUID);
            require(userRecord.account != address(0), "Invalid user UID");
            require(attestation.recipient == userRecord.account, "User must be the attestation recipient");
            userSkillUIDByUserAndSkillName[_userUID][skillName] = attestation.uid;
            emit UserAddedSkill(_userUID, _skillUID, skillName);
            return true;
        } else if (attestation.schema == skillEndorsementSchemaUID) {
            // Attestation is for endorsing a user's skill
            (
                bytes32 _userSkillUID,
                bytes32 _endorseeUID,
                bytes32 _endorserUID
            ) = abi.decode(attestation.data, (bytes32, bytes32, bytes32));
            require(attestation.refUID == _userSkillUID, "Invalid reference UID");
            Attestation memory userSkill = _eas.getAttestation(_userSkillUID);
            (
                bytes32 _skillUID,
                bytes32 _userUID
            ) = abi.decode(userSkill.data, (bytes32, bytes32));
            require(_skillUID != bytes32(0), "User skill attestation not found");
            require(_userUID == _endorseeUID, "User UID does not match");
            UserRecord memory userRecord = userRecordByUID(_userUID);
            require(userRecord.account != address(0), "User not registered");
            UserRecord memory endorserRecord = userRecordByUID(_endorserUID);
            require(endorserRecord.account != address(0), "Endorser not registered");
            Attestation memory skillRecord = _eas.getAttestation(_skillUID);
            string memory skillName = abi.decode(skillRecord.data, (string));
            emit UserSkillEndorsed(_userUID, _endorserUID, _skillUID, skillName);
            return true;
        }
        return false;
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
        delete registrationUpdatesByOriginalUID[attestation.uid];
        emit UserRevoked(_account, attestation.uid, _name, _emailHash, _location, _role);
        return true;
    }
}