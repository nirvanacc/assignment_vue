<template>
  <div>
    <Header></Header>
    <el-row>
      <el-col :span="3"><Menu></Menu></el-col>
      <el-col :span="21">
        <div class="container">
          <div class="pageTitle">用户管理</div>
          <div class="toolbar">
            <el-form :inline="true" style="margin-left:10px">
              <el-form-item style="margin-top:7px">
                <el-input placeholder="输入关键词搜索"></el-input>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="primary" @click="search">{{"搜索"}}</el-button>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="warning" @click="addConsumer">{{"新增"}}</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-table class="adminTable" :data="consumerList">
            <el-table-column type="index" width="60" align="center"></el-table-column>
            <el-table-column prop="name" label="用户名" width="200" align="center"></el-table-column>
            <el-table-column prop="phone" label="电话" width="200" align="center"></el-table-column>
            <el-table-column prop="email" label="邮箱" width="200" align="center" sortable></el-table-column>
            <el-table-column prop="serverNum" label="拥有设备数" width="200" align="center" sortable></el-table-column>
            <el-table-column prop="modifiedByText" label="创建人" align="center" width="200"></el-table-column>
            <el-table-column prop="modifiedDate" label="创建时间" align="center" width="200"></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button @click="editConsumer(scope.$index, scope.row)" type="primary" size="small">详情</el-button>
                <el-button @click="deleteConsumer(scope.$index, scope.row)" type="danger" size="small">删除</el-button>
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
    <!-- 编辑服务器信息 -->
    <el-dialog :title="title" :visible.sync="editVisible" width="20%" :center="isCenter">
      <el-form :model="consumer" label-position="right" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="consumer.name" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="consumer.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="consumer.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="拥有设备" v-show="editShow">
          <div class="myServerTag" v-for="item in consumer.serverVOList" :key="item.id" @click="showServer(item)">
            <el-tag @close="handleClose(item)" closable>{{ item.name }}</el-tag>
          </div>
        </el-form-item>
        <el-form-item label="创建人" v-show="editShow">
          <el-input v-model="consumer.modifiedByText" disabled></el-input>
        </el-form-item>
        <el-form-item label="创建时间" v-show="editShow">
          <el-input v-model="consumer.modifiedDate" disabled></el-input>
        </el-form-item>
        <el-button type="danger" @click="resetPsw" size="small" style="float:right">重置密码</el-button>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="设备详情" :visible.sync="serverDetailVisible" width="22%" top="15vh" :center="isCenter">
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
          <el-col :span="12">
            <el-form-item label="所有人：">
              <span>{{ server.ownerText }}</span>
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
        serverDetailVisible: false,
        consumerList: [],
        consumer: {},
        server: {},
        consumerList: [],
        searchPara: '',
        editVisible: false,
        title: '',
        editShow: false,
        isCenter: true
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
        this.getConsumerList();
      },
      handleSizeChange (val) {
        this.page.size = val;
        this.getConsumerList();
      },
      getConsumerList(){
        this.$api.get('consumer/pageAll?page='+this.page.pageNum+'&size='+this.page.size, null, r => {
          this.consumerList = r.data.content;
          this.page.totalRows = r.data.totalElements;
        })
      },
      addConsumer() {
        this.consumer = {};
        this.editShow = false;
        this.editVisible = true;
        this.title = '新增用户';
      },
      editConsumer: function (index, row) {
        this.title = '用户详情';
        this.consumer = row;
        this.editShow = true;
        this.editVisible = true;
      },
      showServer(item) {
        this.server = item;
        this.serverDetailVisible = true;
      },
      handleClose(item) {
        this.$confirm('确定收回该设备吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          item.isAllocated = 0;
          item.owner = undefined;
          item.modifiedBy = JSON.parse(sessionStorage.obj).id;
          this.$api.post('server/update', item, r => {
            if(r.code === 200){
              this.$message.success('操作成功！');
              this.getConsumerList();
            }
          })
        }).catch(() => {
          this.$message.info("已取消删除");
        });
      },
      resetPsw() {
        this.$confirm('确定重置该用户密码吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.consumer.password = '123';
          this.consumer.modifiedBy = JSON.parse(sessionStorage.obj).id;
          this.$api.post('consumer/update', this.consumer, r => {
            if(r.code === 200){
              this.$message.success('重置成功！');
              this.getConsumerList();
            }
          })
        }).catch(() => {
          this.$message.info("已取消");
        });
      },
      editSubmit() {
        this.$confirm('确定提交这些更改吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.consumer.modifiedBy = JSON.parse(sessionStorage.obj).id;
          this.$api.post('consumer/update', this.consumer, r => {
            if(r.code === 200){
              this.$message.success('更新成功！');
              this.getConsumerList();
              this.editVisible = false;
            }
          })
        }).catch(() => {
          this.$message.info("已取消");
        });
      },
      deleteConsumer: function (index, row) {
        this.$confirm('此操作将永久删除该用户信息,并收回其名下所有设备， 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          console.log(row);
          for(let x in row.serverVOList){
            let item = row.serverVOList[x];
            item.isAllocated = 0;
            item.owner = undefined;
            item.modifiedBy = JSON.parse(sessionStorage.obj).id;
            this.$api.post('server/update', item, r => {
              if(r.code === 200){
                console.log('置空一个设备');
              }
            })
          }
          console.log('名下设备已全部置空');
          this.$api.get('consumer/delete?id=' + row.id, null, r => {
            if(r.code === 200){
              this.$message.success('删除成功！');
              this.getConsumerList();
            }
          })
        }).catch(() => {
          this.$message.info('已取消删除');
        });
      }
    },
    mounted() {
      this.getConsumerList();
    }
}
</script>
<style>
.myServerTag{
  float: left;
  margin-left: 3px;
  cursor: pointer;
}
</style>
