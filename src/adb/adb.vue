<template>
  <div id="app" style="display: flex; flex-direction: column; align-items: stretch; justify-content: end">
    <div style="background: #2d8cf0; display: flex; flex-direction: row; justify-content: start; align-items: center;">
      <div style="flex: 1; text-align: left; color: white; padding: 5px; ">
        {{"指令集"}}
        <span @click="projectPicker" v-if="project != null" style="cursor: pointer;">
          {{"[" + project.project + "]"}}
        </span>
      </div>
      <Icon type="md-cog" class="btn" @click.native="visibleConfig=true"></Icon>
      <!-- <Icon type="md-close" class="btn" @click.native="onClickIcon"></Icon> -->
      <!-- https://www.iviewui.com/components/icon -->
    </div>
    <div  style="flex: 1;">
      <Split v-model="split1"  @on-move-end="onMoveEnd">
        <div slot="left" id="left" class="demo-split-pane" style="z-index: 1; overflow-x: hidden;">
          <div style="flex: 1;">
          <Tree :data="config.commands.concat(config.database)" style="z-index: -1; " @on-select-change="onSelectChange" 
            :render="renderTreeItem" />
          </div>
          <!--  -->
          <div id="version">2021-05-05 16:00</div>
        </div>
        <div slot="right" id="right" class="demo-split-pane" style="z-index: 1; overflow-x: hidden;">
          <Tabs type="card" id="adbTabs"  @on-tab-remove="onTabRemove" @on-click="onTabClick">
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
    <ModalConfig :visible="visibleConfig" @on-close="onCloseConfig" 
      :config="visibleConfig == false ? undefined : config"
    />
    <ModalDatabaseOption :visible="visibleOption" :config="visibleOption == false ? undefined : config" @on-close="onCloseDatabaseOption" />
  </div>
</template>

<script>
import ModalDatabaseOption from "./modalDatabaseOption";
import ModalDatabasePicker from "./modalDatabasePicker";
import ModalConfig from "./modalConfig";
import Terminal from "./terminal";
import ModalProject from "./modalProject";
let processing = false;
let cols = [{title: "主機", key: "host"},
  {title: "埠", key: "port"},
  {title: "帳號", key: "user"},
  {title: "密碼", key: "password"},
  {title: "database", key: "database"},
  {title: "sys_database", key: "sys_database"},
]
// https://www.iviewui.com/components/tree
// https://www.iviewui.com/components/tabs
// 清空 cache 目錄(還沒寫) /Users/jimc/Library/Application Support/scallop/TransportSecurity
export default {
  name: 'ADB',
  components: {ModalConfig, Terminal, ModalDatabaseOption},
  data () {
    return {
      split1: 0.3,
      visibleConfig: false,
      visibleOption: false, //this.$isElectron== true ? false : true,
      tabs: [{title: "1", id: 1}],
      tabIndex: 1,
      tabCurr: "1",
      height: 0,
      project: null,
      config: {
        projects: [
          {project: "BiPOS", package: "com.bipos", folder: "~/Documents/Project/BiPOS2", apk: "/release/BiPOS2-release.apk"},
          {project: "mECR", package: "com.bethel.v1", folder: "~/react-native/V1/android", apk: "/app/build/outputs/apk/mECR.apk"},
          {project: "KONE", package: "com.jabezpos.kone", folder: "~/react-native/kone/android", apk: "/app/build/outputs/apk/release/KONE.apk"},
          {project: "JabezDC", package: "com.jabezdc", folder: "~/react-native/jabezdc/android", apk: "/app/build/outputs/apk/release/JabezDC.apk"},
        ],
        commands: [
          {title: "app 專案", icon: "logo-android", expand: true,
            children: [
              {title: "開啟資料夾", cmd: "open {project.folder}"},
              {title: "安裝專案", cmd: "adb install -r {project.folder}{project.apk}"},
              {title: "啓動專案", cmd: "adb shell am start {project.package}/{project.package}.MainActivity"},
              {title: "停止專案", cmd: "adb shell am force-stop {project.package}"},
              {title: "移除專案", cmd: "adb shell pm uninstall -k {project.package}"},            
            ]
          },
          {title: "ADB", expand: true, children: [
            {title: "reverse(8081)", cmd: "adb reverse tcp:8081 tcp:8081"},
            {title: "擷取畫面", cmd: "adb shell screencap -p /sdcard/Download/screencap.png && adb pull /sdcard/Download/screencap.png ~/Downloads && open ~/Downloads && adb shell rm /sdcard/Download/screencap.png"},
          ]},
          
          {title: "清除終端機", role: "clear"},
        ],
        database: [
          {title: "資料庫設定", expand: true,
            children: [
              {title: "正式區", role: "database", port: 3306},
              {title: "測試區", role: "database", port: 3306},
              {title: "77區", role: "database", port: 3306}
            ]
          },
          {title: "資料庫複製", icon: "md-redo", role: "database-replicate"},
        ],
        tables: {
          SYS: ["SITES", "USERS", "USERGROUPS"],
          BASE: ["APLSYS", "TMMF", "STKNAME", "STOCK", "SYSCOD", "BAS_EMP", "BAS_IO", "BAS_IOGROUP", "BAS_PTYPE", 
            "BAS_PUBLIC", "BAS_SER", "CASHMF", "CLEVEL", "CODE", "DPF_PLU2", "DPF_PLU3", "DPF_PLU4", 
            "DPMF", "F_PLU1", "F_PLU12", "F_PLU2", "F_PLU23MF", "F_PLU3", "F_PLU4", "F_TABMF", "GPMF", 
            "MGUIELEC", "MGUIELEC_D", "MGUIELEC_H", "MGUIELEC_S", "PADNAME", "PAYMENT", "PRN_TYPE", "PSERVER", 
            "PSERVER_LST", "PSERVER_STORE",
            "PRODUCT", "PRODUCT_ORD", "PRODUCT_RATE", "FFDP", "FFDPPLU", "FFDP_HS", "FFPLU", "FFRTR", 
            "PROMO_H", "PROMO_I", "SITES_JPC_PARAM", "SITES_JPC_PARAM_D", "SITES_PARAM", 
            "SIZE", "BAS_DESC2", "BAS_DP"],
          TRANSACTION: [
            {"tbl": "HTRH", "disable": true, "where": "STOCK_NO = '{STOCK_NO}' and TRN_DATE = '{T_DAY}'"},
            {"tbl": "HTRI", "disable": true, "where": "STOCK_NO = '{STOCK_NO}' and TRN_DATE = '{T_DAY}'"},
            {"tbl": "POS_H", "where": "T_STORE = '{STOCK_NO}' and T_DAY = '{T_DAY}'"},
            {"tbl": "POS_I", "where": "T_STORE = '{STOCK_NO}' and T_DAY = '{T_DAY}'"},
            {"tbl": "POS_HM", "where": "T_STORE = '{STOCK_NO}' and T_DAY = '{T_DAY}'"},
          ],
          OPTIONS: [
            "ADCAROUSEL", "APPSITEMENU", "BARCODE_FMT", "BEACONPOS", "BEACONTMPLIST", "BGPMF", 
            "BONUSLOG", "BONUSMASTER", "BULLETIN_BOARD", "COLOR", "FINDATA", "IMPORT", 
            "IITEM", "IOAMT_H", "IOAMT_I", "MAKER", "MAKER_C", "MTAXH", "MTAXI", "PACK", "POS_E", 
            "PREPAIDRULE", "QITEM", "RECEPTION", "RIITEM", "RIMP", 
            "SCHG_H", "SCHG_I", "TAKE_H", "TAKE_I", "TOITEM", "TORDER", "TRANS_2UBILL", 
            "TRANS_EZPAYMENT", "TRANS_IPASS", "TRANS_IPASS_CR", "TRANS_PMS", "TRANS_UUPON", 
            "VIPMF", "VIPMF_LOG"
          ]
        },
        sql_var: [ "STOCK_NO", "TM_NO", "T_DAY"]
      },
    }
  },
  async mounted() {
    let w = localStorage["adb-split-left-width"];
    if(typeof w == "undefined")
      w = 300;
    this.split1 = 1 - ((document.body.clientWidth - w) / document.body.clientWidth);
    if(this.$isElectron== true){
      
    }
    let x = localStorage["adb-config"];
    if(typeof x == "string" && x.length > 0) {
      this.config = JSON.parse(x);
    }
    x = localStorage["adb-project"]; 
    if(typeof x == "string" && x.length > 0) {
      let arr = this.config.projects.filter(item=>{
        return item.project == x;
      });
      if(arr.length == 1) this.project = arr[0]
    }

    // else {
    //   this.visibleConfig = true;
    // }
    this.broadcast.$on("on-resize", this.onResize);
    this.onResize();
    this.broadcast.$on('term-finish',  this.executeFinish);
  },
  destroyed() {
    this.broadcast.$off("on-resize", this.onResize);
    this.broadcast.$off('term-finish',  this.executeFinish);
  },
  methods: {
    onMoveEnd(){
      let w = document.querySelector(".left-pane").clientWidth;
      localStorage["adb-split-left-width"] = w;
    },
    onResize(){
      let h1 = document.querySelector("#adbTabs").clientHeight;
      let h2 = document.querySelector("#adbTabs .ivu-tabs-bar").clientHeight;
      this.height = (h1 - h2);
      document.querySelector("#adbTabs .ivu-tabs-content").style.height = this.height + "px";
    },
    onClickIcon(){
      alert("還沒寫，只作測試用，" + this.tabCurr)
      // console.log(this.$refs["term-" + this.tabCurr])
    },
    onCloseConfig(data){
      if(typeof data != "undefined"){
        localStorage["adb-config"] = JSON.stringify(data);
        this.config = data;
      }
      this.visibleConfig = false;
    },
    onCloseDatabaseOption(data){ // not yet
      this.visibleOption = false;
      if(typeof data == "object") {
        processing = true;
        let tables = {SYS: this.config.tables.SYS, BASE: this.config.tables.BASE};
        if(data.mode == "刪除" || data.tables.indexOf('交易資料表') !=  -1) {
          tables.TRANSACTION = this.config.tables.TRANSACTION;
        }
        if(data.mode == "刪除" || data.tables.indexOf('自訂資料表') !=  -1) {
          tables.OPTIONS = this.config.tables.OPTIONS;
        }
        data.tables = tables;
        this.broadcast.$emit("term-database", this.tabCurr, data);
      }
    },
    onSelectChange(node) { // treeview click
      let self = this;
      if(processing == true) return;
      if(typeof node.children == "undefined") {
        if(typeof node.cmd == "string" && node.cmd.trim().length > 0) {
          if(node.cmd.indexOf("{project.") > -1) {
            if(this.project == null) {
              this.projectPicker(()=>{
                setProject(node.cmd);
              })
            } else {
              setProject(node.cmd);
            }
            // openModal(node.cmd)
          } else
            execute(node.cmd)
        } else if(typeof node.role == "string") {
          // console.log(node)
          if(node.role == "clear")
            execute(node.role)
          else if(node.role == "database-replicate"){ // 資料庫複製
            self.visibleOption = true;
          } else if(node.role == "database")
            self.databasePicker(node)
          else
            alert("role: " + node.role)
        }
      }
      
      for(let key1 in this.config.commands) { // nodeKey
        let item1 = this.config.commands[key1];
        if(typeof item1.children == "object") {
          let children = this.config.commands[key1].children;
          for(let i = 0; i < children.length; i++) {
            let item2 = children[i];
            if(typeof item2.children == "object") {
            } else if(typeof item2.selected == "boolean") {
              if(node.nodeKey != item2.nodeKey) {
                item2.selected = undefined;
                this.$set(this.config.commands[key1].children, i, item2)
              }
            } else if(node.nodeKey == item2.nodeKey) {
              item2.selected = true;
              this.$set(this.config.commands[key1].children, i, item2)
            }
          }
        } else if(typeof item1.selected == "boolean") {
          if(node.nodeKey != item1.nodeKey) {
            item1.selected = undefined;
            this.$set(this.config.commands, key1, this.config.commands[key1])
          }
        } else if(node.nodeKey == item1.nodeKey) {
          item1.selected = true;
          this.$set(this.config.commands, key1, this.config.commands[key1]);
        }
      }
      function execute(cmd) {
        if(typeof window.process == "object")
          cmd = cmd.replace(new RegExp("~/","gm"), "/Users/" + window.process.env.USER + "/");
        processing = true;
        self.broadcast.$emit("term-execute", self.tabCurr, cmd);
      }
      function setProject(cmd) {       
        for(let key in self.project) {
          if(key == "project")
            continue;
          else {
            cmd = cmd.replace(new RegExp("{project." + key + "}","gm"), self.project[key])
          }
        }
        execute(cmd)
      }
    },
    projectPicker(callback){
      let self = this;
      this.$Modal.info({
        title: "專案清單",
        width: 300,
        render: (h) => {
          return h(ModalProject, {
              props: {
                list: self.config.projects
              },
              on: {
                rowClick: (value) => {
                  self.project = value;
                  if(this.$isElectron == false)
                    localStorage["adb-project"] = value.project;
                  if(typeof callback == "function") callback();
                  self.$Modal.remove();
                }
              }
          })
        },
      })
    },
    databasePicker(database) {
      let dirty = false;
      this.$Modal.confirm({
        title: "資料庫設定［" + database.title + "］",
        width: 500,
        render: (h) => {
          return h(ModalDatabasePicker, {
              props: {
                database, 
                cols
              },
              on: {
                onChange: (value) => {
                  dirty = true;
                },
              }
          })
        },
        onOk: () => {
          if(dirty == true) {
            localStorage["adb-config"] = JSON.stringify(this.config);
          }
        },
      });
    },
    executeFinish(){
      processing = false;
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
    },
    renderTreeItem (h, { root, node, data }) {
      let child = [h('span', 
        {
          class: "ivu-tree-title" + (data.selected == true ? " ivu-tree-title-selected" : ""),
          on: {
            click: () => {
              this.onSelectChange(data)
            }
          }
        },  
        data.title)
      ];
      // <Icon type="md-folder" /> <Icon type="ios-folder-open" />
        child.unshift(h('Icon', 
          {
            props: {
                type: typeof data.icon == "string" ? data.icon 
                : (typeof data.children == "undefined" ? 'ios-paper-outline' 
                  : data.expand == true ? "ios-folder-open" : "md-folder")
            },
            style: {
                marginRight: '2px',
                // color: "red"
            }
          }
        ))

      // console.log(data)
      // <Icon type="md-tablet-portrait" />
      // <Icon type="md-phone-portrait" />
      // <Icon type="logo-android" />
      return h('span', { 
          style: { display: 'inline-block', width: '100%', marginBottom: "0px"},
        }, child);
    },
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
#left {
  display: flex;
  flex-direction: column;
}
#version {
  color: red;
  z-index: -1;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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
