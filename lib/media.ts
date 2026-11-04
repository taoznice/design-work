/** 判断素材路径是否为视频文件（用于在 img / video 之间切换渲染） */
export function isVideoSrc(src: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(src)
}
