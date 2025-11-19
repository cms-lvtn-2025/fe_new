import { useState } from 'react'

interface UseGoogleTranslateResult {
  translate: (text: string, sourceLang?: string, targetLang?: string) => Promise<string>
  translating: boolean
  error: string | null
}

/**
 * Hook để dịch văn bản sử dụng Google Translate API (free tier)
 * Sử dụng MyMemory Translation API (free, không cần API key)
 */
export function useGoogleTranslate(): UseGoogleTranslateResult {
  const [translating, setTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const translate = async (
    text: string,
    sourceLang: string = 'vi',
    targetLang: string = 'en'
  ): Promise<string> => {
    if (!text.trim()) {
      return ''
    }

    setTranslating(true)
    setError(null)

    try {
      // Sử dụng MyMemory Translation API (free, không cần API key)
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.responseStatus === 200 && data.responseData) {
        setTranslating(false)
        return data.responseData.translatedText
      } else {
        throw new Error('Translation failed')
      }
    } catch (err: any) {
      console.error('Translation error:', err)
      setError(err.message || 'Lỗi khi dịch văn bản')
      setTranslating(false)

      // Fallback: trả về text gốc nếu có lỗi
      return text
    }
  }

  return {
    translate,
    translating,
    error,
  }
}
