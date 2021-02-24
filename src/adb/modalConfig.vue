<template>
  <modal v-model="visible" title="配置" class-name="vertical-center-modal" 
    @on-visible-change="onVisibleChange" :closable="false"
    fullscreen
  >
    <div class="json-editor" style="overflow: hidden;"> 
      <textarea ref="textarea" />
    </div>
    <div slot="footer" >
      <i-button type="error" @click="$emit('on-close')">取消</i-button>
      <i-button v-if="dirty" type="primary" @click="onOK">確定</i-button>
    </div>
  </modal>
</template>
<script>
import CodeMirror from "codemirror";
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
  components: {CodeMirror},
  data () {
    return {
      dirty: false,
      value: "{}"
    }
  },
  async mounted() {
    // this.value = this.config;
    
    this.codeMirror = CodeMirror.fromTextArea(this.$refs.textarea, {
      lineNumbers: true, // 是否顯示行數
      mode: "application/json",
      theme: "monokai", // 主題
      lint: true,
      styleActiveLine: true, // 当前行背景高亮
      matchBrackets: true,   // 括号匹配
      theme: "monokai",
      autoCloseTags: true,
      lineWrapping: true, /*自动换行*/
      indentUnit: 2,   /*设置缩进的字符数，默认为2*/
      indentWithTabs: true,
      smartIndent: true, /*自动缩进，默认为true*/
      tabSize: 2, /*tab字符的宽度，默认为4*/
      lineWiseCopyCut: false,  /*true时，如果当前没有选中文本，会自动选中当前行*/
      dragDrop: true,   /*是否可以被拖拽*/
      autofocus: true,
      // keyMap: "sublime",
      foldGutter: true,
      lint: true,
      gutters: [
        "CodeMirror-linenumbers", 
        "CodeMirror-foldgutter", "CodeMirror-lint-markers"
      ],
    });

    setTimeout(()=>{
      this.codeMirror.setValue(this.value);
      this.codeMirror.focus();
      this.codeMirror.on("change", cm => {
        this.dirty = true;
      });    
    }, 600)
  },
  methods: {
    onOK(){
      console.log(cm.getValue())
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
    config(value) {
      // this.codeMirror.setValue(JSON.stringify(value, null, 2));
      // this.codeMirror.focus();
    }
  }
}
</script>
<style>
.CodeMirror {
  height: 100%;
  font-family: monospace  !important;
}
.ivu-modal-body {
  padding: 0px 5px !important;
  overflow: hidden !important;
}
.json-editor {
  height: 100%;
  position: relative;
  margin-top: 8px;
}
.json-editor >>> .CodeMirror {
  height: 100%;
  min-height: 300px;
}
.json-editor >>> .CodeMirror-scroll {
  min-height: 300px;
}
.json-editor >>> .cm-s-rubyblue span.cm-string {
  color: #f08047;
}
</style>