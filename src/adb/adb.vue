<template>
  <div id="app" style="display: flex; flex-direction: column; align-items: stretch; justify-content: end">
    <div style="background: #2d8cf0; display: flex; flex-direction: row; justify-content: start; align-items: end;">
      <div style="flex: 1;"></div>
      <Icon type="md-cog" class="btn" @click.native="visible=true"></Icon>
      <Icon type="md-close" class="btn" @click.native="onClickIcon"></Icon>
      <!-- https://www.iviewui.com/components/icon -->
    </div>
    <div  style="flex: 1;">
      <Split v-model="split1" min="150">
        <div slot="left" id="left" class="demo-split-pane" style="z-index: 1; overflow-x: hidden;">
            <Tree :data="config.commands" style="z-index: -1" @on-select-change="onSelectChange"></Tree>
        </div>
        <div id="right" slot="right" class="demo-split-pane" style="z-index: 1; overflow-x: hidden;">
          <Tabs type="card"  @on-tab-remove="onTabRemove" @on-click="onTabClick">
            <TabPane v-for="(tab, index) in tabs" :closable="index == 0 ? false : true" 
              :name="tab.title" :key="tab.id" :label="'Shell ' + tab.title">
              <Terminal :ref="'term-' + tab.title"  :height="height"
              :title="tab.title" />
            </TabPane>
            <Button @click="onTabsAdd" size="small" slot="extra">增加</Button>
        </Tabs>
        </div>
      </Split>
    </div>
    <ModalConfig ref="modal" :visible="visible" @on-close="closeModal" 
      :config="visible == false ? undefined : config" />
  </div>
</template>

<script>
import ModalConfig from "./modalConfig";
import Terminal from "./terminal";
// https://www.iviewui.com/components/tree
// https://www.iviewui.com/components/tabs
export default {
  name: 'ADB',
  components: {ModalConfig, Terminal},
  data () {
    return {
      split1: 0.3,
      visible: false,
      tabs: [{title: "1", id: 1}],
      tabIndex: 1,
      tabCurr: "1",
      height: 0,
      config: {
        projects: [
          {project: "BiPOS", package: "", folder: "~/Documents/Project/BiPOS2", apk: "/release/BiPOS2-release.apk"},
          {project: "mECR", package: "", folder: ""},
          {project: "KONE", package: "", folder: ""},
          {project: "JabezDC", package: "", folder: ""},
        ],
        database: [
          {name: "正式區"},
          {name: "測試區"},
          {name: "77區"}
        ],
        commands: [
          {title: "擷取畫面", cmd: "adb shell screencap -p /sdcard/Download/screencap.png && adb pull /sdcard/Download/screencap.png ~/Downloads && open ~/Downloads && adb shell rm /sdcard/Download/screencap.png"},
          {title: "開啟專案資料夾", cmd: "adb install -r {project.folder}"},
          {title: "安裝專案", cmd: "adb install -r {project.folder}{project.apk}"},
          {title: "啓動專案", cmd: "adb shell am start {project.package}/{project.package}.MainActivity"},
          {title: "停止專案", cmd: "adb shell am force-stop {project.package}"},
          {title: "移除專案", cmd: "adb shell pm uninstall -k {project.package}"},
          {title: "ADB", children: [
            {title: "reverse(8081)", cmd: "adb reverse tcp:8081 tcp:8081"},
            {title: "擷取畫面", cmd: "adb shell screencap -p /sdcard/Download/screencap.png && adb pull /sdcard/Download/screencap.png ~/Downloads && open ~/Downloads && adb shell rm /sdcard/Download/screencap.png"},
            
          ]}
        ]
      },
    }
  },
  async mounted() {
    this.split1 = 1 - ((document.body.clientWidth - 300) / document.body.clientWidth);
    if(this.$isElectron== true){
      
    }
    let x = localStorage["adb-config"];
    if(typeof x == "string" && x.length > 0)
      this.config = JSON.parse(x); 
    // else {
    //   this.visible = true;
    // }
    this.broadcast.$on("on-resize", this.onResize);
    this.onResize();
  },
  destroyed() {
    this.broadcast.$off("on-resize", this.onResize);
  },
  methods: {
    onResize(){
      let h1 = document.querySelector(".ivu-tabs").clientHeight;
      let h2 = document.querySelector(".ivu-tabs-bar").clientHeight;
      this.height = (h1 - h2);
      document.querySelector(".ivu-tabs-content").style.height = this.height + "px";
    },
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
      alert(this.tabCurr)

      
      // console.log(this.$refs["term-" + this.tabCurr])
    },
    closeModal(){
      this.visible = false;
    },
    onSelectChange(node) {
      if(node.length == 1 && typeof node[0].children == "undefined") {
        console.log(node[0].cmd)
        this.broadcast.$emit("term-execute", this.tabCurr, node[0].cmd);
        // console.log(this.$refs["term-" + this.tabCurr][0])
        // this.$refs["term-" + this.tabCurr].execute(node[0].cmd)
      }
    },
    onTabRemove(index) {
      for(let i = 0; i < this.tabs.length; i++) {
        if(this.tabs[i].title == index) {
          if(i == this.tabs.length - 1) {
            this.tabCurr = this.tabs[i - 1].title;
          } else {
            this.tabCurr = this.tabs[i + 1].title;
          }
          this.tabs.splice(i, 1)
          break;
        }
      }
    },
    onTabsAdd(){
      ++this.tabIndex
      this.tabs.push({title: this.tabIndex.toString(), id: this.tabIndex});
    },
    onTabClick(name){
      this.tabCurr = name;
      console.log("onTabClick: ", name)
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
.ivu-tabs {
  height: calc(100% - 0px);
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
}
</style>
