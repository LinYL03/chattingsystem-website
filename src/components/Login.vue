<template>
  <div class="body">
      <div class="box">
          <div class="left">
              <img src="../assets/picture/house.jpg" alt="背景图" height="300px">
          </div>
          <div class="right">
              <h1>LOGIN</h1>
              <el-form :model="loginForm" ref="loginFormRef" class="login_form" @submit.native.prevent>
                  <!-- 判断是用户名登录还是邮箱登录 -->
                  <div class="inputItem">
                      <el-form-item v-if="isUser">
                          <el-input v-model="loginForm.username" class="inputField" @focus="User_onFocus" @blur="User_onBlur" :class="{ 'has-content': loginForm.username !== '' }"></el-input>
                      </el-form-item>
                      <el-form-item v-else>
                          <el-input v-model="loginForm.email" class="inputField" @focus="User_onFocus" @blur="Email_onBlur" :class="{ 'has-content': loginForm.email !== '' }"></el-input>
                      </el-form-item>
                      <label class="inputLabel" :class="{ 'active': User_isFocused || loginForm.username !== '' || loginForm.email != '' }">{{ loginText }}</label>
                  </div>

                  <!-- 密码 -->
                  <div class="inputItem">
                      <el-form-item>
                          <el-input v-model="loginForm.password" show-password class="inputField" @focus="Password_onFocus" @blur="Password_onBlur" :class="{ 'has-content': loginForm.password !== '' }"></el-input>
                      </el-form-item>
                      <label class="inputLabel" :class="{ 'active': Password_isFocused || loginForm.password !== ''}">密码</label>
                  </div>

                  <!-- 按钮区域 -->
                  <el-form-item class="btn_area">
                      <div class="btn1">
                          <button class=" " @click="login">登录</button>
                      </div>
                      <div class="loginway">
                          <div class="btn2">
                              <button class=" " @click="goRegister">
                                  前往注册
                              </button>
                          </div>
                          <div class="btn3">
                              <button class=" " @click="chooseUser">
                                  {{ loginWay }}登录
                              </button>
                          </div>
                      </div>
                  </el-form-item>
              </el-form>
          </div>
      </div>
  </div>
</template>

<script>
export default {
  data() {
      return {
          User_isFocused: false, // 用于控制焦点状态
          Password_isFocused: false, // 用于控制焦点状态
          loginText: "用户名",
          loginWay: "邮箱",
          isUser: true,
          loginForm: {
              username: "",
              password: "",
              email: "",
          },
      };
  },
  methods: {
      checkEmail: function () {
          var regEmail = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
          if (this.loginForm.email != "" && !regEmail.test(this.loginForm.email)) {
              this.$message.error('邮箱格式不正确');
              this.loginForm.email = "";
          }
      },
      login() {
          this.$refs.loginFormRef.validate(async (valid) => {
              if (!valid) return;
              const { data: res } = await this.$http.post("login", {
                  params: this.loginForm,
              });
              if (res.code !== 200) {
                  return this.$message.error(res.msg);
              }
              this.$message.success(res.msg);
              window.sessionStorage.setItem("token", res.token);
              window.sessionStorage.setItem("userInfo", JSON.stringify(res.data));
              // this.$router.push("/chatting");
              // 新的聊天室页面
              this.$router.push("/chat");
          });
      },
      goRegister() {
          this.$router.push("/register");
      },
      chooseUser() {
          if (this.loginWay === "邮箱") {
              this.isUser = false;
              this.loginWay = "用户名";
              this.loginText = "邮箱";
          } else {
              this.isUser = true;
              this.loginWay = "邮箱";
              this.loginText = "用户名";
          }
          this.loginForm = {
              username: "",
              password: "",
              email: "",
          };
      },
      Email_onBlur() {
          this.checkEmail();
          this.User_isFocused = false;
      },
      User_onFocus() {
          this.User_isFocused = true;
      },
      User_onBlur() {
          this.User_isFocused = false;
      },
      Password_onFocus() {
          this.Password_isFocused = true;
      },
      Password_onBlur() {
          this.Password_isFocused = false;
      }
  },
};
</script>

<style lang="less" scoped>
.body {
  width: 100%;
  height: 100%;
  background-image: url('../assets/picture/落叶.gif');
  background-size: cover;    /* 设置为cover，以保持宽高比并覆盖整个屏幕 */
  background-repeat: no-repeat;    /* 禁止背景图重复 */
  background-attachment: fixed;    /* 固定背景图，使其在滚动时保持固定 */
  object-fit: cover;
}

.box {
  width: 60%;
  height: 450px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, .8);

  display: flex;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background: rgba(255, 255, 255, 0.5);    /* 设置右侧区域的背景透明度 */
}

.left {
  width: 65%;
}

.left>img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn_area {
  height: 100%;

  /deep/.el-form-item__content {
      margin-top: 50px;
      width: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      align-items: center;    /* 水平居中 */
  }
}

.btn1 {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 21px; /* 胶囊形状 */
  height: 46px; /* 高度 */
  width: 120px; /* 根据内容自动调整宽度 */
  padding: 0 20px; /* 内边距 */
      background: linear-gradient(to right, #ebc931, #ff6152);
  position: relative;
  overflow: hidden; /* 确保溢出的内容被隐藏 */
  border: none; /* 去掉边框 */
  cursor: pointer; /* 鼠标悬停时手型 */
}

.btn1 button {
  font-size: 1.5rem; /* 字体大小 */
  font-weight: 600; /* 字体粗细 */
  color: #fff; /* 字体颜色 */
  background-color: transparent; /* 胶囊体背景颜色透过 */
  border: none; /* 去掉按钮边框 */
  height: 100%; /* 高度自适应 */
  width: 100%; /* 宽度自适应 */
  padding: 0; /* 去掉内边距 */
  cursor: pointer; /* 鼠标悬停时手型 */
  position: relative;
  z-index: 1; /* 确保文本在最上层 */
}

.btn1::before {
  content: "";
  position: absolute;
  left: -100%;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #ef5c0d;
  /* background-color: #000; */
  transition: left 0.5s ease;
}

.btn1:hover::before {
  left: 0;
}

.loginway {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  align-items: center; /* 垂直居中 */
  justify-content: space-between; /* 水平方向上均匀分布子元素 */
  width: 100%; /* 宽度占满容器 */
}

.btn2,
.btn3 {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px; /* 高度 */
  width: 80px; /* 根据内容自动调整宽度 */
  padding: 0 10px; /* 内边距 */
  // background: linear-gradient(to right, #65cbf7, #b3a5fc); /* 渐变背景 */
  // background-color: #65cbf7;
  position: relative;
  overflow: hidden; /* 确保溢出的内容被隐藏 */
  border: none; /* 去掉边框 */
  cursor: pointer; /* 鼠标悬停时手型 */
  color: #fff; /* 按钮文字颜色 */
  font-size: 14px; /* 按钮文字大小 */
  font-weight: bold; /* 按钮文字加粗 */
  transition: background 0.3s ease; /* 背景色过渡效果 */
}

.btn2 button,
.btn3 button {
  // font-size: 1rem; /* 字体大小 */
  font-weight: 100; /* 字体粗细 */
  color: #454545;
  background-color: #e7a56a;
  border-radius: 5px;
  border: none; /* 去掉按钮边框 */
  height: 100%; /* 高度自适应 */
  width: 100%; /* 宽度自适应 */
  padding: 0; /* 去掉内边距 */
  cursor: pointer; /* 鼠标悬停时手型 */
  position: relative;
  z-index: 1; /* 确保文本在最上层 */
}

.btn2 button:hover,
.btn3 button:hover {
  // background: linear-gradient(to right, #4a8bd1, #9b8dfc); /* 悬停时渐变背景色加深 */
  background-color: #e08907;
}

// 更新的样式
h1 {
  /* background-color: #b3a5fc; */
  text-align: center;
  padding-top: 45px;
  margin-top: 0;
}

.right {
  width: 35%;
  height: 100%;
  // background-color: #ccc;
  box-sizing: border-box;
  padding: 0 20px;

  /* 设置右侧区域的背景透明度 */
  background: rgba(255, 255, 255, 0.5);
}

.inputLabel {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  font-size: 1em;
  color: #1d303f;
  font-weight: 800;
  pointer-events: none;
  transition: all 0.3s ease;
}

.inputField.has-content + .inputLabel,
.inputField:focus + .inputLabel,
.inputLabel.active {
  top: 0px;
  font-size: 0.8em;
}

.inputItem {
  background: none;
  background: transparent;
  height: 46px;
  width: 100%;
  padding: 0;
  padding-left: 3px;
  border: none;
  outline: none;
  border-bottom: 2px solid #b3a5fc;
  font-size: 18px;
  margin-top: 35px;
  position: relative;

  // background-color: #b3a5fc;
}

.el-form-item {
  width: 100%;
  height: 100%;
  // background: #555;
}

.inputField {
  width: 100%;
  height: 100%;
  // background: red;
}

.inputItem {
  /deep/.el-input__inner {
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      font-size: 1.2em;
      color: #162938;
      background-color: transparent;
      box-sizing: border-box;
      // background: yellow;
      // padding-top: -15px;
      // line-height: 1.5;
      padding-left: 10px;
      font-weight: 500;
  }
  /deep/.el-form-item__content {
      width: 100%;
      height: 100%;
      // background: blue;
  }
}

/* 适配960px以上 */
@media screen and (min-width:960px) {
  .box {
      max-width: 950px;
      min-width: 750px;
  }
}

/* 适配960px以下 750px以上 */
@media screen and (max-width:960px) {
  .box {
      display: block;
      height: auto;
  }

  .left,
  .right {
      width: 100%;
      margin-top: 0;
  }

  .left {
      height: 200px;
  }

  .right {
      padding: 2vw 2vw;
  }

  h1 {
      padding-top: 0;
      margin-bottom: 1vw;
  }

  .inputItem,
  .forgetPassword,
  .btn {
      margin-top: 5vw;
  }
}
</style>