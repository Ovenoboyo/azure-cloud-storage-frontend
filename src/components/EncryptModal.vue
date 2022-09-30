<template>
  <b-modal id="encryptModal">
    <b-container fluid v-if="fileList">
      <b-row v-for="f in fileList" :key="`${f.name}:${f.lastModified}`">
        <b-col>{{ f.name }}</b-col>
        <b-col>AES</b-col>
        <b-col>
          <b-input v-model="encKey" />
        </b-col>
        <b-col><b-button @click="generateKey">Generate key</b-button></b-col>
      </b-row>
    </b-container>

    <template #modal-footer>
      <b-button @click="submitFile">Submit</b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { bus } from "@/main";
import { genRand } from "@/utils/utils";
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class EncryptModal extends Vue {
  private fileList: FileList | null = null;

  private encKey = "";
  private onSuccessCallback?: (fileList: FileList, key: string) => void;

  private submitFile() {
    if (this.fileList && this.onSuccessCallback) {
      this.onSuccessCallback(this.fileList, this.encKey);
    }

    this.fileList = null;
    this.onSuccessCallback = undefined;

    this.$bvModal.hide("encryptModal");
  }

  private generateKey() {
    this.encKey = genRand(32 + 24);
  }

  mounted() {
    bus.$on(
      "showEncryptModal",
      (data: FileList, onSuccessCallback: typeof this.onSuccessCallback) => {
        this.fileList = data;
        this.onSuccessCallback = onSuccessCallback;
        this.$bvModal.show("encryptModal");
      }
    );
  }
}
</script>

