#!/usr/bin/env bash

mkdir -p keys
mkdir -p build
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_15.ptau -P ./keys
circom node_modules/zktree/circuits/Verifier.circom --wasm --r1cs -o ./build
npx snarkjs groth16 setup build/Verifier.r1cs keys/powersOfTau28_hez_final_15.ptau keys/Verifier.zkey
npx snarkjs zkey export solidityverifier keys/Verifier.zkey contracts/Verifier.sol
sed -i -e 's/pragma solidity \^0.6.11/pragma solidity 0.8.17/g' contracts/Verifier.sol
