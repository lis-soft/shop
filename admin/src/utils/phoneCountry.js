import { getCountries, getCountryCallingCode } from 'libphonenumber-js'

const DEFAULT_COUNTRY_ISO = 'SG'

const regionNames = typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function'
  ? new Intl.DisplayNames(['en'], { type: 'region' })
  : null

export const COUNTRY_OPTIONS = getCountries()
  .map(iso => ({
    iso,
    name: regionNames?.of(iso) || iso,
    dialCode: `+${getCountryCallingCode(iso)}`
  }))
  .sort((left, right) => left.name.localeCompare(right.name))

const COUNTRY_OPTIONS_BY_ISO = new Map(COUNTRY_OPTIONS.map(country => [country.iso, country]))
const DIAL_CODE_MATCHERS = [...COUNTRY_OPTIONS].sort((left, right) => right.dialCode.length - left.dialCode.length)

export function getDefaultCountryIso() {
  return DEFAULT_COUNTRY_ISO
}

export function getCountryByIso(iso) {
  return COUNTRY_OPTIONS_BY_ISO.get(iso) || COUNTRY_OPTIONS_BY_ISO.get(DEFAULT_COUNTRY_ISO) || COUNTRY_OPTIONS[0]
}

export function splitStoredPhone(phone, defaultIso = DEFAULT_COUNTRY_ISO) {
  const rawPhone = String(phone || '').trim()
  if (!rawPhone) {
    return {
      countryIso: defaultIso,
      phoneNumber: '',
      hasExplicitCountryCode: false,
      rawPhone: ''
    }
  }

  if (rawPhone.startsWith('+')) {
    const matchedCountry = DIAL_CODE_MATCHERS.find(country => {
      return rawPhone === country.dialCode || rawPhone.startsWith(`${country.dialCode} `) || rawPhone.startsWith(country.dialCode)
    })

    if (matchedCountry) {
      return {
        countryIso: matchedCountry.iso,
        phoneNumber: rawPhone.slice(matchedCountry.dialCode.length).replace(/\D/g, ''),
        hasExplicitCountryCode: true,
        rawPhone
      }
    }
  }

  return {
    countryIso: defaultIso,
    phoneNumber: rawPhone.replace(/\D/g, ''),
    hasExplicitCountryCode: false,
    rawPhone
  }
}
