<template>
  <div>
    <div class="userContainer">
      <div class="avatarContainer">
        <el-avatar :src="avatar" :size="170"></el-avatar>
        <div class="signature"><span>个性签名：</span>
          {{ userInfoForm.signature }}</div> <!-- 个性签名展示 -->
      </div>
      <div class="userInfoContainer">
        <el-form label-position="top" :model="userInfoForm" ref="userInfoFormRef">
          <el-form-item label="用户名">
            <el-input v-model="userInfoForm.username" :disabled="!isEditing"></el-input>
          </el-form-item>
          <el-form-item label="个性签名">
            <el-input v-model="userInfoForm.signature" prefix-icon="iconfont icon-qianming"
              :disabled="!isEditing"></el-input>
          </el-form-item>
          <el-form-item label="性别">
            <el-radio :label="1" v-model="userInfoForm.sex" :disabled="!isEditing">男</el-radio>
            <el-radio :label="2" v-model="userInfoForm.sex" :disabled="!isEditing">女</el-radio>
          </el-form-item>
          <el-form-item label="生日">
            <el-date-picker type="date" v-model="userInfoForm.birthday" style="width: 100%"
              :disabled="!isEditing"></el-date-picker>
          </el-form-item>
        </el-form>
        <div class="buttonGroup">
          <el-button type="primary" class="uploadButton" @click="triggerUpload">
            更新头像
          </el-button>
          <el-button type="primary" class="userInfoButton" @click="toggleEdit">
            {{ isEditing ? '保存' : '修改编辑' }}
          </el-button>
        </div>
        <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleFileChange" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      avatar: "",
      preAvatar: "",
      isUpload: false,
      tempUrl: "",
      userInfoForm: {},
      isEditing: false, // 是否处于编辑状态
    };
  },
  mounted() {
    let userInfo = window.sessionStorage.getItem("userInfo");
    userInfo = JSON.parse(userInfo);
    this.avatar = userInfo.avatar;
    this.userInfoForm = userInfo;
  },
  methods: {
    triggerUpload() {
      this.$refs.fileInput.click(); // 触发文件选择框
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      const isJPG1 = file.type === "image/jpeg";
      const isJPG2 = file.type === "image/jpg";
      const isJPG3 = file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG1 && !isJPG2 && !isJPG3) {
        this.$message.error("上传头像图片只能是 JPG 或 PNG 格式!");
        return;
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
        return;
      }

      this.uploadAvatar(file);
    },
    async uploadAvatar(file) {
      const formData = new FormData();
      formData.append('file', file);

      const { data: res } = await this.$http.post(this.$apiServer + 'upload?type=1', formData);

      if (res.code !== 200) {
        return this.$message.error(res.msg);
      }

      this.$message.success(res.msg);
      this.avatar = res.url;
      this.userInfoForm.avatar = this.avatar;
      this.$store.commit("setAvatar", this.avatar);
      window.sessionStorage.setItem("userInfo", JSON.stringify(this.userInfoForm));
    },
    toggleEdit() {
      if (this.isEditing) {
        this.updateUserInfo();
      }
      this.isEditing = !this.isEditing;
    },
    updateUserInfo() {
      this.$refs.userInfoFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("user/update/userinfo", {
          id: this.userInfoForm.id,
          signature: this.userInfoForm.signature,
          sex: this.userInfoForm.sex,
          birthday: this.userInfoForm.birthday,
        });
        if (res.code !== 200) {
          return this.$message.error(res.msg);
        }
        this.$message.success(res.msg);
        window.sessionStorage.setItem(
          "userInfo",
          JSON.stringify(this.userInfoForm)
        );
      });
    },
  },
};
</script>

<style lang="less" scoped>
.userContainer {
  display: flex;
  justify-content: space-around;
}

.avatarContainer {
  width: 170px;
  display: flex;
  flex-direction: column;
  align-items: center;
      margin: 80px;
}

.el-avatar {
  margin: 0 auto;
  margin: 40px 0;
}

.signature {
  margin-bottom: 20px;
  font-size: 16px;
  color: #666;
  text-align: center;
  font-weight: 500;
  span{
  font-size: 16px;
  font-weight: 700;
  }
}

.userInfoContainer {
  width: 100%;
  margin: 30px 120px;
}

.buttonGroup {
    display: flex;
      justify-content: center;
      margin-top: 20px;
      align-items: center;
}

.uploadButton,
.userInfoButton {
  width: 18%;
}
</style>
