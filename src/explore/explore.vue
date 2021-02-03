<template>
  <div id="explore">
    <Split v-model="split1" min="120">
        <div slot="left" id="left" class="demo-split-pane" style="z-index: 1; overflow-x: hidden;">
             <Tree :data="data1" style="z-index: -1"></Tree>
        </div>
        <div id="right" slot="right" class="demo-split-pane" style="z-index: 1; overflow-x: hidden;">
            <Tree :data="data1" style="z-index: -1"></Tree>
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
      data1: [{
          title: 'parent 1',
          expand: true,
          children: [{
              title: 'parent 1-1',
              expand: true,
              children: [{ 
                title: 'leaf 1-1-1'
              }, {
                title: 'leaf 1-1-2'
              }]
            }, {
                title: 'parent 1-2',
                expand: true,
                children: [
                    {
                        title: 'leaf 1-2-1'
                    },
                    {
                        title: 'leaf 1-2-1'
                    }
                ]
            }
          ]
        }
      ]
    }
  },
  async mounted() {
    if(this.$isElectron== true){
      try{
        let result2 = await this.retrive();
        
        console.log(result2);
      } catch(e){
        alert(e)
      }
    }
  },
  methods: {
    retrive(path){
      if(typeof path == "undefined") path = "";
      return new Promise( async (success, error) => {
        if(this.$isElectron== true){
          try{
            let result2 = await window.shell("adb shell ls -F " + path);
            
            console.log(result2);
          } catch(e){
            error(e)
          }
        } else {
          success([])
        }
      })
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
}
</style>
