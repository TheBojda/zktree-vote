import { ethers } from "hardhat";
import { mimcSpongecontract } from 'circomlibjs'
import { ZKTreeVote } from "../typechain-types";
import { generateCommitment, calculateMerkleRootAndZKProof } from 'zktree';

const SEED = "mimcsponge";

// the default verifier is for 20 levels, for different number of levels, you need a new verifier circuit
const TREE_LEVELS = 20;


describe("ZKTree Smart contract test", () => {

    let zktreevote: ZKTreeVote

    before(async () => {
        const signers = await ethers.getSigners()
        const MiMCSponge = new ethers.ContractFactory(mimcSpongecontract.abi, mimcSpongecontract.createCode(SEED, 220), signers[0])
        const mimcsponge = await MiMCSponge.deploy()
        const Verifier = await ethers.getContractFactory("Verifier");
        const verifier = await Verifier.deploy();
        const ZKTreeVote = await ethers.getContractFactory("ZKTreeVote");
        zktreevote = await ZKTreeVote.deploy(TREE_LEVELS, mimcsponge.address, verifier.address, 4);
    });

    it("Test the full process", async () => {
        const signers = await ethers.getSigners()
        await zktreevote.registerValidator(signers[1].address)

        // register 3 voters
        const commitment1 = await generateCommitment()
        await zktreevote.connect(signers[1]).registerCommitment(1, commitment1.commitment)
        const commitment2 = await generateCommitment()
        await zktreevote.connect(signers[1]).registerCommitment(2, commitment2.commitment)
        const commitment3 = await generateCommitment()
        await zktreevote.connect(signers[1]).registerCommitment(3, commitment3.commitment)

        // votes
        const cd1 = await calculateMerkleRootAndZKProof(zktreevote.address, signers[2], TREE_LEVELS, commitment1, "keys/Verifier.zkey")
        await zktreevote.connect(signers[2]).vote(1, cd1.nullifierHash, cd1.root, cd1.proof_a, cd1.proof_b, cd1.proof_c)
        const cd2 = await calculateMerkleRootAndZKProof(zktreevote.address, signers[3], TREE_LEVELS, commitment2, "keys/Verifier.zkey")
        await zktreevote.connect(signers[3]).vote(1, cd2.nullifierHash, cd2.root, cd2.proof_a, cd2.proof_b, cd2.proof_c)
        const cd3 = await calculateMerkleRootAndZKProof(zktreevote.address, signers[4], TREE_LEVELS, commitment3, "keys/Verifier.zkey")
        await zktreevote.connect(signers[4]).vote(2, cd3.nullifierHash, cd3.root, cd3.proof_a, cd3.proof_b, cd3.proof_c)

        // results
        console.log(await zktreevote.getOptionCounter(1))
        console.log(await zktreevote.getOptionCounter(2))
        console.log(await zktreevote.getOptionCounter(3))
        console.log(await +-zktreevote.getOptionCounter(4))
    });

});