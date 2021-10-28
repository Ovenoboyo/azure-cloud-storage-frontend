<template>
  <div class="about">
    <input
      type="file"
      @change="onInputChange"
      name="fileToUpload"
      id="fileToUpload"
    />
    <button @click="uploadFile">Upload</button>
    <button @click="listFiles">List</button>
    <button @click="downloadFile">Download</button>
    <div>{{ uploadStatus }}</div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Navbar from "@/components/Navbar.vue";
import { vxm } from "@/store";
import { get, post } from "@/utils/utils";

@Component({
  name: "About",
  components: {
    Navbar,
  },
})
export default class Dashboard extends Vue {
  private fileInput: File | null = null;
  private uploadStatus: string = "";

  private onInputChange(event: any) {
    const files = event.target.files as FileList;
    if (files.length > 0) {
      this.fileInput = files[0];
    }
  }

  private async uploadFile() {
    if (this.fileInput && vxm.auth.token) {
      const resp = (await (
        await post(
          "/api/upload?path=" + this.fileInput.name,
          this.fileInput,
          vxm.auth.token,
          false
        )
      ).json()) as UploadResponse;

      this.uploadStatus = "" + (resp.success ?? "Failed");
    }
  }

  private async listFiles() {
    if (vxm.auth.token) {
      const resp = await (await get("/api/list", vxm.auth.token)).json();
      console.log(resp);
    }
  }

  private async downloadFile() {
    if (vxm.auth.token) {
      const resp = await get("/api/download?path=testfile.txt", vxm.auth.token);
      const blob = await resp.blob();

      var a = document.createElement("a");
      document.body.appendChild(a);
      a.style.display = "none";

      var file = window.URL.createObjectURL(blob);
      a.href = file;
      a.download = "testfile.txt";
      a.click();
      URL.revokeObjectURL(file);

      a.remove();
    }
  }
}
</script>
