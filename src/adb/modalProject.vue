<template>
  <div id="modalProject" >
    <Table border :columns="columns" :data="list" @on-row-click="onRowClick"></Table>
  </div>
</template>
<script>

export default {
  name: 'ModalProject',
  props: ["list"],
  components: {
  },
  data () {
    return {
      columns: [{
        title: '專案',
        key: 'project',
      }],
    }
  },
  async mounted() {
    // setTimeout(()=>{
    //   let modal = document.querySelectorAll(".ivu-modal");
    //   for(let i = 0; i < modal.length; i++) {
    //     if(modal[i].style.display != "none") {
    //       modal[i].style.top = "20px";
    //       let tabScript = document.querySelector("#tab-script");
    //       let textarea = document.querySelector("#scriptValue textarea");
    //       textarea.style.height = (tabScript.clientHeight -8) + "px";
    //     }
    //   }
    // }, 300)
  },
  methods: {
    onRowClick(data, index){
      // console.log(data, index)
      this.$emit("rowClick", data)
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
#modalProject {
  
}
</style>
