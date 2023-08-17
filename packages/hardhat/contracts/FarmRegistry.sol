//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/ISchemaRegistry.sol";
import "./interfaces/IUserRegistry.sol";
import "./interfaces/IFarmRegistry.sol";

contract FarmRegistry is IFarmRegistry, Ownable, SchemaResolver {
	string public constant registrationSchema =
		"address owner,string name,string description,string streetAddress,string city,string state,stringcountry,string postalCode,string websiteUrl,string imageUrl";
	bytes32 public immutable registrationSchemaUID;

	IUserRegistry public userRegistry;

	mapping(bytes32 => bytes32) public farmUIDByFarmer;
	mapping(string => bytes32) public farmUIDByName;

	constructor(
		IEAS eas,
		ISchemaRegistry _schemaRegistry,
		IUserRegistry _userRegistry
	) SchemaResolver(eas) Ownable() {
		userRegistry = _userRegistry;
		registrationSchemaUID = _schemaRegistry.register(
			registrationSchema,
			this,
			true
		);
	}

	// External view functions

    function farmRecordByOwnerAddress(
		address farmOwner
	) external view override returns (FarmRecord memory) {
        bytes32 farmerUID = userRegistry.userRegistrations(farmOwner);
        return farmRecordByOwnerUID(farmerUID);
    }

	function farmRecordByOwnerUID(
		bytes32 farmOwnerUID
	) public view override returns (FarmRecord memory) {
        bytes32 farmUID = farmUIDByFarmer[farmOwnerUID];
        if (farmUID == bytes32(0)) {
            return FarmRecord({
                farmName: "",
                farmOwner: address(0),
                description: "",
                streetAddress: "",
				city: "",
				state: "",
				country: "",
				postalCode: "",
                websiteUrl: "",
                imageUrl: ""
            });
        }
        UserRecord memory farmOwner = userRegistry.userRecordByUID(farmOwnerUID);
        Attestation memory farmRegistration = _eas.getAttestation(farmUID);
        (
			bytes32 _ownerUID,
			string memory _name,
			string memory _description,
			string memory _streetAddress,
			string memory _city,
			string memory _state,
			string memory _country,
			string memory _postalCode,
			string memory _websiteUrl,
			string memory _imageUrl
		) = abi.decode(
				farmRegistration.data,
				(bytes32, string, string, string, string, string, string, string, string, string)
			);
        require(_ownerUID == farmOwnerUID, "Farm owner UID mismatch");
        return FarmRecord({
            farmName: _name,
            farmOwner: farmOwner.account,
            description: _description,
            streetAddress: _streetAddress,
			city: _city,
            state: _state,
			country: _country,
            postalCode: _postalCode,
            websiteUrl: _websiteUrl,
            imageUrl: _imageUrl
        });
    }

    function farmRecordByUID(
        bytes32 farmUID
    ) public view override returns (FarmRecord memory) {
        if (farmUID == bytes32(0)) {
            return FarmRecord({
                farmName: "",
                farmOwner: address(0),
                description: "",
                streetAddress: "",
				city: "",
				state: "",
				country: "",
				postalCode: "",
                websiteUrl: "",
                imageUrl: ""
            });
        }
        Attestation memory farmRegistration = _eas.getAttestation(farmUID);
        (
			bytes32 _ownerUID,
			string memory _name,
			string memory _description,
			string memory _streetAddress,
			string memory _city,
			string memory _state,
			string memory _country,
			string memory _postalCode,
			string memory _websiteUrl,
			string memory _imageUrl
		) = abi.decode(
				farmRegistration.data,
				(bytes32, string, string, string, string, string, string, string, string, string)
			);
        UserRecord memory farmOwner = userRegistry.userRecordByUID(_ownerUID);
        return FarmRecord({
            farmName: _name,
            farmOwner: farmOwner.account,
            description: _description,
            streetAddress: _streetAddress,
			city: _city,
            state: _state,
			country: _country,
            postalCode: _postalCode,
            websiteUrl: _websiteUrl,
            imageUrl: _imageUrl
        });
    }

	function farmRecordByName(
		string calldata farmName
	) external view override returns (FarmRecord memory) {
        return farmRecordByUID(farmUIDByName[farmName]);
    }

	// Internal SchemaResolver functions

	function onAttest(
		Attestation calldata attestation,
		uint256 value
	) internal virtual override returns (bool) {
		require(value == 0, "Farm registration requires zero value");
        require(attestation.schema == registrationSchemaUID, "Invalid attestation schema");
		(
			bytes32 _ownerUID,
			string memory _name,
			string memory _description,
			string memory _streetAddress,
			string memory _city,
			string memory _state,
			string memory _country,
			string memory _postalCode,
			string memory _websiteUrl,
		) = abi.decode(
				attestation.data,
				(bytes32, string, string, string, string, string, string, string, string, string)
			);
        farmUIDByFarmer[_ownerUID] = attestation.uid;
        farmUIDByName[_name] = attestation.uid;        
		emit FarmRegistered(
			attestation.uid,
			_ownerUID,
			_name,
			_description,
			_streetAddress,
			_city,
            _state,
			_country,
            _postalCode,
			_websiteUrl
		);
		return true;
	}

	function onRevoke(
		Attestation calldata attestation,
		uint256 value
	) internal virtual override returns (bool) {
		require(value == 0, "Revoking farm registration requires zero value");
        require(attestation.schema == registrationSchemaUID, "Invalid attestation schema");
        (
			bytes32 _ownerUID,
			string memory _name,
			, , , , ,
		) = abi.decode(
				attestation.data,
				(bytes32, string, string, string, string, string, string, string)
			);
        require(farmUIDByFarmer[_ownerUID] == attestation.uid, "UID mismatch");
        require(farmUIDByName[_name] == attestation.uid, "UID mismatch");
        farmUIDByFarmer[_ownerUID] = bytes32(0);
        farmUIDByName[_name] = bytes32(0);
        emit FarmRevoked(attestation.uid, _ownerUID, _name);
		return true;
	}

}