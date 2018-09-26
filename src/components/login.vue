<template>
  <!--背景图-->
  <div class="note" :style="note">
    <!--login框，表单+tab标签页的组合-->
    <div class="loginFrame">
        <!--表单组件放在外面，标签栏在里面-->
        <el-form class="login-container" :model="account" :rules="rules" ref="loginForm">
           <!--tab标签-->
           <div class="tabsUser">
             <el-tabs v-model="activeName" @tab-click="handleClick" style="height:30px;font-size:25px">
               <el-tab-pane label="普通用户" name="user"></el-tab-pane>
               <el-tab-pane label="管理员" name="admin"></el-tab-pane>
             </el-tabs>
           </div>
           <div class="formGroup">
             <el-form-item label="账号" prop="user" >
               <el-input type="text" v-model="account.name" placeholder="请输入您的账号" class="form-control" ></el-input>
             </el-form-item>
             <el-form-item label="密码" prop="password" class="form-inline">
               <el-input type="password" v-model="account.password" auto-complete="off" placeholder="请输入密码" class="form-control" ></el-input>
             </el-form-item>
           </div>
           <div class="remFor">
             <el-checkbox checked class="remember">记住密码</el-checkbox>
             <a href="https://www.baidu.com" class="forget">忘记密码？</a>
           </div>
           <div class="formButton">
             <el-form-item style="width:100%;">
               <el-button type="primary" style="width:100%;" @click="login">登录</el-button>
             </el-form-item>
           </div>
        </el-form>
      </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            note: {
                position:"absolute",
                top:"0px",
                left:"0px",
                width: "100%",
                height:"100%",
                backgroundImage: "url(" + require("../assets/loginbg.jpg") + ")",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
            },
            account : {
                name:'',
                password:'',
            },
            activeName: 'user',
            loginRole: 0,
            rules: {
              user: [
                { required: true, message: '请输入您的账号', trigger: 'blur' }
              ],
              password: [
                { required: true, message: '请输入密码', trigger: 'blur' }
              ]
            }
        };
    },
    methods: {
      handleClick(tab) {
        if(tab.name === 'user'){
          this.loginRole = 0;
        } else{
          this.loginRole = 1;
        }

      },
      login () {
        // this.$refs.loginForm.validate((valid) => {
        //   if (valid) {
        //     console.log(123);
        //   } else {
        //     console.log('error submit!!');
        //     return false;
        //   }
        // });
        if(this.loginRole === 0 ){
          this.$api.post('consumer/login', this.account, r => {
            if (r.code != 200) {
              if (r.code == 101) {
                this.$message.warning('用户名不存在！');
              } else if (r.code == 102){
                this.$message.warning('用户名或密码错误！');
              }
            } else {
              this.$message.success('欢迎您，' + r.data.name + '！');
              sessionStorage.obj = JSON.stringify(r.data);
              this.$router.push('/consumer');
            }
          });
        } else {
          this.$api.post('admin/login', this.account, r => {
            if (r.code != 200) {
              if (r.code == 101) {
                this.$message.warning('用户名不存在！');
              } else if (r.code == 102){
                this.$message.warning('用户名或密码错误！');
              }
            } else {
              this.$message.success('欢迎您，' + r.data.name + '！');
              sessionStorage.obj = JSON.stringify(r.data);
              sessionStorage.index = '1';
              this.$router.push('/serverInfo');
            }
          });
        }
      }
    }
}</script>

<style scoped>
.login-container {
    -webkit-border-radius: 5px;
    border-radius: 15px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    margin: 180px auto;
    width: 350px;
    padding: 35px 35px 15px 35px;
    background: rgba(255,255,255,0.7);
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
}
label{
    width:70px;
    text-align:left;
}
.form-control{
    width:270px;
    flex: 1;
    -webkit-flex: 1;
    -ms-flex: 1;
}
.remember{
    width:250px;
    text-align:left;
}
.forget{
    width:500px;
    text-align:right;
    font-size:14px;
    font-family:PingFang SC;
}
.remFor{
    margin-bottom: 10px;
    padding-bottom: 10px;
}
.tabsUser{
    display: inline-block;
    margin-left: 0px;
    margin-right:0px;
    text-align:center;
    font-size:25px;
}
 </style>
