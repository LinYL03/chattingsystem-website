<template>
  <div>
    <div class="userContainer">
      <div class="avatarContainer">
        <el-avatar :src="avatar" :size="170"></el-avatar>
        <div class="signature"><span>个性签名：</span>{{ userInfoForm.signature }}</div>
        <el-upload class="avatar-uploader" :action="$apiServer + 'upload?type=1'" :show-file-list="false"
          :on-success="handleAvatarSuccess" :before-upload="beforeuploadButton" :limit="1">
          <img v-if="isUpload" :src="preAvatar" class="avatarImg" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
        <el-button type="primary" class="uploadButton" @click="uploadAvatar">更换头像</el-button>

      </div>
      <div class="userInfoContainer">
        <el-form label-position="top" :model="userInfoForm" ref="userInfoFormRef">
          <el-form-item label="用户名">
            <el-input v-model="userInfoForm.username" :disabled="!isEditing"></el-input>
          </el-form-item>
          <el-form-item label="个性签名">
            <el-input v-model="userInfoForm.signature" :disabled="!isEditing"></el-input>
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
          <el-button type="primary" class="userInfoButton" @click="toggleEdit">
            {{ isEditing ? '保存' : '修改编辑' }}
          </el-button>
        </div>
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
      isEditing: false,
      userInfoForm: {},
    };
  },
  mounted() {
    let userInfo = window.sessionStorage.getItem("userInfo");
    userInfo = JSON.parse(userInfo);
    this.avatar = userInfo.avatar;
    this.userInfoForm = userInfo;
  },
  methods: {
    beforeuploadButton(file) {
      const isJPG1 = file.type === "image/jpeg";
      const isJPG2 = file.type === "image/jpg";
      const isJPG3 = file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG1 && !isJPG2 && !isJPG3) {
        this.$message.error("上传头像图片只能是 JPG 或 PNG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return (isJPG1 || isJPG2 || isJPG3) && isLt2M;
    },
    handleAvatarSuccess(res, file) {
      this.isUpload = true;
      this.preAvatar = URL.createObjectURL(file.raw);
      this.tempUrl = res;
    },
    async uploadAvatar() {
      if (!this.isUpload) {
        return this.$message.warning("请先选择要更换的头像!");
      }
      const { data: res } = await this.$http.post("user/update/avatar", {
        id: this.userInfoForm.id,
        imgUrl: this.tempUrl,
      });
      if (res.code !== 200) {
        return this.$message.error(res.msg);
      }
      this.$message.success(res.msg);
      this.avatar = res.url;
      this.isUpload = false;
      this.userInfoForm.avatar = this.avatar;
      this.$store.commit("setAvatar", this.avatar);
      window.sessionStorage.setItem(
        "userInfo",
        JSON.stringify(this.userInfoForm)
      );
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

        const { data: res } = await this.$http.post(this.$apiServer + "user/update/userinfo", {
          id: this.userInfoForm.id,
          signature: this.userInfoForm.signature,
          sex: this.userInfoForm.sex,
          birthday: this.userInfoForm.birthday,
        });

        if (res.code !== 200) {
          return this.$message.error(res.msg);
        }

        this.$message.success(res.msg);

        // 更新 sessionStorage 中的用户信息
        window.sessionStorage.setItem("userInfo", JSON.stringify(this.userInfoForm));
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
.el-avatar {
  margin: 0 auto;
  margin: 40px 0;
}

.avatar-uploader {
  border: 1px dashed rgb(206, 206, 206);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 170px;
  height: 170px;
  line-height: 170px;
  text-align: center;
}

.avatarImg {
  width: 170px;
  height: 170px;
  display: block;
}

.uploadButton {
  text-align: center;
  margin: 30px auto;
}

.userInfoContainer {
  width: 100%;
  margin: 30px 120px;
}


.avatarContainer {
  width: 170px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 100px;
}

.signature {
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
  text-align: center;
  font-weight: 500;

  span {
    font-size: 16px;
    font-weight: 700;
  }
}


.buttonGroup {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  align-items: center;
}


.userInfoButton {
  // width: 18%;
}
</style>
