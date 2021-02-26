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
let { exec, spawn } = require('child_process');

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
      process.kill(this.pid);
    this.broadcast.$off('term-execute');
  },
  methods: {
    cwd(){
      return new Promise( async (success, error) => {
        if(this.$isElectron == false) {
          success("~")
        } else if (process.platform == 'win32') {
          let directoryRegex = /([a-zA-Z]:[^\:\[\]\?\"\<\>\|]+)/mi;
          if (action && action.data) {
              let path = directoryRegex.exec(action.data);
              if(path){
                success(path[0]); // 還沒測過
              }
          }
        } else {
          exec(`lsof -p ${pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`, (err, cwd) => {
            success(cwd.trim());
          });
        }
      });
    },
    async execute(title, commands) {
      this.processing = true;
      if(title != this.title) return;
      let arr = commands.split("&&"), results = "";
      for(let i = 0; i < arr.length; i++) {
        console.log(arr[i])
        try {
          await this.exeCmd(arr[i]);
          this.addHistory("cwd");
        } catch(e) {
          this.addHistory("cwd");
          break;
        }
      }
      this.processing = false;
    },
    exeCmd(command) {
      return new Promise( async (success, error) => {
        console.log(command)
        this.addHistory(command.trim(), "\n");
        if(this.$isElectron== true){
          let arr = command.trim().split(" "), result = "";
          let cmd = arr[0];
          arr.splice(0, 1);

          let bat = spawn(cmd, arr);
          bat.stdout.on("data", (data) => {
            console.log(data.toString())
            this.addHistory(data.toString());
          });

          bat.stderr.on("data", async (err) => {
            process.kill(bat.pid);
            error(err.toString())
            this.addHistory(err.toString());
            this.addHistory("\n", "cwd");
          });

          bat.on("exit", async (code) => {
            success(result)
            this.addHistory("\n", "cwd");
          });
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
