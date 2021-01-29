// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import iView from "iview";
import "iview/dist/styles/iview.css";

Vue.use(iView);
Vue.config.productionTip = false;
Vue.prototype.broadcast = new Vue(); // 廣播用元件
Vue.prototype.$isElectron = navigator.userAgent.indexOf("Electron") > -1;

new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
  mounted() {
    window.onresize = () => {
      return (() => {
        // self.screenWidth = document.body.clientWidth;
        this.broadcast.$emit("on-resize");
      })();
    };
  }
})
