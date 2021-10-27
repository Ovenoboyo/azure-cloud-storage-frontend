<template>
  <div class="home">
    <input type="text" v-model="username" id="username" />
    <input type="password" v-model="password" id="password" />
    <button @click="login">Login</button>
    <button @click="register">Register</button>

    <div>{{ authStatus }}</div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Navbar from "@/components/Navbar.vue";
import { vxm } from "@/store";
import { post } from "@/utils/utils";

@Component({
  name: "Home",
  components: {
    Navbar,
  },
})
export default class Home extends Vue {
  private username: string = "";
  private password: string = "";

  private authStatus: string = "";

  private async login() {
    try {
      const resp = (await (
        await post("/login", {
          username: this.username,
          password: this.password,
        })
      ).json()) as LoginResponse;

      vxm.auth.token = resp.data.token;
      console.log(resp);

      this.$router.push("/dashboard");
    } catch (e) {
      console.error(e);
      this.authStatus = e as string;
    }
  }

  private register() {
    post("/register", {
      username: this.username,
      password: this.password,
    });
  }
}
</script>

<style scoped>
.block {
  margin: 3rem 2rem 3rem 2rem;
}
h1,
h2 {
  margin: 0;
}
h3 {
  margin-top: 0.5rem;
}
img {
  margin-bottom: 1rem;
}
.donate-btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
  color: #fff;
  background-color: #1e7e34;
  border-color: #1c7430;
  cursor: pointer;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  text-decoration: none;
}
.donate-btn:hover {
  color: #fff;
  background-color: #218838;
  border-color: #1e7e34;
}
</style>
