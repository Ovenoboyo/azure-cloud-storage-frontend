<template>
  <b-modal id="encryptModal">
    <b-container fluid v-if="fileList">
      <b-row v-for="f in fileList" :key="`${f.name}:${f.lastModified}`">
        <b-col>{{ f.name }}</b-col>
        <b-col>AES + 3DES</b-col>
        <!-- <b-col>
          <b-input v-model="encKey" />
        </b-col> -->
        <!-- <b-col><b-button @click="generateKey">Generate key</b-button></b-col> -->
      </b-row>
    </b-container>

    <template #modal-footer>
      <b-button @click="submitFile">Submit</b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
type PicSumResult = {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}[];

import { bus } from "@/main";
import { genRand } from "@/utils/utils";
import { Vue, Component } from "vue-property-decorator";
import { encode } from "ts-steganography";

@Component({})
export default class EncryptModal extends Vue {
  private fileList: FileList | null = null;

  private encKey = "";
  private onSuccessCallback?: (fileList: FileList, key: string) => void;

  private download(dataurl: string, filename: string) {
    const link = document.createElement("a");
    link.href = dataurl;
    link.download = filename;
    link.click();
  }

  private async submitFile() {
    try {
      await this.generateKey();
      if (this.fileList && this.onSuccessCallback) {
        this.onSuccessCallback(this.fileList, this.encKey);
      }

      this.fileList = null;
      this.onSuccessCallback = undefined;

      this.$bvModal.hide("encryptModal");
    } catch (e) {
      console.error(e);
      this.$toast.error("Error encoding data in image");
    }
  }

  private async generateKey() {
    this.encKey = genRand(32 + 24);

    const rawData = await (
      await fetch(`https://picsum.photos/800?random=${this.encKey}`)
    ).blob();
    const url = URL.createObjectURL(rawData);

    const dataUrl = await encode(this.encKey, url);
    this.download(dataUrl, "encrypted-key.png");

    this.$toast.info(
      `DEBUG: Key ${this.encKey} has been embedded in encrypted-key.png`,
      {
        message: `DEBUG: Key ${this.encKey} has been embedded in encrypted-key.png`,
        duration: 10 * 1000,
      }
    );
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

