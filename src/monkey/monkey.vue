<template>
  <div id="monkey">
    <Menu
      mode="horizontal"
      theme="primary"
      active-name="1"
      @on-select="onMenuSelect"
    >
      <Submenu name="file">
        <template slot="title">
          檔案
        </template>
        <MenuItem name="add">
          新增腳本
        </MenuItem>
        <MenuItem name="clone">
          另存腳本
        </MenuItem>
        <MenuItem name="download">
          滙出腳本
        </MenuItem>
        <MenuItem name="download">
          關閉編輯器
        </MenuItem>
      </Submenu>
    </Menu>
    <div id="menu" style="background: #2d8cf0;" >
      <Dropdown class="dropdown" style="margin-right: 10px">
        腳本
        <DropdownMenu slot="list">
          <DropdownItem name="新增腳本">
            新增腳本
          </DropdownItem>
          <DropdownItem name="另存腳本" divided>
            另存腳本
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>

    <div id="frame">
      <div id="left" :style="{height: (src.length == 0 ? '100%' : (height + 'px'))}">
        <div ref="imgframe"
          style="flex: 1; display: flex; flex-direction: column; justify-content: center;
            align-items: center;"
        >
          <div style="position: relative">
            <img id="img" ref="img" :src="src" :width="width + 'px'" />
            <div
              id="cursor"
              v-if="cursor != null"
              :style="{ top: cursor.y + 'px', left: cursor.x + 'px' }"
            />
          </div>
        </div>

        <div class="footer" v-if="src.length > 0 || $isElectron">
          <div>
            <Button
              type="success"
              v-if="$isElectron"
              @click="capture"
              style="margin-right: 5px"
              >截圖
            </Button>
            <Button
              type="success"
              @click="runScript"
              v-if="$isElectron && rows > 0"
              style="margin-right: 5px"
              >腳本
            </Button>
            <Button
              type="success"
              @click="download"
              v-if="rows > 0"
              style="margin-right: 5px"
              >滙出
            </Button>
          </div>
          <div style="flex: 1"></div>
          <div style="margin-left: 10px; width: 40px" v-show="x > -1 && y > -1">
            <div
              style="display: flex; flex-direction: row; align-items: center"
            >
              <div>X:</div>
              <div style="flex: 1; text-align: right">{{ x }}</div>
            </div>
            <div
              style="display: flex; flex-direction: row; align-items: center"
            >
              <div>Y:</div>
              <div style="flex: 1; text-align: right">{{ y }}</div>
            </div>
          </div>
        </div>
      </div>
      <Script id="right"
        v-if="src.length > 0"
        ref="script"
        @on-row-change="onRowChange"
        @on-cursor-change="onCursorChange"
        :style="{height: height + 'px'}"
      />
    </div>
    <ExecScript :script="execScript" @on-close="closeScript" />
  </div>
</template>
<script>
import Script from "./script";
import ExecScript from "./execScript";
let rate = 1;

export default {
  name: "Monkey",
  components: { Script, ExecScript },
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
    };
  },
  async mounted() {
    // alert(navigator.userAgent)
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
    // console.log(document.getElementsByTagName("BODY"))
    // console.log(document.getElementById("body"))
    drop(document.getElementById("body"), (event, result) => {
      this.src = result;
      localStorage["monkey-img"] = result;
    });

    let img = localStorage["monkey-img"];
    if (typeof img === "string" && img.length > 0) {
      this.src = img;
    }
    this.broadcast.$on("on-resize", this.onResize);

    try {
      // let result1 = await window.shell("adb shell ls");
      // console.log(result1);
      // let result2 = await window.checkDevice();
      // console.log(result2);
    } catch (e) {
      console.log(e);
    }
  },
  destroyed() {
    this.broadcast.$off("on-resize", this.onResize);
  },
  methods: {
    onRowChange(list) {
      this.rows = list.length;
    },
    onCursorChange(row, index) {
      if (row != null) {
        this.cursor = Object.assign({}, row);
        this.cursor.x = Math.ceil(row.x / rate) - 10;
        this.cursor.y = Math.ceil(row.y / rate) - 10;
      } else this.cursor = null;
    },
    onResize() {
      if (this.src.length > 0) {
        let monkey = document.querySelector("#monkey");
        let arr = document.querySelectorAll("#monkey > *");
        let clientHeight = 0;
        for(let i = 0; i < arr.length - 1; i++) {
          console.log(arr[i])
          clientHeight += arr[i].clientHeight;
        }
        this.height = monkey.clientHeight - clientHeight;
        console.log(monkey.clientHeight + "/" + clientHeight)
        let frame = document.querySelector("#frame");
        let right = document.querySelector("#script");
        let clientWidth = frame.clientWidth - right.clientWidth;
        do {
          let xRate = this.$refs["img"].naturalWidth / clientWidth;
          let h = this.$refs["img"].naturalHeight / xRate;
          if (h > frame.clientHeight - 100) {
            clientWidth -= 10;
          } else {
            if (clientWidth < this.$refs["img"].naturalWidth)
              this.width = clientWidth;
            else this.width = this.$refs["img"].naturalWidth;
              rate = this.$refs["img"].naturalWidth / this.width;
            break;
          }
        } while (clientWidth > 0);
      }
    },
    onMenuSelect(name) {
      if (name === "download") this.download();
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
                id: "clipboard",
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
            let el = document.getElementById("clipboard");
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
        let el = document.getElementById("clipboard");
        if (typeof el === "object") {
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
        await window.screenCapture();
      } catch (e) {
        alert(e);
      }
    },
    parseScript() {
      let s = "";
      this.$refs["script"].list.forEach((el, index) => {
        let s2 = "";
        if (typeof el.title === "string") {
          s2 += "#" + el.title + "\n";
        }
        if (typeof el.x === "number" && typeof el.y === "number") {
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
            ",0,0,0,0,0,0,0)\n";
        }
        if (typeof el.second) {
          s2 += "UserWait(" + parseFloat(el.second) * 1000 + ")\n";
        }

        if (s2.length > 0) s += "" + s2 + "\n";
      });
      if (s.length > 0) {
        s = "type= raw events\ncount= 10\nspeed= 1.0\nstart data >>\n\n" + s; // + "#等待20秒\nUserWait(20000)";
      }
      return s;
    },
    async runScript() {
      this.execScript = this.parseScript();
    },
    closeScript() {
      this.execScript = "";
    },
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
}
#monkey {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
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
  border: 1px solid #e6e6e6;
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
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background-color: rgba(192, 25, 33, 0.3);
  border: 3px solid #c01921;
  position: absolute;
}
.ivu-dropdown-rel{
  font-size: 16px;
}
</style>
