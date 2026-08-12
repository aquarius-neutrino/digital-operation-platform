<template>
  <div class="virtual-table-wrap">
    <el-table
      ref="tableRef"
      :data="virtualList"
      border
      stripe
      :height="tableHeight"
      v-bind="$attrs"
    >
      <slot />
    </el-table>
    <div class="pagination-wrap mt-4 flex justify-end" v-if="showPagination">
      <el-pagination
        v-model:current-page="pageInfo.pageNum"
        v-model:page-size="pageInfo.pageSize"
        :total="pageInfo.total"
        :page-sizes="[20,50,100,200]"
        layout="total, sizes, prev, pager, next, jumper"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import type { ElTable } from 'element-plus'
import { debounce } from '@/utils/common'

interface Props {
  sourceList: any[]
  tableHeight?: string
  rowHeight?: number
  showPagination?: boolean
  pageInfo?: {
    pageNum: number
    pageSize: number
    total: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  tableHeight: '600px',
  rowHeight: 54,
  showPagination: false,
  pageInfo: () => ({
    pageNum: 1,
    pageSize: 100,
    total: 0
  })
})

const emit = defineEmits(['page-change'])
const tableRef = ref<InstanceType<typeof ElTable>>()
const scrollTop = ref(0)
const isMount = ref(false)
const visibleCount = computed(() => Math.ceil(Number(props.tableHeight.slice(0,-2)) / props.rowHeight) + 4)

const virtualList = computed(() => {
  if (!isMount.value) return []
  const startIndex = Math.floor(scrollTop.value / props.rowHeight)
  const endIndex = startIndex + visibleCount.value
  return props.sourceList.slice(startIndex, endIndex)
})

const handleScroll = debounce(() => {
  if (!tableRef.value) return
  const scrollDom = tableRef.value.$el.querySelector('.el-table__body-wrapper')
  if (!scrollDom) return
  scrollTop.value = scrollDom.scrollTop
}, 300)

const handlePageChange = () => {
  emit('page-change', props.pageInfo)
  scrollTop.value = 0
  nextTick(() => {
    const scrollDom = tableRef.value?.$el.querySelector('.el-table__body-wrapper')
    if (scrollDom) scrollDom.scrollTop = 0
  })
}

onMounted(() => {
  nextTick(() => {
    isMount.value = true
    const scrollDom = tableRef.value?.$el.querySelector('.el-table__body-wrapper')
    if (scrollDom) {
      scrollDom.addEventListener('scroll', handleScroll)
      scrollTop.value = scrollDom.scrollTop
    }
  })
})
</script>

<style scoped>
.virtual-table-wrap {
  width: 100%;
}
.pagination-wrap {
  padding: 0 8px;
}
</style>