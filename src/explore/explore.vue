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
import Electron from "../system/Electron.js"

export default {
  name: 'Explore',
  components: {
  },
  data () {
    return {
      split1: 0.5,
      //
      data1: [{
            title: 'parent 1',
            expand: true,
            children: [{
                    title: 'parent 1-1',
                    expand: true,
                    children: [{ title: 'leaf 1-1-1'
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
        console.log(typeof Electron.checkDevice)
        // let result1 = await Electron.shell("adb shell ls -al", (data)=>{
        //   console.log(data)
        // });
        // console.log(result1);
        let result2 = await Electron.checkDevice();
        console.log(result2);
      } catch(e){
        console.log(e)
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
* {
  box-size: border-box;
}
#explore {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
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
</style>
