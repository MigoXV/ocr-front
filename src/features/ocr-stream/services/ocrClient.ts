export async function requestOcrStream(apiBase: string, imageDataUrl: string) {
  const response = await fetch(`${apiBase}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-ocr2',
      stream: true,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'OCR this image.' },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
    }),
  })

  if (!response.ok || !response.body) {
    throw new Error(`OCR request failed: ${response.status}`)
  }

  return response.body
}
