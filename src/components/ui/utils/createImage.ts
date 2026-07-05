const createBlobFromBase64 = (imgUrl: string) => {
  try {
    const base64Data = imgUrl.split(",")[1] // Удаляем префикс "data:image/..."
    const binaryStr = atob(base64Data)
    const bytes = new Uint8Array(binaryStr.length)

    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }

    return new Blob([bytes], { type: "image/webp" })
  } catch (error) {
    throw new Error("Base64 conversion failed")
  }
}

const createImage = async (
  file: File,
): Promise<
  | {
      response: Blob
      error?: undefined
    }
  | {
      response?: undefined
      error: number
    }
> => {
  // Проверка типа файла
  if (!file.type.match(/image.*/) || !file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return { error: 1 }
  }

  return await new Promise<
    | {
        response: Blob
        error?: undefined
      }
    | {
        response?: undefined
        error: number
      }
  >((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => {
      console.error("Failed to read file")
      resolve({ error: 2 })
    }

    reader.onload = (event) => {
      if (!event.target?.result || typeof event.target.result !== "string") {
        console.error("Invalid file data")
        resolve({ error: 3 })
        return
      }

      const imgUrl = URL.createObjectURL(createBlobFromBase64(event.target.result))
      const img = new Image()

      img.onerror = () => {
        console.error("Failed to load image")
        resolve({ error: 4 })
      }

      img.onload = () => {
        let width = img.width
        let height = img.height

        const maxWidth = 1000
        const maxHeight = 1000

        let ratio = 1
        if (width > maxWidth) {
          ratio = maxWidth / width
        }
        if (height > maxHeight) {
          ratio = Math.min(ratio, maxHeight / height)
        }

        width *= ratio
        height *= ratio

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          console.error("Could not get canvas context")
          resolve({ error: 5 })
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(imgUrl)
            resolve(blob ? { response: blob } : { error: 6 })
          },
          "image/webp",
          1,
        )
      }

      img.src = imgUrl
    }

    reader.readAsDataURL(file)
  })
}

export default createImage
