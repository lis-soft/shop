const languages = {
  'zh-cn': require('./zh-cn'),
  'ja-jp': require('./ja-jp'),
  'en-us': require('./en-us')
}

const defaultLang = 'en-us'
const langMap = {
  zh: 'zh-cn',
  'zh-cn': 'zh-cn',
  'zh-hans': 'zh-cn',
  ja: 'ja-jp',
  'ja-jp': 'ja-jp',
  en: 'en-us',
  'en-us': 'en-us',
  'en-gb': 'en-us'
}

function normalizeLanguage(acceptLanguage = defaultLang) {
  if (!acceptLanguage || typeof acceptLanguage !== 'string') {
    return defaultLang
  }

  const lang = acceptLanguage.split(',')[0].toLowerCase().trim()
  const supportedLangs = Object.keys(languages)

  if (supportedLangs.includes(lang)) return lang
  if (langMap[lang]) return langMap[lang]

  const langPrefix = lang.split('-')[0]
  if (langMap[langPrefix]) return langMap[langPrefix]

  return defaultLang
}

function t(key, lang = defaultLang, params = {}) {
  if (!key || typeof key !== 'string') {
    return key
  }
  
  const langPack = languages[lang] || languages[defaultLang]
  let translation = langPack[key] || key
  
  if (params && typeof params === 'object' && Object.keys(params).length > 0) {
    Object.keys(params).forEach(param => {
      const regex = new RegExp(`\\{${param}\\}`, 'g')
      translation = translation.replace(regex, params[param])
    })
  }
  
  return translation
}

module.exports = {
  t,
  languages,
  defaultLang,
  langMap,
  normalizeLanguage
} 
