<!-- 功能：展示用户信息、修改昵称、更换头像、修改登录密码，权限无需控制，所有登录用户可访问 -->
 <template>
  <div class="profile-page p-6">
    <el-row :gutter="20">
      <!-- 左侧个人信息卡片 -->
      <el-col span="8">
        <el-card shadow="hover">
          <div class="avatar-wrap flex flex-col items-center py-4">
            <el-avatar :size="120" class="mb-4">{{ userInfo.nickname.slice(0,1) }}</el-avatar>
            <h2 class="text-xl font-medium">{{ userInfo.nickname }}</h2>
            <p class="text-gray-500 mt-1">账号：{{ userInfo.username }}</p>
          </div>
          <el-divider />
          <div class="info-item flex justify-between py-2">
            <span class="text-gray-500">用户ID</span>
            <span>{{ userInfo.id }}</span>
          </div>
          <div class="info-item flex justify-between py-2">
            <span class="text-gray-500">登录账号</span>
            <span>{{ userInfo.username }}</span>
          </div>
          <div class="info-item flex justify-between py-2">
            <span class="text-gray-500">创建时间</span>
            <span>{{ userInfo.createTime }}</span>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧操作面板 -->
      <el-col span="16">
        <el-card shadow="hover" class="mb-6">
          <template #header>
            <span class="font-medium">基础资料修改</span>
          </template>
          <el-form :model="baseForm" label-width="100px">
            <el-form-item label="用户昵称">
              <el-input v-model="baseForm.nickname" placeholder="请输入昵称"></el-input>
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="baseForm.phone" placeholder="请输入手机号"></el-input>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="baseForm.remark" type="textarea" rows="3"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updateBaseInfo">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="hover">
          <template #header>
            <span class="font-medium">修改登录密码</span>
          </template>
          <el-form :model="pwdForm" label-width="100px" ref="pwdRef">
            <el-form-item label="原密码" prop="oldPwd">
              <el-input v-model="pwdForm.oldPwd" show-password placeholder="请输入原密码"></el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="newPwd">
              <el-input v-model="pwdForm.newPwd" show-password placeholder="请输入新密码"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPwd">
              <el-input v-model="pwdForm.confirmPwd" show-password placeholder="再次输入新密码"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updatePwd">确认修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { useUserStore } from '@/store/user'
import { updateProfile, updatePassword } from '@/api/system/profile'

const userStore = useUserStore()
const userInfo = ref(userStore.userInfo)
const pwdRef = ref<FormInstance>()

// 基础资料表单
const baseForm = reactive({
  nickname: '',
  phone: '',
  remark: ''
})

// 密码表单
const pwdForm = reactive({
  oldPwd: '',
  newPwd: '',
  confirmPwd: ''
})

// 页面加载赋值
onMounted(() => {
  baseForm.nickname = userInfo.value.nickname
  baseForm.phone = userInfo.value.phone || ''
  baseForm.remark = userInfo.value.remark || ''
})

// 修改基础信息
const updateBaseInfo = async () => {
  await updateProfile(baseForm)
  ElMessage.success('资料修改成功')
  // 更新store用户信息
  userStore.userInfo.nickname = baseForm.nickname
  userStore.userInfo.phone = baseForm.phone
  userInfo.value = { ...userStore.userInfo }
}

// 修改密码
const updatePwd = async () => {
  await pwdRef.value?.validate()
  if (pwdForm.newPwd !== pwdForm.confirmPwd) {
    ElMessage.warning('两次新密码输入不一致')
    return
  }
  await updatePassword(pwdForm)
  ElMessage.success('密码修改成功，请重新登录')
  // 密码修改完成直接退出登录
  userStore.logout()
}
</script>

<style scoped>
.avatar-wrap {
  padding: 20px 0;
}
.info-item {
  font-size: 14px;
}
</style>