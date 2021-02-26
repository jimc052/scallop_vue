<template>
  <div class="term-frame" :style="{height: height + ('px'), position: 'relative'}">
    <div class="demo-spin-container" v-if="processing">
      <spin fix>
          <icon type="ios-loading" size=18 class="demo-spin-icon-load"></icon>
      </spin>
    </div>
    <div class="term" ref="term" contenteditable="true" v-html="history">
      {{history}}
    </div>
  </div>
</template>

<script>
// let { exec, spawn } = require('child_process');
// let spawn = require("child_process").spawn;
// console.log(typeof window.spawn)

export default {
  name: 'Terminal',
  components: {
  },
  props: ['title', "height"],
  data() {
    return {
      history: "",
      processing: false,
      // cwd: ""
      // height: document.body.clientHeight - 300,
    };
  },
  async mounted() {
    this.addHistory("cwd");
    this.broadcast.$on('term-execute',  this.execute);
  },
  destroyed() {
    if(typeof this.pid != "undefined")
      window.process.kill(this.pid);
    this.broadcast.$off('term-execute');
  },
  methods: {
    cwd(){ //  沒效。。。。。。。。。。。
      return new Promise( async (success, error) => {
        if(this.$isElectron == false) {
          success("~")
        } else if (window.process.platform == 'win32') { // 沒寫
          let directoryRegex = /([a-zA-Z]:[^\:\[\]\?\"\<\>\|]+)/mi;
          
        } else {
          window.child_process.exec(`lsof -p | grep cwd | tr -s ' ' | cut -d ' ' -f9-`, (err, cwd) => {
            console.log(cwd)
            success(cwd.trim());
          });
        }
      });
    },
    async execute(title, commands) {
      console.log(commands)
      this.processing = true;
      if(title != this.title) return;
      let arr = commands.split("&&"), results = "";
      for(let i = 0; i < arr.length; i++) {
        // console.log(arr[i])
        try {
          await this.exeCmd(arr[i]);
          this.addHistory("cwd");
        } catch(e) {
          this.addHistory("cwd");
          break;
        }
      }
      this.processing = false;
      this.broadcast.$emit("term-finish")
    },
    exeCmd(command) {
      return new Promise( async (success, error) => {
        // console.log(command)
        this.addHistory(command.trim(), "\n");
        if(this.$isElectron== true){
          let arr = command.trim().split(" "), result = "";
          let cmd = arr[0];
          arr.splice(0, 1);

          let bat = window.child_process.spawn(cmd, arr);
          bat.stdout.on("data", (data) => {
            console.log("stdout: " + data.toString())
            this.addHistory(data.toString());
          });

          bat.stderr.on("data", async (err) => {
            window.process.kill(bat.pid);
            error(err.toString())
            this.addHistory(err.toString());
            this.addHistory("\n", "cwd");
          });

          bat.on("exit", async (code) => {
            this.pid = undefined;
            console.log("exit.......")
            success(result)
            this.addHistory("\n", "cwd");
          });
          this.pid = bat.pid
        } else {
          success();
        }
      });
    },
    addHistory(){
      for(let i = 0; i < arguments.length; i++){
        if(arguments[i] == "cwd") {
          this.history += "~ $ "
        } else {
          this.history += arguments[i].replace(new RegExp("\n","gm"),"<br/>")
        }
      }
      setTimeout(()=>{
        this.$refs["term"].scrollTop = this.$refs["term"].scrollHeight;
      }, 300)
    },
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
.demo-spin-container{
  top: 0px;
  right: 0px;
  display: inline-block;
  width: 30px;
  height: 30px;
  position: absolute;
  /* border: 1px solid #eee; */
  z-index: 99999;
  background: transparent;
}
.demo-spin-icon-load{
    animation: ani-demo-spin 1s linear infinite;
}
@keyframes ani-demo-spin {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
}
</style>
