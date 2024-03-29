<template>
  <b-container fluid class="dashboard-container">
    <b-row
      class="header"
      no-gutters
      @drop="dropFile"
      @dragover="dragover"
      @dragleave="dragleave"
    >
      <b-col>
        <div class="d-flex upload-container" @click="openUploadDialog">
          <div class="upload-button">+ Upload New File</div>
          <div class="dnd d-flex align-items-center">or Drag and Drop</div>
        </div>
        <input
          type="file"
          @change="onInputChange"
          name="fileToUpload"
          ref="fileToUpload"
          hidden
        />
      </b-col>
      <b-col align-self="center">
        <div
          class="d-flex justify-content-end logout-container"
          @click="logout"
        >
          <div>Logout</div>
          <img
            class="logout-icon"
            src="@/assets/img/fe_logout.svg"
            alt="logout"
          />
        </div>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <b-table
          striped
          hover
          :items="fileList"
          :fields="fields"
          :key="rTable"
          sticky-header
          class="table-container"
          tbody-tr-class="table-row"
        >
          <template #head(refresh)="data">
            <div
              class="d-flex align-items-center refresh-container"
              @click="fetchData"
            >
              <span>{{ data.label }}</span>
              <img
                class="refresh-icon"
                src="@/assets/img/ci_refresh.svg"
                alt="refresh"
              />
            </div>
          </template>
          <template #cell(file_name)="data">
            {{ getFileData(data.item).file_name }}
          </template>
          <template #cell(last_modified)="data">
            {{ parseTimestamp(getFileData(data.item).last_modified) }}
          </template>
          <template #cell(md5)="data">
            {{ getFileData(data.item).md5 }}
          </template>
          <template #cell(size)="data">
            <div class="size-col">
              {{ humanFileSize(getFileData(data.item).size) }}
            </div>
          </template>
          <template #cell(version)="data">
            <b-dropdown id="dropdown-1">
              <template #button-content>
                <div class="d-flex align-items-center">
                  <div>{{ parseVersion(activeVersionList[data.item]) }}</div>
                  <img
                    class="dropdown-icon"
                    src="@/assets/img/dropdown.svg"
                    alt="dropdown"
                  />
                </div>
              </template>
              <b-dropdown-item
                v-for="version of getAllVersions(data.item)"
                @click="setActiveVersion(data.item, version)"
                :key="data.item + version"
              >
                {{ parseVersion(version) }}
              </b-dropdown-item>
            </b-dropdown>
          </template>
          <template #cell(refresh)="data">
            <div class="d-flex">
              <img
                style="cursor: pointer"
                src="@/assets/img/bx_bxs-download.svg"
                alt="download"
                @click="downloadFile(data.item, activeVersionList[data.item])"
              />
              <img
                style="cursor: pointer"
                src="@/assets/img/fluent_delete-24-regular.svg"
                alt="delete"
                class="delete-icon"
                @click="deleteFile(data.item, activeVersionList[data.item])"
              />
              <img
                style="cursor: pointer"
                src="@/assets/img/ant-design_share-alt-outlined.svg"
                alt="share"
                class="share-icon"
                @click="
                  shareFile(
                    data.item,
                    activeVersionList[data.item],
                    fileListParsed[data.item][0].uid
                  )
                "
              />
            </div>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <EncryptModal />
    <DecryptModal />
  </b-container>
</template>

<script lang="ts">
import { Vue, Component, Ref } from "vue-property-decorator";
import Navbar from "@/components/Navbar.vue";
import { get, post } from "@/utils/utils";
import moment from "moment";
import EncryptModal from "@/components/EncryptModal.vue";
import DecryptModal from "@/components/DecryptModal.vue";

import { bus } from "@/main";
import { Buffer } from "buffer";

@Component({
  name: "Dashboard",
  components: {
    Navbar,
    EncryptModal,
    DecryptModal,
  },
})
export default class Dashboard extends Vue {
  private jwtToken: string | undefined;

  private uploadStatus = "";
  private fileList: string[] = [];
  private fileListParsed: AzureFileParsed = {};
  private activeVersionList: { [key: string]: string } = {};

  private rTable = false;

  @Ref("fileToUpload")
  private uploadField!: HTMLInputElement;

  private fields = [
    "file_name",
    "version",
    "size",
    "md5",
    "last_modified",
    "refresh",
  ];

  created(): void {
    this.jwtToken = this.$cookies.get("jwtToken");

    if (process.env.NODE_ENV !== "development") {
      if (!this.jwtToken) {
        this.$router.push("/");
        return;
      }
    }
    this.fetchData();
  }

  private parseTimestamp(timestamp: number) {
    return moment(timestamp).format("DD-MM-YYYY LT");
  }

  private parseVersion(timestamp: string) {
    return moment(timestamp).format("YYYY-MM-DD LT");
  }

  private humanFileSize(bytes: number, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
      return bytes + " B";
    }

    const units = si
      ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
      : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    let u = -1;
    const r = 10 ** dp;

    do {
      bytes /= thresh;
      ++u;
    } while (
      Math.round(Math.abs(bytes) * r) / r >= thresh &&
      u < units.length - 1
    );

    return bytes.toFixed(dp) + " " + units[u];
  }

  private async fetchData() {
    this.fileListParsed = {};
    this.fileList = [];
    this.activeVersionList = {};

    const files = await this.listFiles();
    if (files.data) {
      for (const file of files.data) {
        if (!this.fileListParsed[file.file_name]) {
          this.fileListParsed[file.file_name] = [];
        }

        this.fileListParsed[file.file_name].push(file);
      }
      this.fileList.push(...Object.keys(this.fileListParsed));

      for (const f of this.fileList) {
        this.activeVersionList[f] = this.fileListParsed[f][0].version;
      }
    }

    console.log(this.fileListParsed);
  }

  private getFileData(key: string) {
    const version = this.activeVersionList[key];
    return (
      this.fileListParsed[key].find((val) => val.version === version) ??
      this.fileListParsed[key][0]
    );
  }

  private getAllVersions(key: string) {
    return this.fileListParsed[key].map((val) => val.version);
  }

  private setActiveVersion(key: string, version: string) {
    this.$set(this.activeVersionList, key, version);
    this.refreshTable();
  }

  private refreshTable() {
    this.rTable = !this.rTable;
  }

  private onInputChange(event: HTMLInputFileEvent) {
    if (event) {
      const files = event.target.files;
      bus.$emit("showEncryptModal", files, this.uploadFile.bind(this));
    }
  }

  private dragover(event: DragEvent) {
    event.preventDefault();
  }

  private dragleave(event: DragEvent) {
    event.preventDefault();
  }

  private dropFile(event: DragEvent) {
    if (event) {
      event.preventDefault();
      if (event.dataTransfer) {
        bus.$emit(
          "showEncryptModal",
          event.dataTransfer.files,
          this.uploadFile.bind(this)
        );
      }
    }
  }

  private openUploadDialog() {
    this.uploadField.click();
  }

  private async uploadFile(files: FileList, key: string) {
    if (this.jwtToken) {
      for (const file of files) {
        this.$toast.info("Uploading " + file.name, {
          message: "Uploading " + file.name,
          position: "top",
          duration: 5000,
        });
        // TODO: Pass key in body params
        const resp = (await (
          await post(
            `/api/upload?path=${file.name}&key=${key}`,
            file,
            this.jwtToken,
            false
          )
        ).json()) as UploadResponse;

        if (resp.success) {
          this.$toast.success("Uploaded " + file.name, {
            message: "Uploaded " + file.name,
            position: "top",
            type: "success",
            duration: 5000,
          });
        } else {
          this.$toast.error("Failed to upload " + file.name, {
            message: "Failed to upload " + file.name,
            position: "top",
            type: "error",
            duration: 5000,
          });
        }

        await this.fetchData();
      }
    }
  }

  private async listFiles(): Promise<BlobListResponse> {
    if (this.jwtToken) {
      const resp = await (await get("/api/list", this.jwtToken)).json();
      return resp as BlobListResponse;
    }

    return {
      success: false,
      data: [],
    };
  }

  private downloadFile(key: string, version: string) {
    bus.$emit("showDecryptModal", key, version, this._downloadFile.bind(this));
  }

  private async _downloadFile(path: string, version: string, key: string) {
    if (this.jwtToken) {
      const resp = await get(
        `/api/download?path=${path}&version=${version}&key=${key}`,
        this.jwtToken
      );
      const blob = await resp.blob();

      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style.display = "none";

      const file = window.URL.createObjectURL(blob);
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

  private shareFile(path: string, version: string, uid: string) {
    const currentURL = new URL(window.location.href);
    currentURL.pathname = `/share/${encodeURIComponent(
      Buffer.from(`${path}:${uid}`).toString("base64")
    )}/${encodeURIComponent(version)}`;

    navigator.clipboard.writeText(currentURL.toString());
  }

  private async deleteFile(key: string, version: string) {
    if (this.jwtToken) {
      const resp = await post(
        "/api/delete",
        {
          file_name: key,
          version,
        },
        this.jwtToken
      );

      this.$toast.info("Deleted file successfully", {
        message: "Deleted file successfully",
        position: "top",
        duration: 5000,
      });

      await this.fetchData();
    }
  }

  private logout() {
    this.$cookies.remove("jwtToken");
    this.$router.push("/");
    this.$toast.success("Logged out", {
      message: "Logged out",
      position: "top",
      type: "success",
      duration: 5000,
    });
  }
}
</script>

<style lang="sass">
@import url('https://fonts.googleapis.com/css2?family=Lato&display=swap')
*
  font-family: 'Lato', sans-serif

*::-webkit-scrollbar,
*::-webkit-scrollbar-thumb
  width: 26px
  border-radius: 13px
  background-clip: padding-box
  border: 10px solid transparent
  min-height: 50px

*::-webkit-scrollbar-thumb
  box-shadow: inset 0 0 0 10px
  color: #a3a3a3
  min-height: 40px

*::-webkit-scrollbar-track
  margin-top: calc( 0.75rem * 2 + 18px)
  background: transparent

th
  font-weight: 600

td
  vertical-align: middle

.dropdown-toggle
  background: transparent !important
  border-color: transparent !important
  color: #1452CC !important
  padding: 0
  font-style: italic
  &::after
    content: none !important

.dropdown-item
  color: #1452CC !important
  border-radius: 25px
  font-style: italic
  &:active
    background-color: #e9ecef

.dropdown-menu
  box-shadow: 0px 0px 30px rgba(48, 48, 48, 0.19)
  border: none
  border-radius: 25px

.table-row
  height: 75px
</style>

<style lang="sass" scoped>
.header
  height: 60px
  padding: 15px 0
  -webkit-user-select: none
  -moz-user-select: none
  -ms-user-select: none
  user-select: none

.dashboard-container
  padding: 0 30px
  height: 100vh

.dnd
  margin-left: 10px
  font-size: 14px
  color: #ADADAD

.upload-button
  font-size: 20px
  color: #1452CC

.logout-icon
  margin-left: 8px

.logout-container
  color: #E83B3B
  font-size: 20px
  cursor: pointer

.upload-container
  cursor: pointer

.table-container
  margin-top: 40px
  max-height: calc( 100vh - 60px - 40px - 30px)

.refresh-icon
  margin-left: 4px

.delete-icon
  margin-left: 36px

.share-icon
  width: 25px
  margin-left: 36px

.dropdown-icon
  margin-left: 10px

.size-col
  padding-right: 10px

.refresh-container
  cursor: pointer
</style>

