<template>
  <div>
    <DecryptModal />
  </div>
</template>

<script lang="ts">
import DecryptModal from "@/components/DecryptModal.vue";
import Navbar from "@/components/Navbar.vue";
import { Component } from "vue-property-decorator";
import Vue from "vue";
import { get } from "@/utils/utils";
import { bus } from "@/main";

@Component({
  name: "Dashboard",
  components: {
    Navbar,
    DecryptModal,
  },
})
export default class Dashboard extends Vue {
  private fullPath = "";
  mounted(): void {
    this.fullPath = decodeURIComponent(this.$route.params.path);
    const version = decodeURIComponent(this.$route.params.version);

    console.log(this.fullPath.split(":")[0], version);

    console.log("emitting");
    bus.$emit(
      "showDecryptModal",
      this.fullPath.split(":")[0],
      version,
      this._downloadFile.bind(this)
    );
  }

  private async _downloadFile(pathUid: string, version: string, key: string) {
    const [path, uid] = this.fullPath.split(":");
    const jwtToken = this.$cookies.get("jwtToken");

    if (jwtToken) {
      const resp = await get(
        `/api/download?path=${path}&version=${version}&key=${key}&uid=${uid}`,
        jwtToken
      );

      
      const blob = await resp.blob();

      var a = document.createElement("a");
      document.body.appendChild(a);
      a.style.display = "none";

      var file = window.URL.createObjectURL(blob);
      a.href = file;
      a.download = path;
      a.click();
      URL.revokeObjectURL(file);

      a.remove();

      this.$toast.info("Downloaded file successfully", {
        message: "Downloaded file successfully",
        position: "top",
        duration: 5000,
      });
    }
  }
}
</script>