<template>
  <div class="login-page d-grid">
    <b-container fluid class="login-container">
      <b-row class="h-100">
        <b-col :order="isLogin ? 0 : 1" class="left-container">
          <b-row align-v="center" class="h-100 left-container-inner">
            <b-col>
              <b-row align-v="center">
                <b-col>
                  <h1 class="login_title">
                    {{ isLogin ? "Sign in" : "Register" }}
                  </h1>
                </b-col>
              </b-row>
              <!-- <b-row v-if="authStatus">
                <h1 class="error-message">
                  {{ authStatus }}
                </h1>
              </b-row> -->
              <b-row no-gutters align-v="center">
                <b-col>
                  <b-input
                    class="login-input"
                    aria-label="Username"
                    placeholder="Username"
                    type="text"
                    v-model="username"
                  />
                </b-col>
                <b-col
                  :title="
                    isListen ? 'Click to stop using voice' : 'Enter using voice'
                  "
                  cols="auto"
                  class="mic-icon"
                  v-if="hasSpeech"
                >
                  <mic-icon @click.native="toggleListen" :stroke="micStroke" />
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <b-input
                    class="login-input"
                    aria-label="password"
                    placeholder="Password"
                    type="password"
                    v-model="password"
                  />
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <b-input
                    v-if="!isLogin"
                    class="login-input"
                    aria-label="email"
                    placeholder="Email"
                    type="email"
                    v-model="email"
                  />
                </b-col>
              </b-row>
              <b-row class="mt-4">
                <b-col>
                  <vue-recaptcha
                    ref="recaptcha"
                    sitekey="6LdkUL0fAAAAALOxpqSh_2Hu_jO1ZO_QzmaS2iS6"
                    @verify="verifyMethod"
                    @expired="expiredMethod"
                    class="speech"
                  ></vue-recaptcha>
                </b-col>
              </b-row>
              <b-row>
                <button
                  @click="isLogin ? login() : register()"
                  class="login_btn mx-auto"
                >
                  {{ isLogin ? "Sign in" : "Register" }}
                </button>
              </b-row>
            </b-col>
          </b-row>
        </b-col>

        <b-col
          class="right-container h-100"
          :style="{ borderRadius: isLogin ? '0 26px 26px 0' : '26px 0 0 26px' }"
        >
          <b-row align-v="center" class="right-container-inner h-100">
            <b-col>
              <b-row>
                <h1 class="login_title">
                  {{
                    isLogin
                      ? "Don't have an account?"
                      : "Already have an account?"
                  }}
                </h1>
              </b-row>
              <b-row>
                <p class="login_desc">
                  {{ isLogin ? "Register now!" : "Login now!" }}
                </p>
              </b-row>
              <b-row>
                <button @click="toggleLoginSignup" class="register_btn mx-auto">
                  {{ isLogin ? "Sign up" : "Log in" }}
                </button>
              </b-row>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
      <SpeechRecognitionComponent
        :isListen="isListen"
        @result="onSpeechDetected"
        v-if="hasSpeech"
      />
    </b-container>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import Navbar from "@/components/Navbar.vue";
import { post } from "@/utils/utils";
import { VueRecaptcha } from "vue-recaptcha";
import SpeechRecognitionComponent from "../components/speechRecognition.vue";
import MicIcon from "../components/micIcon.vue";

@Component({
  name: "Home",
  components: {
    VueRecaptcha,
    Navbar,
    SpeechRecognitionComponent,
    MicIcon,
  },
})
export default class Home extends Vue {
  private isLogin = true;

  private username = "";
  private password = "";
  private email = "";

  private authStatus = "";
  private authSuccess = false;

  private captchaStatus = false;

  private isListen = false;

  private micStroke = "black";

  private get hasSpeech() {
    return window.SpeechRecognition;
  }

  @Watch("authStatus")
  private onAuthStatusChanged() {
    if (this.authStatus) {
      this.$toast.info(this.authStatus, {
        duration: 5000,
        message: this.authStatus,
        position: "top",
        type: this.authSuccess ? "success" : "error",
      });
    }
  }

  @Watch("isListen")
  private onListenChanged() {
    if (this.isListen) this.micStroke = "red";
    else this.micStroke = "black";
  }

  private onSpeechDetected(data: any) {
    this.username = data;
  }

  private expiredMethod() {
    console.log("Captcha expired");
    this.captchaStatus = false;
    (this.$refs.recaptcha as any).reset();
  }

  private verifyMethod() {
    console.log("Captcha verified");
    this.captchaStatus = true;
  }

  private created() {
    if (this.$cookies.get("jwtToken")) {
      this.$router.push("/dashboard");
    }
  }

  private toggleLoginSignup() {
    try {
      (this.$refs.recaptcha as any).reset();
    } catch (e) {
      console.error("Failed to reset recaptcha", e);
    }
    if (this.isLogin) this.authStatus = "";
    this.isListen = false;
    this.isLogin = !this.isLogin;
  }

  private async login() {
    if (this.captchaStatus) {
      try {
        const resp = (await (
          await post("/login", {
            username: this.username,
            password: this.password,
          })
        ).json()) as LoginResponse;

        this.$cookies.set("jwtToken", resp.data.token, 3 * 60 * 60);

        const redirect = this.hasRedirect();
        console.log(redirect);
        this.$router.push(
          !redirect || redirect === "/" ? "/dashboard" : redirect
        );
        this.$toast.info("Logged in successfully", {
          duration: 5000,
          message: "Logged in successfully",
          position: "top",
          type: "success",
        });
      } catch (e) {
        console.error(e);
        this.authStatus = "Invalid Username/Password";
        this.authSuccess = false;
      }
    } else {
      this.authStatus = "Please complete the captcha and try again";
      this.authSuccess = false;
    }
  }

  private hasRedirect() {
    return (this.$route.query.redirect as string)?.replaceAll(
      "/?redirect=",
      ""
    );
  }

  private toggleListen() {
    this.isListen = !this.isListen;
    console.log(this.isListen);
  }

  private async register() {
    if (this.captchaStatus) {
      const resp = (await (
        await post("/register", {
          username: this.username,
          password: this.password,
          email: this.email,
        })
      ).json()) as RegisterResponse;

      console.log(resp);

      if (resp.error) {
        this.authStatus = resp.error;
        this.authSuccess = false;
      } else if (resp.success) {
        this.authStatus = resp.success
          ? "Successfully registered"
          : "Registeration failed";
        this.authSuccess = !!resp.success;
        this.toggleLoginSignup();
      }
    } else {
      this.authStatus = "Please complete the captcha and try again";
      this.authSuccess = false;
    }
  }

  mounted() {
    window.onkeydown = (e) => {
      if (e.code === "Enter") {
        this.isLogin ? this.login() : this.register();
      }
    };
  }
}
</script>

<style lang="sass" scoped>
.login-container
  box-shadow: 4px 7px 12px -10px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)
  text-align: center
  border-radius: 26px
  background-color: #ffffff
  width: 850px
  height: 600px

.right-container
  color: white
  text-align: center
  background: #834ce6
  background-color: #3787f6
  background-image: linear-gradient(315deg, #733fed 0%, #3787f6 74%)
  background-repeat: no-repeat
  background-size: cover
  background-position: 0 0

.left-container
  border-radius: 26px

.login-page
  background: #f6f5f7
  height: 100vh
  place-items: center

.left-container-inner, .right-container-inner
  padding: 35px

.login-input
  background-color: #eee !important
  border: none
  padding: 12px 15px
  margin: 20px 0 0 0
  border-radius: 5px

.forgot_pass
  color: #333
  font-size: 14px
  text-decoration: none

.login_btn
  border: 1px solid #7853ce
  background-color: #735cdd
  margin-top: 25px

.login_btn, .register_btn
  border-radius: 20px
  width: calc(100% - 130px)
  color: #ffffff
  font-size: 12px
  font-weight: bold
  padding: 12px 45px
  letter-spacing: 1px
  text-transform: uppercase

.register_btn
  border: 1px solid #fff
  background-color: transparent

.login_title
  margin-bottom: 25px
  font-weight: bold

.login_desc
  font-size: 15px
  font-weight: 400
  line-height: 20px
  letter-spacing: 0.5px
  margin: 20px 0 30px

.error-message
  color: crimson
  margin-bottom: 20px
  font-size: 14px

.mic-icon
  margin-top: 15px
  svg
    cursor: pointer
    width: 16px

.reset-icon
  width: 30px
  margin-bottom: 25px
</style>