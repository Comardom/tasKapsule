import { ref, onUnmounted } from 'vue'

export interface DailyWeather {
  max: number
  min: number
  code: number
}

export interface CurrentWeather {
  temperature: number
  code: number
}

interface CacheData {
  current: CurrentWeather | null
  daily: Record<string, DailyWeather>
  fetchedAt: number
}

interface StoredLocation {
  lat: number
  lon: number
  name: string
}

const CACHE_KEY = 'weather-cache'
const LOCATION_KEY = 'weather-location'
const REFRESH_MS = 30 * 60 * 1000
const DEFAULT_LOCATION: StoredLocation = { lat: 39.9042, lon: 116.4074, name: 'Beijing' }

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function useWeather() {
  const currentWeather = ref<CurrentWeather | null>(null)
  const dailyMap = ref<Record<string, DailyWeather>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  const location = ref<StoredLocation>(loadFromStorage(LOCATION_KEY, DEFAULT_LOCATION))

  readCache()

  detectLocationIfNeeded().then(fetchWeather)

  const timer = setInterval(fetchWeather, REFRESH_MS)
  onUnmounted(() => clearInterval(timer))

  function readCache() {
    const cache = loadFromStorage<CacheData | null>(CACHE_KEY, null)
    if (cache && Date.now() - cache.fetchedAt < REFRESH_MS) {
      currentWeather.value = cache.current
      dailyMap.value = cache.daily
    }
  }

  function writeCache() {
    const data: CacheData = {
      current: currentWeather.value,
      daily: dailyMap.value,
      fetchedAt: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  }

  async function detectLocationIfNeeded() {
    if (localStorage.getItem(LOCATION_KEY)) return
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          enableHighAccuracy: false,
        })
      })
      location.value = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        name: `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`,
      }
      localStorage.setItem(LOCATION_KEY, JSON.stringify(location.value))
    } catch {
      /* use default */
    }
  }

  async function fetchWeather() {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({
        latitude: String(location.value.lat),
        longitude: String(location.value.lon),
        current: 'temperature_2m,weather_code',
        daily: 'temperature_2m_max,temperature_2m_min,weather_code',
        past_days: '3',
        forecast_days: '7',
        timezone: 'auto',
      })
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      if (!res.ok) throw new Error(`Weather API ${res.status}`)
      const json = await res.json()

      currentWeather.value = json.current
        ? { temperature: json.current.temperature_2m, code: json.current.weather_code }
        : null

      const daily: Record<string, DailyWeather> = {}
      if (json.daily) {
        for (let i = 0; i < json.daily.time.length; i++) {
          daily[json.daily.time[i]] = {
            max: json.daily.temperature_2m_max[i],
            min: json.daily.temperature_2m_min[i],
            code: json.daily.weather_code[i],
          }
        }
      }
      dailyMap.value = daily
      writeCache()
    } catch (e: any) {
      error.value = e.message ?? 'Failed to fetch weather'
    } finally {
      loading.value = false
    }
  }

  function setLocation(lat: number, lon: number, name?: string) {
    location.value = { lat, lon, name: name ?? `${lat}, ${lon}` }
    localStorage.setItem(LOCATION_KEY, JSON.stringify(location.value))
    fetchWeather()
  }

  async function setLocationByCity(city: string): Promise<boolean> {
    try {
      const params = new URLSearchParams({ name: city, count: '1', language: 'auto', format: 'json' })
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`)
      if (!res.ok) return false
      const json = await res.json()
      if (!json.results?.[0]) return false
      const r = json.results[0]
      setLocation(r.latitude, r.longitude, `${r.name}, ${r.country ?? ''}`)
      return true
    } catch {
      return false
    }
  }

  return {
    currentWeather,
    dailyMap,
    loading,
    error,
    location,
    fetchWeather,
    setLocation,
    setLocationByCity,
  }
}
