<template>
  <div class="app-head">
      <div class="app-head-inner">
          <img src="@/assets/logo.png">
        <div class="head-nav">
          <ul class="nav-list">
            <li> {{ 123 }}</li>
            <li class="nav-pile">|</li>
            <li @click="quit">退出</li>
            <!-- <li v-if="noLoginState" @click="loginVisible = true">登录</li> -->
            <li class="nav-pile">|</li>
            <!-- <li v-if="noLoginState" @click="registerVisible = true">注册</li> -->
            <li>关于</li>
          </ul>
        </div>
      </div>
    </div>
</template>

<script>
export default {
  name: 'head',
  data () {
    return {

    }
  },
  methods: {

  }
}
</script>

<style>
.app-head {
  background: #363636;
  color: #b2b2b2;
  height: 90px;
  line-height: 90px;
  width: 100%;
}
.app-head-inner {
  width: 1200px;
  margin: 0 auto;
}
.head-logo {
  float: left;
}
.app-head-inner img {
  width: 50px;
  margin-top: 20px;
}
.head-nav {
  float: right;
}
.head-nav ul {
  overflow: hidden;
}
.head-nav li {
  cursor: pointer;
  float: left;
}
.nav-pile {
  padding: 0 10px;
}
</style>
