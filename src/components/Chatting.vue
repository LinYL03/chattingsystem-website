<template>
  <div class="body">
    <div class="chatBox">
      <room
      :user="user"
      :userList="userList"
      :sign="sign"
      ref="chatroom"
      @sendServer="sendServer"
      @handleFile="handleFile"
      @activeSid="activeSid"
      @sendIceCandidate="sendIceCandidate"
      @sendOffer="sendOffer"
      @sendAnswer="sendAnswer"
      @endCall="endCall"
      />
    </div>
  </div>
</template>

<script>
import Room from "./ChattingRoom";

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
    this.sign = userInfo.signature;
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
    // 一对一监听视频事件
    this.socket.on('oneCalling', (message) => {
        if (message.data.type === 'offer') {
          this.$refs.chatroom.handleOffer(message);
        } else if (message.data.type === 'answer') {
          this.$refs.chatroom.handleAnswer(message.data);
        } else if (message.data.type === 'candidate') {
          this.$refs.chatroom.handleIceCandidate(message.data);
        } else if (message.data.type === 'endCall') {
          this.$refs.chatroom.handleEndCall();
        }
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
        this.socket.emit("sendImage", { username, avatar, file});
      } else {
        this.socket.emit("oneImage", { username, avatar, file, tosid, sid});
      }
    },
    sendServer(content, isGroup, isAudio) {
      const { username, avatar, sid } = this.user;
      const tosid = this.sid;
      console.log("父组件中的数据样子：", content);
      if (isGroup) {
        this.socket.emit("sendMessage", { username, avatar, isAudio, msg: content });
      } else {
        this.socket.emit("oneMessage", { username, avatar, isAudio, sid, tosid, msg: content, });
      }
    },
    sendIceCandidate(data, isGroup) {
      // console.log("sendIceCandidate 发送到父组件的数据如下", data);
      const { username, avatar, sid } = this.user;
      const tosid = this.sid;
      if (isGroup) {
        console.log("等会实现");
      } else {
        this.socket.emit("sendIceCandidate", {username, avatar, sid, tosid, data})
      }
    },
    sendOffer(data, isGroup) {
      const { username, avatar, sid } = this.user;
      const tosid = this.sid;
      // console.log("sendOffer 发送到父组件的数据如下", data);
      // console.log("sendOffer 发送方的名字，头像，sid", { username, avatar, sid });
      // console.log("sendOffer 发送到父组件的数据如下", tosid);
      // console.log("sendOffer 发送到父组件的数据如下", isGroup);
      if (isGroup) {
        console.log("等会实现");
      } else {
        this.socket.emit("sendOffer", {username, avatar, sid, tosid, data})
      }
    },
    sendAnswer(data, isGroup) {
      console.log("sendAnswer 发送到父组件的数据如下", data);
      const { username, avatar, sid } = this.user;
      const tosid = this.sid;
      if (isGroup) {
        console.log("等会实现");
      } else {
        this.socket.emit("sendAnswer", {username, avatar, sid, tosid, data})
      }
    },
    endCall(data, isGroup) {
      console.log("endCall 发送到父组件的数据如下", data);
      const { username, avatar, sid } = this.user;
      const tosid = this.sid;
      if (isGroup) {
        console.log("等会实现");
      } else {
        this.socket.emit("endCall", {username, avatar, sid, tosid, data})
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
  // opacity: 0.9;
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

@media screen and (min-width: 1200px) {
  .chatBox {
    position: relative;
    width: 1200px;
    height: 588px;
    margin: 0 auto;
    border: none;
    // opacity: 0.9;
    // background: #eee;
  }
}

@media screen and (max-width: 1200px) {
  .chatBox {
    min-width: 500px;
    position: relative;
    width: 90%;
    height: 588px;
    margin: 0 auto;
    border: none;
    // opacity: 0.9;
    // background: #eee;
  }
}

</style>