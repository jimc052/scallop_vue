import Vue from 'vue';
import ADB from './adb.vue';
import iView from "iview";
import "iview/dist/styles/iview.css";
import locale from 'iview/src/locale/lang/zh-TW';

Vue.use(iView, { locale });

Vue.config.productionTip = false;
Vue.prototype.broadcast = new Vue(); // 廣播用元件
Vue.prototype.$isElectron = navigator.userAgent.indexOf("Electron") > -1;

new Vue({
  el: '#app',
  components: { ADB },
  template: '<ADB />',
  mounted() {
    window.onresize = () => {
      return (() => {
        this.broadcast.$emit("on-resize");
      })();
    };
  }
})
