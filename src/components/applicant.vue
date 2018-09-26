<template>
  <div>
    <Header></Header>
    <el-row>
      <el-col :span="3"><Menu></Menu></el-col>
      <el-col :span="21">
        <div class="container">
          <div class="pageTitle">申请管理</div>
          <div class="toolbar">
            <el-form :inline="true" style="margin-left:10px">
              <el-form-item style="margin-top:7px">
                <el-input placeholder="输入关键词搜索"></el-input>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="primary" @click="search">{{"搜索"}}</el-button>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="warning" @click="getHis">{{"历史申请"}}</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-table class="adminTable" :data="requestList">
            <el-table-column type="index" width="60" align="center"></el-table-column>
            <el-table-column prop="detail" label="概述" width="400" align="center"></el-table-column>
            <el-table-column prop="applicantText" label="申请人" width="200" align="center"></el-table-column>
            <el-table-column prop="requestDate" label="申请日期" width="200" align="center" sortable></el-table-column>
            <el-table-column prop="stateText" label="状态" width="200" align="center" sortable></el-table-column>
            <el-table-column prop="operatorText" label="经办人" align="center" width="200"></el-table-column>
            <el-table-column prop="operateDate" label="操作日期" align="center" width="200"></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button type="primary" @click="handleRequest(scope.$index, scope.row)" size="small" v-show="unsolved">处理</el-button>
                <el-button type="danger" @click="deleteRequest(scope.$index, scope.row)" size="small" v-show="hisRequest">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination class="pageBar"
            layout="total, sizes, prev, pager, next"
            @current-change="handleCurrentChange" @size-change="handleSizeChange"
            :current-page="currentPage" :page-sizes="pageSizes" :page-size="page.size" :total="page.totalRows">
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
        unsolved: true,
        hisRequest: false,
        handleVisible: false,
        usableVisible: false,
        requestList: [],
        request: {},
        usableServers: [],
        pickedServers: [],
        pickedServersInput: '',
        message: {}
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
        this.$api.get('requestInfo/pageUnsloved?page='+this.page.pageNum+'&size='+this.page.size, null, r => {
          this.requestList = r.data.content;
          this.page.totalRows = r.data.totalElements;
        })
      },
      search() {
        this.unsolved = true;
        this.hisRequest = false;
        this.getRequestList();
      },
      getHis() {
        this.unsolved = false;
        this.hisRequest = true;
        this.$api.get('requestInfo/pageHis?page='+this.page.pageNum+'&size='+this.page.size, null, r => {
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
      deleteRequest: function (index, row) {
        this.$confirm('确定删除该申请吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$api.get('requestInfo/delete?id='+row.id, null, r => {
            this.$api.get('requestInfo/pageHis?page='+this.page.pageNum+'&size='+this.page.size, null, r => {
              this.requestList = r.data.content;
              this.page.totalRows = r.data.totalElements;
            })
          })
        }).catch(() => {
          this.$message.info('已取消');
        });
      },
      fillInput() {
        for(let x in this.pickedServers) {
          this.pickedServers[x].owner = this.request.applicant;
          this.pickedServers[x].modifiedBy = JSON.parse(sessionStorage.obj).id;
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
      }
    },
    mounted() {
      this.getRequestList();
    }
}
</script>
<style>

</style>
