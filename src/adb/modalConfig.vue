<template>
  <modal id='modalConfig' v-model="visible" title="配置" class-name="vertical-center-modal" 
    @on-visible-change="onVisibleChange" :closable="false"
    fullscreen
  >
    <Tabs type="card" id="configTabs" style="margin-top: 5px;" @on-click="onTabClick">
      <TabPane :closable="false" label="SYS">
        <TableConfig :columns="colTables" :datas="dataTables.SYS" v-if="visible == true" :height="height" />
      </TabPane>
      <TabPane :closable="false" label="BASE">
        <TableConfig :columns="colTables" :datas="dataTables.BASE" v-if="visible == true" :height="height" />
      </TabPane>
      <TabPane :closable="false" label="TRANSACTION">
        <TableConfig :columns="colTables" :datas="dataTables.TRANSACTION" v-if="visible == true" :height="height"/>
      </TabPane>
      <TabPane :closable="false" label="OPTIONS">
        <TableConfig :columns="colTables" :datas="dataTables.OPTIONS" v-if="visible == true" :height="height" />
      </TabPane>
      <TabPane :closable="false" label="database">
        <TableConfig :columns="colDatabase" :datas="dataDatabase" v-if="visible == true" :height="height" />
      </TabPane>
      <TabPane :closable="false" label="projects">
        <TableConfig :columns="colProject" :datas="dataProject" v-if="visible == true" :height="height" />
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
      colProject: [{
          title: 'project',
          key: 'project',
          width: 100,
        }, {
          title: 'package',
          key: 'package',
          width: 180,
        }, {
          title: 'folder',
          key: 'folder',
        }, {
          title: 'apk',
          key: 'apk',
      }],
      dataProject: [],
      colDatabase: [{
          title: 'title',
          key: 'title',
          width: 100,
        }, {
          title: 'host',
          key: 'host',
          width: 180,
        }, {
          title: 'port',
          key: 'port',
        }, {
          title: 'user',
          key: 'user',
        }, {
          title: 'password',
          key: 'password',
        }, {
          title: 'database',
          key: 'database',
        }, {
          title: 'sys_database',
          key: 'sys_database',
      }],
      dataDatabase: [],
      colTables: [{
          title: '失能',
          key: 'disable',
          width: 80,
          slot: 'disable',
        }, {
          title: '名稱',
          key: 'tbl',
          width: 200,
          slot: 'tbl',
        }, {
          title: 'where',
          key: 'where',
          slot: 'where',
      }],
      dataTables: {
        SYS: [], 
        BASE: [], 
        TRANSACTION: [],
        OPTIONS: [],       
      },
      tabCurr: ""
    }
  },
  async mounted() {
    
  },
  methods: {
    onTabClick(name){
      this.tabCurr = name;
      console.log(name)
    },
    onTabsAdd(){},
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
    onRowProjectClick(index){

    }, 
    onEdit(){

    },
    onRemove() {

    }, 
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
        this.dataProject = value.projects.clone();
        this.dataDatabase = value.database[0].children.clone();
        for(let key in this.dataTables){
          this.dataTables[key] = [];
        }
        if(typeof value.tables == "object") {
          for(let key in value.tables){
            // this.dataTables[key] = [];
            let table1 = value.tables[key];
            let table2 = this.dataTables[key]
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
        
        this.readConfig(value)
        // let json = recursion(this.config);
        // this.editor.setValue(JSON.stringify(json, null, "\t"))
      }

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
}
</style>