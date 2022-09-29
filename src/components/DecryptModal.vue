<template>
  <b-modal id="decryptModal">
    <b-container fluid v-if="path.length > 0">
      <b-row>
        <b-col>{{ path }}</b-col>
        <b-col>AES</b-col>
        <b-col>
          <b-input v-model="decKey" />
        </b-col>
      </b-row>
    </b-container>

    <template #modal-footer>
      <b-button @click="submitFile">Submit</b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { bus } from "@/main";
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class EncryptModal extends Vue {
  private path = "";
  private version = ""

  private decKey: string = "";
  private onSuccessCallback?: (path: string, version: string, key: string) => void;

  private submitFile() {
    if (this.path && this.onSuccessCallback) {
      this.onSuccessCallback(this.path, this.version, this.decKey);
    }

    this.path = "";
    this.version = ""
    this.onSuccessCallback = undefined;
  }

  mounted() {
    bus.$on(
      "showDecryptModal",
      (data: string, version: string, onSuccessCallback: typeof this.onSuccessCallback) => {
        this.path = data;
        this.version = version
        this.onSuccessCallback = onSuccessCallback;
        this.$bvModal.show("decryptModal");
      }
    );
  }
}
</script>

