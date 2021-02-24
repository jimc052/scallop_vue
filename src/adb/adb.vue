<template>
  <div id="app" style="display: flex; flex-direction: column; align-items: stretch; justify-content: end">
    <div style="background: #2d8cf0; display: flex; flex-direction: row; justify-content: start; align-items: end;">
      <div style="flex: 1;"></div>
      <Icon type="md-cog" class="btn" @click.native="onClickIcon(-1)"></Icon>
      <Icon type="md-close" class="btn"></Icon>
      <!-- https://www.iviewui.com/components/icon -->
    </div>
    <div  style="flex: 1;">
      <Split v-model="split1" min="120">
        <div slot="left" id="left" class="demo-split-pane" style="z-index: 1; overflow-x: hidden;">
            <Tree :data="config.commands" style="z-index: -1"></Tree>
        </div>
        <div id="right" slot="right" class="demo-split-pane" style="z-index: 1; overflow-x: hidden;">
        </div>
      </Split>
    </div>
    <ModalConfig ref="modal" :visible="visible" @on-close="closeModal" 
      :config="JSON.stringify(config)" />
  </div>
</template>

<script>
import ModalConfig from "./modalConfig";

export default {
  name: 'ADB',
  components: {ModalConfig},
  data () {
    return {
      split1: 0.3,
      visible: false,
      config: {
        package: [],
        commands: []
      }
    }
  },
  async mounted() {
    if(this.$isElectron== true){
      
    }
    let x = localStorage["adb-config"];
    if(typeof x == "string" && x.length > 0)
      this.config = JSON.parse(x); 
    else {
      this.visible = true;
    }
    console.log(this.config)
  },
  methods: {
    retrive(path){
      path = typeof path == "undefined" ? "" : path + "/";
      return new Promise( async (success, error) => {
        if(this.$isElectron== true){
          try{
            let result = await window.shell("adb shell ls -F " + path);
            let arr = result.split("\n");
            let folder = [], file = [];
            for(let i = 0; i < arr.length; i++){
              let obj = {};
              if(arr[i].substr(arr[i].length - 1, 1) == "/"){
                folder.push({title: arr[i].substr(0, arr[i].length - 1), 
                  expand: false,
                  loading: false,
                  children: [],
                  path
                })
              } else if(arr[i].length > 0) {
                file.push({title: arr[i]})
              } else 
                continue;
            }
            success(folder.concat(file))
          } catch(e){
            error(e)
          }
        } else {
          success([])
        }
      })
    },
    onClickIcon(){

    },
    closeModal(){
      this.visible = false;
    }
  },
}
</script>

<style>
html, body {
  height: 100%;
  margin: 0px;
  padding: 0px;
  overflow: hidden;
}
div, span {
  user-select: none;
}
* {
  box-size: border-box;
  font-family: 'Times New Roman', 'Helvetica Neue', 微軟正黑體, 'Microsoft Jhenghei', Helvetica, Arial, sans-serif;
	font-size: 16px;
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
#left, #right {
  height: 100%;
}
.demo-split{
  height: 200px;
  border: 1px solid #dcdee2;
}
.demo-split-pane{
  padding: 10px;
}
.ivu-tree {
  text-align: left;
}
.ivu-tree ul li {
  padding: 0px;
  margin: 0px;
}
.btn {
  margin: 5px 10px 5px 0;
  color: white;
  font-size: 25px;
  cursor: pointer;
}
</style>
