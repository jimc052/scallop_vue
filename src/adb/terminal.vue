<template>
  <div class="term-frame" :style="{height: height + ('px'), position: 'relative'}">
    <div class="term" :id="id" ref="term" v-html="history">
      {{history}}
    </div>
  </div>
</template>

<script>
let waiting = '<i class="demo-spin-icon-load ivu-icon ivu-icon-ios-loading"></i>'
let cursor = "<span class='term-cursor' />"
export default {
  name: 'Terminal',
  components: {
  },
  props: ['title', "height"],
  data() {
    return {
      history: "",
      processing: false,
      id: "term" + (new Date()).getTime()
      // cwd: ""
      // height: document.body.clientHeight - 300,
    };
  },
  async mounted() {
    this.addHistory("cwd", "cursor");
    this.broadcast.$on('term-execute',  this.execute);
  },
  destroyed() {
    if(typeof this.pid != "undefined")
      window.process.kill(this.pid);
    this.broadcast.$off('term-execute');
  },
  methods: {
    cwd(){ // MacOS 測過了 OK，但沒在用
      return new Promise( async (success, error) => {
        if(this.$isElectron == false) {
          success("~")
        } else if (window.process.platform == 'win32') { // copy 自 hyper-history, 但沒改，可能不能用
          // if (action && action.data) {
          //     let path = directoryRegex.exec(action.data);
          //     if(path){
          //       currCwd = path[0];
          //     }
          // }
        } else {
          window.child_process.exec(`lsof -p ${window.process.pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`, (err, cwd) => {
            success(cwd.trim());
          });
        }
      });
    },
    async execute(title, commands) {
      if(title != this.title) return;
      console.log(commands)
      if(commands == "clear") {
        this.history = "";
        this.addHistory("cwd", "cursor");
        this.broadcast.$emit("term-finish")
        return;
      }
      this.processing = true;
      let arr = commands.split("&&"), results = "";
      for(let i = 0; i < arr.length; i++) {
        // console.log(arr[i])
        try {
          await this.exeCmd(arr[i]);
        } catch(e) {
          break;
        }
      }
      this.processing = false;
      this.broadcast.$emit("term-finish")
    },
    exeCmd(command) {
      this.history = this.history.replace(cursor, "")

      return new Promise( async (success, error) => {
        // console.log(command)
        this.addHistory(command.trim(), "waiting", "\n");
        if(this.$isElectron== true){
          let arr = command.trim().split(" "), result = "";
          let cmd = arr[0];
          arr.splice(0, 1);

          let bat = window.child_process.spawn(cmd, arr);
          this.pid = bat.pid;
          bat.stdout.on("data", (data) => {
            console.log("stdout: " + data.toString())
            this.addHistory(data.toString());
          });

          bat.stderr.on("data", async (err) => {
            window.process.kill(bat.pid);
            this.pid = undefined;
            error(err.toString());
            this.history = this.history.replace(waiting, "");
            this.addHistory({error: err.toString()});
            this.addHistory("\n", "cwd", "cursor");
          });

          bat.on("exit", async (code) => {
            if(typeof this.pid != "undefined") {
              this.history = this.history.replace(waiting, "");
              this.pid = undefined;
              console.log("exit.......")
              success(result)   
              this.addHistory("cwd", "cursor");
            }
          });
        } else {
          this.history = this.history.replace(waiting, "");
          this.addHistory("cwd", "cursor");
          success();
        }
      });
    },
    addHistory(){
      for(let i = 0; i < arguments.length; i++){
        console.log(i + ": '" + arguments[i] + "'")
        if(typeof arguments[i].error == "string") {
          this.history += "<span class='term-error' >" + arguments[i].error + "</span>";
        } else if(arguments[i] == "cwd") {
          this.history += "<span class='term-cwd' >~ $ </span>"
        } else if(arguments[i] == "cursor") {
          this.history += cursor;
        } else if(arguments[i] == "waiting") {
          this.history += waiting;
        } else {
          this.history += "<span>" + arguments[i].replace(new RegExp("\n","gm"),"<br/>") + "</span>"
        }
      }
      setTimeout(()=>{
        this.$refs["term"].scrollTop = this.$refs["term"].scrollHeight;
      }, 300)
    }
  },
  watch: {
    // command(value) {}
  }
}
</script>

<style>
.term {
  height: 100%;
  background: #272822; 
  color: #f8f8f2;
  text-align: left;
  padding: 3px;
  z-index: 1;
  overflow: auto;
  /* zoom: 1.2; */
  font-family: Arial, monospace;
  font-size: 18px;
}
.term-cwd {
  font: inherit;
  color: yellow;
}
.term-error {
  font: inherit;
  color: red;
}
.term-cursor {
  width: 10px;
  height: 16px;
  margin-bottom: -2px;
  display: inline-block;
  background-color: white;
}

.demo-spin-icon-load{
  animation: ani-demo-spin 1s linear infinite;
  margin-left: 10px;
  font-size: 18px; 
}
.demo-split-pane {
  padding: 5px 5px 5px 10px;
}
@keyframes ani-demo-spin {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
}
</style>
