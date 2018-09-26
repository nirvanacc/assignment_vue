<template>
  <div>
    <Header></Header>
      <div class="contentBg">
        <div class="content">
          <div class="toolbar" style="margin-top:18px;width:100%">
            <el-form :inline="true" style="margin-left:10px">
              <el-form-item style="margin-top:7px">
                <el-input placeholder="输入关键词搜索"></el-input>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="primary">{{"搜索"}}</el-button>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="warning" @click="applyVisible = true">{{"申请设备"}}</el-button>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="danger" @click="returnServerBatch">{{"归还设备"}}</el-button>
              </el-form-item>
              <el-badge :value="messageNum" style="float:right;margin-right:24px;margin-top:18px;">
                <div class="message" @click="showMyMessage"></div>
              </el-badge>
            </el-form>
          </div>
          <el-table :data="serverList" @selection-change="handleSelectionChange" style="width:100%;margin-top:18px">
            <el-table-column type="selection" width="55" align="center"></el-table-column>
            <el-table-column type="index" width="60" align="center"></el-table-column>
            <el-table-column prop="name" label="名称" width="200" align="center"></el-table-column>
            <el-table-column prop="os" label="系统" width="200" align="center"></el-table-column>
            <el-table-column prop="runningStateText" label="运行状态" width="200" align="center" sortable></el-table-column>
            <el-table-column prop="modifiedDate" label="分配于" width="200" align="center" sortable></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button @click="showDetail(scope.$index, scope.row)" type="primary" size="small">详情</el-button>
                <el-button @click="returnServer(scope.$index, scope.row)" type="danger" size="small">归还</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination layout="total, sizes, prev, pager, next"
            @current-change="handleCurrentChange" @size-change="handleSizeChange"
            :current-page="currentPage" :page-sizes="pageSizes" :page-size="page.size" :total="page.totalRows"
            style="float:right;margin-top:10px">
          </el-pagination>
        </div>
      </div>
    <Footer></Footer>
    <el-dialog title="申请设备" :visible.sync="applyVisible" width="19%" top="15vh" :center="isCenter">
      <el-form :model="requestInfo" :rules="rules" ref="requestForm" label-position="top" label-width="80px">
        <el-form-item label="申请详情" prop="detail">
          <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="requestInfo.detail"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancle">取 消</el-button>
        <el-button type="primary" @click="applySubmit">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="设备详情" :visible.sync="detailVisible" width="22%" top="15vh" :center="isCenter">
      <el-form :model="server" label-position="right" label-width="110px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="名称：">
              <span>{{ server.name }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="搭载系统：">
              <span>{{ server.os }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="运行状态：">
              <span>{{ server.runningStateText }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="最近的编辑人：">
              <span>{{ server.modifiedByText }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="编辑时间：">
              <span>{{ server.modifiedDate }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
    <el-dialog title="我的消息" :visible.sync="messageVisible" width="40%" top="15vh" :center="isCenter">
      <el-table :data="messageList" :show-header="showHeader">
        <el-table-column type="index" width="35" align="center"></el-table-column>
        <el-table-column prop="text" label="内容" width="400" align="center"></el-table-column>
        <el-table-column prop="postDate" label="时间" width="150" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button @click="deleteMessage(scope.$index, scope.row)" type="primary" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import Header from '@/components/layout/Head'
import Footer from '@/components/layout/Foot'

export default {
  components: {
    Header,
    Footer
  },
  data () {
    return {
      page: {
        pageNum: 1,
        size: 10,
        totalRows: 0
      },
      pageSizes: [5, 10],
      isCenter: true,
      showHeader: false,
      applyVisible: false,
      detailVisible: false,
      messageVisible: false,
      consumerId: '',
      requestInfo: {},
      messageNum: 0,
      messageList: [],
      serverList: [],
      server: {},
      returnBatchList: [],
      rules: {
        detail: [
          { required: true, message: '请输入申请详情', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    currentPage: function() {
      return this.page.pageNum;
    }
  },
  methods: {
    handleCurrentChange (val) {
      this.page.pageNum = val;
      this.getMyServerList();
    },
    handleSizeChange (val) {
      this.page.size = val;
      this.getMyServerList();
    },
    handleSelectionChange(val) {
      this.returnBatchList = val;
    },
    getMyServerList() {
      this.$api.get('server/pageByConsumer?id='+this.consumerId+'&page='+this.page.pageNum+'&size='+this.page.size, null, r => {
        this.serverList = r.data.content;
        this.page.totalRows = r.data.totalElements;
      })
    },
    getMyMessage() {
      this.$api.get('message/getByConsumer?id='+this.consumerId, null, r => {
        if(r.data.length>0){
          this.messageNum = r.data.length;
          this.messageList = r.data;
        }
      })
    },
    deleteMessage: function (index, row) {
      this.$confirm('确定删除该消息吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$api.get('message/delete?id=' + row.id, null, r => {
          if(r.code === 200){
            this.$message.success('删除成功！');
            this.getMyMessage();
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    showMyMessage() {
      this.messageVisible = true;
    },
    returnServer: function (index, row) {
      this.$confirm('确定归还该设备吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$api.post('server/return', row, r => {
          if(r.code === 200){
            this.$message.success('归还成功！');
            this.getMyServerList();
          }
        })
      }).catch(() => {
        this.$message.info('已取消');
      });
    },
    returnServerBatch() {
      if(this.returnBatchList.length <= 0){
        this.$message.warning('请至少选择一台设备！');
      } else{
        this.$confirm('您确定要归还此' + this.returnBatchList.length +'台设备吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$api.post('server/returnBatch', this.returnBatchList, r => {
            if(r.code === 200){
              this.$message.success('归还成功！');
              this.getMyServerList();
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
      }
    },
    cancle() {
      this.applyVisible = false;
      this.requestInfo.detail = '';
    },
    applySubmit() {
      this.$refs.requestForm.validate((valid) => {
        if (valid) {
          this.$confirm('确定提交该申请码?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.requestInfo.applicant = this.consumerId;
            this.$api.post('requestInfo/add', this.requestInfo, r => {
              if(r.code === 200){
                this.$message.success('申请成功！');
                this.applyVisible=false;
                this.requestInfo.detail = '';
              }
            })
          }).catch(() => {
            this.$message.info('已取消申请');
            this.applyVisible=false;
            this.requestInfo.detail = '';
          });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },


    showDetail: function (index, row) {
      console.log(row);
      this.server = row;
      this.detailVisible = true;

    },
    deleteServer: function (index, row) {

    }
  },
  mounted() {
    this.consumerId = JSON.parse(sessionStorage.obj).id;
    this.getMyServerList();
    this.getMyMessage();
  }
}
</script>

<style scoped>
.contentBg {
  background-image:url("../assets/loginbg.jpg");
  background-size: 100% 100%;
  width: 100%;
  height: 773px;
}
.content {
  overflow: hidden;
  margin: 0 auto;
  width: 63%;
  height: 773px;
}
.message{
  background-image:url("../assets/message.png");
  background-size: 100% 100%;
  width: 35px;
  height: 35px;
}
</style>
