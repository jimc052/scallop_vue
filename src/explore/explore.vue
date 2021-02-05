<template>
  <div id="explore">
    <Split v-model="split1" min="120">
        <div slot="left" id="left" class="demo-split-pane" style="z-index: 1; overflow-x: hidden;">
            <Tree :data="left" style="z-index: -1" :load-data="loadData"></Tree>
        </div>
        <div id="right" slot="right" class="demo-split-pane" style="z-index: 1; overflow-x: hidden;">
            <tree :data="right" style="z-index: -1" :load-data="loadData"></tree>
        </div>
    </Split>
  </div>
</template>

<script>

export default {
  name: 'Explore',
  components: {
  },
  data () {
    return {
      split1: 0.3,
      left: [],
      right: []
    }
  },
  async mounted() {
    if(this.$isElectron== true){
      try{
        let result = await this.retrive("/sdcard");
        this.left = result;
      } catch(e){
        alert(e)
      }
    }
  },
  methods: {
    retrive(path){
      path = typeof path == "undefined" ? "" : path + "/";
      return new Promise( async (success, error) => {
        if(this.$isElectron== true){
          try{
            let result = await window.shell("adb shell ls -F " + path);
            let arr = result.split("\n");
            let folder = [], file = [];
            for(let i = 0; i < arr.length; i++){
              let obj = {};
              if(arr[i].substr(arr[i].length - 1, 1) == "/"){
                folder.push({title: arr[i].substr(0, arr[i].length - 1), 
                  expand: false,
                  loading: false,
                  children: [],
                  path
                })
              } else if(arr[i].length > 0) {
                file.push({title: arr[i]})
              } else 
                continue;
            }
            success(folder.concat(file))
          } catch(e){
            error(e)
          }
        } else {
          success([])
        }
      })
    },
    async loadData (item, callback) {
      try{
        let result = await this.retrive(item.path + item.title);
        callback(result)
      } catch(e){
        alert(e)
      }
    }
  },
}
</script>

<style>
html, body {
  height: 100%;
  margin: 0px;
  padding: 0px;
  overflow: hidden;
}
div, span {
  user-select: none;
}
* {
  box-size: border-box;
  font-family: 'Times New Roman', 'Helvetica Neue', 微軟正黑體, 'Microsoft Jhenghei', Helvetica, Arial, sans-serif;
	font-size: 16px;
}
#explore {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
#left, #right {
  height: 100%;
}
.demo-split{
  height: 200px;
  border: 1px solid #dcdee2;
}
.demo-split-pane{
  padding: 10px;
}
.ivu-tree {
  text-align: left;
}
.ivu-tree ul li {
  padding: 0px;
  margin: 0px;
}
</style>
