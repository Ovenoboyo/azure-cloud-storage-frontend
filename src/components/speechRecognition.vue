<template>
<div></div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

@Component({
  name: "Navbar",
})
export default class SpeechRecognitionComponent extends Vue {
  @Prop({ default: false })
  private isListen!: boolean;

  private recognition: typeof window.SpeechRecognition;

  @Watch("isListen")
  private onListenChanged() {
    if (this.isListen) this.recognition && this.recognition.start();
    else this.recognition && this.recognition.stop();
  }

  created() {
    const obj = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!obj) {
      throw new Error(
        "Speech Recognition does not exist on this browser. Use Chrome or Firefox"
      );
    }

    this.recognition = new obj();
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";

    this.recognition.addEventListener("result", (e: any) =>
      this.$emit(
        "result",
        Array.from(e.results)
          .map((r: any) => r[0])
          .map((r) => r.transcript)
          .join("")
      )
    );

    this.recognition.addEventListener("end", (data: any) =>
      this.onListenChanged()
    );

    this.onListenChanged();
  }
}
</script>
