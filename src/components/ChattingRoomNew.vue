<template>
    <div class="chatRoom" ref="room">
        <div class="chatBox">
            <div class="boxLeft">
                <div class="leftTop"><span>#网络即时通讯</span></div>
                <div class="leftDown">
                    <span>聊天列表</span>
                    <div class="group" @click="chooseGroup" :class="{'active-user': isGroup}">
                        <img src="../assets/picture/ChatforGroup.svg" alt="" />
                        <span>群聊</span>
                    </div>
                    <span>当前在线用户</span>
                    <div class="ungroup">
                        <div class="userBox" v-for="(item, index) in userList" :key="index" v-if="item.username !== user.username" @click="chooseUser(item, index)" :class="{'active-user': activeElement === index && isGroup === false}">
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
                    <div class="function"><span>其他功能</span></div>
                </div>
                <div class="rightDown">
                    <div class="chatArea">
                        <ul class="join" ref="joinUs">
                            <li v-for="(item1, index) in messageContent"
                            :key="index"
                            :class="{
                                'my-message': item1.type === 1 ? true : false,
                                'other-message': item1.type === 2 ? true : false,}">
                                <div v-if="item1.type === 3">欢迎{{ item1.username }}加入聊天室</div>
                                <div v-if="item1.type === 4">{{ item1.username }}离开了聊天室</div>
                                <div v-if="item1.type === 1">
                                    <img :src="item1.file" alt class="file" v-if="item1.file" @load="loadOverImg" preview="1" />
                                    <span v-else>{{ item1.msg }}</span>
                                    <img :src="item1.avatar" class="avatar" />
                                </div>
                                <div v-if="item1.type === 2">
                                    <img :src="item1.avatar" alt class="avatar" />
                                    <span class="username">{{ item1.username }}</span>
                                    <img :src="item1.file" alt class="file" v-if="item1.file" @load="loadOverImg" preview="1" />
                                    <span class="content" v-else>{{ item1.msg }}</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="sendMessage">
                        <div class="icon">
                            <span class="iconfont icon-smile" @click="emojiShow = !emojiShow"></span>
                            <div class="emoji" tabindex="1" v-show="emojiShow" @blur="handleEmojiBlur">
                                <span v-for="item in emojiList" :key="item.codes" @click="handleEmoji(item)">{{ item.char }}</span>
                            </div>
                            <label class="iconfont icon-Path" for="file"></label>
                            <input type="file" style="display: none" id="file" @change="handleFile" />
                            <span class="iconfont icon-jietu" @click="handleCanvas"></span>
                            <!-- <img src="../assets/picture/emoji.svg" alt="">
                            <img src="../assets/picture/shoot.svg" alt="">
                            <img src="../assets/picture/file.svg" alt=""> -->
                        </div>
                        <textarea cols="80" rows="5" ref="textarea" @keydown.enter="handlePress"></textarea>
                        <button @click="sendContentToServe">发送</button>
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
            imgUrl: "", // 图片或截图
            isGroup: true, // 是否是群聊
            active: null, // 当前聊天用户
            username: null, // 当前聊天用户名
            activeElement: null, // 用来追踪用户列表中当前被选中的元素
        };
    },
    computed: {
        userListLength() {
            return this.userList.length;
        },
    },
    mounted() {
        this.emojiList = emoji;
        this.userList.forEach((val, i) => {
            this.oneContent[i] = [];
        });
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
            html2canvas(room).then((canvas) => {
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
            //发送给服务器
            this.$emit("sendServer", this.content, this.isGroup);
            let msg = this.content;
            if (!this.isGroup) {
                this.oneContent.push({ ...this.user, msg, type: 1 });
            }
        },
        // 分类显示聊天窗口中的内容
        handleMessageBox(newValue) {
            // 群组消息
            if (this.isGroup) {
                if (newValue.username === this.user.username) {
                    //是自己发的信息
                    this.groupContent.push({ ...newValue, type: 1 });
                } else {
                    //是别人发的信息
                    this.groupContent.push({ ...newValue, type: 2 });
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
                this.oneContent.push({ ...newValue, type: 2 });
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
}

.chatRoom {
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
    margin-left: 10px;
    font-size: 18px;
    color: var(--font-color);
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
            div {
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
        }
        .other-message {
            position: relative;
            display: flex;
            justify-content: flex-start;
            div {
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
                .file {
                    max-width: 330px;
                    max-height: 170px;
                    margin-top: 15px;
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
            background: var(--secondary-dark-color);
            // background: #eee;
            /* 设置为 Flexbox 布局 */
            display: flex;
            /* 垂直居中 */
            align-items: center;
            .icon-smile,
            .icon-Path,
            .icon-jietu {
                font-size: 20px;
                padding: 0 6px;
                cursor: pointer;
            }
            .icon-jietu {
                font-size: 23px !important;
            }
            .emoji {
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
        }

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

        button {
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
        button:hover {
            background: #0e5eaa;
        }
        textarea:hover {
            border-color: #148AF6;
        }
    }

}

</style>