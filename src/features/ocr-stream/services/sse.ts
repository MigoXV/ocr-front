export async function consumeSSE(stream: ReadableStream<Uint8Array>, onContent: (text: string) => void) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let pending = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    pending += decoder.decode(value, { stream: true })

    const blocks = pending.split('\n\n')
    pending = blocks.pop() ?? ''

    for (const block of blocks) {
      for (const line of block.split('\n')) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (!data || data === '[DONE]') continue
        try {
          const payload = JSON.parse(data)
          const content: string | undefined = payload?.choices?.[0]?.delta?.content
          if (content) onContent(content)
        } catch {
          // Ignore malformed chunk.
        }
      }
    }
  }
}
