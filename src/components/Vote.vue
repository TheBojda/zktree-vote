<template>
  <main role="main" class="container">
    <div style="padding-top: 7rem" class="d-none d-lg-block"></div>
    <div class="row justify-content-md-center">
      <div class="col-lg-4">
        <div class="text-center vstack gap-3">
          <h1>Vote</h1>
          Choose one option
          <div class="btn-group-vertical" role="group">
            <input
              type="radio"
              class="btn-check"
              name="vbtn-radio"
              id="vbtn-radio1"
              @click="option = 1"
            />
            <label class="btn btn-outline-dark" for="vbtn-radio1"
              >1st option</label
            >
            <input
              type="radio"
              class="btn-check"
              name="vbtn-radio"
              id="vbtn-radio2"
              @click="option = 2"
            />
            <label class="btn btn-outline-dark" for="vbtn-radio2"
              >2nd option</label
            >
            <input
              type="radio"
              class="btn-check"
              name="vbtn-radio"
              id="vbtn-radio3"
              @click="option = 3"
            />
            <label class="btn btn-outline-dark" for="vbtn-radio3"
              >3rd option</label
            >
            <input
              type="radio"
              class="btn-check"
              name="vbtn-radio"
              id="vbtn-radio4"
              @click="option = 4"
            />
            <label class="btn btn-outline-dark" for="vbtn-radio4"
              >4th option</label
            >
          </div>
          <button class="btn btn-info" @click="sendToBlockchain">
            Send to blockchain
          </button>
          <a href="#/" class="btn btn-primary">Back</a>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { Component, Vue } from "vue-facing-decorator";
import * as ethers from "ethers";
import { calculateMerkleRootAndZKProof } from "zktree";

// the default verifier is for 20 levels, for different number of levels, you need a new verifier circuit
const TREE_LEVELS = 20;

@Component
export default class Vote extends Vue {
  public option = 0;

  async sendToBlockchain() {
    if (!this.option) {
      alert("Please choose one!");
      return;
    }

    const commitment = JSON.parse(
      localStorage.getItem("zktree-vote-commitment")
    );
    if (!commitment) {
      alert("No commitment generated, please register!");
      return;
    }

    const abi = [
      "function vote(uint _option,uint256 _nullifier,uint256 _root,uint[2] memory _proof_a,uint[2][2] memory _proof_b,uint[2] memory _proof_c)",
    ];
    const provider = new ethers.providers.Web3Provider(
      (window as any).ethereum
    );
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contracts = await (await fetch("contracts.json")).json();
    const contract = new ethers.Contract(contracts.zktreevote, abi, signer);
    const cd = await calculateMerkleRootAndZKProof(
      contracts.zktreevote,
      signer,
      TREE_LEVELS,
      commitment,
      "verifier.zkey"
    );
    try {
      await contract.vote(
        this.option,
        cd.nullifierHash,
        cd.root,
        cd.proof_a,
        cd.proof_b,
        cd.proof_c
      );
    } catch (e) {
      alert(e.reason);
    }
  }
}
</script>