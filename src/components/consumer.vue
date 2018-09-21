<template>
  <div>
    <Header></Header>
      <div class="contentBg">
        <div class="content">
          <div class="toolbar" style="margin-top:0px;width:100%">
            <el-form :inline="true" style="margin-left:10px">
              <el-form-item style="margin-top:7px">
                <el-input v-model="searchPara" placeholder="输入关键词搜索"></el-input>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="primary">{{"搜索"}}</el-button>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="primary">{{"申请设备"}}</el-button>
              </el-form-item>
              <el-form-item style="margin-top:7px">
                <el-button type="primary">{{"归还设备"}}</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-table :data="serverList" @selection-change="handleSelectionChange" style="width:100%;margin-top:10px">
            <el-table-column type="selection" width="55" align="center"></el-table-column>
            <el-table-column type="index" width="60" align="center"></el-table-column>
            <el-table-column prop="name" label="名称" width="200" align="center"></el-table-column>
            <el-table-column prop="os" label="系统" width="200" align="center"></el-table-column>
            <el-table-column prop="runningStateText" label="运行状态" width="200" align="center" sortable></el-table-column>
            <el-table-column prop="modifiedDate" label="分配于" width="200" align="center" sortable></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button @click="editServer(scope.$index, scope.row)" type="primary" size="small">详情</el-button>
                <el-button @click="deleteServer(scope.$index, scope.row)" type="primary" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination layout="total, sizes, prev, pager, next"
            @current-change="handleCurrentChange" @size-change="handleSizeChange"
            :current-page="currentPage" :page-sizes="pageSizes" :page-size="page.size" :total="page.totalRows"
            style="float:left;margin-left:40%">
          </el-pagination>
        </div>
        <!-- <div class="message"></div>
        <div class="nomessage"></div> -->
      </div>
    <Footer></Footer>
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
      consumerId: '',
      serverList: []
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
      this.deleteBatchList = val;
    },
    getMyServerList() {
      this.$api.get('server/pageByConsumer?id='+this.consumerId+'&page='+this.page.pageNum+'&size='+this.page.size, null, r => {
        this.serverList = r.data.content;
        this.page.totalRows = r.data.totalElements;
      })
    },
    editServer: function (index, row) {

    },
    deleteServer: function (index, row) {

    }
  },
  mounted() {
    let consumerId = JSON.parse(sessionStorage.obj).id;
    this.consumerId = consumerId;
    this.getMyServerList();
  }
}
</script>

<style>
.contentBg {
  background-image:url("../assets/loginbg.jpg");
  background-size: 100% 100%;
  width: 100%;
  height: 773px;
}
.content {
  background-color: grey;
  margin: 0 auto;
  width: 63%;
  height: 773px;
}
.message{
  background-image:url("../assets/message.png");
  background-size: 100% 100%;
  width: 50px;
  /* background-color: red; */
  height: 50px;
  /* float: left; */
  position: absolute;
  margin-top: -844px;
  margin-left: 82%;
}
</style>
