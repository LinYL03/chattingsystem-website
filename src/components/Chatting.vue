<template>
  <div class="body">
    <div class="chatBox">
      <room
      :user="user"
      :userList="userList"
      ref="chatroom"
      @sendServer="sendServer"
      @handleFile="handleFile"
      @activeSid="activeSid" />
    </div>
    <!-- <div>1234565</div> -->
    <!-- <div class="null">
      <room2
      :user="user"
      :userList="userList"
      ref="chatroom"
      @sendServer="sendServer"
      @handleFile="handleFile"
      @activeSid="activeSid" />
    </div> -->
    <!-- <div class="avatar">
      <el-avatar :size="70" :src="avatar" @click.native="UserInfo1"></el-avatar>
      <div class="UserInfo">
        <ul>
          <li>
            <span>当前登录用户:</span>
            <span class="loginName">{{ username }}</span>
          </li>
          <li @click="UserInfo1">
            <i class="iconfont">&#xe61d;</i>个人资料
          </li>
          <li @click="UserInfo2">
            <i class="iconfont">&#xe66d;</i>账号安全
          </li>
          <li @click="UserInfo3">
            <i class="iconfont">&#xe646;</i>我的消息
          </li>
          <li @click="loginOut">
            <i class="iconfont">&#xe71e;</i>退出登录
          </li>
        </ul>
      </div>
    </div> -->
  </div>
</template>

<script>
import Room from "./ChattingRoomNew";
import Room2 from "./Null";
// import Room from "./ChatRoom";
// 引入socket.io-client
import io from "socket.io-client";
export default {
  components: { Room },
  // components: { Room, Room2 },
  data() {
    return {
      username: "",
      avatar: "",
      uid: null,
      isEnter: false,
      socket: null,
      user: {},
      userList: [],
      sid: null,
    };
  },
  created() {
    let userInfo = window.sessionStorage.getItem("userInfo");
    userInfo = JSON.parse(userInfo);
    this.avatar = userInfo.avatar;
    this.username = userInfo.username;
    this.uid = userInfo.id;
  },
  mounted() {
    /**
     * 聊天室的主要功能
     */
    // 连接服务器
    this.socket = io(this.$apiServer);
    // 进入页面直接登录聊天室
    this.socket.emit("login", {
      id: this.uid,
      username: this.username,
      avatar: this.avatar,
    });
    // 监听登录失败的请求
    this.socket.on("userExit", (data) => this.$message.error(data.msg));
    // 监听登录成功的请求
    this.socket.on("loginSuccess", (data) => {
      this.$message.success(data.msg);
      this.user = data;
      this.isEnter = true;
    });
    this.socket.on("addUser", (data) => {
      this.$store.commit("setJoinRoom", data);
      this.$refs.chatroom ? this.$refs.chatroom.haveOneJoinRoom() : null;
    });
    this.socket.on("leaveroom", (data) => {
      this.$store.commit("setLeaveRoom", data);
      this.$refs.chatroom ? this.$refs.chatroom.haveOneleaveRoom() : null;
    });
    // 监听用户列表的信息
    this.socket.on("userList", (data) => {
      this.userList = data;
    });
    // 监听聊天的消息
    this.socket.on("receiveMessage", (data) => {
      // 把接收到的消息显示到聊天窗口中
      this.$refs.chatroom.handleGroup(data);
    });
    // 监听图片的消息
    this.socket.on("receiveImage", (data) => {
      // 把接收到的图片显示到聊天窗口中
      this.$refs.chatroom.handleGroup(data);
    });
    // 一对一单聊消息
    this.socket.on("oneMsg", (data) => {
      // 把接收到的消息显示到聊天窗口中
      this.$refs.chatroom.handleOne(data);
    });
    // 一对一单聊图片
    this.socket.on("oneImg", (data) => {
      // 把接收到的图片显示到聊天窗口中
      this.$refs.chatroom.handleOne(data);
    });
  },
  destroyed() {
    if (this.socket) this.socket.disconnect();
  },
  methods: {
    loginChat() {
      this.socket.emit("login", {
        id: this.uid,
        username: this.username,
        avatar: this.avatar,
      });
    },
    activeSid(sid) {
      this.sid = sid;
    },
    handleFile(file, isGroup) {
      const { username, avatar, sid } = this.user;
      const tosid = this.sid;
      if (isGroup) {
        this.socket.emit("sendImage", { username, avatar, file });
      } else {
        this.socket.emit("oneImage", { username, avatar, file, tosid, sid });
      }
    },
    sendServer(content, isGroup) {
      const { username, avatar, sid } = this.user;
      const tosid = this.sid;
      if (isGroup) {
        this.socket.emit("sendMessage", { username, avatar, msg: content });
      } else {
        this.socket.emit("oneMessage", { username, avatar, sid, tosid, msg: content, });
      }
    },
    loginOut() {
      window.sessionStorage.clear();
      this.$message.success("退出登录成功");
      this.$router.push("/login");
    },
    UserInfo1() {
      this.$router.push("/userinfo/1");
    },
    UserInfo2() {
      this.$router.push("/userinfo/2");
    },
    UserInfo3() {
      this.$router.push("/userinfo/3");
    },
  },
};
</script>

<style lang="less" scoped>
.body {
  width: 100%;
  height: 100%;
  background-image: url('../assets/picture/下雨.gif');
  background-size: cover; /* 设置为cover，以保持宽高比并覆盖整个屏幕 */
  background-repeat: no-repeat; /* 禁止背景图重复 */
  background-attachment: fixed; /* 固定背景图，使其在滚动时保持固定 */
  object-fit: cover;

  // // 水平垂直对齐
  display: flex;             /* 设置为 Flexbox 布局 */
  justify-content: center;   /* 水平居中 */
  align-items: center;       /* 垂直居中 */

  // background: #000;
  // 上下排列
  // display: flex;
  // flex-direction: column; /* 垂直方向排列 */
  // align-items: center;
}

// .null {
//   width: 952px;
//   height: 588px;
// }

.chatBox {
  position: relative;
  width: 1200px;
  height: 588px;
  margin: 0 auto;
  border: none;

  // background: #eee;
}

.loginChat {
  width: 900px;
  height: 550px;
  background-image: linear-gradient(to right top,
      #a98fb3,
      #a08fb9,
      #9490bd,
      #8691c1,
      #7593c4);

  img {
    width: 180px;
    height: 180px;
    top: 110px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  span {
    position: absolute;
    display: block;
    left: 50%;
    transform: translateX(-50%);
    font-size: 34px;
    top: 300px;
    color: yellow;
  }

  button {
    width: 135px;
    height: 47px;
    font-size: 20px;
    top: 410px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    background-color: rgb(157, 82, 226);
    cursor: pointer;
    border: none;
    border-radius: 50px;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
  }
}

// 头像
.avatar {
  position: relative;

  .el-avatar {
    border: 2px #eee solid;
    z-index: 999;
    margin-top: 10px;
    position: relative;
    cursor: pointer;
  }
}

.el-avatar:hover+.UserInfo {
  animation: show 0.7s forwards;
}

.UserInfo:hover {
  height: 300px;
}

@keyframes show {
  0% {
    height: 0;
  }

  100% {
    height: 300px;
  }
}

.UserInfo {
  position: absolute;
  left: -50px;
  top: 70px;
  height: 0;
  overflow: hidden;
  width: 170px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
  border-radius: 5px;
  background-color: #fff;
  z-index: 99;

  ul {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      font-size: 16px;
      border-top: 1px #eee solid;
      padding-top: 14px;
      text-align: center;
      color: purple;
      width: 100%;
      cursor: pointer;

      i {
        margin-right: 8px;
      }

      span {
        display: block;
        cursor: auto;
      }

      .loginName {
        font-size: 24px;
        color: orange;
        margin: 0 auto;
      }
    }
  }
}
</style>