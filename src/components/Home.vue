<template>
  <el-container class="home_container">
    <!-- Header -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>OS Management System</span>
      </div>
      <el-button type="info" @click="logout">Logout</el-button>
    </el-header>
    <el-container>
      <!-- Aside -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- toggle button -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          :uniqueOpened="true"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#409EFF"
          :collapse="isCollapse"
          :collapse-transition="false"
        >
          <!-- First level menu -->
          <el-submenu
            :index="item.id + {}"
            v-for="item in menuList"
            :key="item.id"
          >
            <template #title>
              <i :class="iconsObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- Second level menu -->
            <el-menu-item
              :index="subItem.id + {}"
              v-for="subItem in item.children"
              :key="subItem.id"
            >
              <template #title>
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- Main -->
      <el-main>Main</el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao',
      },
      isCollapse: false,
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.replace('/login')
    },

    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    //toggle collapse and expansion of the sidebar
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
  },
  created() {
    this.getMenuList()
  },
}
</script>

<style lang='less' scoped>
.home_container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4a5064;
  color: #fff;
  font-size: 10px;
  line-height: 24px;
  letter-spacing: 0.2em;
  text-align: center;
  cursor: pointer;
}
</style>
