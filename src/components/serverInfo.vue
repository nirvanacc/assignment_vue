<template>
  <div>
    <Header></Header>
    <el-row>
      <el-col :span="3"><Menu></Menu></el-col>
      <el-col :span="21">
        <div class="container">
          <div class="pageTitle">设备管理</div>
          <div class="toolbar">
            <el-form :inline="true" style="margin-left:10px">
              <el-form-item style="margin-top:7px">
                <el-input v-model="searchPara" placeholder="输入关键词搜索"></el-input>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="primary" @click="search">{{"搜索"}}</el-button>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="warning" @click="addServer">{{"新增"}}</el-button>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="danger" @click="deleteBatch">{{"批量删除"}}</el-button>
              </el-form-item>
            </el-form>
          </div>
          <!-- 服务器列表 -->
          <el-table class="adminTable" :data="serverList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"></el-table-column>
            <el-table-column type="index" width="60" align="center"></el-table-column>
            <el-table-column prop="name" label="名称" width="200" align="center"></el-table-column>
            <el-table-column prop="os" label="系统" width="200" align="center"></el-table-column>
            <el-table-column prop="runningStateText" label="运行状态" width="200" align="center" sortable></el-table-column>
            <el-table-column prop="isAllocatedText" label="是否分配" width="200" align="center" sortable></el-table-column>
            <el-table-column prop="ownerText" label="所有者" align="center" width="200"></el-table-column>
            <el-table-column prop="modifiedDate" label="上次编辑于" align="center" width="200"></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button @click="editServer(scope.$index, scope.row)" type="primary" size="small">详情</el-button>
                <el-button @click="deleteServer(scope.$index, scope.row)" type="danger" size="small">删除</el-button>
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
    <el-dialog :title="title" :visible.sync="editVisible" width="19%" :center="isCenter">
      <el-form :model="server" :rules="rules" ref="editForm" label-position="right" label-width="96px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="server.name" placeholder="服务器名称 \ 代号"></el-input>
        </el-form-item>
        <el-form-item label="搭载系统" prop="os">
          <el-input v-model="server.os" placeholder="服务器系统"></el-input>
        </el-form-item>
        <el-form-item label="运行状态">
          <el-select v-model="server.runningState" placeholder="请选择">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分配给">
          <el-input placeholder="添加设备所有人" v-model="server.ownerText">
            <el-button slot="append" icon="el-icon-circle-plus" @click="addOwner"></el-button>
            <el-button slot="append" icon="el-icon-remove" @click="deleteOwner"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item label="最近的编辑人" v-show="editShow">
          <el-input v-model="server.modifiedByText" disabled></el-input>
        </el-form-item>
        <el-form-item label="编辑时间" v-show="editShow">
          <el-input v-model="server.modifiedDate" disabled></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editSubmit">确 定</el-button>
      </span>
      <!-- 选择添加设备所有人 -->
      <el-dialog title="分配给" :visible.sync="allocateVisible" append-to-body width="27%" :center="isCenter">
        <span class="quickSearch">快速查询：</span>
        <el-input size="small" placeholder="输入关键字查询用户" v-model="searchConsumerInput" style="width:170px"></el-input>
        <el-table :data="consumerList" @row-click="rowClick" border style="width:461px;margin-top:5px">
          <el-table-column type="index" width="60" align="center"></el-table-column>
          <el-table-column prop="name" label="用户名" width="100" align="center"></el-table-column>
          <el-table-column prop="phone" label="电话" width="150" align="center"></el-table-column>
          <el-table-column prop="email" label="邮箱" width="150" align="center"></el-table-column>
        </el-table>
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
        serverList: [],
        consumerList: [],
        server: {},
        searchPara: '', // 多条件查询参数
        editVisible: false,
        allocateVisible: false, // 设备分配dialog
        title: '',
        editShow: false, // 控制元素编辑时才显示
        options: [{
           value: 0,
           label: '正常'
        }, {
          value: 1,
          label: '异常'
        }],
        deleteBatchList: [], // 批量删除的设备对象列表
        searchConsumerInput: '', // 分配时的一个实时查询用户的参数
        isCenter: true,
        rules: {
          name: [
            { required: true, message: '请输入服务器名称', trigger: 'blur' }
          ],
          os: [
            { required: true, message: '请输入搭载系统', trigger: 'blur' }
          ]
        }
      }
    },
    // 分页的计算属性
    computed: {
      currentPage: function() {
        return this.page.pageNum;
      }
    },
    watch: {
      // 监听参数变化，实时改变查询结果
      searchConsumerInput (curVal, oldVal) {
        this.getConsumerList();
      }
    },
    methods: {
      // 换页
      handleCurrentChange (val) {
        this.page.pageNum = val;
        this.getServerList();
      },
      // 改变单页容量
      handleSizeChange (val) {
        this.page.size = val;
        this.getServerList();
      },
      // 多选改变时传递数据
      handleSelectionChange(val) {
       this.deleteBatchList = val;
      },
      // 分页查询设备
      getServerList() {
        this.$api.get('server/pageAll?page='+this.page.pageNum+'&size='+this.page.size, null, r => {
          this.serverList = r.data.content;
          this.page.totalRows = r.data.totalElements;
        })
      },
      // 模糊查询用户
      getConsumerList(){
        this.$api.get('consumer/fuzzy?para='+this.searchConsumerInput, null, r => {
          this.consumerList = r.data;
        })
      },
      // 添加设备，表单置空
      addServer() {
        this.server = {};
        // this.$refs.editForm.resetFields();
        this.server.runningState = 0;
        this.title = '新增设备';
        this.editShow = false;
        this.editVisible = true;
      },
      // 编辑设备
      editServer: function (index, row) {
        this.title = '设备详情';
        this.editShow = true;
        this.server = row;
        this.editVisible = true;
      },
      // 添加设备所有人
      addOwner() {
        this.searchConsumerInput = '';
        this.getConsumerList();
        this.allocateVisible = true;
      },
      // 点击table行设置设备所有人
      rowClick(row, event, column) {
        this.server.owner = row.id;
        this.server.ownerText = row.name;
        this.server.isAllocated = 1;
        this.allocateVisible = false;
      },
      // 删除设置的尚未提交的设备所有人
      deleteOwner() {
        this.server.owner = null;
        this.server.ownerText = '';
        this.server.isAllocated = 0;
      },
      editSubmit() {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            if(this.server.isAllocated === undefined){
              this.server.isAllocated = 0;
            }
            this.server.modifiedBy = JSON.parse(sessionStorage.obj).id;
            this.$api.post('server/update', this.server, r => {
              if(r.code === 200){
                this.$message.success('操作成功！');
                this.getServerList();
                this.editVisible = false;
              }
            })
          } else {
            console.log('验证未通过');
            return false;
          }
        });
      },
      deleteBatch() {
        if(this.deleteBatchList.length <= 0){
          this.$message.warning('请至少选择一台设备！');
        } else{
          this.$confirm('此操作将永久删除此' + this.deleteBatchList.length +'条设备信息, 是否继续?', '提示', {
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
            this.$message.info("已取消删除");
          });
        }
      },
      deleteServer: function (index, row) {
        this.$confirm('此操作将永久删除该设备信息, 是否继续?', '提示', {
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
          this.$message.info("已取消删除");
        });
      },
      search() {
        if(this.searchPara === ''){
          this.getServerList();
        } else {
          this.$api.get('server/fuzzy?para=' + this.searchPara, null, r => {
            this.serverList = r.data;
          })
        }
      }
    },
    mounted() {
      this.getServerList();
    }
}
</script>
<style scoped>
.quickSearch{
  margin-left: 10px;
  font-size: 15px;
  font-weight: bold;
}
</style>
