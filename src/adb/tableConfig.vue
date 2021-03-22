<template>
  <Table border :columns="columns2" :data="rows" :id="name + '-tbl'" :height="height - 10" style="margin: 0px 2px 2px 2px;"
    @on-row-click="onRowClick" @on-row-dblclick="onRowDoubleClick"
  >
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
        <Button type="primary" size="small" style="margin-right: 2px;" @click="onRowDoubleClick(row, index)">編輯</Button>
        <Button type="error" size="small" @click="onRemove(row, index)">刪除</Button>
      </div>
      <div style="text-align: center" v-else-if="editIndex == index">
        <Button type="primary" size="small" style="margin-right: 2px" @click="onEdit(row, index)">存檔</Button>
        <Button type="error" size="small" @click="editIndex = -1; dirty = false; ">取消</Button>
      </div>
    </template>
  </Table>
      
</template>
<script>

export default {
  name: 'TableConfig',
  props: ["columns", "datas", "height", "name", "active"],
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
      width: 100,
      slot: 'action',
    });
    window.addEventListener('keydown', this.onKeydown, false);
  },
  destroyed() {
    this.broadcast.$off('config-add', this.onAdd);
    window.removeEventListener('keydown', this.onKeydown, false);
  },
  methods: {
    onKeydown(event) {
      if(this.active == false) return;

      let o = document.activeElement;
			let pk = navigator.userAgent.indexOf('Macintosh') > -1 ? event.metaKey : event.ctrlKey;
			let ak = navigator.userAgent.indexOf('Macintosh') > -1  ? event.ctrlKey : event.altKey;
			let sk = event.shiftKey, code = event.keyCode;
			let char = (event.keyCode >=48 && event.keyCode <=122) ? String.fromCharCode(event.keyCode).toUpperCase() : "";
      console.log("char: " + char + ", pk: " + pk + ", code: " + code)
      if(code == 27 && this.editIndex > -1) {
        this.editIndex = -1; 
        this.dirty = false;
      } else if(pk == true && char == "S" && this.editIndex > -1) {
        this.onEdit(this.editRow, this.editIndex)
      } else if(this.$isElectron== true && pk == true && char == "N" && this.editIndex == -1) {
        this.onAdd(this.name)
      } else {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
			event.stopPropagation();
    },
    onAdd(panel){
      if(this.name == panel && this.editIndex == -1) {
        this.rows.push({});
        setTimeout(() => {
          this.editRow = {};
          this.editIndex = this.rows.length - 1;

          setTimeout(() => {
            let arr = document.querySelectorAll("#" + this.name + "-tbl input[type='text']");
            if(arr.length > 0)
              arr[0].focus();
          }, 600);
        }, 300);
      }
    },
    onRowClick(index){
    },
    onRowDoubleClick(row, index) {
      if(this.dirty == true) return;
      this.editIndex = index; 
      this.editRow = Object.assign({}, row); 
      this.dirty = false;
    } ,
    onEdit(row, index){
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
    onRemove(row, index) {
      this.dirty = false;
      this.rows.splice(index, 1);
      this.$emit('on-update', this.rows)
    },
    onChange(){
      this.dirty = true;
    },
  },
  watch: {
    active(value) {
    }
  }, 
}
</script>
<style>

</style>