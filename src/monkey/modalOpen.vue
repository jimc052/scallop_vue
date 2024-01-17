<template>
  <modal
    v-model="visible"
    class-name="vertical-center-modal"
    :title="edit_Item != null && typeof edit_Item.key == 'undefined' ? '新增' : '編輯'"
    width="500"
    @on-visible-change="onVisibleChange"
    :closable="false"
  >
    <table style="width: 100%;" v-if="visible == true">
      <tr><td width="50px;">名稱：</td>
        <td>
          <Input v-model="edit_Item.name" placeholder="名稱" id="script_name" />
        </td>
      </tr>
      <tr><td>專案：</td>
        <td>
          <Select v-model="edit_Item.project" style="width:200px">
            <Option v-for="item in projects" :value="item" :key="item">
              {{ item }}
            </Option>
          </Select>
        </td>
      </tr>
      <tr><td>裝置：</td>
        <td>
          <Select v-model="edit_Item.device" style="width:200px">
            <Option v-for="item in devices" :value="item" :key="item">
              {{ item }}
            </Option>
          </Select>
        </td>
      </tr>
      <tr><td>描述：</td>
        <td>
          <textarea :value="edit_Item.descript" style="resize: none; width: 100%; height: 100px;"/>
        </td>
      </tr>
    </table>
    <div slot="footer" >
      <i-button type="error" @click="$emit('on-close')">取消</i-button>
      <i-button type="primary" @click="onOK">確定</i-button>
    </div>
  </modal>
</template>
<script>

export default {
  name: 'ModalOpen',
  props: ["editItem", "visible"],
  components: {
  },
  data () {
    return {
      projects: ["BiPOS2", "mECR", "JabezDC", "new2ECR", "new2DC"],
      devices: ["H10", "V2", "A920", "T1", "T2", "T2mini"],
      edit_Item: {
        name: "",
        project: "",
        device: "",
        descript: "",
      }
    }
  },
  async mounted() {
  },
  methods: {
    onOK(){
      let msg = "";
      if(this.edit_Item.name.trim() == "")
        msg = "請輸入名稱"
      else if(this.edit_Item.project.trim() == "")
        msg = "請輸入專案"
      else if(this.edit_Item.device.trim() == "")
        msg = "請輸入裝置"
      if(msg.length == 0) {
        this.$emit('on-close', this.edit_Item);
      } else {
        alert(msg)
      }
    },
    onVisibleChange(v) {
      if (v === false) {
        this.$emit("on-close");
      }
    },
  },
  watch: {
    visible(value){
    },
    editItem(value) {
      if(this.visible == false) {
       this.edit_Item = {
          name: "",
          project: "",
          device: "",
          descript: "",
        }     
      } else {
        this.edit_Item = Object.assign({
          name: "",
          project: "",
          device: "",
          descript: "",
        }, value)
      }
    }
  }
}
</script>