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
  mounted(): void {
    const path = decodeURIComponent(this.$route.params.path);
    const version = decodeURIComponent(this.$route.params.version);

    console.log("emitting");
    bus.$emit("showDecryptModal", path, version, this._downloadFile.bind(this));
  }

  private async _downloadFile(path: string, version: string, key: string) {
    const jwtToken = this.$cookies.get("jwtToken");

    if (jwtToken) {
      const resp = await get(
        `/api/download?path=${path}&version=${version}&key=${key}`,
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