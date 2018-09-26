<template>
  <div class="adminreg">
    <div class="adminregTitle">添加管理员</div>
    <el-form :model="admin" style="margin-top:15px">
         <el-form-item label="账号">
           <el-input v-model="admin.name" placeholder="请输入您的账号"></el-input>
         </el-form-item>
         <el-form-item label="密码">
           <el-input v-model="admin.password" placeholder="请输入密码"></el-input>
         </el-form-item>
         <el-button type="primary" @click="submit">{{"添加"}}</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      admin: {}
    }
  },
  methods: {
    submit(){
      this.$api.post('admin/add', this.admin, r => {
        if(r.code === 200){
          this.$message.success('添加管理员成功');
          this.admin = {};
        }
      })
    }
  }
}
</script>

<style>
.adminreg{
  margin: 0 auto;
  text-align: center;
  width: 250px;
}
.adminregTitle{
  margin-top: 100px;
  font-size: 20px;
  font-weight: 800;
}
</style>
