import Vue from "vue";
import Vuex from "vuex";
import { createProxy, extractVuexModule } from "vuex-class-component";
import { AuthStore } from "./auth";

Vue.use(Vuex);

export const store = new Vuex.Store({
  modules: {
    ...extractVuexModule(AuthStore)
  }
})

// Creating proxies.
export const vxm = {
  auth: createProxy(store, AuthStore),
}
