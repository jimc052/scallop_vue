<template>
  <modal id='modalConfig' v-model="visible" title="配置" class-name="vertical-center-modal" 
    @on-visible-change="onVisibleChange" :closable="false"
    fullscreen
  >
    <codemirror :options="cmOptions" ref="editor" style="height: 100%;"
      @ready="onCmReady"
      @focus="onCmFocus"
      @input="onCmCodeChange"
    />
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

export default {
  name: 'ModalConfig',
  props: ["visible", "config"],
  components: {codemirror},
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
    }
  },
  async mounted() {
    
  },
  methods: {
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
  },
  watch: {
    visible(value){
    },
    config(value) {
      if(typeof value == "undefined") {
        this.editor.setValue("");
      } else {
        let json = recursion(value);
        this.editor.setValue(JSON.stringify(json, null, "\t"))
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
</style>