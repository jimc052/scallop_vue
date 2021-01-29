// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ADB from './adb.vue'

Vue.config.productionTip = false

console.log(ADB)
new Vue({
  el: '#adb',
  components: { ADB },
  template: '<ADB />'
})
