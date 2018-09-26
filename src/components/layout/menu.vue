<template>
  <el-row class="tac">
    <el-col>
      <el-menu class="el-menu-vertical-demo" :default-active="index" background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">
        <el-menu-item index="1" @click="menu1">
          <i class="el-icon-menu"></i>
          <span slot="title">服务器信息</span>
        </el-menu-item>
        <el-menu-item index="2" @click="menu2">
          <i class="el-icon-document"></i>
          <span slot="title">申请管理</span>
        </el-menu-item>
        <el-menu-item index="3" @click="menu3">
          <i class="el-icon-setting"></i>
          <span slot="title">用户管理</span>
        </el-menu-item>
      </el-menu>
    </el-col>
  </el-row>
</template>

<script>
  export default {
    data () {
      return {
        index: ''
      }
    },
    methods: {
      menu1() {
        sessionStorage.index = '1';
        this.$router.push('/serverInfo');
      },
      menu2() {
        sessionStorage.index = '2';
        this.$router.push('/applicant');
      },
      menu3() {
        sessionStorage.index = '3';
        this.$router.push('/userManager');
      }
    },
    mounted() {
      this.index = sessionStorage.index;
    }
  }
</script>

<style>
.tac{
  float: left;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
   width: 166.5%;
   min-height: 773px;
 }
</style>
