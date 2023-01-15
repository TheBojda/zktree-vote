// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "zk-merkle-tree/contracts/ZKTree.sol";

contract ZKTreeVote is ZKTree {
    address public owner;
    mapping(address => bool) public validators;
    mapping(uint256 => bool) uniqueHashes;
    uint numOptions;
    mapping(uint => uint) optionCounter;

    constructor(
        uint32 _levels,
        IHasher _hasher,
        IVerifier _verifier,
        uint _numOptions
    ) ZKTree(_levels, _hasher, _verifier) {
        owner = msg.sender;
        numOptions = _numOptions;
        for (uint i = 0; i <= numOptions; i++) optionCounter[i] = 0;
    }

    function registerValidator(address _validator) external {
        require(msg.sender == owner, "Only owner can add validator!");
        validators[_validator] = true;
    }

    function registerCommitment(
        uint256 _uniqueHash,
        uint256 _commitment
    ) external {
        require(validators[msg.sender], "Only validator can commit!");
        require(
            !uniqueHashes[_uniqueHash],
            "This unique hash is already used!"
        );
        _commit(bytes32(_commitment));
        uniqueHashes[_uniqueHash] = true;
    }

    function vote(
        uint _option,
        uint256 _nullifier,
        uint256 _root,
        uint[2] memory _proof_a,
        uint[2][2] memory _proof_b,
        uint[2] memory _proof_c
    ) external {
        require(_option <= numOptions, "Invalid option!");
        _nullify(
            bytes32(_nullifier),
            bytes32(_root),
            _proof_a,
            _proof_b,
            _proof_c
        );
        optionCounter[_option] = optionCounter[_option] + 1;
    }

    function getOptionCounter(uint _option) external view returns (uint) {
        return optionCounter[_option];
    }
}
