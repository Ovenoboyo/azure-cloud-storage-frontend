<template>
  <b-modal id="decryptModal">
    <b-container fluid v-if="path.length > 0">
      <b-row>
        <b-col>{{ path }}</b-col>
        <b-col>AES + DES</b-col>
        <b-col>
          <b-form-file
            v-model="decKeyFile"
            placeholder="Choose a file or drop it here..."
            drop-placeholder="Drop file here..."
          />
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
import { decode } from "ts-steganography";
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class DecryptModal extends Vue {
  private path = "";
  private version = "";

  private decKeyFile: File | null = null;
  private onSuccessCallback?: (
    path: string,
    version: string,
    key: string
  ) => void;

  private async submitFile() {
    try {
      const decKey = await this.decryptImage();

      if (decKey && this.path && this.onSuccessCallback) {
        this.onSuccessCallback(this.path, this.version, decKey);
      }

      this.path = "";
      this.version = "";
      this.onSuccessCallback = undefined;

      this.$bvModal.hide("decryptModal");
    } catch (e) {
      this.$toast.error(
        "Error decrypting image: " + (e as Error)?.message ?? ""
      );
      console.error(e);
    }
  }

  private async decryptImage(): Promise<string | undefined> {
    if (this.decKeyFile) {
      const data = await new Promise<ArrayBuffer | string | null>(
        (resolve, reject) => {
          const fileReader = new FileReader();

          fileReader.onload = () => {
            resolve(fileReader.result);
          };

          fileReader.onerror = reject;

          fileReader.readAsDataURL(this.decKeyFile!);
        }
      );
      if (typeof data === "string") {
        const decodedKey = await decode(data);
        console.log("decoded", decodedKey);
        return decodedKey;
      }
    }
    throw new Error("Empty file");
  }

  mounted() {
    bus.$on(
      "showDecryptModal",
      (
        data: string,
        version: string,
        onSuccessCallback: typeof this.onSuccessCallback
      ) => {
        this.path = data;
        this.version = version;
        this.onSuccessCallback = onSuccessCallback;
        this.$bvModal.show("decryptModal");
      }
    );
  }
}
</script>

