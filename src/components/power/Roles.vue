<template>
  <div>
    <!-- breadcrumb navigator -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- Card Area -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">ADD</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe="">
        <!-- Expand Area -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bd-bottom', i1 === 0 ? 'bd-top' : '', 'vcenter']"
            >
              <!-- Render First Level right -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removedRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- Render Second Level right -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bd-top', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removedRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>

                  <el-col :span="18">
                    <el-tag
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removedRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button size="mini" type="danger" icon="el-icon-delete"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
            <!--  Assign Permission dialog box-->
            <el-dialog
              title="分配权限"
              :visible="setRightDialogVisible"
              width="50%"
              @close="setRightDialogClosed"
            >
              <el-tree
                :data="rightsList"
                :props="treeProps"
                show-checkbox
                node-key="id"
                default-expand-all
                :default-checked-keys="defaultKeys"
                ref="treeRef"
              ></el-tree>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="setRightDialogVisible = false"
                    >取 消</el-button
                  >
                  <el-button type="primary" @click="allotRights"
                    >确 定</el-button
                  >
                </span>
              </template>
            </el-dialog>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      setRightDialogVisible: false,
      rightsList: [],
      treeProps: {
        children: 'children',
        label: 'authName',
      },
      defaultKeys: [],
      roleId: '',
    }
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200)
        return this.$message.error('Failed to get Role List')
      this.roleList = res.data
    },

    removedRightById(role, rightId) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `roles/${role.id}/rights/${rightId}`
          )
          if (res.meta.status !== 200)
            return this.$message.error('Failed to delete the Right')
          role.children = res.data
          this.$message({
            type: 'success',
            message: '删除成功!',
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },

    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200)
        return this.$message.error('Failed to get Rights')
      this.rightsList = res.data
      this.setRightDialogClosed()
      this.getLeafKeys(role, this.defaultKeys)
      this.setRightDialogVisible = true
    },

    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach((item) => this.getLeafKeys(item, arr))
    },

    setRightDialogClosed() {
      this.defaultKeys = []
    },

    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200)
        return this.$message.error('Failed to Edit Right')
      this.getRoleList()
      this.$message.success('Success to Edit Right')
      this.setRightDialogVisible = false
    },
  },
  created() {
    this.getRoleList()
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bd-top {
  border-top: 1px solid #eee;
}

.bd-bottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
