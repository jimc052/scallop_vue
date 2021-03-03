<template>
  <div>
    <table style="width: 100%;">
      <tr v-for="item in cols" :key="item.key">
        <td style="text-align: right; width: 100px">{{item.title + "："}}</td>
        <td> <Input v-model="database[item.key]" id="host" size="large" @on-change="onChange" clearable/></td>

        <!-- <td style="text-align: right; width: 100px">主機：</td>
        <td> <Input v-model="database['host']" id="host" size="large" @on-change="onChange" clearable/></td> -->
      </tr>
      
    </table>
  </div>
</template>
<script>

export default {
  name: 'ModalDatabasePicker',
  props: ["database", "cols"],
  components: {
  },
  data () {
    return {
      // height: document.body.clientHeight - 200
    }
  },
  async mounted() {
    
  },
  methods: {
    onChange(event) {
      this.$emit("onChange", this.database)
    },
  }
}

</script>

<style>

</style>
