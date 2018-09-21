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
                <el-input v-model="searchPara" placeholder="输入关键词搜索"></el-input>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="primary" @click="search">{{"搜索"}}</el-button>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="primary" @click="addServer">{{"历史申请"}}</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-table :data="serverList" style="width:100%;margin-top:10px">
            <el-table-column type="index" width="60" align="center"></el-table-column>
            <el-table-column prop="detail" label="概述" width="400" align="center"></el-table-column>
            <el-table-column prop="applicantText" label="申请人" width="200" align="center"></el-table-column>
            <el-table-column prop="requestDate" label="申请日期" width="200" align="center" sortable></el-table-column>
            <el-table-column prop="stateText" label="状态" width="200" align="center" sortable></el-table-column>
            <el-table-column prop="operatorText" label="经办人" align="center" width="200"></el-table-column>
            <el-table-column prop="operatorDate" label="操作日期" align="center" width="200"></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button @click="editServer(scope.$index, scope.row)" type="primary" size="small">处理</el-button>
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
    <el-dialog title="处理申请" :visible.sync="handlerVisible" width="19%" top="15vh" :center="isCenter">
      <el-form :model="requestInfo" label-position="top" label-width="80px">
        <el-form-item label="申请详情">
          <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="requestInfo.detail"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="applyVisible = false">取 消</el-button>
        <el-button type="primary" @click="applySubmit">确 定</el-button>
      </span>
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

        requestInfoList: [],
        handlerVisible: false,

        serverList: [],
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
    watch: {
      searchConsumerInput (curVal, oldVal) {
        this.getConsumerList();
      }
    },
    methods: {
      handleCurrentChange (val) {
        this.page.pageNum = val;
        this.getServerList();
      },
      handleSizeChange (val) {
        this.page.size = val;
        this.getServerList();
      },
      handleSelectionChange(val) {
       this.deleteBatchList = val;
      },
      getServerList() {
        this.$api.get('requestInfo/pageAll?page='+this.page.pageNum+'&size='+this.page.size, null, r => {
          this.serverList = r.data.content;
          this.page.totalRows = r.data.totalElements;
        })
      },
      getConsumerList(){
        this.$api.get('consumer/fuzzy?para='+this.searchConsumerInput, null, r => {
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
        this.server.ownerText = row.name;
        this.server.isAllocated = 1;
        this.allocateVisible = false;
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
      deleteServer: function (index, row) {
        this.$confirm('此操作将永久删除该条信息, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$api.get('server/delete?id=' + row.id, null, r => {
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
