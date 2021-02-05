<template>
  <div id="monkey" >
    <div id="menu" style="background: #2d8cf0;" >
      <Dropdown class="dropdown" style="margin-right: 10px" @on-click="onMenuSelect">
        <div style="cursor: pointer;">
        腳本
        <Icon type="ios-arrow-down"></Icon>
        </div>
        <DropdownMenu slot="list">
          <DropdownItem name="add">
            新增腳本
          </DropdownItem>
          <DropdownItem name="另存腳本" v-if="editItem != null">
            另存腳本
          </DropdownItem>
          <DropdownItem name="delete" v-if="editItem != null">
            刪除腳本
          </DropdownItem>
          <Dropdown placement="right-start" v-if="playList.length > 1">
						<DropdownItem :disabled="playList.length == 0" divided>開啟最近的腳本
              <icon type="ios-arrow-forward" style="margin-left: 2px;"></icon>
            </DropdownItem>
						<DropdownMenu slot="list" v-if="playList.length > 1">
              <div v-for="(item, index) in playList"  :key="index">
                <DropdownItem v-if="editItem != null && editItem.key != item.key" :name="'playlist-' + item.key">
                  {{ (index) + ". " + item.name + " (" + item.project + ")"}}
                </DropdownItem>
              </div>
						</DropdownMenu>
					</Dropdown>
        </DropdownMenu>
      </Dropdown>
    </div>
    <div id="frame">
      <div id="left" :style="{height: (src.length == 0 ? '100%' : (height + 'px'))}" style="background: rgb(32,32,32)">
        <div id="imgframe" 
          style="flex: 1; display: flex; flex-direction: column; justify-content: center;
            align-items: center;"
        >
          <div style="position: relative">
            <img id="img" ref="img" :src="src" :width="width + 'px'" />
            <div id="cursor"  
              :style="{ 
                top: (cursor == null ? 0 :cursor._y) + 'px', 
                left: (cursor == null ? 0 :cursor._x) + 'px',
                display: (cursor == null ? 'none' : 'inline-block'),
                width: (cursorRadius * 2) + 'px', 
                height: (cursorRadius * 2) + 'px', 
                borderRadius: cursorRadius + 'px', 
              }"
              style="border: 3px solid #c01921;"
            />
          </div>
        </div>
        <div id="left_footer" class="footer" v-if="src.length > 0 || (editItem != null && $isElectron)">
          <div>
            <Button type="success"  v-if="$isElectron" @click="capture" 
              style="margin-right: 5px">截圖
            </Button>
            <Button type="success" @click="runScript" 
              v-if="$isElectron && src.length > 0 && rows > 0"
              style="margin-right: 5px">腳本</Button>
            <Button type="success" @click="download" v-if="src.length > 0 && rows > 0" 
              style="margin-right: 5px">滙出</Button>
          </div>
          <div style="flex: 1"></div>
          <div style="margin-left: 10px; width: 40px; color: white;" v-show="x > -1 && y > -1">
            <div style="display: flex; flex-direction: row; align-items: center;" >
              <div style="font-size: 12px !important;">X:</div>
              <div style="flex: 1; text-align: right; font-size: 12px !important;">{{ x }}</div>
            </div>
            <div style="display: flex; flex-direction: row; align-items: center" >
              <div style="font-size: 12px !important;">Y:</div>
              <div style="flex: 1; text-align: right; font-size: 12px !important;">{{ y }}</div>
            </div>
          </div>
        </div>
      </div>
      <Script id="right" ref="script" 
        v-if="editItem != null" :editItem="editItem.key"
        @on-row-change="onRowChange" @on-cursor-change="onCursorChange"
        @on-open-mondal="onOpenMondalInsert"
        :style="{height: (src.length == 0 ? '100%' : (height + 'px')), width: '300px'}"
      />
    </div>
    <ExecScript :script="execScript" @on-close="closeScript" />
    <ModalOpen :visible="visibleModalOpen" @on-close="closeOpen" :editItem="editItem"  />
  </div>
</template>
<script>
import Script from "./script";
import ExecScript from "./execScript";
import ModalOpen from "./modalOpen";
import ModalInsert from "./modalInsert";
let rate = 1;

export default {
  name: "Monkey",
  components: { Script, ExecScript, ModalOpen },
  data() {
    return {
      src: "",
      x: -1,
      y: -1,
      width: 0,
      height: 0,
      rows: 0,
      execScript: "",
      cursor: null,
      script: {
      },
      playList: [],
      cursorRadius: 10, // 半徑
      visibleModalOpen: false,
      editItem: null,
    };
  },
  async mounted() {
    let self = this;
    { // img 的事件
      this.$refs["img"].onload = () => {
        this.x = -1;
        this.y = -1;
        this.onResize();
      };

      this.$refs["img"].onmousedown = (e) => {
        this.$refs["script"].add(this.x, this.y);
      };
      this.$refs["img"].onmousemove = (e) => {
        this.x = Math.ceil(e.offsetX * rate);
        this.y = Math.ceil(e.offsetY * rate);
      };
      this.$refs["img"].onmouseout = (e) => {
        this.x = -1;
        this.y = -1;
      };
    }
    drop(document.getElementById("body"), (event, result) => {
      this.src = result;
      this.cursor = null;
      localStorage["monkeyImg-" + this.editItem.key] = result;
    });
    
    this.broadcast.$on("on-resize", this.onResize);

    window.addEventListener('keydown', this.onKeydown, false);
    document.querySelector('#cursor').addEventListener('mousedown', (e)=>{
      e.preventDefault();
      let el = document.querySelector('#cursor');
      var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      pos3 = e.clientX;
      pos4 = e.clientY;

      document.querySelector('#cursor').addEventListener('mousemove', mousemove, false);
      document.querySelector('#cursor').addEventListener('mouseup', mouseup, false);
      document.querySelector('#cursor').addEventListener('mouseout', mouseup, false);

      function mousemove(e){
        e.preventDefault();
        // console.log("mousemove: " + e.clientX + ", " + e.clientY)
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        let top = (el.offsetTop - pos2);
        let left = (el.offsetLeft - pos1);
        let clientHeight = document.querySelector('#img').clientHeight;
        let clientWidth = document.querySelector('#img').clientWidth;
        // console.log("clientHeight: " + clientHeight + ", clientWidth: " + clientWidth)
        if(top > (0 - self.cursorRadius) && left > (0 - self.cursorRadius)
          && top < (clientHeight - self.cursorRadius) && left < (clientWidth - self.cursorRadius)
        ) {
          el.style.top = top + "px";
          el.style.left = left + "px";
          self.cursor._y = top;
          self.cursor._x = left;  
          self.cursor.x = Math.floor((self.cursor._x + self.cursorRadius) * rate);
          self.cursor.y = Math.floor((self.cursor._y + self.cursorRadius) * rate);
          // console.log("cursor: " + self.cursor.x + ", " + self.cursor.y)
        } else {
          return;
        }
      }

      function mouseup(){
        if(pos3 == 0 && pos4 == 0) return;
        document.querySelector('#cursor').removeEventListener('mousemove', mousemove);
        document.querySelector('#cursor').removeEventListener('mouseup', mouseup);
        self.$refs["script"].update(self.cursor);
        pos3 = 0; 
        pos4 = 0;
      }
    }, false);
    
    let s = localStorage["monkeyPlaylist"];
    if (typeof s === "string" && s.length > 0) {
      this.playList = JSON.parse(s);
    }
    if(this.playList.length > 0) {
      this.selectItem(this.playList[0].key);
    }
  },
  destroyed() {
    this.broadcast.$off("on-resize", this.onResize);
    window.removeEventListener('keydown', this.onKeydown, false);
  },
  methods: {
    onKeydown(event){
      let o = document.activeElement;
			let pk = navigator.userAgent.indexOf('Macintosh') > -1 ? event.metaKey : event.ctrlKey;
			let ak = navigator.userAgent.indexOf('Macintosh') > -1  ? event.ctrlKey : event.altKey;
			let sk = event.shiftKey, keyCode = event.keyCode;
      let char = (event.keyCode >=48 && event.keyCode <=122) ? String.fromCharCode(event.keyCode).toUpperCase() : ""
      if(keyCode == 27) {
        if (document.querySelector("#download_clipboard") != null 
          || document.querySelector("#scriptValue") != null) 
          this.$Modal.remove()
      }
    },
    onRowChange(list) {
      this.rows = list.length;
    },
    onCursorChange(row, index) {
      if (row != null) {
        for(let key in row) {
          if(key == "x" || key == "y") {
            if(typeof row[key] == "undefined" || (typeof row[key] == "string" && row[key].trim().length == 0)
              || (typeof row[key] != "undefined" && (row[key] + "").length > 0 && isNaN(row[key]))
            ) {
              this.cursor = null;
              return;
            }
          }
        }

        this.cursor = Object.assign({}, row);
        this.cursor._x = Math.ceil(row.x / rate) - this.cursorRadius;
        this.cursor._y = Math.ceil(row.y / rate) - this.cursorRadius;
      } else 
        this.cursor = null;
    },
    onResize() {
      if (this.src.length > 0) {
        let monkey = document.querySelector("#monkey");
        let arr = document.querySelectorAll("#monkey > *");
        let clientHeight = 0;
        for(let i = 0; i < arr.length - 1; i++) {
          clientHeight += arr[i].clientHeight;
        }
        this.height = monkey.clientHeight - clientHeight;
        let frame = document.querySelector("#frame");
        let right = document.querySelector("#script");
        let clientWidth = frame.clientWidth - right.clientWidth - 50;
        clientHeight = this.height;
        arr = document.querySelectorAll("#left > *");
        for(let i = 0; i < arr.length; i++) {
          if(arr[i].id != "imgframe"){
            clientHeight -= arr[i].clientHeight;
          }
        }
        do {
          let xRate = this.$refs["img"].naturalWidth / clientWidth;
          let h = this.$refs["img"].naturalHeight / xRate;
          let w = this.$refs["img"].naturalWidth / xRate;

          if (h > clientHeight - 50) {
            clientWidth -= 10;
          } else {
            if (clientWidth < this.$refs["img"].naturalWidth)
              this.width = clientWidth;
            else 
              this.width = this.$refs["img"].naturalWidth;
            rate = this.$refs["img"].naturalWidth / this.width;
            this.onCursorChange(this.cursor)
            break;
          }
        } while (clientWidth > 0);
      }
    },
    onMenuSelect(name) {
      if (name === "download") 
        this.download();
      else if(name == "add") {
        this.editItem = null;
        this.src = "";
        this.cursor = null;
        this.visibleModalOpen = true;
      } else if(name == "delete") {
        delete localStorage["monkeyScript-" + this.editItem.key];
        delete localStorage["monkeyImg-" + this.editItem.key];
        for(var i = 0; i < this.playList.length; i++) {
          if(this.editItem.key == this.playList[i].key){
            this.playList.splice(i, 1)
            break;
          }
        }
        localStorage["monkeyPlaylist"] = JSON.stringify(this.playList);
        this.editItem = null;
        this.src = "";
        this.cursor = null;
        document.title = "monkey";
      } else if(name.indexOf('playlist-') == 0) {
        let key = name.replace('playlist-', "");
        this.selectItem(key);
      }
    },
    selectItem(key){
      if(key != this.playList[0].key) {
        for(var i = 0; i < this.playList.length; i++) {
          if(key == this.playList[i].key){
            let arr = this.playList.splice(i, 1)
            this.playList.unshift(arr[0]);
            break;
          }
        }
      }
      if(this.playList.length > 20) {
        this.playList.slice(20, this.playList.length)   
      }
      
      let img = localStorage["monkeyImg-" + this.playList[0].key];
      this.src = (typeof img === "string" && img.length > 0) ? img : "";
      this.cursor = null;
      localStorage["monkeyPlaylist"] = JSON.stringify(this.playList);
      this.editItem = this.playList[0];
      document.title = "monkey[" + this.editItem.name + "(" + this.editItem.project + ", " + this.editItem.device + ")]";
    },
    download() { // 滙出
      this.$Modal.confirm({
        title: "滙出",
        width: document.body.clientWidth - 100,
        render: (h) => {
          return h(
            "textarea",
            {
              attrs: {
                id: "download_clipboard",
                style:
                  "height: " +
                  (document.body.clientHeight - 300) +
                  "px; width: 100%; padding: 5px; font-size: 16px; font-weight: 700;",
                readonly: true,
              },
              props: {
                // read
              },
              on: {
                blur: (event) => {
                  this.value = event.target.value;
                },
                paste: (event) => {
                  // console.log(event)
                },
              },
            },
            this.parseScript()
          );
        },
        onOk: () => {
          if (this.$isElectron) {
            let el = document.getElementById("download_clipboard");
            if (typeof el === "object") {
              try {
                window.execScript(el.value, { cycle: 1 });
              } catch (e) {
                alert(e);
              }
            }
          }
        },
      });
      setTimeout(() => {
        let el = document.getElementById("download_clipboard");
        if (el != null && typeof el === "object") {
          el.select();
          let range = document.createRange();
          range.selectNode(el);
          window.getSelection().addRange(range);
          document.execCommand("copy");
        }
      }, 1000);
    },
    async capture() {
      try {
        vm.loading();
        this.src = await window.screenCapture();
        localStorage["monkeyImg-" + this.editItem.key] = this.src;
        vm.loading(false);
      } catch (e) {
        vm.loading(false);
        // alert(e);
      }
    },
    parseScript() {
      let s = "";
      this.$refs["script"].list.forEach((el, index) => {
        let s2 = "";
        if(typeof el.script == "string") {
          let scripts = localStorage["monkeyScript-" + el.script];
          if (typeof scripts === "string" && scripts.length > 0) {
            let list = JSON.parse(scripts);
            list.forEach((el2, index2) => {
              let s3 = parse(el2);
              if (s3.length > 0) s2 += (s2.length > 0 ? "\n" : "") + s3 ;
            });
          }
        } else 
          s2 = parse(el);
        if (s2.length > 0) s += (s.length > 0 ? "\n" : "") + s2;
      });
      if (s.length > 0) {
        s = "type= raw events\ncount= 10\nspeed= 1.0\nstart data >>\n\n" + s;
      }
      return s;

      function parse(el) {
        let s2 = "";
        if (!isNaN(el.x) && typeof !isNaN(el.y)) {
          s2 +=
            "DispatchPointer(0,0,0," +
            el.x +
            "," +
            el.y +
            ",0,0,0,0,0,0,0)\n" +
            "DispatchPointer(0,0,1," +
            el.x +
            "," +
            el.y +
            ",0,0,0,0,0,0,0)";
        }
        if (!isNaN(el.second)) {
          s2 += (s2.length > 0 ? "\n" : "") + "UserWait(" + parseFloat(el.second) * 1000 + ")";
        }

        if (typeof el.title === "string" && s2.length > 0)
          s2 = "#" + el.title + "\n" + s2;

        return s2
      }
    },
    async runScript() {
      this.execScript = this.parseScript();
    },
    closeScript() {
      this.execScript = "";
    },
    closeOpen(arg) {
      if(typeof arg == "object") {
        if(typeof arg.key == "undefined") {
          arg.key = (new Date()).toString("yyyy-mm-ddThh:MM:ss.ms")
        }
        this.playList.unshift(arg);
        this.selectItem(arg.key);
      }
      this.visibleModalOpen = false;
    },
    onOpenMondalInsert(){
      let list = [], slef = this;
       this.playList.forEach((item, index)=>{
         if(index > 0) {
           if(item.project == this.editItem.project && item.device == this.editItem.device)
            list.push(item)
         }
       });
      let script = "";
      this.$Modal.confirm({
        title: "插入腳本",
        width: document.body.clientWidth - 100,
        render: (h) => {
          return h(ModalInsert, {
              props: {
                list
              },
              on: {
                scriptChange: (value) => {
                  script = value;
                },
                rowClick: (value) => {
                  slef.$refs["script"].insert({script: value.key, name: value.name});
                  this.$Modal.remove();
                }
              }
          })
        },
        onOk: () => {
          if(script.length > 0) {
            try {
              let arr = JSON.parse(script);
              slef.$refs["script"].insert(arr)
            } catch (e) {
              alert(e)
            }
          } else {

          }
        },
      });
    }
  },
};

function drop(el, callback) {
  function stopEvent(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }
  el.addEventListener(
    "dragover",
    function (e) {
      stopEvent(e);
      // if (typeof callback === "function") callback("dragover");
    },
    false
  );

  el.addEventListener(
    "dragleave",
    function (e) {
      stopEvent(e);
      // if (typeof callback === "function") callback("dragleave");
    },
    false
  );

  el.addEventListener(
    "drop",
    function (e) {
      stopEvent(e);
      let files = e.dataTransfer.files;
      for (let key in files) {
        if (
          typeof files[key] === "object" &&
          "image/jpeg, image/bmp, image/gif, image/png".indexOf(
            files[key].type
          ) > -1
        ) {
          let reader = new FileReader();
          reader.onload = function (e) {
            if (typeof callback === "function") callback("drop", reader.result);
          };
          reader.readAsDataURL(files[key]);
        } else if (typeof files[key] === "object") {
          alert("檔案格式錯誤");
          return;
        }
      }
    },
    false
  );
}
</script>

<style>
html,
body {
  height: 100%;
  margin: 0px;
  padding: 0px;
  overflow: hidden;
}
* {
  box-size: border-box;
  font-family: 'Times New Roman', 'Helvetica Neue', 微軟正黑體, 'Microsoft Jhenghei', Helvetica, Arial, sans-serif;
	font-size: 16px;
}
div, span {
  user-select: none;
}
.ivu-input {
  font-size: 14px;
  padding: 4px;
}
#monkey {
  /* font-family: "Avenir", Helvetica, Arial, sans-serif; */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin: 5px; */
  height: 100%;
  display: flex;
  flex-direction: column;
}
#menu {
  color: white;
  display: flex;
  flex-direction: row;
  padding: 10px 10px 5px 10px;
}
#frame {
  /* height: 100%; */
  flex: 1;
  display: flex;
  flex-direction: row;
  padding: 2px;
}
#left {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
#right {
  height: 100%;
  display: flex;
}
.footer {
  min-height: 50px;
  width: 100%;
  border-top: 1px solid #e6e6e6;
  padding: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.ivu-menu-horizontal {
  height: 45px !important;
  line-height: 45px !important;
}
#cursor {
  display: inline-block;
  background-color: rgba(192, 25, 33, 0.3);
  
  position: absolute;
  animation: mymove 5s infinite;
  cursor: move;
}
.ivu-dropdown-rel{
  font-size: 16px;
}
.ivu-dropdown-item {
  padding: 7px 10px;
  text-align: left;
}
.ivu-dropdown-item-divided:before {
  margin: 0 -10px
}
@keyframes mymove {
  from {
    background-color: rgb(192,192,192, 0.3);
    border-color: rgb(192, 25, 33)
  }
  to {
    background-color:rgba(192, 25, 33, 0.3);
    border-color: rgb(192,192,192)
  }
}
</style>
