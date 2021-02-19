<template>
  <div>
    <div id="script" style="height: 100%; display: flex; flex-direction: column">
      <div id="list" style="flex: 1; padding: 5px; overflow-y: auto;">
        <draggable  :list="list" :disabled="!enabled" class="list-group"
          ghost-class="ghost" @start="dragging = true" @end="dragging = false"
          @update="datadragEnd"
        >
          <div v-for="(el, index) in list" :key="index" class="list-group-item2">
            <div v-if="typeof el.title == 'string'" class="list-group-item"
              :class="{ active: index === cursor }"
              style="cursor: pointer"
            >
              <div @click="onClickSerial(index)" style="width: 30px">
                {{ index + 1 + " " }}
              </div>
              <div style="flex: 1; margin: 0 3px" @click="onEdit(index)">
                <div style="font-size: 16px; text-align: left">
                  {{ el.title }}
                </div>
                <div style="text-align: left; font-size: 12px;">
                  {{ "暫停：" + el.second + " 秒" }}
                </div>
                <div></div>
              </div>
              <div @click="onClickIcon(index)" style="padding: 3px 5px">
                <Icon type="md-trash" size="20" />
              </div>
            </div>
            <div v-else class="list-group-item" style="color: rgb(255,69,0);" >
              <div style="width: 30px;">
                {{ index + 1 + " " }}
              </div>
              <div style="flex: 1; margin: 0 3px">
                <div style="font-size: 16px; text-align: left">
                  {{ el.name }}
                </div>
              </div>
              <div @click="onClickIcon(index)" style="padding: 3px 5px; cursor: pointer">
                <Icon type="md-trash" size="20" />
              </div>
            </div>
          </div>
        </draggable>
      </div>
      <div class="footer">
        <div>
          <Button type="success" @click="add()">新增</Button>
          <Button type="success"  @click="$emit('on-open-mondal')">插入</Button>
          <Button type="error" v-if="list.length > 0" @click="clearAll">清除</Button>
        </div>
      </div>
    </div>
    <modal v-model="visibleData" class-name="vertical-center-modal"
      :title="title" :width="300" :closable="false"
    >
      <table style="width: 100%" class="layout">
        <tr>
          <td class="label">標題：</td>
          <td><Input v-model="row.title" placeholder="標題" /></td>
        </tr>
        <tr>
          <td class="label">X 軸：</td>
          <td>
            <Input v-model="row.x" placeholder="X 軸" />
          </td>
        </tr>
        <tr>
          <td class="label">Y 軸：</td>
          <td>
            <Input v-model="row.y" placeholder="Y 軸" />
          </td>
        </tr>
        <tr>
          <td class="label">暫停：</td>
          <td><Input v-model="row.second" placeholder="暫停(秒)" /></td>
        </tr>
      </table>
      <div slot="footer">
        <i-button type="error" @click="visibleData = false">取消</i-button>
        <i-button type="primary" @click="onOK">確定</i-button>
      </div>
    </modal>
  </div>
</template>

<script>
import draggable from "vuedraggable";

export default {
  name: "Script",
  components: {
    draggable
  },
  props: ["editItem"],
  data() {
    return {
      title: "",
      visibleData: false,
      row: {},
      list: [],
      enabled: true,
      dragging: false,
      cursor: -1,
    };
  },
  mounted() {
    this.retrieve(this.editItem)
  },
  methods: {
    retrieve(key){
      let scripts = localStorage["monkeyScript-" + key];
      if (typeof scripts === "string" && scripts.length > 0) {
        this.list = JSON.parse(scripts);
      } else {
        this.list = [];
      }
      this.$emit('on-row-change', this.list);
    },
    onEdit(index) {
      this.cursor = index;
      this.row = Object.assign({}, this.list[index]);
      this.title = "編輯";
      this.visibleData = true;
      this.$emit("on-cursor-change", this.row, index);
    },
    onClickSerial(index) {
      this.cursor = index;
      this.$emit("on-cursor-change", this.list[index], index);
    },
    onOK() {
      for(let key in this.row) {
        if(key == "x" || key == "y" || key == "second") {
          if(typeof this.row[key] == "string" && this.row[key].trim().length == 0) {
            this.row[key] = this.row[key].trim();
          } else if(typeof this.row[key] != "undefined" && (this.row[key] + "").length > 0 && isNaN(this.row[key])) {
            alert("請輸入數字")
            return;
          }
        }
      }
      this.visibleData = false;
      let row = Object.assign({}, this.row);
      if (typeof row.id === "undefined") {
        row.id = new Date().getTime();
        this.list.push(row);
        if (typeof row.title === "undefined" || row.title.length === 0) {
          let i = 1;
          this.list.forEach((el) => {
            if (
              typeof el.title === "string" &&
              el.title.indexOf("untitle") === 0
            ) {
              let s = el.title.replace("untitle", "");
              if (!isNaN(s) && parseInt(s, 10) >= i) {
                i = parseInt(s, 10) + 1;
              }
            }
          });
          row.title = "untitle" + i;
        }
        this.cursor = this.list.length - 1;
        this.$emit("on-cursor-change", row, this.cursor);
      } else {
        this.list[this.cursor] = row;
        this.$emit("on-cursor-change", row);
      }
      this.save();
      this.$emit("on-row-change", this.list);
      this.row = {};
    },
    add(x, y) {
      this.row = {x, y, second: 1};
      this.title = "新增";
      this.visibleData = true;
    },
    onClickIcon(index) {
      this.list.splice(index, 1);
      this.save();
      this.$emit("on-row-change", this.list);
      this.$emit("on-cursor-change", null, -1);
      this.cursor = -1;
    },
    datadragEnd(e) {
      this.save();
    },
    update(row){
      row = Object.assign({}, row);
      // console.log(row)
      for(let key in row) {
        if(key.indexOf("_") == 0) {
          delete row[key];
        }
      }
      for(let i = 0; i < this.list.length; i++) {
        if(this.list[i].id == row.id) {
          this.$set(list, i, row)
          this.list[i] = row;
          break;
        }
      }
      // console.log(this.list)
      this.save();
    },
    clearAll(){
      this.$emit("on-cursor-change", null);
      this.list = [];
      this.save();
    },
    insert(data){
      if(Array.isArray(data)) {
        this.list = this.list.concat(data)
      } else {
        this.list.push(data)
      }
      this.save()
      this.$emit("on-row-change", this.list);
    },
    save() {
      if(this.list.length == 0)
        delete localStorage["monkeyScript-" + this.editItem];
      else
        localStorage["monkeyScript-" + this.editItem] = JSON.stringify(this.list);
    }, 
    reset(){
      this.cursor = -1;
    }
  },
  watch: {
    editItem(value) {
      // console.log(value)
      this.retrieve(value)
    }
  },
};
</script>
<style>
#script {
  width: 300px;
  height: 100%;
  border: 1px solid #e6e6e6;
  border-width: 0px 1px;
}
.layout .label {
  text-align: right;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-group-item {
  border: 1px solid #eee;
  height: 50px;
  margin: 0px 5px;
  display: flex;
  flex-direction: row;
  align-items: center;

}
.list-group-item.active {
  background-color: #e0ecff;
  color: #0e2d5f;
  border: 1px solid #95b8e7;
}

.list-group-item2 + .list-group-item2 {
  margin-top: 2px;
}
.ivu-icon-md-close:before {
  content: "X";
  box-sizing: border-box;
  font-size: 14px;
  display: block;
  width: 22px;
  height: 14px;
  padding-top: 2px;
  /* position: absolute;
  left: 0px;
  bottom: 5px; */
}
</style>
