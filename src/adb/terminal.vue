<template>
  <div class="term-frame" :style="{height: height + ('px'), position: 'relative'}">
    <div class="term" :id="id" ref="term" v-html="history">
      {{history}}
    </div>
  </div>
</template>

<script>
let waiting = '<i class="demo-spin-icon-load ivu-icon ivu-icon-ios-loading"></i>'
let cursor = "<span class='term-cursor' />";
let exeMode = "shell";
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
    this.broadcast.$on('term-execute', (title, json)=> {
      if(title != this.title) return;
      if(exeMode != "shell") {
        this.history = "";
        document.getElementById(this.id).innerHTML = "";
      }
      setTimeout(()=>{
        if(exeMode != "shell") this.addHistory("cwd", "cursor");

        this.execute(title, json)
      }, exeMode != "shell" ? 600 : 0);
    });
    this.broadcast.$on('term-database', (title, json)=> {
      if(title != this.title) return;
      this.history = "";
      document.getElementById(this.id).innerHTML = "";
      setTimeout(()=>{
        this.database(title, json)
      }, 600);
    });
  },
  destroyed() {
    if(typeof this.pid != "undefined")
      window.process.kill(this.pid);
    this.broadcast.$off('term-execute');
    this.broadcast.$off('term-database');
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
      exeMode = "shell";
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
    async database(title, json) {
      exeMode = "database";
      let self = this;
      this.processing = true;
      
      json.site = json.sql_var[0].value;
      json.sql_var.splice(0, 1);

      console.log(json)

      this.addPrompt("開始：" + (new Date()).toString());
      
      let target, source;
      { // 連線......
        if(json.mode == "複製") {
          try {
            this.addPrompt({id: "source_connect", msg: json.source + "連線中"});
            source = await connect(json.source_config);
            this.addPrompt({id: "source_connect", msg: json.source + "已連線"});
          } catch(e) {
            this.addPrompt({id: "source_connect", msg: json.source + "連線失敗!!"});
            this.addPrompt({error: e.toString()});
            finish();
            return;
          }
        }
        try {
          this.addPrompt({id: "target_connect", msg: json.target + "連線中"});
          target = await connect(json.target_config);
          this.addPrompt({id: "target_connect", msg: json.target + "已連線"});
          console.log(target)
        } catch(e) {
          this.addPrompt({id: "target_connect", msg: json.target + "連線失敗!!"});
          this.addPrompt({error: e.toString()});
          finish();
          return;
        }
      }

      for(let key in json.tables) {
        let tables = json.tables[key];
        for(let i = tables.length - 1; i >= 0; i--) {
          let tbl = tables[i];
          if(typeof tbl == "object") {
            if(typeof tbl.disable == "boolean" && tbl.disable == true) {
              tables.splice(i, 1);
            }
          }
        }
      }

      if(json.mode == "複製") {
        let datas = {}
        self.addPrompt(json.source + "資料表複製：" + json.site);
        for(let key in json.tables) {
          let tables = json.tables[key];
          for(let i = 0; i < tables.length; i++) {
            let tbl = tables[i], where = "";
            if(typeof tbl == "object") {
              if(typeof tbl.tbl == "string") {
                if(typeof tbl.where == "string" && tbl.where.trim().length > 0) {
                  let x = tbl.where.toUpperCase();
                  if(x.indexOf("AND ") == 0 || x.indexOf("OR ") == 0 || x.indexOf("ORDER BY") == 0 || x.indexOf("LIMIT ") == 0) {

                  } else
                    where = " and " + tbl.where;

                  json.sql_var.forEach(el => {
                    where = where.replace("{" + el.title + "}", el.value)
                  });
                }
                tbl = tbl.tbl;
              } else {
                console.log("表格參數不正確", tbl);
                this.addPrompt({error: "表格參數不正確<br/>" + JSON.stringify(tbl) });
                break;
              }
            }

            try {
              this.addPrompt({id: "source_" + tbl, msg: "讀取 " + tbl + " ......"});
              let sql = "Select * from " + (key == "SYS" ? json.source_config.sys_database + "." : "") + tbl + 
                " Where " +
                ( tbl == "USERGROUPS" 
                  ? "USERID Like Concat('%@','" + json.site + "')"
                  : "SITE = '"  + json.site + "'"
                ) + where; // limit 100
              console.log(sql)
              let x = await query(source, sql);
              if(x.rows.length > 0) {
                if(typeof datas[key] == "undefined") datas[key] = {};
                datas[key][tbl] = x.rows;
              }
              this.addPrompt({id: "source_" + tbl, msg: "讀取 " + tbl + "；" + (x.rows.length) + " 列"});
            } catch(e) {
              this.addPrompt({error: e.toString()});
              finish();
              return;
            }
          }
          // console.log(datas); // break;
        }
        source.end();

        self.addPrompt(json.target + "資料表寫入：" + json.site);
        for(let key in datas) {
          let tables = datas[key];
          for(let tbl in tables) {
            this.addPrompt({id: "target_" + tbl, msg: "寫入 " + tbl});
            // console.log(tables[tbl])
            for(let i = 0; i < tables[tbl].length; i++) {
              if(i > 0) {
                this.addPrompt({id: "target_" + tbl, msg: "寫入 " + tbl + ": " + (i + 1) + " / " + tables[tbl].length });
              }
              let sql = "";
              try {
              //   
                sql = "Insert Into " + (key == "SYS" ? json.target_config.sys_database + "." : "") + tbl + 
                  " Set ";
                let row = tables[tbl][i];
                let set = ""
                for(let key2 in row) {
                  if(row[key2] != null){
                    let val = typeof row[key2] == "string" 
                      ? row[key2].replace(new RegExp("'", "gm"),"''")
                      : row[key2];
                    set += (set.length > 0 ? ", " : "") + key2 + "='" + val + "'";
                  }
                }
                sql += set;
                // console.log(sql + set)
                let x = await query(target, sql)
                // this.addPrompt({id: "target_" + tbl, msg: "寫入 " + tbl + ""});
              } catch(e) {
                this.addPrompt({error: sql + "<br/>" + e.toString()});
                finish();
                return;
              }
            }
            this.addPrompt({id: "target_" + tbl, msg: "寫入 " + tbl + ": " + tables[tbl].length + " 列"});
            // console.log(tbl)
          }
        }
        target.end();
      } else { // 
        self.addPrompt(json.target + "資料表刪除：" + json.site);
        for(let key in json.tables) {
          let tables = json.tables[key];
          for(let i = 0; i < tables.length; i++) {
            let tbl = tables[i];
            if(typeof tbl == "object") {
              if(typeof tbl.tbl == "string") {
                tbl = tbl.tbl;
              } else {
                console.log("表格參數不正確", tbl);
                this.addPrompt({error: "表格參數不正確<br/>" + JSON.stringify(tbl) });
                break;
              }
            }
            try {
              this.addPrompt({id: "target_" + tbl, msg: "刪除 " + tbl + " ......"});
              let sql = "Delete from " + (key == "SYS" ? json.target_config.sys_database + "." : "") + tbl + 
                " Where " +
                ( tbl == "USERGROUPS" 
                  ? "USERID Like Concat('%@','" + json.site + "')"
                  : "SITE = '"  + json.site + "'"
                );
              console.log(sql)
              let x = await query(target, sql)

              this.addPrompt({id: "target_" + tbl, msg: "刪除 " + tbl + ""});
            } catch(e) {
              this.addPrompt({error: e.toString()});
              finish();
              return;
            }
          }
        }
        target.end();
      }
      finish();

      function connect(config) {
        return new Promise( async (success, error) => {
          if(self.$isElectron== true) {
            let db = window.mysql.createConnection(config);
            db.connect(function(err){
              if(err) 
                error(err);
              else 
                success(db)
            });
          } else {
            setTimeout(() => {
              success("error test")
            }, 1000);
          }
        })
      }

      function query(connect, sql) {
        return new Promise( async (success, error) => {
          if(self.$isElectron== true) {
            connect.query(sql, function(err, rows, fields) {
              if(err){
                error(err);
              } else {
                setTimeout(() => {
                  success({rows, fields});
                }, 600);
              }
            });
          } else {
            setTimeout(() => {
              success("error test")
            }, 1000);
          }
        });
      }

      function finish(){
        self.addPrompt("結束：" + (new Date()).toString());
        self.processing = false;
        self.broadcast.$emit("term-finish");
      }
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
        // console.log(i + ": '" + arguments[i] + "'")
        if(typeof arguments[i].error == "string") {
          this.history.replace(waiting, "");
          this.history += "<span class='term-error' >" + arguments[i].error + "</span>";
        } else if(arguments[i] == "cwd") {
          this.history += "<span class='tem-prompt' >~ $ </span>";
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
    },
    addPrompt(arg){
      if(typeof arg.id == "string") {
        let child = document.querySelector("#" + this.id + " ." + arg.id);
        if(child == null) {
          let node = document.createElement("div");
          node.innerHTML = "<span class='tem-prompt' >SQL > </span>" +
            "<span class='" + arg.id + "'>" + arg.msg + waiting+ "</span";  
          document.getElementById(this.id).appendChild(node); 
        } else {
          child.innerHTML = arg.msg;
        }
      } else if(typeof arg.error == "string") {
        let node = document.createElement("div");
        node.innerHTML = "<span class='term-error' >" + arg.error + "</span>";
        document.getElementById(this.id).appendChild(node)
      } else if(typeof arg == "string") {
        let node = document.createElement("div");
        node.innerHTML = arg;  
        document.getElementById(this.id).appendChild(node); 
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
.tem-prompt {
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
