<template>
  <div>
    <Head></Head>
    <el-row>
      <el-col :span="3"><Menu></Menu></el-col>
      <el-col :span="21">
        <div class="container">
          <div style="font-size:20px;margin-left:10px;margin-top:10px">服务器信息</div>
          <div class="toolbar">
            <el-form :inline="true" style="margin-left:10px">
              <el-form-item style="margin-top:7px">
                <el-input v-model="searchPara" placeholder="输入关键词搜索"></el-input>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="primary" @click="search">{{"搜索"}}</el-button>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="primary" @click="addServer">{{"新增"}}</el-button>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="primary" @click="deleteBatch">{{"批量删除"}}</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-table :data="serverList" @selection-change="handleSelectionChange" style="width:100%;margin-top:10px">
            <el-table-column type="selection" width="55" align="center"></el-table-column>
            <el-table-column type="index" width="60" align="center"></el-table-column>
            <el-table-column prop="name" label="名称" width="200" align="center"></el-table-column>
            <el-table-column prop="os" label="系统" width="200" align="center"></el-table-column>
            <el-table-column prop="runningState" label="运行状态" width="200" align="center" sortable></el-table-column>
            <el-table-column prop="isAllocated" label="是否分配" width="200" align="center" sortable></el-table-column>
            <el-table-column prop="owner" label="所有者" align="center" width="200"></el-table-column>
            <el-table-column label="操作" align="center">
              <template scope="scope">
                <el-button @click="editServer(scope.$index, scope.row)" type="primary" size="small">详情</el-button>
                <el-button @click="deleteServer(scope.$index, scope.row)" type="primary" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
    <Foot></Foot>
    <!-- 新增服务器 -->
    <el-dialog :title="title" :visible.sync="editVisible" width="25%" center="true">
      <el-form :model="server" label-position="right" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="server.name" placeholder="服务器名称 \ 代号"></el-input>
        </el-form-item>
        <el-form-item label="搭载系统">
          <el-input v-model="server.os" placeholder="服务器系统"></el-input>
        </el-form-item>
        <el-form-item label="运行状态">
          <el-select v-model="server.runningState" placeholder="请选择">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分配给">
          <el-input placeholder="添加设备所有人" ref="ownerName" v-model="server.owner">
            <el-button slot="append" icon="el-icon-circle-plus" @click="addOwner"></el-button>
            <el-button slot="append" icon="el-icon-remove" @click="deleteOwner"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item label="最近的编辑人" v-show="editShow">
          <el-input v-model="server.modifiedBy" disabled></el-input>
        </el-form-item>
        <el-form-item label="编辑时间" v-show="editShow">
          <el-input v-model="server.modifiedDate" disabled></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 选择添加设备所有人 -->
    <el-dialog title="分配给" :visible.sync="allocateVisible" width="25%" center="true">
      <el-table :data="consumerList" @row-click="rowClick" border>
        <el-table-column type="index" width="60"></el-table-column>
        <el-table-column prop="name" label="用户名" width="100"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import Head from '@/components/layout/Head'
import Menu from '@/components/layout/Menu'
import Foot from '@/components/layout/Foot'

export default {
  components: {
    Head,
    Menu,
    Foot
  },
  data() {
      return {
        serverList: [],
        consumerList: [],
        server: {},
        searchPara: '',
        editVisible: false,
        allocateVisible: false,
        title: '',
        editShow: false,
        options: [{
           value: 0,
           label: '正常'
        }, {
          value: 1,
          label: '异常'
        }],
        deleteBatchList: []
      }
    },
    methods: {
      handleSelectionChange(val) {
       this.deleteBatchList = val;
       console.log(this.deleteBatchList);
      },
      getServerList() {
        this.$api.get('server/list', null, r => {
          this.serverList = r.data;
        })
      },
      getConsumerList(){
        this.$api.get('user/list', null, r => {
          this.consumerList = r.data;
        })
      },
      addServer() {
        this.editVisible = true;
        this.title = '新增设备';
        this.editShow = false;
      },
      editServer: function (index, row) {
        this.editVisible = true;
        this.title = '设备详情';
        this.editShow = true;
        this.server = row;
      },
      addOwner() {
        this.getConsumerList();
        this.allocateVisible = true;
      },
      rowClick(row, event, column) {
        this.server.owner = row.id;
        // this.server.ownerText = row.name;
        this.server.isAllocated = 1;
        this.allocateVisible = false;
      },
      deleteOwner() {
        this.server.owner = null;
        this.server.isAllocated = 0;
        this.$refs.ownerName.value ='';
      },
      editSubmit() {
        this.server.modifiedBy = "1";
        console.log(this.server);
        this.$api.post('server/update', this.server, r => {
          if(r.code === 200){
            this.$message.success('操作成功！');
            this.getServerList();
            this.editVisible = false;
            this.server = {};
          }
        })
      },
      deleteBatch() {
        if(this.deleteBatchList.length <= 0){
          this.$message.warning('请至少选择一台设备！');
        } else{
          this.$confirm('此操作将永久删除此' + this.deleteBatchList.length +'条信息, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.$api.post('server/deleteBatch', this.deleteBatchList, r => {
              if(r.code === 200){
                this.$message.success('删除成功！');
                this.getServerList();
              }
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        }
      },
      search() {
        this.$api.get('server/fuzzy?para=' + this.searchPara, null, r => {
          this.serverList = r.data;
        })
      }
    },
    mounted() {
      this.getServerList();
    }
}
</script>
<style>
.container{
  float: left;
}
.el-table__body{
  width: 100%;
}
</style>
