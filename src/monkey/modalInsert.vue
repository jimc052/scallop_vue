<template>
  <div :style="{height: height + 'px'}">
    <Tabs type="card">
      <TabPane label="JSON" class="tab-pane" id="tab-script">
        <Input v-model="script" type="textarea" placeholder="JSON"
          id="scriptValue"
          styel="height: 100%;" :rows="20"
        @on-change="scriptChange" />
      </TabPane>
      <TabPane label="清單" class="tab-pane">
        <Table border :columns="columns" :data="list" @on-row-click="onRowClick"></Table>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>

export default {
  name: 'ModalInsert',
  props: ["list"],
  components: {
  },
  data () {
    return {
      script: "", 
      columns: [{
        title: '名稱',
        key: 'name',
        width: 150,
        fixed: 'left'
      }, {
        title: '專案',
        key: 'project',
        width: 100,
      }, {
        title: '裝置',
        key: 'device',
        width: 100,
      }, {
        title: '描述',
        key: 'descript',
      }],
      height: document.body.clientHeight - 200
    }
  },
  async mounted() {
    setTimeout(()=>{
      let modal = document.querySelectorAll(".ivu-modal");
      for(let i = 0; i < modal.length; i++) {
        if(modal[i].style.display != "none") {
          modal[i].style.top = "20px";
          let tabScript = document.querySelector("#tab-script");
          let textarea = document.querySelector("#scriptValue textarea");
          textarea.style.height = (tabScript.clientHeight -8) + "px";
        }
      }
    }, 300)
  },
  methods: {
    onRowClick(data, index){
      // console.log(data, index)
      this.$emit("rowClick", data)
    },
    scriptChange() {
      this.$emit("scriptChange", this.script)
    },
  }
}

</script>

<style>
.ivu-tabs {
  height: calc(100% - 5px);
}
.ivu-tabs {
  display: flex;
  flex-direction: column;
}
.ivu-tabs-bar {
  margin: 0px;
}
.ivu-tabs-content {
  flex: 1;
  width: 100%;
}
.tab-pane {
  height: 100%;
  padding: 5px 0px;
}
.ivu-table-cell {
  padding: 0px 5px;
}
.ivu-table td, .ivu-table th {
  height: 30px;
}
</style>
