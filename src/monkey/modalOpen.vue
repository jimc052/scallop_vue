<template>
  <modal
    v-model="visible"
    class-name="vertical-center-modal"
    :title="title"
    width="500"
    @on-visible-change="onVisibleChange"
    :closable="false"
  >
    <table style="width: 100%;">
      <tr><td width="50px;">名稱：</td>
        <td><Input v-model="name" placeholder="名稱" id="script_name" /></td></tr>
      <tr><td>專案：</td>
        <td>
          <Select v-model="project" style="width:200px">
            <Option v-for="item in projects" :value="item" :key="item">
              {{ item }}
            </Option>
          </Select></td></tr>
      <tr><td>裝置：</td>
        <td>
          <Select v-model="device" style="width:200px">
            <Option v-for="item in devices" :value="item" :key="item">
              {{ item }}
            </Option>
          </Select></td></tr>
      <tr><td>描述：</td>
        <td><textarea :value="descript" style="resize: none; width: 100%; height: 100px;" 
        /></td></tr>
    </table>
    <div slot="footer" >
      <i-button type="error" @click="visible = false">取消</i-button>
      <i-button type="primary" @click="onOK">確定</i-button>
    </div>
  </modal>
</template>
<script>

export default {
  name: 'ModalOpen',
  props: ["title"],
  components: {
  },
  data () {
    return {
      visible: false,
      name: "",
      project: "",
      projects: ["BiPOS2", "mECR"],
      device: "",
      devices: ["H10", "V2", "A920"],
      descript: "",
    }
  },
  async mounted() {
  },
  methods: {
    onOK(){
      this.visible = false;
    },
    onVisibleChange(v) {
      if (v === false) {
        this.$emit("on-close");
      }
    },
  }
}
</script>

<style>
</style>
