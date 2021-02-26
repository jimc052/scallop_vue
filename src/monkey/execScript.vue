<template>
  <modal
    v-model="visible"
    class-name="vertical-center-modal"
    title="monkey script"
    :width="width"
    @on-visible-change="onVisibleChange"
    :closable="false"
  >
    <textarea
      ref="textarea"
      :style="{
        width: '100%',
        height: height + 'px',
        padding: '5px',
        resize: 'none',
      }"
      :value="stdout"
      :readonly="true"
    ></textarea>
    <div slot="footer" style="display: flex; flex-direction: row">
      <i-button type="error" @click="visible = false">取消</i-button>
      <i-button type="warning" v-if="stdout.length > 0" @click="stdout = ''"
        >清除</i-button
      >
      <div style="flex: 1"></div>
      <i-select v-model="cycle" style="width: 80px; margin-right: 10px">
        <i-option v-for="item in cycles" :value="item" :key="item">{{
          item + " 次"
        }}</i-option>
      </i-select>
      <i-select v-model="interval" style="width: 80px; margin-right: 10px">
        <i-option v-for="item in intervals" :value="item" :key="item">{{
          item + " 秒"
        }}</i-option>
      </i-select>
      <i-button type="primary" @click="onOK">確定</i-button>
    </div>
  </modal>
</template>

<script>
export default {
  name: "execScript",
  components: {},
  props: ["script"],
  data() {
    return {
      visible: false,
      cycle: 5,
      cycles: [1, 2, 3, 5, 10, 20, 30, 50, 80, 100],
      interval: 10,
      intervals: [0, 10, 15, 20, 30],
      width: document.body.clientWidth - 200,
      height: document.body.clientHeight - 300,
      stdout: "",
    };
  },
  mounted() {
    // this.onResize();
  },
  methods: {
    async onOK() {
      this.stdout +=
        (this.stdout.length > 0 ? "\n\n" : "") + "開始：" + new Date() + "\n";
      try {
        let s =
          this.script +
          "#等待 " +
          this.interval +
          " 秒\nUserWait(" +
          this.interval * 1000 +
          ")";
        for (let i = 0; i < this.cycle; i++) {
          if (this.visible === false) return;
          await window.execScript(s, {
            cycle: 1, // this.cycle,
            write: i === 0,
            stdout: (data) => {
              if (this.visible === false) return;
              let d2 = new Date();
              this.stdout +=
                (this.stdout.length > 0 ? "\n" : "") +
                data +
                (data.indexOf("adb shell monkey ......") === 0
                  ? "第 " + (i + 1) + " 次(" + d2.toString("hh:MM:ss") + ")："
                  : "");
              setTimeout(() => {
                this.$refs["textarea"].scrollTop = this.$refs["textarea"].scrollHeight;
              }, 600);
            },
          });
        }
        let d3 = new Date();
        this.stdout += "\n結束：" + d3.toString("hh:MM:ss");
      } catch (e) {
        console.log(e);
        alert(e);
      }
      // this.visible = false;
    },
    onVisibleChange(v) {
      if (v === false) {
        this.$emit("on-close");
      }
    },
    onResize() {
      this.width = document.body.clientWidth - 200;
      this.height = document.body.clientHeight - 300;
    }
  },
  watch: {
    script(value) {
      this.visible = value.length > 0 ? true : false;
      this.stdout = "";
      if(this.visible == true) {
        this.onResize();
        this.broadcast.$on("on-resize", this.onResize);
      } else {
        this.broadcast.$off("on-resize", this.onResize);
      }
    },
  },
};
</script>
