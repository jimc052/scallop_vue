<template>
  <Table border :columns="columns2" :data="rows" @on-row-click="onRowProjectClick" :height="height - 10" style="margin: 2px;">
    <template slot-scope="{index}" slot="index">
      <div style="text-align: center">{{index + 1}}</div>
    </template>
    <template v-for="(item, index2) in columns" :slot="item.key" slot-scope="{row, index}" >
      <div v-if="editIndex == index" :key="index2" style="text-align: center;">
        <Checkbox v-model="editRow[item.key]" @on-change="onChange"
          v-if="typeof item.type == 'string' && item.type == 'checkbox'" />
        <Input v-model="editRow[item.key]" size="large" clearable v-else 
          @on-change="onChange" /> 
      </div>
      <div v-else :key="index2 + 1000">
        {{row[item.key]}}
      </div>
    </template>

    <template slot-scope="{row, index}" slot="action" class="action">
      <div style="text-align: center" v-if="editIndex == -1">
        <Button type="primary" size="small" style="margin-right: 5px" @click="editIndex = index; editRow = Object.assign({}, row); dirty = false;">編輯</Button>
        <Button type="error" size="small" @click="onRemove(index, row)">刪除</Button>
      </div>
      <div style="text-align: center" v-else-if="editIndex == index">
        <Button type="primary" size="small" style="margin-right: 5px" @click="onEdit(index, row)">存檔</Button>
        <Button type="error" size="small" @click="editIndex = -1; dirty = false; ">取消</Button>
      </div>
    </template>
  </Table>
      
</template>
<script>

export default {
  name: 'TableConfig',
  props: ["columns", "datas", "height", "name"],
  data () {
    return {
      dirty: false,
      columns2: [],
      editIndex: -1,
      rows: this.datas,
      editRow: null
    }
  },
  async mounted() {
    this.broadcast.$on('config-add', this.onAdd);

    this.columns2.push({
        title: ' ',
        width: 40,
        slot: 'index',
    });
    this.columns2 = this.columns2.concat(this.columns);
    this.columns2.push({
      title: '操作',
      width: 120,
      slot: 'action',
    })
  },
  destroyed() {
    this.broadcast.$off('config-add', this.onAdd);
  },
  methods: {
    onAdd(panel){
      if(this.name == panel && this.editIndex == -1) {
        // this.$set(this.rows, this.rows.length, {})
        this.rows.push({});
        setTimeout(() => {
          this.editRow = {};
          this.editIndex = this.rows.length - 1;
        }, 300);
      }
    },
    onRowProjectClick(index){
    }, 
    onChange(){
      this.dirty = true;
      
    },
    onEdit(index, row){
      console.log("dirty: " + this.dirty)
      for(let key in this.editRow) {
        if(key.indexOf("_") == 0) 
          delete this.editRow[key];
        else if(typeof this.editRow[key] == "boolean" && this.editRow[key] == false)
          delete this.editRow[key];
      }
      this.$set(this.rows, index, this.editRow)
      if(this.dirty == true)
        this.$emit('on-update', this.rows)
      this.editIndex = -1;
      this.editRow = null;
      this.dirty = false
    },
    onRemove(index, row) {
      this.dirty = false;
      this.rows.splice(index, 1);
      this.$emit('on-update', this.rows)
    },
  },
  watch: {
    
  }, 
}
</script>
<style>
</style>