export async function copyText(text) {
  const normalizedText = String(text || '').trim()

  if (!normalizedText) {
    throw new Error('Nothing to copy')
  }

  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(normalizedText)
    return
  }

  const textArea = document.createElement('textarea')
  textArea.value = normalizedText
  textArea.setAttribute('readonly', 'readonly')
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
  textArea.style.pointerEvents = 'none'
  document.body.appendChild(textArea)
  textArea.select()

  const copied = document.execCommand('copy')
  document.body.removeChild(textArea)

  if (!copied) {
    throw new Error('Copy failed')
  }
}
