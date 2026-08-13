//真实开发由后端实现；mock 只做前端页面交互演示，不会真保存文件。
export default [
  {
    url: '/api/upload/check',
    method: 'post',
    response: () => {
      return { code: 200, data: { uploadedChunkIndex: [] } }
    }
  },
  {
    url: '/api/upload/chunk',
    method: 'post',
    response: () => {
      return { code: 200, msg: '分片上传成功' }
    }
  },
  {
    url: '/api/upload/merge',
    method: 'post',
    response: () => {
      return { code: 200, msg: '分片合并完成' }
    }
  }
]