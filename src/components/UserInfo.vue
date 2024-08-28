<template>
  <div class="userinfo">
    <div class="card">
      <div class="menu">
        <div class="menu-item" :class="{ active: activeIndex === '1' }" @click="handleSelect('1')">个人资料</div>
        <div class="menu-item" :class="{ active: activeIndex === '2' }" @click="handleSelect('2')">账号安全</div>
        <!-- <div class="menu-item" :class="{ active: activeIndex === '3' }" @click="handleSelect('3')">我的消息</div> -->

        <img src="../assets/img/返回.png" class="back imgback" @click="handleBack">
      </div>

      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: "1",
    };
  },
  mounted() {
    this.getRoutePath();
  },
  updated() {
    this.getRoutePath();
  },
  methods: {
    handleSelect(key) {
      switch (key) {
        case "1":
          if (this.activeIndex === "1") return;
          this.$router.push("/userinfo/1");
          break;
        case "2":
          if (this.activeIndex === "2") return;
          this.$router.push("/userinfo/2");
          break;
      }
    },
    getRoutePath() {
      const path = this.$route.path;
      if (path === "/userinfo/1") {
        this.activeIndex = "1";
      } else if (path === "/userinfo/2") {
        this.activeIndex = "2";
      }
    },
    handleBack() {
      this.$router.push("/chat");
    },
  },
};
</script>

<style lang="less" scoped>
.userinfo {
  width: 100%;
  height: 96.2%;
  background-image: url('../assets/picture/下雨.gif');
  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: fixed;
  object-fit: cover;
  padding-top: 30px;
}

.card {
  width: 75%;
  margin: 0 auto;
  background: #1d1d3099;
  position: fixed;
  border: 1px solid #182b57;
  border-radius: 20px;
  padding: 20px;
  margin-left: 180px;
}

.menu {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  background: #44474e73;
  border-radius: 10px;
  padding: 10px;
  border-bottom: solid 1px #5e5959;
}

.menu-item {
  font-size: 16px;
  color: #fff;
  cursor: pointer;
  padding: 10px 15px;
  transition: all 0.3s ease;
  margin-right: 20px;
}

.menu-item.active {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.back {
  margin-left: auto;
  cursor: pointer;
}

.imgback {
  width: 30px;
  height: 30px;
  margin-right: 20px;
  transition: transform 0.3s ease;
}

.imgback:hover {
  transform: scale(1.1);
}
</style>
