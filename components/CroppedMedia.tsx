'use client'

import { useState, type CSSProperties } from 'react'
import type { MediaCrop } from '@/content/portfolio'
import { isVideoSrc } from '@/lib/media'

/**
 * 按 crop 区域裁剪展示媒体（视频 / GIF / 图片通用）。
 * 读取素材原始宽高比后，容器严格按裁剪区域的真实像素比例裁切，
 * 媒体只做等比放大 + 平移，任何情况下都不会拉伸变形。
 */
export function CroppedMedia({
  src,
  crop,
  className = '',
  style,
}: {
  src: string
  crop: MediaCrop
  className?: string
  style?: CSSProperties
}) {
  const [naturalAspect, setNaturalAspect] = useState<number | null>(null)

  // 容器比例 = 裁剪区域的真实像素比例（宽 / 高）。
  // 素材尺寸读出前先用分数比例近似（瞬间纠正），避免空白闪烁
  const containerAspect = naturalAspect ? (crop.w * naturalAspect) / crop.h : crop.w / crop.h

  // 媒体按宽度等比放大（高度 auto，绝不强制拉伸），
  // 使裁剪区域恰好铺满容器；top/left 以容器百分比平移到裁剪起点
  const mediaStyle: CSSProperties = {
    position: 'absolute',
    left: `${(-crop.x / crop.w) * 100}%`,
    top: `${(-crop.y / crop.h) * 100}%`,
    width: `${100 / crop.w}%`,
    height: 'auto',
    maxWidth: 'none',
  }

  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ aspectRatio: String(containerAspect), ...style }}>
      {isVideoSrc(src) ? (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          onLoadedMetadata={(event) => setNaturalAspect(event.currentTarget.videoWidth / event.currentTarget.videoHeight)}
          style={mediaStyle}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          onLoad={(event) => setNaturalAspect(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)}
          style={mediaStyle}
        />
      )}
    </div>
  )
}
