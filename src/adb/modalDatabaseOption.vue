<template>
  <modal id='modalDatatbaseOption' v-model="visible" title="資料庫複製" class-name="vertical-center-modal" 
    @on-visible-change="onVisibleChange" :closable="false"
  >
    <div>
      <div style="margin: 10px 0px;">
        <RadioGroup v-model="mode" type="button">
          <Radio label="複製"></Radio>
          <Radio label="刪除"></Radio>
        </RadioGroup>
      </div>
      <div style="margin: 10px 0px;" v-if="mode == '複製'">
        <CheckboxGroup v-model="tables">
          <Checkbox label="系統資料表" border disabled></Checkbox>
          <Checkbox label="基本資料表" border disabled></Checkbox>
          <Checkbox label="交易資料表" border></Checkbox>
          <Checkbox label="自訂資料表" border></Checkbox>
        </CheckboxGroup>
      </div>
      <div style="margin: 10px 0px; display: flex; flex-direction: row; justify-content: start; align-items: center;">
        <div v-if="mode == '複製'">Source：</div>
        <Select v-model="source" v-if="mode == '複製'">
          <Option v-for="(item) in database" :key="item.title" :value="item.title">
            {{item.title}}
          </Option>
        </Select> 
        <div style="margin-left: 5px;">Target：</div>
        <Select v-model="target">
          <Option v-for="(item) in database" :key="item.title" :value="item.title" v-if="item.security == false && item.title != source">
            {{item.title}}
          </Option>
        </Select>
      </div>
      <div v-for="(item, index) in sql_var" :key="item.title">
        <div class="row" v-if="mode == '複製' || (mode == '刪除' && index == 0)">
          {{item.title + "："}}
          <Input v-model="item.value" size="large" clearable/>
        </div>        
      </div>

    </div>
    <div slot="footer" >
      <i-button type="error" @click="$emit('on-close')">取消</i-button>
      <i-button type="primary" @click="onOK">確定</i-button>
    </div>
  </modal>
</template>
<script>

export default {
  name: 'ModalDatabaseOption',
  props: ["visible", "config"],
  data () {
    return {
      mode: "複製",
      tables: ["系統資料表", "基本資料表"],
      database: [],
      sql_var: [],
      target: "", 
      source: ""
    }
  },
  async mounted() {
    let x = localStorage["adb-database-option"];
    if(typeof x == "string" && x.length > 0) {
      x = JSON.parse(x);
      for(let key in x) {
        this[key] = x[key];
      }
    }
  },
  methods: {
    onOK(){
      let data = {mode: this.mode, tables: this.tables, 
        sql_var: this.sql_var, target: this.target, source: this.source};
      if(this.mode == "複製" && this.source.length == 0){
        alert("請選擇 Source")
      } else if(this.target.length == 0){
        alert("請選擇 Target")
      } else if(this.sql_var[0].value.length == 0){
        alert("請輸入 SITE")
      } else {
        localStorage["adb-database-option"] = JSON.stringify(data)
        data.source_config = this.database.filter((item) => {
          return item.title == this.source;
        })[0]
        data.target_config = this.database.filter((item) => {
          return item.title == this.target;
        })[0]
        this.$emit("on-close", data);
      }
    },
    onVisibleChange(v) {
      if (v === false) {
        this.$emit("on-close");
      } else {
        let x = localStorage["adb-config"];
        if(typeof x == "string" && x.length > 0) {
          let config = JSON.parse(x);
          let d1 = config.database.filter((item)=>{
            return typeof item.children == "object"
          })
          if(d1.length > 0) {
            let cols = ["host", "user", "password", "database", "sys_database"];
            let d2 = d1[0].children.filter((item)=>{
              if(item.role == "database") {
                for(let i = 0; i < cols.length; i++) {
                  if(typeof item[cols[i]] == "undefined" || item[cols[i]].length == 0)
                    return false;
                }
                return true;
              } else {
                return false;
              }
            })
            d2.forEach(item => {
              item.security = (item.host.trim().toLowerCase().indexOf("myjabezpos") > -1 
                && (item.database.trim().toLowerCase().indexOf("jp_") == 0 
                  || item.sys_database.trim().toLowerCase().indexOf("jp_") == 0) ) 
                ? true : false;
            }); 
            this.database = d2;
            if(d2.length == 0) {
             alert("請先設定資料庫") 
            }
          }
        }
      }
    },
  },
  watch: {
    visible(value){
    },
    source(value) {
      if(value.length > 0 && this.target == value)
        this.target = "";
    },
    config(value) {
      if(typeof value == "object") {
        let x = localStorage["adb-database-option"];
        if(typeof x == "string" && x.length > 0) {
          x = JSON.parse(x).sql_var;
        } else {
          x = [];
        }
        
        this.sql_var = [{title: "SITE", value: ""}];
        if(Array.isArray(value.sql_var)) {
          value.sql_var.forEach(item=>{
            this.sql_var.push({title: item, value: ""})
          })

          this.sql_var.forEach(item=>{
            let y = x.find(element => element.title == item.title)
            if(typeof y != "undefined") {
              if(y.value.trim().length > 0) {
                item.value = y.value.trim();
              }
            }
          })
        }
      }
    }
  },
}
</script>
<style>
#modalDatatbaseOption .ivu-checkbox-wrapper  {
  /* border: 1px solid #2d8cf0; */
  padding: 5px;
}

#modalDatatbaseOption .row  {
  margin-top: 10px;
  display: flex; flex-direction: row; 
  justify-content: start; 
  align-items: center;
}

</style>