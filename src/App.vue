<template>
  <div id="app">
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
    // HelloWorld
  },
  data() {
    return {
      visible: false,
      cycle: 5,
      cycles: [1, 2, 3, 5, 10, 20, 30, 50, 80, 100],
      interval: 10,
      intervals: [0, 10, 15, 20, 30],
      width: document.body.clientWidth - 200,
      height: document.body.clientHeight - 300,
      stdout: "",
    };
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
