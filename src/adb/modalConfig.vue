<template>
  <modal id='modalConfig' v-model="visible" title="配置" class-name="vertical-center-modal" 
    @on-visible-change="onVisibleChange" :closable="false"
    fullscreen
  >
    <Tabs type="card" id="configTabs" style="margin-top: 5px;" @on-click="onTabClick">
      <TabPane :closable="false" v-for="(item,key) in configTables" :key="key"
        :label="key" :name="key">
        <TableConfig :columns="colTables" :datas="item" :name="key" :height="height" :active="tabCurr == key"
          v-if="visible == true" @on-update="onUpdate"  />
      </TabPane>

      <TabPane :closable="false" v-for="(item,key) in panel1" :key="key"
        :label="key" :name="key">
        <TableConfig :columns="item.cols" :datas="item.datas" :name="key" :height="height" :active="tabCurr == key"
          v-if="visible == true" @on-update="onUpdate"  />
      </TabPane>

      <TabPane :closable="false" label="commands" name="commands">
        <TableConfig :columns="panel2.cols" :datas="panel2.datas" :height="height" :active="tabCurr == 'commands' "
          v-if="visible == true" @on-update="onUpdate"  />
      </TabPane>
      
      <TabPane :closable="false" label="原始碼" name="原始碼" id="tabPaneCode">
        <codemirror :options="cmOptions" ref="editor" 
          @ready="onCmReady"
          @focus="onCmFocus"
          @input="onCmCodeChange"
        />
      </TabPane>
      <Button v-if="tabCurr != '原始碼' " @click="onTabsAdd" size="small" slot="extra" style="margin-right: 5px;">
        新增
      </Button>
    </Tabs>
    <div slot="footer" >
      <i-button type="error" @click="$emit('on-close')">取消</i-button>
      <i-button v-if="dirty" type="primary" @click="onOK">確定</i-button>
    </div>
  </modal>
</template>
<script>
import { codemirror } from "vue-codemirror";
import "codemirror/addon/lint/lint.css";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css"; // 主題顯示，可以百度搜索其他的主題
require("script-loader!jsonlint");
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/lint/lint";
import "codemirror/addon/lint/json-lint";
import "codemirror/addon/fold/foldgutter.css"
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/indent-fold.js';
import "codemirror/addon/fold/brace-fold";
import 'codemirror/addon/fold/comment-fold.js';
import TableConfig from './tableConfig';

export default {
  name: 'ModalConfig',
  props: ["visible", "config"],
  components: {codemirror, TableConfig},
  data () {
    return {
      dirty: false,
      cmOptions: {
        lineNumbers: true, // 是否顯示行數
        mode: "application/json",
        theme: "monokai", // 主題
        lint: true,
        styleActiveLine: true, // 当前行背景高亮
        matchBrackets: true, // 括号匹配
        theme: "monokai",
        autoCloseTags: true,
        autofocus: true,
        lineWrapping: true /*自动换行*/,
        indentUnit: 2 /*设置缩进的字符数，默认为2*/,
        indentWithTabs: true,
        smartIndent: true /*自动缩进，默认为true*/,
        tabSize: 2 /*tab字符的宽度，默认为4*/,
        lineWiseCopyCut: false,
        foldGutter: true,
        lint: true,
        gutters: [
          "CodeMirror-linenumbers",
          "CodeMirror-foldgutter",
          "CodeMirror-lint-markers",
        ],
      },
      height: 0,
      mode: "原始碼",
      panel1: {
        sql_var: {
          cols: [{
            title: '參數',
            key: 'value',
            slot: 'value',
          }],
          datas: []
        },
        projects: {
          cols: [{
              title: 'project',
              key: 'project',
              slot: 'project',
              width: 100,
            }, {
              title: 'package',
              key: 'package',
              slot: 'package',
              width: 180,
            }, {
              title: 'folder',
              key: 'folder',
              slot: 'folder',
            }, {
              title: 'apk',
              key: 'apk',
              slot: 'apk'
          }],
          datas: []
        },
        database: {
          cols: [{
              title: 'title',
              key: 'title',
              slot: 'title',
              width: 100,
            }, {
              title: 'host',
              key: 'host',
              slot: 'host',
              width: 180,
            }, {
              title: 'port',
              key: 'port',
              slot: 'port',
              type: "number"
            }, {
              title: 'user',
              key: 'user',
              slot: 'user',
            }, {
              title: 'password',
              key: 'password',
              slot: 'password',
            }, {
              title: 'database',
              key: 'database',
              slot: 'database',
            }, {
              title: 'sys_database',
              key: 'sys_database',
              slot: 'sys_database',
          }],
          datas: []
        },
      },
      panel2: {
        cols: [{
          title: '群組',
          key: 'group',
          slot: 'group',
          width: 100,
        }, {
          title: 'title',
          key: 'title',
          slot: 'title',
          width: 150,
        }, {
          title: '指令',
          key: 'cmd',
          slot: 'cmd',
        }],
        datas: []
      },
      dataDatabase: [],
      colTables: [{
          title: '失能',
          key: 'disable',
          width: 60,
          slot: 'disable',
          type: "checkbox"
        }, {
          title: '表格名稱',
          key: 'tbl',
          width: 200,
          slot: 'tbl',
        }, {
          title: '欄位',
          key: 'cols',
          // width: 200,
          slot: 'cols',
        }, {
          title: 'where',
          key: 'where',
          slot: 'where',
      }],
      configTables: {
        SYS: [], 
        BASE: [], 
        TRANSACTION: [],
        OPTIONS: [],       
      },
      tabCurr: "SYS"
    }
  },
  async mounted() {
    // console.log(this.config)
  },
  methods: {
    onTabClick(name){
      this.tabCurr = name;
      console.log(name)
    },
    onTabsAdd(){
      this.broadcast.$emit("config-add", this.tabCurr);
    },
    onCmReady(cm) {
      cm.focus();
      this.editor = cm;
    },
    onCmFocus(cm) {
      // console.log('the editor is focus!', cm)
    },
    onCmCodeChange(newCode) {
      this.dirty = true;
    },
    onOK(){
      // console.log(this.editor.getValue())
      try {
        let json = JSON.parse(this.editor.getValue());
        this.$emit("on-close", json);
      } catch(e) {

      }
    },
    onVisibleChange(v) {
      this.dirty = false;
      if (v === false) {
        this.$emit("on-close");
      } else {
      }
    },
    onResize(){
      let h1 = document.querySelector("#configTabs").clientHeight;
      let h2 = document.querySelector("#configTabs .ivu-tabs-bar").clientHeight;
      this.height = (h1 - h2);
      document.querySelector("#configTabs .ivu-tabs-content").style.height = this.height + "px";
      let h = document.querySelector("#tabPaneCode").clientHeight;
      this.height = h;
      document.querySelector(".CodeMirror").style.height = h + "px";
    },
    readConfig(value){
      let json = recursion(value);
      this.editor.setValue(JSON.stringify(json, null, "\t"))

      function recursion(json){
        let obj = {};
        for(let key in json) {
          if("nodeKey,expand,selected".indexOf(key) > -1)
            continue;
          else if(key == "tables" || key == "projects" || key == "sql_var" || typeof json[key] == "string" || typeof json[key] == "number" || typeof json[key] == "boolean") {
            obj[key] = json[key];
          } else if(Array.isArray(json[key])) {
            let arr = [];
            for(let i = 0; i < json[key].length; i++){
              let obj2 = recursion(json[key][i]);
              arr.push(obj2);
            }
            obj[key] = arr;
          } else if(typeof json[key] == "object"){
            obj[key] = recursion(json[key])
          }
        }
        return obj;
      }
    },
    onUpdate(datas){
      // console.log("onUpdate: " + this.tabCurr)
      this.dirty = true;
      let json = JSON.parse(this.editor.getValue());
      if("SYS,BASE,TRANSACTION,OPTIONS".indexOf(this.tabCurr) > -1){
        let arr = [];
        datas.forEach(row=>{
          let score = "";
          this.colTables.forEach((item, index) =>{
            if(item.key == "disable" && row[item.key] == true) {
              score += index;
            } else if(typeof row[item.key] == "string" && row[item.key].length > 0) {
              score += index;
            }
          });

          if(score == "1")
            arr.push(row["tbl"])
          else if(score.indexOf("1") > -1 && score.length > 1) 
            arr.push(row)
        })
        console.log(arr)
        json.tables[this.tabCurr] = arr;
      } else if(this.tabCurr == "commands"){
        if(typeof json.commands == "object") {
          console.log(this.panel2.datas)
          let commands = [];
          this.panel2.datas.forEach(item1=>{
            let index = commands.findIndex(item2=>{
              return item1.group == item2.title;
            })
            if(index == -1) {
              commands.push({
                title: item1.group,
                icon: item1.icon,
                children: []
              })
              index = commands.length - 1;
            }
            commands[index].children.push({title: item1.title, cmd: item1.cmd});
          });
          
          
          let clear = json.commands.filter(item=>{
            return item.role == "clear";
          });
          if(clear.length == 1)
            commands.push(clear[0]);
          json.commands = commands;
        }
      } else {
        let cols = this.panel1[this.tabCurr].cols;
        let arr = [];
        datas.forEach(row=>{
          if(cols.length == 1) {
            if(typeof row.value == "string" && row.value.length > 0)
              arr.push(row.value)
          } else {
            let isRequire = true, isValue = false;
            cols.forEach(col=>{
              if(col.isRequire == true) {
                if(typeof row[col.key] == "undefined")
                  isRequire = false;
                else if(typeof row[col.key] == "string" && row[col.key].length == 0)
                  isRequire = false;
              }
              if(isValue == false) {
                if(typeof row[col.key] == "string" && row[col.key].length > 0)
                  isValue = true;
                else if(typeof row[col.key] == "number")
                  isValue = true;
              }
            });

            if(isRequire == true && isValue == true)
              arr.push(row)
          }
        });
        if(this.tabCurr == "database")
          json[this.tabCurr][0].children = arr;
        else
          json[this.tabCurr] = arr;
      }
      this.readConfig(json)
      // console.log(data)
    }
  },
  watch: {
    visible(value){
      if(value == true) {
        setTimeout(() => {
          this.onResize();
        }, 600);
      } else {
        this.height = 0;
      }
    },
    config(value) {
      if(typeof value == "undefined") {
        this.editor.setValue("");
      } else {
        for(let key in this.configTables){
          this.configTables[key] = [];
        }
        if(typeof value.tables == "object") {
          for(let key in value.tables){
            // this.configTables[key] = [];
            let table1 = value.tables[key];
            let table2 = this.configTables[key]
            table1.forEach(item=>{
              if(typeof item == "string")
                table2.push({tbl: item})
              else 
                table2.push(Object.assign({}, item));
            });

            table2.sort(function(a, b){
              if(a.tbl > b.tbl)
                return 1;
              else if(a.tbl < b.tbl)
                return -1;
              else
                return 0;
            });
          }
        }
         
        for(let key in this.panel1){
          let target = this.panel1[key];
          target.datas = [];
          let source = key == "database" ? value[key][0].children :  value[key];
          source.forEach(item=>{
            let obj = {};
            if(target.cols.length == 1) {
              target.datas.push({value: item})
            } else {
              target.cols.forEach(col =>{
                if(typeof item[col.key] != "undefined")
                  obj[col.key] = item[col.key]
              });
              target.datas.push(obj);            
            }
          });
        }
        this.panel2.datas = [];
        if(Array.isArray(value.commands)) {
          value.commands.forEach((item, index)=>{
            if(Array.isArray(item.children)) {
              item.children.forEach((item2, index2)=>{
                this.panel2.datas.push({
                  group: item.title, icon: item.icon, 
                  title: item2.title, cmd: item2.cmd,
                  // index, index2
                })
              });
            }
          });
        }
        this.readConfig(value)
      }
    }
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

#modalConfig .ivu-modal-body {
  padding: 0px 0px !important;
  overflow: hidden !important;
}
.ivu-tabs-tabpane {
  height: 100%;
  overflow: hidden;
}
#modalConfig .ivu-table td, .ivu-table th {
  height: 40px;
}

#modalConfig  .ivu-table-cell {
  padding: 0px 5px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
#modalConfig  .ivu-table-cell button span {
  font-size: 12px;
}
#configTabs .ivu-tabs-content {
  padding-top: 2px;
}
</style>