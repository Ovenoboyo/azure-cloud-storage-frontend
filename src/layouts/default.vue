<template>
  <div class="appContainer">
    <div class="main-content">
      <transition name="slide-fade">
        <router-view></router-view>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import Vue from "vue";
import { get } from "@/utils/utils";

@Component({})
export default class DefaultLayout extends Vue {
  async created() {
    // if (process.env.NODE_ENV !== "development") {
    if (this.$route.name !== "Home") {
      const token = this.$cookies.get("jwtToken");
      if (token) {
        const resp = await (await get("/validate?token=" + token)).json();
        if (resp.success) {
          return;
        }
      }

      this.$router.push(`/?redirect=${this.$route.fullPath}`);
    }
  }
  // }
}
</script>
