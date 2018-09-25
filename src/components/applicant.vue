<template>
  <div>
    <Header></Header>
    <el-row>
      <el-col :span="3"><Menu></Menu></el-col>
      <el-col :span="21">
        <div class="container">
          <div style="font-size:20px;margin-left:10px;margin-top:10px">申请管理</div>
          <div class="toolbar">
            <el-form :inline="true" style="margin-left:10px">
              <el-form-item style="margin-top:7px">
                <el-input placeholder="输入关键词搜索"></el-input>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="primary">{{"搜索"}}</el-button>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="primary">{{"历史申请"}}</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-table :data="requestList" style="width:100%;margin-top:10px">
            <el-table-column type="index" width="60" align="center"></el-table-column>
            <el-table-column prop="detail" label="概述" width="400" align="center"></el-table-column>
            <el-table-column prop="applicantText" label="申请人" width="200" align="center"></el-table-column>
            <el-table-column prop="requestDate" label="申请日期" width="200" align="center" sortable></el-table-column>
            <el-table-column prop="stateText" label="状态" width="200" align="center" sortable></el-table-column>
            <el-table-column prop="operatorText" label="经办人" align="center" width="200"></el-table-column>
            <el-table-column prop="operateDate" label="操作日期" align="center" width="200"></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button type="primary" @click="handleRequest(scope.$index, scope.row)" size="small">处理</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination layout="total, sizes, prev, pager, next"
            @current-change="handleCurrentChange" @size-change="handleSizeChange"
            :current-page="currentPage" :page-sizes="pageSizes" :page-size="page.size" :total="page.totalRows"
            style="float:right;margin-top:3px">
          </el-pagination>
        </div>
      </el-col>
    </el-row>
    <Footer></Footer>
    <el-dialog title="处理申请" :visible.sync="handleVisible" width="19%" top="15vh" :center="isCenter">
      <el-form :model="request" label-position="top" label-width="80px">
        <el-form-item label="申请人">
          <el-input v-model="request.applicantText"></el-input>
        </el-form-item>
        <el-form-item label="申请详情">
          <el-input type="textarea" :rows="2" v-model="request.detail"></el-input>
        </el-form-item>
        <el-form-item label="已添加设备">
          <el-input v-model="pickedServersInput">
            <el-button slot="append" icon="el-icon-circle-plus" @click="addServer"></el-button>
            <el-button slot="append" icon="el-icon-remove" @click="deleteServer"></el-button>
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleVisible = false">取 消</el-button>
        <el-button type="primary" @click="rejectRequest">拒 绝</el-button>
        <el-button type="primary" @click="submitHandle">确 定</el-button>
      </span>
      <el-dialog title="可分配设备" :visible.sync="usableVisible" append-to-body width="30%" :center="isCenter">
        <el-table :data="usableServers" @selection-change="handleSelectionChange" style="width:516px">
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column type="index" width="60" align="center"></el-table-column>
          <el-table-column prop="name" label="设备名称" width="100" align="center"></el-table-column>
          <el-table-column prop="os" label="系统" width="150" align="center"></el-table-column>
          <el-table-column prop="runningStateText" label="运行状态" width="150" align="center"></el-table-column>
        </el-table>
        <span slot="footer" class="dialog-footer">
          <el-button @click="usableVisible = false">取 消</el-button>
          <el-button type="primary" @click="fillInput">确 定</el-button>
        </span>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import Header from '@/components/layout/Head'
import Menu from '@/components/layout/Menu'
import Footer from '@/components/layout/Foot'

export default {
  components: {
    Header,
    Menu,
    Footer
  },
  data() {
      return {
        page: {
          pageNum: 1,
          size: 10,
          totalRows: 0
        },
        pageSizes: [5, 10],
        isCenter: true,

        handleVisible: false,
        usableVisible: false,

        requestList: [],
        request: {},
        usableServers: [],
        pickedServers: [],
        pickedServersInput: '',
        message: {},



        consumerList: [],
        server: {
          runningState: 0
        },
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
        deleteBatchList: [],
        searchConsumerInput: ''
      }
    },
    // 分页的计算属性
    computed: {
      currentPage: function() {
        return this.page.pageNum;
      }
    },
    methods: {
      handleCurrentChange (val) {
        this.page.pageNum = val;
        this.getRequestList();
      },
      handleSizeChange (val) {
        this.page.size = val;
        this.getRequestList();
      },
      handleSelectionChange(val) {
       this.pickedServers = val;
      },
      getRequestList() {
        this.$api.get('requestInfo/pageAll?page='+this.page.pageNum+'&size='+this.page.size, null, r => {
          this.requestList = r.data.content;
          this.page.totalRows = r.data.totalElements;
        })
      },
      getUsableServers() {
        this.$api.get('server/usable', null, r => {
          this.usableServers = r.data;
        })
      },
      handleRequest: function (index, row) {
        this.request = row;
        this.handleVisible = true;
        console.log(row);
      },
      fillInput() {
        for(let x in this.pickedServers) {
          this.pickedServers[x].owner = this.request.applicant;
          this.pickedServersInput = this.pickedServersInput + this.pickedServers[x].name + '(' + this.pickedServers[x].os + ');';
        }
        this.usableVisible = false;
      },
      rejectRequest() {
        this.request.state = 1;
        this.request.operator = JSON.parse(sessionStorage.obj).id;
        this.$api.post('requestInfo/update', this.request, r => {
          this.handleVisible = false;
          this.$message.success('申请已驳回！');
          this.getRequestList();
        })
        // 发送驳回消息
        this.message.receiver = this.request.applicant;
        this.message.text = '申请失败。您的“' + this.request.detail +'”已被驳回！';
        this.message.poster = JSON.parse(sessionStorage.obj).id;
        this.$api.post('message/update', this.message, r => {})
      },
      submitHandle() {
        this.$api.post('server/addOwner', this.pickedServers, r => {})
        this.request.state = 2;
        this.request.operator = JSON.parse(sessionStorage.obj).id;
        this.$api.post('requestInfo/update', this.request, r => {
          this.handleVisible = false;
          this.$message.success('申请已批准！');
          this.getRequestList();
        })
        // 发送批准消息
        this.message.receiver = this.request.applicant;
        this.message.text = '申请成功。您的“' + this.request.detail +'”已批准！';
        this.message.poster = JSON.parse(sessionStorage.obj).id;
        this.$api.post('message/update', this.message, r => {})
      },
      addServer() {
        this.getUsableServers();
        this.usableVisible = true;
      },
      deleteServer() {
        this.pickedServersInput = '';
        this.pickedServers = [];
      },
      editServer: function (index, row) {
        this.editVisible = true;
        this.title = '设备详情';
        this.editShow = true;
        this.server = row;
      },
      deleteOwner() {
        this.server.owner = null;
        this.server.ownerText = null;
        this.server.isAllocated = 0;
        this.$refs.ownerName.value ='';
      },
      editSubmit() {
        if(this.server.isAllocated === undefined){
          this.server.isAllocated = 0;
        }
        this.server.modifiedBy = JSON.parse(sessionStorage.obj).id;
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
          this.requestList = r.data;
        })
      }
    },
    mounted() {
      this.getRequestList();
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
