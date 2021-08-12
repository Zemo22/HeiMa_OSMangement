<template>
  <div>
    <!-- breadcrumb navigator -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Cart View Area -->
    <el-card class="box-card">
      <!-- Add and Search Area -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <template #append>
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="getUserList"
              ></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >ADD</el-button
          >
        </el-col>
      </el-row>

      <!-- Table Area -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="Name" prop="username"> </el-table-column>
        <el-table-column label="Mail" prop="email"> </el-table-column>
        <el-table-column label="Phone" prop="mobile"> </el-table-column>
        <el-table-column label="Role" prop="role_name"> </el-table-column>
        <el-table-column label="Status">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column label="Operation" width="180px">
          <template slot-scope="scope">
            <!-- Edit -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- Delete -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              @click="removedUserById(scope.row.id)"
            ></el-button>
            <!-- Assign -->
            <el-tooltip
              effect="dark"
              content="Assign Roles"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="small"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- Pagination Area -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- Dialog for Adding User -->
    <el-dialog
      title="ADD User"
      :visible="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- Content Area -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item label="Username" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="Mail" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="Mobile" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- Footer Area -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Dialog for Edit User -->
    <el-dialog title="Edit User" :visible="editDialogVisible" width="50%">
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
        @close="editDialogClosed"
      >
        <el-form-item label="Username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="mobile" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Dialog for assign Role -->
    <el-dialog
      title="Assign Role"
      :visible="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>Usernaem:{{ userInfo.username }}</p>
        <p>Role:{{ userInfo.role_name }}</p>
        <p>
          Assign New Role:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }

      cb(new Error('请输入合法的邮箱'))
    }

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }

    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2,
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      //Form data to add new user
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      addFormRules: {
        username: [
          { required: true, message: 'Input the Username', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: 'The Username must be in 3 to 10 char',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: 'Input the Password', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: 'The Password must be in 6 to 15 char',
            trigger: 'blur',
          },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      //Form data for edit user
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      setRoleDialogVisible: false,
      userInfo: {},
      roleList: [],
      selectedRoleId: '',
    }
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })

      if (res.meta.status !== 200)
        return this.$message.error('Failed to get User List')

      this.userList = res.data.users
      console.log(this.userList)
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // Listen the status button
    async userStateChange(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.status}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_status = !userInfo.mg_status
        return this.$message.error('Failed to change status')
      }
      this.$message.success('Success to change the status')
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //ClickEvent for adding new User
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        console.log('----')
        if (!valid) return

        const { data: res } = await this.$http.post('users', this.addForm)

        if (res.meta.status !== 201) {
          return this.$message.error('Failed to add new user')
        }
        this.$message.success('Success to add new user')
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('Failed to edit')
      }
      this.editDialogVisible = true
      this.editForm = res.data
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        )
        if (res.meta.status !== 200)
          return this.$message.error('Failed to edit user')
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success('Success to edit user')
      })
    },
    async removedUserById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该User, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const { data: res } = await this.$http.delete('users/' + id)
          if (res.meta.status !== 200)
            return this.$message.error('Failed to delete user')
          this.$message({
            type: 'success',
            message: '删除成功!',
          })
          this.getUserList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })

      console.log(confirmResult)
    },
    async setRole(userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$http.get(`roles`)
      if (res.meta.status !== 200)
        return this.$message.error('Failed to Get Role')
      this.roleList = res.data
      console.log(this.roleList)
      this.setRoleDialogVisible = true
    },
    async saveRoleInfo() {
      if (!this.selectedRoleId)
        return this.$message.error('Failed to Edit Role1')
      console.log(this.selectedRoleId)
      console.log(this.userInfo.id)
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId,
        }
      )
      console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('Failed to Edit Role2')

      this.$message.success('Successed to Edit Role')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    },
  },
  created() {
    this.getUserList()
  },
}
</script>

<style lang='less' scoped>
</style>
