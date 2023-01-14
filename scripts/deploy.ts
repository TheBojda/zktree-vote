import * as fs from 'fs'
import { ethers } from "hardhat";
import { mimcSpongecontract } from 'circomlibjs'

const SEED = "mimcsponge";
const TREE_LEVELS = 20;

async function main() {
    const signers = await ethers.getSigners()
    const MiMCSponge = new ethers.ContractFactory(mimcSpongecontract.abi, mimcSpongecontract.createCode(SEED, 220), signers[0])
    const mimcsponge = await MiMCSponge.deploy()
    console.log(`MiMC sponge hasher address: ${mimcsponge.address}`)

    const Verifier = await ethers.getContractFactory("Verifier");
    const verifier = await Verifier.deploy();
    console.log(`Verifier address: ${verifier.address}`)

    const ZKTreeVote = await ethers.getContractFactory("ZKTreeVote");
    const zktreevote = await ZKTreeVote.deploy(TREE_LEVELS, mimcsponge.address, verifier.address, 4);
    console.log(`ZKTreeVote address: ${zktreevote.address}`)

    fs.writeFileSync("static/contracts.json", JSON.stringify({
        mimc: mimcsponge.address,
        verifier: verifier.address,
        zktreevote: zktreevote.address
    }))
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});