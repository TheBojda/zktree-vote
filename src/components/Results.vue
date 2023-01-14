<template>
  <main role="main" class="container">
    <div style="padding-top: 7rem" class="d-none d-lg-block"></div>
    <div class="row justify-content-md-center">
      <div class="col-lg-4">
        <div class="text-center vstack gap-3">
          <h1>Results</h1>
          <div class="text-start">1st option: {{ options[0] }}</div>
          <div class="text-start">2nd option: {{ options[1] }}</div>
          <div class="text-start">3rd option: {{ options[2] }}</div>
          <div class="text-start">4th option: {{ options[3] }}</div>
          <a href="#/" class="btn btn-primary">Back</a>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { Component, Vue } from "vue-facing-decorator";
import * as ethers from "ethers";

@Component
export default class Vote extends Vue {
  public options = [0, 0, 0, 0];

  mounted() {
    this.init();
  }

  async init() {
    const abi = [
      "function getOptionCounter(uint _option) external view returns (uint)",
    ];
    const provider = new ethers.providers.Web3Provider(
      (window as any).ethereum
    );
    const signer = provider.getSigner();
    const contracts = await (await fetch("contracts.json")).json();
    const contract = new ethers.Contract(contracts.zktreevote, abi, signer);
    for (let i = 0; i < 4; i++) {
      this.options[i] = (await contract.getOptionCounter(i + 1)).toString();
    }
    console.log(this.options[3]);
  }
}
</script>