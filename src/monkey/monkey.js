// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Monkey from './monkey.vue';
import iView from "iview";
import "iview/dist/styles/iview.css";

Vue.use(iView);
Vue.config.productionTip = false;
Vue.prototype.broadcast = new Vue(); // 廣播用元件
Vue.prototype.$isElectron = navigator.userAgent.indexOf("Electron") > -1;


window.vm = new Vue({
  el: '#monkey',
  components: { Monkey },
  template: '<div style="height: 100%;"><Monkey /><div v-if="spin" class="demo-spin-container"><Spin fix></Spin></div></div>',
  data() {
    return {
      spin: false
    };
  },
  mounted() {
    window.onresize = () => {
      return (() => {
        // self.screenWidth = document.body.clientWidth;
        this.broadcast.$emit("on-resize");
      })();
    };
    
  },
  methods: {
    loading(arg) {
      if(typeof arg == "boolean" && arg == false) {
        this.spinID = setTimeout(()=>{
          this.$Spin.hide();
        }, 1000)
      } else {
        let span = document.querySelector(".ivu-spin-main");
        if(span == null) {
          clearTimeout(this.spinID)
          this.$Spin.hide();
          this.$Spin.show({
            render: (h) => {
              return h('div', [
                h('Icon', {
                  'class': 'spin-icon-load',
                  props: {
                    type: 'ios-loading',
                    size: 30
                  }
                }),
                h('div', typeof arg == "string" ? arg : 'Loading')
              ])
            }
          });									
        }
      }
    }
  }
})
