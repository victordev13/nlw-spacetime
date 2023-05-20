'use client'

import { ChangeEvent, useState } from 'react'

type FileType = 'image' | 'video'

type Preview = {
  url: string
  type: FileType
}

export default function MediaPicker() {
  const [preview, setPreview] = useState<Preview | null>(null)

  function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.target

    if (!files) {
      return
    }

    const file = files[0]
    const type = file.type.split('/')[0]
    if (!['image', 'video'].includes(type)) {
      alert('invalid file type')
      return
    }

    const previewURL = URL.createObjectURL(file)
    setPreview({
      url: previewURL,
      type: type as FileType,
    })
  }

  return (
    <>
      <input
        type="file"
        id="media"
        name="coverUrl"
        className="hidden"
        accept="image/*, video/*"
        onChange={onFileSelected}
      />
      {preview &&
        (preview.type === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview.url}
            alt=""
            className="aspect-video w-full rounded-lg object-cover"
          />
        ) : (
          <video
            src={preview.url}
            controls
            className="aspect-video w-full rounded-lg object-cover"
            autoPlay
          />
        ))}
    </>
  )
}
