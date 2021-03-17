<template>
  <Table border :columns="columns2" :data="datas" @on-row-click="onRowProjectClick" :height="height - 10" style="margin: 2px;">
    <template v-for="(item) in columns" :slot="item.key"
      slot-scope="{row, index}"
    >
      {{row[item.key]}}
    </template>

    <template slot-scope="{ row, index }" slot="action" class="action">
      <Button type="primary" size="small" style="margin-right: 5px" @click="onEdit(index, row)">編輯</Button>
      <Button type="error" size="small" @click="onRemove(index, row)">刪除</Button>
    </template>
  </Table>
      
</template>
<script>

export default {
  name: 'TableConfig',
  props: ["columns", "datas", "height"],
  data () {
    return {
      dirty: false,
      columns2: this.columns.concat([{
          title: '操作',
          key: 'action',
          width: 140,
          slot: 'action',
      }])
    }
  },
  async mounted() {
    // console.log(this.datas)
  },
  methods: {
    onRowProjectClick(index){
    }, 
    onEdit(){
    },
    onRemove() {
    }, 
    onDiable(index, type){
      console.log(type + ": " + index)
    }
  },
  watch: {
    visible(value){
      if(value == true) {
        setTimeout(() => {
          this.onResize();  
        }, 600);
      } else {
        this.height = 0;
      }
    },
    config(value) {
      if(typeof value == "undefined") {
        this.editor.setValue("");
      } else {
        this.dataProject = value.projects;
        this.dataDatabase = value.database[0].children;
        this.dataSys = [];
        value.tables.SYS.forEach(item=>{
          if(typeof item == "string")
            this.dataSys.push({tbl: item})
          else 
            this.dataSys.push(item);
        })
        this.readConfig(value)
        // let json = recursion(this.config);
        // this.editor.setValue(JSON.stringify(json, null, "\t"))
      }

      function recursion(json){
        let obj = {};
        for(let key in json) {
          if("nodeKey,expand,selected".indexOf(key) > -1)
            continue;
          else if(key == "tables" || key == "projects" || key == "sql_var" || typeof json[key] == "string" || typeof json[key] == "number" || typeof json[key] == "boolean") {
            obj[key] = json[key];
          } else if(Array.isArray(json[key])) {
            let arr = [];
            for(let i = 0; i < json[key].length; i++){
              let obj2 = recursion(json[key][i]);
              arr.push(obj2);
            }
            obj[key] = arr;
          } else if(typeof json[key] == "object"){
            obj[key] = recursion(json[key])
          }
        }
        return obj;
      }
    }
  }, 
}
</script>
<style>

</style>