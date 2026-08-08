let watermarkDom: HTMLElement | null = null
let observer: MutationObserver | null = null

export function setWatermark(text: string) {
  removeWatermark()

  const canvas = document.createElement('canvas')
  canvas.width = 220
  canvas.height = 140
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.rotate(-22 * Math.PI / 180)
  ctx.font = '14px Microsoft YaHei'
  ctx.fillStyle = 'rgba(180,180,180,0.22)'
  ctx.fillText(text, 20, 100)

  watermarkDom = document.createElement('div')
  watermarkDom.style.position = 'fixed'
  watermarkDom.style.zIndex = '9999'
  watermarkDom.style.pointerEvents = 'none'
  watermarkDom.style.top = '0'
  watermarkDom.style.left = '0'
  watermarkDom.style.width = '100%'
  watermarkDom.style.height = '100%'
  watermarkDom.style.backgroundImage = `url(${canvas.toDataURL()})`
  document.body.appendChild(watermarkDom)

  observer = new MutationObserver(() => {
    if (!document.body.contains(watermarkDom!)) {
      setWatermark(text)
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

export function removeWatermark() {
  // 断开监听，防止内存泄漏
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (watermarkDom) {
    watermarkDom.remove()
    watermarkDom = null
  }
}