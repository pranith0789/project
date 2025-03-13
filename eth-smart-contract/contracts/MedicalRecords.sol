// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MedicalRecords {
    struct Record {
        string fileCID;   // IPFS hash of the uploaded file
        string resultCID; // IPFS hash of classification result
        address uploader; // User who uploaded the file
        uint256 timestamp;
    }

    mapping(address => Record[]) public records;

    event RecordAdded(address indexed uploader, string fileCID, string resultCID, uint256 timestamp);

    function storeRecord(string memory _fileCID, string memory _resultCID) public {
        records[msg.sender].push(Record(_fileCID, _resultCID, msg.sender, block.timestamp));
        emit RecordAdded(msg.sender, _fileCID, _resultCID, block.timestamp);
    }

    function getRecords(address _user) public view returns (Record[] memory) {
        return records[_user];
    }
}
