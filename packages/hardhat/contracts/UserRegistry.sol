//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/IUserRegistry.sol";

contract UserRegistry is IUserRegistry, Ownable {

    // UserRecord mappings
    mapping(address => UserRecord) public userRecordsByAddress;
    mapping(string => UserRecord) public userRecordsByEmail;

    // FarmRecord mappings
    mapping(address => FarmRecord) public farmRecordsByOwner;
    mapping(string => FarmRecord) public farmRecordsByName;
    mapping(address => ProductType[]) public farmProductsByOwner;

    // Community mappings
    Community[] public communities;
    mapping(string => Community) public communitiesByName;
    mapping(uint => Community) public communitiesById;
    mapping(string => uint) public communityIdsByName;
    mapping(address => uint[]) public userToCommunityIds;

    // Attestation mappings
    mapping(address => bytes32[]) public attestationsSentByUser;
    mapping(address => bytes32[]) public attestationsReceivedByUser;

    modifier onlyUserAccount() {
        UserRecord memory user = userRecordsByAddress[msg.sender];
        require(msg.sender == user.account, "Not authorized user account");
        _;
    }

    modifier onlyFarmOwner() {
        FarmRecord memory farm = farmRecordsByOwner[msg.sender];
        require(msg.sender == farm.farmOwner, "Not authorized farm owner");
        _;
    }

    constructor() Ownable() {}

    // External functions

    /// External registration functions

    function registerUserSelf(
        string memory _name, 
        string memory _email,
        string memory _phone,
        string memory _location,
        UserRole _role,
        string memory _communityName
    ) external returns (bool) {
        require(bytes(_email).length > 0, "Email cannot be empty");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(
            msg.sender == owner() || (_role != UserRole.ADMIN && _role != UserRole.MANAGER), 
            "Only owner can register admin and manager roles"
        );
        require(userRecordsByAddress[msg.sender].account == address(0), "User address already registered");
        require(userRecordsByEmail[_email].account == address(0), "Email already registered");
        UserRecord memory newUser = UserRecord({
            account: msg.sender,
            name: _name,
            email: _email,
            phone: _phone,
            location: _location,
            role: _role
        });
        _registerUser(newUser);
        emit UserRegistered(newUser.account, newUser.email, newUser.role);
        if(bytes(_communityName).length > 0) {
            _addUserToCommunity(newUser, _communityName);
            emit UserJoinedCommunity(newUser.account, _communityName, newUser.role);
        }
        return true;
    }

    function registerUserOnBehalfOf(
        address _userAddress,
        string memory _name,
        string memory _email,
        string memory _phone,
        string memory _location,
        UserRole _role,
        string memory _communityName
    ) external returns (bool) {
        require(bytes(_email).length > 0, "Email cannot be empty");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(userRecordsByAddress[_userAddress].account == address(0), "User address already registered");
        require(userRecordsByEmail[_email].account == address(0), "Email already registered");
        UserRecord memory senderUser = userRecordsByAddress[msg.sender];
        require(senderUser.account != address(0), "Only registered users can register others");
        require(
            (_role != UserRole.ADMIN) || msg.sender == owner() || senderUser.role == UserRole.ADMIN, 
            "Only owner and other admins can register new admins"
        );
        require(
            senderUser.role == UserRole.ADMIN || senderUser.role == UserRole.FARMER || senderUser.role == UserRole.MANAGER, 
            "Only admins, farmers and managers can register users on their behalf"
        );
        UserRecord memory newUser = UserRecord({
            account: _userAddress,
            name: _name,
            email: _email,
            phone: _phone,
            location: _location,
            role: _role
        });
        _registerUser(newUser);
        emit UserRegistered(newUser.account, newUser.email, newUser.role);
        if(bytes(_communityName).length > 0) {
            _addUserToCommunity(newUser, _communityName);
            emit UserJoinedCommunity(newUser.account, _communityName, newUser.role);
        }
        return true;
    }

    function registerFarm(
        address _farmOwner,
        string memory _farmName,
        string memory _description,
        string memory _location,
        string memory _imageUrl,
        string[] memory _socialAccounts,
        string memory _communityName
    ) external returns (bool) {
        require(bytes(_farmName).length > 0, "Farm name cannot be empty");
        require(bytes(_communityName).length > 0, "Community name cannot be empty");
        require(userRecordsByAddress[_farmOwner].account != address(0), "Farm owner is not a registered user");
        require(userRecordsByAddress[_farmOwner].role == UserRole.FARMER, "Only farmers can register as farm owners");
        require(farmRecordsByOwner[_farmOwner].farmOwner == address(0), "Farm owner already has a registered farm");
        require(farmRecordsByName[_farmName].farmOwner == address(0), "Farm name already exists");
        require(communitiesByName[_communityName].treasury != address(0), "Community does not exist");
        UserRecord memory senderUser = userRecordsByAddress[msg.sender];
        require(msg.sender == _farmOwner || senderUser.role == UserRole.ADMIN, "Only farm owner and admins can register farms");
        FarmRecord memory newFarm = FarmRecord({
            farmName: _farmName,
            farmOwner: _farmOwner,
            description: _description,
            location: _location,
            imageUrl: _imageUrl,
            socialAccounts: _socialAccounts,
            communityId: communitiesByName[_communityName].id
        });
        _registerFarm(newFarm);
        emit FarmRegistered(_farmName, _farmOwner, communitiesByName[_communityName].id);
        return true;
    }

    /// External registry management functions

    function updateUserRecord(
        string memory _newName,
        string memory _newEmail,
        string memory _newPhone,
        string memory _newLocation
    ) external onlyUserAccount returns (UserRecord memory) {
        require(bytes(_newName).length > 0, "Name cannot be empty");
        require(bytes(_newEmail).length > 0, "Email cannot be empty");
        UserRecord storage userRecord = userRecordsByAddress[msg.sender];
        string memory oldEmail = userRecord.email;
        userRecord.name = _newName;
        userRecord.email = _newEmail;
        userRecord.phone = _newPhone;
        userRecord.location = _newLocation;
        if(!Strings.equal(oldEmail, _newEmail)) {
            require(userRecordsByEmail[_newEmail].account == address(0), "New email already registered");
            delete userRecordsByEmail[oldEmail];
            userRecordsByEmail[_newEmail] = userRecord;
        }
        return userRecord;
    }

    function updateFarmRecord(
        string memory _newDescription,
        string memory _newLocation,
        string memory _newImageUrl,
        string[] memory _newSocialAccounts
    ) external onlyFarmOwner returns (FarmRecord memory) {
        FarmRecord storage farmRecord = farmRecordsByOwner[msg.sender];
        farmRecord.description = _newDescription;
        farmRecord.location = _newLocation;
        farmRecord.imageUrl = _newImageUrl;
        farmRecord.socialAccounts = _newSocialAccounts;
        return farmRecord;
    }

    function addUserToCommunity(address _newMember, string memory _communityName) external {
        require(_newMember != address(0), "Invalid address");
        require(userRecordsByAddress[_newMember].account != address(0), "User is not registered");
        require(bytes(_communityName).length > 0, "Community name cannot be empty");
        require(communitiesByName[_communityName].treasury != address(0), "Community does not exist");
        if (userToCommunityIds[_newMember].length > 0) {
            for (uint i; i < userToCommunityIds[_newMember].length; ++i) {
                require(!Strings.equal(communities[userToCommunityIds[_newMember][i]].name, _communityName), "User already in community");
            }
        }
        UserRecord memory newMember = userRecordsByAddress[_newMember];
        if (newMember.role != UserRole.USER && newMember.role != UserRole.DONOR) {
            require(msg.sender != newMember.account, "Farmers, managers and admins cannot add themselves");
            UserRecord memory senderUser = userRecordsByAddress[msg.sender];
            require(senderUser.role != UserRole.USER && senderUser.role != UserRole.DONOR, "Only farmers, managers and admins can add other farmers, managers and admins");
        }
        _addUserToCommunity(newMember, _communityName);
        emit UserJoinedCommunity(newMember.account, _communityName, newMember.role);
    }

    function removeUserFromCommunity(string memory _communityName, UserRole _role, uint256 index) external {
        require(bytes(_communityName).length > 0, "Community name cannot be empty");
        require(communitiesByName[_communityName].treasury != address(0), "Community does not exist");
        UserRecord memory senderUser = userRecordsByAddress[msg.sender];
        require(senderUser.role == UserRole.ADMIN, "Only admins can remove users from a community");
        require(_role != UserRole.ADMIN, "Admins cannot be removed from a community");
        require(index < communitiesByName[_communityName].membersByRole[_role].length, "Invalid index");
        address userToRemove = communitiesByName[_communityName].membersByRole[_role][index].account;
        delete communitiesByName[_communityName].membersByRole[_role][index];
        for (uint i; i < userToCommunityIds[userToRemove].length; ++i) {
            if (userToCommunityIds[userToRemove][i] == communitiesByName[_communityName].id) {
                delete userToCommunityIds[userToRemove][i];
                break;
            }
        }
    }

    function addFarmProducts(ProductType[] memory _products) external onlyFarmOwner {
        ProductType[] storage products = farmProductsByOwner[msg.sender];
        for (uint i; i < _products.length; ++i) {
            require(bytes(_products[i].name).length > 0, "Product name cannot be empty");
            require(bytes(_products[i].unit).length > 0, "Product unit cannot be empty");
            products.push(_products[i]);
        }
    }

    function removeFarmProduct(uint index) external onlyFarmOwner {
        ProductType[] storage products = farmProductsByOwner[msg.sender];
        require(index < products.length, "Index out of bounds");
        delete products[index];
    }

    // Internal functions

    function _registerUser(UserRecord memory _userRecord) internal {
        userRecordsByAddress[_userRecord.account] = _userRecord;
        userRecordsByEmail[_userRecord.email] = _userRecord;
    }

    function _registerFarm(FarmRecord memory _farmRecord) internal {
        farmRecordsByOwner[_farmRecord.farmOwner] = _farmRecord;
        farmRecordsByName[_farmRecord.farmName] = _farmRecord;
        communitiesById[_farmRecord.communityId].farms.push(_farmRecord);
    }

    function _addUserToCommunity(UserRecord memory _newUser, string memory _communityName) internal {
        require(communitiesByName[_communityName].treasury != address(0), "Community does not exist");
        userToCommunityIds[msg.sender].push(communitiesByName[_communityName].id);
        communitiesByName[_communityName].membersByRole[_newUser.role].push(_newUser);
    }

}