<template>
  <modal id='modalDatatbase' v-model="visible" title="資料庫" class-name="vertical-center-modal" 
    @on-visible-change="onVisibleChange" :closable="false"
    fullscreen
  >
   
    <div slot="footer" >
      <i-button type="error" @click="$emit('on-close')">取消</i-button>
      <i-button v-if="dirty" type="primary" @click="onOK">確定</i-button>
    </div>
  </modal>
</template>
<script>

export default {
  name: 'ModalConfig',
  props: ["visible"],
  data () {
    return {
      dirty: false,

    }
  },
  async mounted() {
    
  },
  methods: {
    onOK(){
        // this.$emit("on-close", json);
    },
    onVisibleChange(v) {
      this.dirty = false;
      if (v === false) {
        this.$emit("on-close");
      } else {
      }
    },
  },
  watch: {
    visible(value){
    },
  },
  
}
</script>
<style>
.CodeMirror {
  height: 100%;
  /* font-family: monospace  !important; */
}
.CodeMirror * {
  font-family: Arial, monospace;
  font-size: 18px;
}

#modalDatatbase .ivu-modal-body {
  padding: 0px 0px !important;
  overflow: hidden !important;
}
</style>