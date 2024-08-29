<template>
    <div class="Room" ref="room">
        <div class="chatBox">
            <div class="boxLeft">
                <div class="leftTop">
                    <div class="avatar" @click="userinfo"><img :src="user.avatar" alt=""></div>
                    <div class="username"><span>{{ user.username }}</span></div>
                </div>
                <div class="leftDown">
                    <span>聊天列表</span>
                    <div class="group" @click="chooseGroup" :class="{'active-user': isGroup}">
                        <img src="../assets/picture/ChatforGroup.svg" alt="" />
                        <span>群聊</span>
                    </div>
                    <span>当前在线用户</span>
                    <div class="ungroup">
                        <div class="nousers" v-if="userList.length === 1"><span>没有其他用户</span></div>
                        <div class="userBox" v-for="(item, index) in userList" :key="index"
                            v-if="item.username !== user.username" @click="chooseUser(item, index)"
                            :class="{'active-user': active === index && isGroup === false}">
                            <div class="avatar"><img :src="item.avatar" alt=""></div>
                            <div class="username"><span>{{ item.username }}</span></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="boxRight">
                <div class="rightTop">
                    <div class="boxName" v-if="isGroup"><span>聊天室 ( {{ userListLength }} )</span></div>
                    <div class="boxName" v-else><span>{{ username }}</span></div>
                    <!-- <div class="function"><span>其他功能</span></div> -->
                </div>
                <div class="rightDown">
                    <div class="chatArea">
                        <ul class="join" ref="joinUs">
                            <li v-for="(item1, index) in messageContent" :key="index" :class="{
                                'my-message': item1.type === 1 ? true : false,
                                'other-message': item1.type === 2 ? true : false,
                                'my-audio-message': item1.type === 5 ? true : false,
                                'other-audio-message': item1.type === 6 ? true : false,}">
                                <div v-if="item1.type === 3">欢迎{{ item1.username }}加入聊天室</div>
                                <div v-if="item1.type === 4">{{ item1.username }}离开了聊天室</div>
                                <div v-if="item1.type === 1">
                                    <div v-if="item1.file" class="image">
                                        <img :src="item1.file" class="file" v-if="item1.file" @load="loadOverImg"
                                            preview="1" />
                                        <img :src="item1.avatar" class="avatar" />
                                    </div>
                                    <div v-else class="message">
                                        <span>{{ item1.msg }}</span>
                                        <img :src="item1.avatar" class="avatar" />
                                    </div>
                                </div>
                                <div v-if="item1.type === 2">
                                    <div v-if="item1.file" class="image">
                                        <img :src="item1.avatar" class="avatar" />
                                        <span class="username">{{ item1.username }}</span>
                                        <img :src="item1.file" class="file" v-if="item1.file" @load="loadOverImg"
                                            preview="1" />
                                    </div>
                                    <div v-else class="message">
                                        <img :src="item1.avatar" class="avatar" />
                                        <span class="username">{{ item1.username }}</span>
                                        <span class="content">{{ item1.msg }}</span>
                                    </div>
                                </div>

                                <div v-if="item1.type === 5">
                                    <div class="message">
                                        <span @click="playAudioFromBase64( item1.msg )">语音 </span>
                                        <img :src="item1.avatar" class="avatar" />
                                    </div>
                                </div>
                                <div v-if="item1.type === 6">
                                    <div class="message">
                                        <img :src="item1.avatar" class="avatar" />
                                        <span class="username">{{ item1.username }}</span>
                                        <span class="content" @click="playAudioFromBase64( item1.msg )"> 语音 </span>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="sendMessage">
                        <div class="icon">
                            <img class="emoji" @click="emojiShow = !emojiShow" src="../assets/picture/emoji.svg" alt="">
                            <div class="emoji-box" tabindex="1" v-show="emojiShow" @blur="handleEmojiBlur">
                                <span v-for="item in emojiList" :key="item.codes" @click="handleEmoji(item)">{{
                                    item.char }}</span>
                            </div>
                            <img class="shoot" @click="handleCanvas" src="../assets/picture/shoot.svg" alt="">
                            <label for="file"><img class="file" src="../assets/picture/file.svg" alt=""></label>
                            <input type="file" style="display: none" id="file" @change="handleFile" />
                            <img src="../assets/picture/语音.svg" class="audio" @mousedown="startRecord"
                                @mouseup="sendAudioToServe">
                            <div class="audio-box" v-show="audioShow">正在录制...<img src="../assets/img/录音中.png" style="width: 70px;margin-top: 12px;"></div>
                            <img src="../assets/picture/视频通话-填充.svg" class="video" @click="startVideo">
                            <div class="video-box" v-show="showVideoBox" @mousedown="mousedown($event)" id="Drag">
                                <video class="localVideo" id="localVideo" autoplay muted></video>
                                <div><img src="../assets/img/未接电话.png" @click="endVideo" class="end-video-btn"></div>
                            </div>
                            <div class="video-box1" v-show="showVideoBox1">
                                <div><img src="../assets/img/未接电话.png" @click="endVideo" class="end-video-btn"></div>
                                <div><img src="../assets/img/接电话.png" @click="startTalk" class="start-video-btn"></div>
                                <video class="remoteVideo" id="remoteVideo" autoplay></video>
                            </div>
                        </div>
                        <textarea cols="80" rows="5" ref="textarea" @keydown.enter="handlePress"></textarea>
                        <button @click="sendContentToServe" class="send-btn">发送</button>
                        <img :src="imgUrl" alt />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import html2canvas from "html2canvas";
import emoji from "../assets/emoji.json";
export default {
    name: "Room",
    props: {
        user: Object,
        userList: Array,
    },
    data() {
        return {
            messageContent: [], //0不渲染，1表示自己发出的信息，2表示别人发出的信息
            groupContent: [],
            oneContent: [],
            emojiList: [],
            content: "", // 输入框的内容
            emojiShow: false, // 表情框
            audioShow: false, // 语音输入框
            imgUrl: "", // 图片或截图
            isGroup: true, // 是否是群聊
            isAudio: false, // 是否是语音
            active: null, // 当前聊天用户
            username: null, // 当前聊天用户名
            activeElement: null, // 用来追踪用户列表中当前被选中的元素
            pc: null, // RTCPeerConnection对象
            localStream: null, // 本地音频流
            remoteStream: null, // 远程音频流
            showVideoBox: false, // 展示自己视频的容器
            showVideoBox1: false, // 展示别人视频的容器

            // 容器可拖动
            DragEl: null,//拖动元素
            dragContainerEl: null,//容器元素
            disX: 0, // 鼠标与元素左上角的水平偏移
            disY: 0, // 鼠标与元素左上角的垂直偏移
            pageWidth: window.innerWidth,
            pageHeight: window.innerHeight,

            // 双方视频
            start_offer: null,

        };
    },
    computed: {
        userListLength() {
            // console.log(this.userList);
            return this.userList.length;
        },
    },
    mounted() {
        this.emojiList = emoji;
        this.userList.forEach((val, i) => {
            this.oneContent[i] = [];
        });
        // console.log(userList);
        this.DragEl = document.getElementById("Drag");
        // 添加窗口尺寸变化的监听器
        console.log("pageWidth: ", this.pageWidth, "pageHeight: ", this.pageHeight);
        window.addEventListener('resize', this.handleResize);
        this.updateDimensions(); // 初始化时设置尺寸
    },
    updated() {
        // 聊天定位到底部
        this.handleScrollBottom();
    },
    watch: {
        groupContent: {
            handler(val) {
                this.messageContent = val;
            },
            deep: true,
        },
        oneContent: {
            handler(val) {
                this.messageContent = val;
            },
            deep: true,
        },
    },
    methods: {
        handleResize() {
            this.pageWidth = window.innerWidth;
            this.pageHeight = window.innerHeight;
            this.updateDimensions();
        },
        updateDimensions() {
            console.log("this.pageWidth: ", this.pageWidth);
            console.log("this.pageHeight: ", this.pageHeight);
            document.documentElement.style.setProperty('--page-width', `${this.pageWidth}px`);
            document.documentElement.style.setProperty('--page-height', `${this.pageHeight}px`);
        },
        mousedown(event) {
            // 1. 计算鼠标点击位置与拖动元素左上角的偏移量
            this.disX = event.clientX - this.DragEl.offsetLeft;
            this.disY = event.clientY - this.DragEl.offsetTop;

            //2， 获取拖动元素的高度和容器的高度 为了下面进行限制元素拖动的范围
            let dragHeight = this.DragEl.offsetHeight;
            let dragWidth = this.DragEl.offsetWidth;

            // 添加鼠标移动事件
            document.onmousemove = (el) => {
                // console.log("el: ", el)
                let moveX = el.clientX - this.disX;
                let moveY = el.clientY - this.disY;
                // 限制拖动范围在整个页面内
                const pageWidth = window.innerWidth;
                const pageHeight = window.innerHeight;
                // console.log("moveX :", moveX, "moveY :", moveY);
                // 4，限制拖动
                if (moveX <= 0) {
                    moveX = 0;
                }
                // 上边界
                if (moveY <= 0) {
                    moveY = 0;
                }
                //下边界  容器高度 - 拖动元素高度
                if (moveX >= pageWidth - dragWidth) {
                    moveX = pageWidth - dragWidth;
                }
                //右边界   容器宽度 - 拖动元素宽度
                if (moveY >= pageHeight - dragHeight) {
                    moveY = pageHeight - dragHeight;
                }

                // 5, 开始移动
                this.DragEl.style.left = moveX + "px";
                this.DragEl.style.top = moveY + "px";
            };

            /* 6，鼠标抬起解除事件 */
            document.onmouseup = () => {
                document.onmousemove = null;
            };
        },
        // 监听键盘按下事件
        handlePress(e) {
            if (e.ctrlKey && e.keyCode == 13) {
                //用户点击ctrl+enter触发换行
                this.$refs.textarea.value += "\n";
            } else {
                //用户点击了enter触发发送消息
                this.sendContentToServe();
                //禁止回车的默认换行
                event.preventDefault();
            }
        },
        //发送截图
        handleCanvas() {
            const room = this.$refs.room;
            html2canvas(room, { backgroundColor: null }).then((canvas) => {
                const file = canvas.toDataURL();
                this.$emit("handleFile", file, this.isGroup);
                if (!this.isGroup) {
                    this.oneContent.push({ ...this.user, file, type: 1 });
                }
            });
        },
        handleEmojiBlur() {
            this.emojiShow = false;
        },
        // 输入表情
        handleEmoji(emoji) {
            this.content = this.$refs.textarea.value;
            this.$refs.textarea.value += emoji.char;
        },
        loadOverImg() {
            // 图片预览
            this.$previewRefresh();
            this.handleScrollBottom();
        },
        // 处理收到的群聊消息
        handleGroup(data) {
            this.isGroup = true;
            this.active = null;
            this.handleMessageBox(data);
        },
        // 处理收到的单聊消息
        handleOne(data) {
            console.log("handleOne函数执行");
            this.isGroup = false;
            this.userList.forEach((val, i) => {
                if (val.username == data.username) {
                    this.active = i;
                    this.username = val.username;
                }
            });
            this.$emit("activeSid", data.sid);
            this.handleMessageBox(data);
        },
        // 给发送图片做限制
        handleFile(e) {
            const file = e.target.files[0];
            if (file.size > 1024 * 1024) {
                return this.$message.info("发送图片大小不能超过1M!");
            }
            const reader = new FileReader(); // 创建读取文件对象
            reader.readAsDataURL(file); // 发起异步请求，读取文件
            reader.onload = (e) => {
                let file = e.target.result;
                // 文件读取完成后
                // 读取完成后，将结果赋值给img的src
                this.$emit("handleFile", file, this.isGroup);
                if (!this.isGroup) {
                    this.oneContent.push({ ...this.user, file, type: 1 });
                }
            };
        },
        haveOneJoinRoom() {
            const joinRoom = this.$store.state.joinRoom;
            this.groupContent.push({ ...joinRoom, type: 3 });
        },
        haveOneleaveRoom() {
            const leaveRoom = this.$store.state.leaveRoom;
            this.groupContent.push({ ...leaveRoom, type: 4 });
        },
        // 点击发送按钮
        sendContentToServe() {
            // 获取到聊天的内容
            this.content = this.$refs.textarea.value;
            this.$refs.textarea.value = "";
            if (!this.content) {
                return alert("请输入内容");
            }
            this.isAudio = false;
            //发送给服务器
            this.$emit("sendServer", this.content, this.isGroup, this.isAudio);
            let msg = this.content;
            if (!this.isGroup) {
                this.oneContent.push({ ...this.user, msg, type: 1 });
            }
        },
        // 分类显示聊天窗口中的内容
        handleMessageBox(newValue) {
            console.log("分类函数中处理消息时的信息:");
            console.log("isGroup:", this.isGroup);
            console.log("newValue.isAudio:", newValue.isAudio);
            console.log("newValue.username:", newValue.username);
            console.log("this.username:", this.user.username);
            // 群组消息
            if (this.isGroup) {
                if (newValue.username === this.user.username) {
                    //是自己发的信息
                    if (newValue.isAudio) this.groupContent.push({ ...newValue, type: 5 });
                    else this.groupContent.push({ ...newValue, type: 1 });
                } else {
                    //是别人发的信息
                    if (newValue.isAudio) this.groupContent.push({ ...newValue, type: 6 });
                    else this.groupContent.push({ ...newValue, type: 2 });
                }
                this.messageContent = this.groupContent;
            } else {
                // 单人消息
                if (this.oneContent.length > 1) {
                    let user = this.oneContent[this.oneContent.length - 1];
                    if (newValue.username !== user.username) {
                        this.oneContent = [];
                    }
                }
                console.log("分类函数中处理单人消息时的isAudio:", newValue.isAudio);

                if (newValue.isAudio) this.oneContent.push({ ...newValue, type: 6 });
                else this.oneContent.push({ ...newValue, type: 2 });
                this.messageContent = this.oneContent;
            }
        },
        handleScrollBottom() {
            const ul = this.$refs.joinUs;
            ul.scrollTop = ul.scrollHeight;
        },
        // 点击群聊进入群聊房间
        chooseGroup() {
            console.log("你进入聊天室了");
            this.active = null;
            this.isGroup = true;
            this.$refs.textarea.value = "";
            this.messageContent = this.groupContent;
        },
        // 点击用户进行单聊
        chooseUser(user, index) {
            console.log(user, this.active, index);
            this.activeElement = index; // 点击后设置为当前元素的索引
            // if (user.username == this.user.username) return;
            this.isGroup = false;
            if (this.active !== index) {
                this.active = index;
                this.oneContent = [];
                this.username = user.username;
                this.$refs.textarea.value = "";
                this.$emit("activeSid", user.sid);
            }
        },
        userinfo() {
            this.$router.push("/userinfo/1");
            console.log("跳转到用户信息界面");
        },
        // 长按语音按钮
        async startRecord() {
            this.audioShow = true;
            console.log("准备录制");
            try {
                // 请求用户的音频权限并获取音频流
                console.log("请求音频权限...");
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log("获取音频流成功");
                this.mediaRecorder = new MediaRecorder(stream);

                // 清空之前的音频数据
                this.audioChunks = [];

                // 保存音频流到实例属性，以便停止时释放
                this.audioStream = stream;

                // 在录音数据可用时，将数据推入数组
                this.mediaRecorder.addEventListener("dataavailable", event => {
                    console.log("录音数据可用");
                    this.audioChunks.push(event.data);
                });

                // 开始录音
                this.mediaRecorder.start();
                console.log("正在录音");
            } catch (error) {
                console.error("无法开始录音:", error);
                console.error("错误详情:", error.name, error.message);
            }
        },
        // 松开或者离开语音按钮
        sendAudioToServe() {
            this.audioShow = false;
            console.log("准备发送语音数据");
            if (this.mediaRecorder) {
                // 停止录音
                this.mediaRecorder.stop();
                console.log("录音停止了！！！");

                // 处理录音数据
                this.mediaRecorder.addEventListener("stop", () => {
                    // 创建音频 Blob 数据
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

                    // 将 Blob 转换为 base64
                    const fileReader = new FileReader();
                    fileReader.readAsDataURL(audioBlob);
                    fileReader.onloadend = () => {
                        const base64Audio = fileReader.result;

                        this.isAudio = true;
                        console.log("当前是否为群聊：", this.isGroup);
                        // 发送音频数据到服务器
                        this.$emit("sendServer", base64Audio, this.isGroup, this.isAudio);
                        console.log("发送到服务器的语音数据：", base64Audio);
                        let msg = base64Audio;
                        if (!this.isGroup) {
                            this.oneContent.push({ ...this.user, msg, type: 5 });
                        }
                    };

                    // 清除 MediaRecorder 实例
                    this.mediaRecorder = null;

                    // 停止所有音频轨道，释放音频权限
                    if (this.audioStream) {
                        this.audioStream.getTracks().forEach(track => track.stop());
                        this.audioStream = null;
                        console.log("音频权限已释放");
                    }
                });
            }
        },
        playAudioFromBase64(base64Audio) {
            // 将 base64Audio 字符串转换为 Blob
            const byteString = atob(base64Audio.split(',')[1]); // 去掉 "data:audio/webm;base64," 这部分
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const uint8Array = new Uint8Array(arrayBuffer);

            for (let i = 0; i < byteString.length; i++) {
                uint8Array[i] = byteString.charCodeAt(i);
            }

            const audioBlob = new Blob([uint8Array], { type: 'audio/webm' }); // 确保与录音时的 MIME 类型一致

            // 创建一个音频对象并播放
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            audio.play()
                .then(() => {
                    console.log("音频播放成功");
                })
                .catch((error) => {
                    console.error("音频播放错误:", error);
                });
        },
        ensurePeerConnection() {
            if (!this.pc) {
                const configuration = {
                    iceServers: [
                        {
                            urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
                        },
                    ],
                };
                this.pc = new RTCPeerConnection(configuration);

                this.pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        this.$emit("sendIceCandidate", {
                            type: "candidate",
                            candidate: event.candidate.candidate,
                            sdpMid: event.candidate.sdpMid,
                            sdpMLineIndex: event.candidate.sdpMLineIndex,
                        }, this.isGroup);
                        console.log("sendIceCandidate");
                    }
                };

                this.pc.ontrack = (event) => {
                    this.remoteStream = event.streams[0];
                    const remoteVideoElement = document.getElementById("remoteVideo");
                    remoteVideoElement.srcObject = this.remoteStream;
                    remoteVideoElement.play();
                    console.log("处理远程流");
                };
            }
        },
        async startVideo(){
            this.showVideoBox = true;
            this.$message.success("开始视频通话");
            try {
                // 获取本地音频流
                this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                console.log("音频获取成功!!!");

                // 在页面上显示本地视频
                const localVideoElement = document.getElementById("localVideo");
                localVideoElement.srcObject = this.localStream;
                localVideoElement.play();

                this.ensurePeerConnection();

                // 添加本地音频轨道到RTCPeerConnection
                // 让本地音频（即你麦克风捕获的声音）通过WebRTC的连接发送到远程用户
                this.localStream.getTracks().forEach(track => {
                    this.pc.addTrack(track, this.localStream);
                });

                // 创建Offer并发送给对方
                const offer = await this.pc.createOffer();
                await this.pc.setLocalDescription(offer);
                this.$emit("sendOffer", { type: "offer", sdp: offer.sdp }, this.isGroup);
                console.log("正在等待对方接受通话请求...");

                this.$message.success("正在等待对方接受通话请求...");
            } catch (error) {
                console.error("无法开始视频通话:", error);
                console.error("错误详情:", error.name, error.message);
            }
        },
        endVideo() {
            // 接收方取消视频
            this.showVideoBox1 = false;
            this.showVideoBox = false;

            // 停止所有的媒体流轨道
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    track.stop();
                });
            }

            // 发送一个结束视频通话的信号给对方
            this.$emit("endCall", { type: "endCall" }, this.isGroup);

            // 关闭 RTCPeerConnection
            if (this.pc) {
                this.pc.close();
                this.pc = null;
            }

            this.$message.success("视频通话结束");
        },
        handleEndCall() {
            this.showVideoBox = false;
            this.showVideoBox1 = false;
            // 停止所有的媒体流轨道
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    track.stop();
                });
            }

            // 关闭 RTCPeerConnection
            if (this.pc) {
                this.pc.close();
                this.pc = null;
            }

            this.$message.info("对方结束了视频通话");
        },
        // 接收并处理对方的Answer
        async handleAnswer(answer) {
            this.showVideoBox1 = true;
            if (!this.pc)
                // 创建RTCPeerConnection对象
                this.ensurePeerConnection();

            if (answer && answer.type && answer.sdp) {
                const remoteDesc = new RTCSessionDescription(answer);
                await this.pc.setRemoteDescription(remoteDesc);
                this.$message.success("通话已连接");
                console.log("接收并处理对方的Answer");
            } else {
                console.error("无效的回复数据格式:", answer);
            }
        },
        // 接收并处理ICE候选者
        async handleIceCandidate(candidate) {
            if (!this.pc)
                // 创建RTCPeerConnection对象
                this.ensurePeerConnection();
            if (candidate) {
                await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        },
        // 处理Offer并返回Answer
        handleOffer(offer) {
            console.log(offer.username, " 申请与你连接视频, 是否同意？");
            this.showVideoBox1 = true;
            this.start_offer = offer;
        },
        async startTalk() {
            this.showVideoBox = true;
            try {
                if (!this.pc)
                    // 创建RTCPeerConnection对象
                    this.ensurePeerConnection();

                // 获取本地音频流
                this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                console.log("接收方: 音频获取成功!!!");

                // 在页面上显示本地视频
                const localVideoElement = document.getElementById("localVideo");
                localVideoElement.srcObject = this.localStream;
                localVideoElement.play();

                // 添加本地音频轨道到RTCPeerConnection
                this.localStream.getTracks().forEach(track => {
                    this.pc.addTrack(track, this.localStream);
                });

                await this.pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: this.start_offer.data.sdp }));
                const answer = await this.pc.createAnswer();
                await this.pc.setLocalDescription(answer);
                this.$emit("sendAnswer", { type: "answer", sdp: answer.sdp }, this.isGroup);
            } catch (error) {
                console.error("无法处理Offer:", error);
            }
        },
    },
};
</script>

<style lang="less" scoped>
:global(:root) {
    /* 定义全局 CSS 变量 */
    --wechat-green: #1AAD19;
    --dark-green: #2BA245;
    --dark-gray: #4D4D4D;
    --medium-gray: #888888;
    --light-gray: #AAAAAA;
    --very-light-gray: #F1F1F1;
    --main-dark-color: #1d1d30;
    --secondary-dark-color: #313745;
    --selected-color: #148AF6;
    --font-dark-color: #818693;
    --font-color: #ffffff;

    // 长度设置
    --top-height: 59px;
    --page-width: 1494px;
    --page-height: 767px;
}

.Room {
    width: 100%;
    height: 100%;
    // width: 1200px;
    // height: 588px;
    display: flex;
}

.chatBox {
    width: 100%;
    height: 100%;
    background: var(--main-dark-color);
    border-radius: 12px;
    // overflow: hidden; /* 隐藏超出圆角部分的内容 */

    display: grid;
    /* 子元素各占据一列，右侧的元素填充剩余的空间 */
    grid-template-columns: 30% 1fr;
    /* 子元素之间的间距 */
    gap: 10px;


    padding: 10px;
    /* 确保子元素不会超出 */
    box-sizing: border-box;
}

.boxLeft {
    display: grid;
    /* 子元素各占据一行，下侧的元素填充剩余的空间 */
    grid-template-rows: var(--top-height) 1fr;
    /* 子元素之间的间距 */
    gap: 10px;
}

.leftTop {
    // background: #fff;
    /* 垂直居中 */
    display: flex;
    align-items: center;
    flex-direction: row;
    .avatar {
        height: 42px;
        width: 42px;

        cursor: pointer;
        margin-left: calc((var(--top-height) - 42px) / 2);
        margin-right: calc((var(--top-height) - 42px) / 2);
        // background: #000;
        img {
            height: 42px;
            width: 42px;
            border-radius: 50%;
        }
    }

    .username {
        // background: #000;
        span {
            font-size: 20px;
            color: #fff;
        }
    }
}

.leftDown {
    >span {
        margin-left: 10px;
        font-size: 18px;
        color: var(--font-color);
    }
}

.active-user {
    background-color: var(--selected-color) !important;
    // border: 2px solid #ccc;
    // border-radius: 5px;
}

.leftDown .group {
    height: var(--top-height);
    /* 垂直居中 */
    display: flex;
    align-items: center;
    background: var(--secondary-dark-color);
    border-radius: 10px;
    margin: 10px;

    cursor: pointer;
    transition: background-color 0.3s ease;

    img {
        margin-left: calc((var(--top-height) - 35px) / 2);
        margin-right: calc((var(--top-height) - 35px) / 2);
        width: 35px;
        height: 35px;
        // border-radius: 50%;
        // background: #Fff;
    }

    span {
        font-size: 18px;
        color: var(--font-color);
    }
}

.leftDown .ungroup {
    // background: var(--secondary-dark-color);
    // border-radius: 10px;
    margin: 10px;

    display: flex;
    flex-direction: column;

    .userBox {
        cursor: pointer;
        transition: background-color 0.3s ease;
        background: var(--secondary-dark-color);
        height: var(--top-height);
        /* 垂直居中 */
        display: flex;
        align-items: center;
        flex-direction: row;
        margin-bottom: 10px;
        border-radius: 10px;

        // background: #fff;

        .avatar {
            height: 42px;
            width: 42px;
            margin-left: calc((var(--top-height) - 42px) / 2);
            margin-right: calc((var(--top-height) - 42px) / 2);

            img {
                // background: #fff;
                width: 100%;
                height: 100%;
                border-radius: 50%;
            }
        }

        .username {
            // /* 设置为 Flexbox 布局 */
            // display: flex;
            // /* 水平居中 */
            // justify-content: center;
            // /* 垂直居中 */
            // align-items: center;
            // height: 100%;

            // background: #fff;
            span {
                font-size: 18px;
                color: var(--font-color);
            }
        }
    }

    /* 移除最后一个元素的底部间距，保持整体样式一致 */
    .userBox:last-child {
        margin-bottom: 0;
    }

    .nousers {
        background: var(--secondary-dark-color);
        height: var(--top-height);
        /* 水平垂直居中 */
        /* 设置为 Flexbox 布局 */
        display: flex;
        justify-content: center;
        align-items: center;

        // margin-bottom: 10px;
        border-radius: 10px;
        span {
            color: #fff;
            font-size: 20px
        }
    }
}

.leftDown .group:hover {
    background-color: var(--selected-color);
}

.leftDown .ungroup .userBox:hover {
    background-color: var(--selected-color);
}

.boxRight {
    display: grid;
    /* 子元素各占据一列，下侧的元素填充剩余的空间 */
    grid-template-rows: var(--top-height) 1fr;
    /* 子元素之间的间距 */
    gap: 10px;
    .rightDown {
        background: var(--secondary-dark-color);
        border-radius: 12px;
    }
}

.rightTop {
    // background-color: green;
    // background: var(--main-dark-color);

    display: grid;
    /* 子元素各占据一列，右侧的元素填充剩余的空间 */
    grid-template-columns: 30% 1fr;
    /* 子元素之间的间距 */
    gap: 10px;

    /* 子元素之间的间距 */
    .boxName {
        display: flex;
        /* 垂直居中 */
        align-items: center;

        // background: #999;
        padding-left: 10px;
        span {
            color: var(--font-color);
            font-size: 23px;
            // margin-left: calc((var(--top-height) - 45px) / 2);
            // margin-right: calc((var(--top-height) - 45px) / 2);

            // background: #000;
        }

    }

    .function {
        // 右对齐且垂直居中
        display: flex;
        justify-content: flex-end;
        align-items: center;
        // background: #999;
        span {
            font-size: 18px;
            color: var(--font-color);
        }
    }
}

.rightDown {
    display: grid;
    /* 子元素各占据一行，下侧的元素填充剩余的空间 */
    grid-template-rows: 65% 1fr;
    /* 子元素之间的间距 */
    gap: 5px;
    .chatArea {
        // height: 100%;
        height: 324px;
        width: 100%;
        background: var(--secondary-dark-color);
        // background: #fff;
        border-radius: 12px;

        .join {
            text-align: center;
            color: #ccc;
            overflow: auto;
            height: 100%;
            box-sizing: border-box;
            margin: 10px;
            margin-bottom: 10px;
            margin-top: 0;
            padding: 10px 30px 0;
            list-style: none;

            // background: #000;
            li {
                // background-color: #fff;
                padding-bottom: 20px;
            }
        }
        .join::-webkit-scrollbar {
            display: none;
        }
        .my-message {
            display: flex;
            justify-content: flex-end;
            // background: #fff;
            .message {
                display: flex;
                position: relative;
                &::after {
                    content: "";
                    right: 55px;
                    top: 22.5px;
                    transform: translateY(-50%);
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background-color: #91ED61;
                    border-radius: 3px; /* 钝角 */
                    clip-path: polygon(50% 0%, 100% 0%, 100% 50%);
                    transform: translateY(-50%) rotate(45deg); /* 旋转形成钝角 */
                }
                .avatar {
                    width: 45px;
                    height: 45px;
                }
                span {
                    // overflow: auto;
                    box-sizing: border-box;
                    display: block;
                    text-align: justify;
                    border-radius: 5px;
                    // line-height: 30px;
                    background-color: #91ED61;
                    // background: #ffffff;
                    color: #000;
                    padding: 10px;
                    margin-right: 12px;
                    min-width: 0;
                    max-width: 500px;
                    word-wrap: break-word;
                    word-break: break-all;
                    white-space: pre-wrap; /* 保留空白符和换行符 */
                }
            }

            .image {
                display: flex;
                position: relative;
                .file {
                    max-width: 330px;
                    max-height: 170px;
                    margin-right: 12px;
                    cursor: pointer;
                }
                .avatar {
                    width: 45px;
                    height: 45px;
                }
            }
        }
        .other-message {
            position: relative;
            display: flex;
            justify-content: flex-start;
            .message {
                display: flex;
                position: relative;
                // background: #fff;
                &::before {
                    content: "";
                    left: 55px;
                    top: 45px;
                    transform: translateY(-50%);
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background-color: #fff;
                    border-radius: 3px; /* 钝角 */
                    clip-path: polygon(50% 0%, 100% 0%, 100% 50%);
                    transform: translateY(-50%) rotate(-135deg);
                    border: 1px solid #ccc;
                }
                .avatar {
                    width: 45px;
                    height: 45px;
                }
                .username {
                    // width: 100px;
                    position: absolute;
                    left: 58px;
                    font-size: 16px;
                    color: #888;
                    // background: #000;
                    display: inline-block;  /* 让 <p> 标签的宽度自适应内容 */
                    text-align: left;       /* 文本左对齐 */
                    white-space: nowrap;
                }
                .content {
                    margin-top: 24px;
                    margin-left: 12px;
                    border: 1px solid #ccc;

                    box-sizing: border-box;
                    display: block;
                    text-align: justify;
                    border-radius: 5px;
                    background: #fff;
                    color: #000;
                    padding: 10px;
                    margin-right: 12px;
                    min-width: 0;
                    max-width: 500px;
                    word-wrap: break-word;
                    word-break: break-all;
                    white-space: pre-wrap; /* 保留空白符和换行符 */
                }
            }

            .image {
                display: flex;
                position: relative;
                .file {
                    max-width: 330px;
                    max-height: 170px;
                    margin-top: 25px;
                    margin-left: 11px;
                    cursor: pointer;
                }
                .avatar {
                    width: 45px;
                    height: 45px;
                }
                .username {
                    // width: 100px;
                    position: absolute;
                    left: 58px;
                    font-size: 16px;
                    color: #888;
                    // background: #000;
                    display: inline-block;  /* 让 <p> 标签的宽度自适应内容 */
                    text-align: left;       /* 文本左对齐 */
                    white-space: nowrap;
                }
            }
        }
        .my-audio-message {
            display: flex;
            justify-content: flex-end;
            // background: #fff;
            .message {
                display: flex;
                position: relative;
                &::after {
                    content: "";
                    right: 55px;
                    top: 22.5px;
                    transform: translateY(-50%);
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background-color: #91ED61;
                    border-radius: 3px; /* 钝角 */
                    clip-path: polygon(50% 0%, 100% 0%, 100% 50%);
                    transform: translateY(-50%) rotate(45deg); /* 旋转形成钝角 */
                }
                .avatar {
                    width: 45px;
                    height: 45px;
                }
                span {
                    cursor: pointer;
                    box-sizing: border-box;
                    display: block;
                    text-align: justify;
                    border-radius: 5px;
                    // line-height: 30px;
                    background-color: #91ED61;
                    // background: #ffffff;
                    color: #000;
                    padding: 10px;
                    margin-right: 12px;
                    min-width: 0;
                    max-width: 500px;
                    word-wrap: break-word;
                    word-break: break-all;
                    white-space: pre-wrap; /* 保留空白符和换行符 */
                }
            }
        }
        .other-audio-message {
            position: relative;
            display: flex;
            justify-content: flex-start;
            .message {
                display: flex;
                position: relative;
                // background: #fff;
                &::before {
                    content: "";
                    left: 55px;
                    top: 45px;
                    transform: translateY(-50%);
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background-color: #fff;
                    border-radius: 3px; /* 钝角 */
                    clip-path: polygon(50% 0%, 100% 0%, 100% 50%);
                    transform: translateY(-50%) rotate(-135deg);
                    border: 1px solid #ccc;
                }
                .avatar {
                    width: 45px;
                    height: 45px;
                }
                .username {
                    // width: 100px;
                    position: absolute;
                    left: 58px;
                    font-size: 16px;
                    color: #888;
                    // background: #000;
                    display: inline-block;  /* 让 <p> 标签的宽度自适应内容 */
                    text-align: left;       /* 文本左对齐 */
                    white-space: nowrap;
                }
                .content {
                    cursor: pointer;
                    margin-top: 24px;
                    margin-left: 12px;
                    border: 1px solid #ccc;

                    box-sizing: border-box;
                    display: block;
                    text-align: justify;
                    border-radius: 5px;
                    background: #fff;
                    color: #000;
                    padding: 10px;
                    margin-right: 12px;
                    min-width: 0;
                    max-width: 500px;
                    word-wrap: break-word;
                    word-break: break-all;
                    white-space: pre-wrap; /* 保留空白符和换行符 */
                }
            }
        }
    }
    .sendMessage {
        height: 100%;
        width: 100%;
        background: var(--secondary-dark-color);
        // background: yellow;
        border-radius: 12px;

        // 子元素可以此为定位元素
        position: relative;
        // 竖直排列
        display: flex;
        align-items: center;
        flex-direction: column;
        .icon {
            width: 96%;
            height: 30px;
            // background: var(--secondary-dark-color);
            // background: #000;
            /* 设置为 Flexbox 布局 */
            display: flex;
            /* 垂直居中 */
            align-items: center;
            .emoji,
            .shoot,
            .file,
            .audio,
            .video {
                padding: 0 6px;
                cursor: pointer;
                transition: filter 0.3s ease; /* 添加过渡效果 */
                // background: #bbb;
            }
            .emoji {
                width: 28px;
                padding-bottom: 2px;
            }
            .shoot {
                width: 30px;
            }
            .file {
                width: 26px;
                padding-bottom: 0;
            }
            .audio {
                width: 30px;
                padding-bottom: 0;
            }
            .video {
                width: 30px;
            }
            .emoji:hover,
            .shoot:hover,
            .file:hover,
            .audio:hover,
            .video:hover {
                filter: hue-rotate(180deg) saturate(500%) brightness(50%);
                // filter: invert(30%) sepia(100%) saturate(700%) hue-rotate(200deg) brightness(90%) contrast(90%);
            }
            .emoji-box {
                position: absolute;
                display: flex;
                flex-wrap: wrap;
                width: 276px;
                height: 218px;
                overflow: auto;
                top: -218px;
                background-color: #fff;
                border: 1px solid #cccccc;
                outline: none;
                span {
                    padding: 7px;
                    cursor: pointer;
                }
            }
            .audio-box {
                    position: absolute;
                    display: flex;
                    align-items: center;
                    width: 200px;
                    height: 123px;
                    border-radius: 20px;
                    top: -140px;
                    left: 58px;
                    background: #91ED61;
                    flex-direction: column;
                    justify-content: center;
            }
            .audio-box::after {
                position: absolute; /* 伪元素绝对定位 */
                content: ""; /* 伪元素内容为空 */
                display: block; /* 使伪元素作为块级元素显示 */
                background-color: lightblue; /* 示例背景色 */
                top: 108px; /* 放置在父元素的下方 */

                width: 40px;
                height: 40px;
                background-color: #91ED61;
                border-radius: 5px; /* 钝角 */
                clip-path: polygon(50% 0%, 100% 0%, 100% 50%);
                transform: translateY(-50%) rotate(135deg); /* 旋转形成钝角 */
            }
        }
        .icon .video-box {
            z-index: 999;
            display: flex;
            /* 水平居中 */
            justify-content: center;
            /* 垂直居中 */
            align-items: center;

            position: fixed; // 相对于页面定位
            width: 350px;
            height: 600px;
            background: #fff;

            left: calc((var(--page-width) + 100px) / 2);
            top: calc((var(--page-height) - 600px) / 2);
            // cursor: move; /* 鼠标悬停时显示移动光标 */
            .localVideo {
                flex-grow: 1; /* 使视频占据所有可用空间 */
                width: 100%;
                height: 100%;
                object-fit: cover; /* 保持视频内容比例填充容器 */
            }
            .end-video-btn {
                position: absolute;
                width: 50px;
                height: 50px;
                border-radius: 50%;

                right: 160px;
                bottom: 40px;
                z-index: 1000; /* 确保按钮在视频之上 */
            }
        }

        .icon .video-box1 {
            z-index: 999;
            display: flex;
            /* 水平居中 */
            justify-content: center;
            /* 垂直居中 */
            align-items: center;

            position: fixed; // 相对于页面定位
            width: 350px;
            height: 600px;
            background: #fff;

            left: calc((var(--page-width) - 800px) / 2);
            top: calc((var(--page-height) - 600px) / 2);
            // left: 200px;
            .remoteVideo {
                flex-grow: 1; /* 使视频占据所有可用空间 */
                width: 100%;
                height: 100%;
                object-fit: cover; /* 保持视频内容比例填充容器 */
            }
            .end-video-btn {
                position: absolute;
                width: 50px;
                height: 50px;
                border-radius: 50%;

                right: 70px;
                bottom: 40px;
                z-index: 1000; /* 确保按钮在视频之上 */
            }
            .start-video-btn {
                position: absolute;
                width: 55px;
                height: 55px;
                border-radius: 50%;

                right: 220px;
                bottom: 40px;
                z-index: 1000; /* 确保按钮在视频之上 */
            }
        }

        // .icon #localVideo,
        // .icon #remoteVideo {
        //     background: #000;
        //     position: fixed;
        //     z-index: 10;
        //     border: 2px solid white;
        // }

        // .icon #localVideo {
        //     top: 10px;
        //     right: 10px;
        //     width: 225px;
        //     height: 150px;
        // }
        // .icon #remoteVideo {
        //     top: 10px;
        //     right: 245px;
        //     width: 225px;
        //     height: 150px;
        // }

        textarea {
            width: 94%;
            height: 60px;
            // border: none;
            resize: none;
            outline: none;
            font-size: 15px;
            margin-top: 5px;
            padding: 10px;
            background: #424758;
            font-family: 'Microsoft YaHei', sans-serif; /* 设置字体为微软黑体 */
            border-color: transparent;
            border-radius: 12px;
            color: #d6fcfe;

            transition: border-color 0.3s ease;
        }
        textarea::-webkit-scrollbar {
            display: none;
        }
        textarea:hover {
            border-color: #148AF6;
        }

        .send-btn {
            position: absolute;
            width: 120px;
            height: 40px;
            bottom: 8px;
            right: 16px;

            font-size: 16px;
            border-radius: 5px;
            // padding: 4px 10px;
            background-color: #f5f5f5;
            border: 1px solid transparent;

            cursor: pointer;

            /* 设置为 Flexbox 布局 */
            display: flex;
            /* 水平居中 */
            justify-content: center;
            /* 垂直居中 */
            align-items: center;

            background: var(--selected-color);
            transition: background 0.3s ease;
        }
        .send-btn:hover {
            background: #0e5eaa;
        }
    }

}

</style>