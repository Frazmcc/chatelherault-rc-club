import { useEffect, useMemo, useState } from 'react'
import PageIntro from '../components/PageIntro'
import { defaultMeetupsContent, type MeetupsContent, useManagedJson } from '../content/managedContent'

type WeatherPoint = {
  time: string
  temperatureC: number | null
  precipitationChance: number | null
  windMph: number | null
  weatherCode: number | null
  weatherLabel: string
}

type MetOfficeSeriesPoint = {
  time?: string
  screenTemperature?: number
  maxScreenAirTemp?: number
  minScreenAirTemp?: number
  feelsLikeTemperature?: number
  probabilityOfPrecipitation?: number
  probOfPrecipitation?: number
  windSpeed10m?: number
  weatherType?: string | number
  significantWeatherCode?: number
}

type WeatherIconName =
  | 'sun'
  | 'partly-cloudy'
  | 'cloud'
  | 'rain'
  | 'drizzle'
  | 'snow'
  | 'sleet'
  | 'hail'
  | 'fog'
  | 'thunder'

type WeatherCodeInfo = {
  label: string
  icon: WeatherIconName
}

type LondonDateKey = {
  year: number
  month: number
  day: number
}

const MEETUP_LAT = 55.76278
const MEETUP_LON = -4.010164
const DEFAULT_PROXY_URL = '/api/metoffice-forecast'
const WORKER_FALLBACK_PROXY_URL =
  'https://chatelherault-rc-club.fraz-er.workers.dev/api/metoffice-forecast'
const METOFFICE_PROXY_URL = import.meta.env.VITE_METOFFICE_PROXY_URL || DEFAULT_PROXY_URL
const METOFFICE_HOURLY_URL =
  import.meta.env.VITE_METOFFICE_HOURLY_URL ||
  'https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/hourly'

const LONDON_PARTS_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  weekday: 'short',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const WEATHER_CODE_MAP: Record<number, WeatherCodeInfo> = {
  0: { label: 'Clear night', icon: 'sun' },
  1: { label: 'Sunny', icon: 'sun' },
  2: { label: 'Partly cloudy', icon: 'partly-cloudy' },
  3: { label: 'Partly cloudy', icon: 'partly-cloudy' },
  5: { label: 'Mist', icon: 'fog' },
  6: { label: 'Fog', icon: 'fog' },
  7: { label: 'Cloudy', icon: 'cloud' },
  8: { label: 'Overcast', icon: 'cloud' },
  9: { label: 'Light rain shower', icon: 'rain' },
  10: { label: 'Light rain shower', icon: 'rain' },
  11: { label: 'Drizzle', icon: 'drizzle' },
  12: { label: 'Light rain', icon: 'rain' },
  13: { label: 'Heavy rain shower', icon: 'rain' },
  14: { label: 'Heavy rain shower', icon: 'rain' },
  15: { label: 'Heavy rain', icon: 'rain' },
  16: { label: 'Sleet shower', icon: 'sleet' },
  17: { label: 'Sleet shower', icon: 'sleet' },
  18: { label: 'Sleet', icon: 'sleet' },
  19: { label: 'Hail shower', icon: 'hail' },
  20: { label: 'Hail shower', icon: 'hail' },
  21: { label: 'Hail', icon: 'hail' },
  22: { label: 'Light snow shower', icon: 'snow' },
  23: { label: 'Light snow shower', icon: 'snow' },
  24: { label: 'Light snow', icon: 'snow' },
  25: { label: 'Heavy snow shower', icon: 'snow' },
  26: { label: 'Heavy snow shower', icon: 'snow' },
  27: { label: 'Heavy snow', icon: 'snow' },
  28: { label: 'Thunder shower', icon: 'thunder' },
  29: { label: 'Thunder shower', icon: 'thunder' },
  30: { label: 'Thunder', icon: 'thunder' },
}

function getWeatherCode(point: MetOfficeSeriesPoint): number | null {
  if (Number.isFinite(point.significantWeatherCode)) {
    return point.significantWeatherCode as number
  }

  if (typeof point.weatherType === 'number' && Number.isFinite(point.weatherType)) {
    return point.weatherType
  }

  if (typeof point.weatherType === 'string') {
    const parsed = Number.parseInt(point.weatherType, 10)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

function getWeatherInfo(code: number | null): WeatherCodeInfo {
  if (code !== null && WEATHER_CODE_MAP[code]) {
    return WEATHER_CODE_MAP[code]
  }

  return { label: 'Unknown', icon: 'cloud' }
}

function WeatherIcon({ icon }: { icon: WeatherIconName }) {
  if (icon === 'sun') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="weather-icon">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.2 2.2M16.9 16.9l2.2 2.2M19.1 4.9l-2.2 2.2M7.1 16.9l-2.2 2.2" />
      </svg>
    )
  }

  if (icon === 'partly-cloudy') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="weather-icon">
        <circle cx="8" cy="8" r="3" />
        <path d="M7 16h10a3 3 0 0 0 0-6 4.5 4.5 0 0 0-8.3-1.7A3.5 3.5 0 0 0 7 16z" />
      </svg>
    )
  }

  if (icon === 'rain' || icon === 'drizzle') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="weather-icon">
        <path d="M7 14h10a3 3 0 0 0 0-6 4.5 4.5 0 0 0-8.3-1.7A3.5 3.5 0 0 0 7 14z" />
        <path d="M9 16l-1 3M13 16l-1 3M17 16l-1 3" />
      </svg>
    )
  }

  if (icon === 'snow' || icon === 'sleet' || icon === 'hail') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="weather-icon">
        <path d="M7 14h10a3 3 0 0 0 0-6 4.5 4.5 0 0 0-8.3-1.7A3.5 3.5 0 0 0 7 14z" />
        <path d="M9 17h0.01M12 19h0.01M15 17h0.01" />
      </svg>
    )
  }

  if (icon === 'fog') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="weather-icon">
        <path d="M5 10h14M4 14h16M6 18h12" />
      </svg>
    )
  }

  if (icon === 'thunder') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="weather-icon">
        <path d="M7 14h10a3 3 0 0 0 0-6 4.5 4.5 0 0 0-8.3-1.7A3.5 3.5 0 0 0 7 14z" />
        <path d="M12 14l-2 4h2l-1 4 3-5h-2l2-3" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="weather-icon">
      <path d="M7 16h10a3 3 0 0 0 0-6 4.5 4.5 0 0 0-8.3-1.7A3.5 3.5 0 0 0 7 16z" />
    </svg>
  )
}

function getLondonPartsFromDate(date: Date): {
  weekday: string
  year: number
  month: number
  day: number
  hour: number
} {
  const parts = LONDON_PARTS_FORMATTER.formatToParts(date)
  const map = new Map<string, string>()

  parts.forEach((part) => {
    map.set(part.type, part.value)
  })

  return {
    weekday: map.get('weekday') || '',
    year: Number.parseInt(map.get('year') || '0', 10),
    month: Number.parseInt(map.get('month') || '0', 10),
    day: Number.parseInt(map.get('day') || '0', 10),
    hour: Number.parseInt(map.get('hour') || '0', 10),
  }
}

function getTargetSundayKey(fromDate: Date): LondonDateKey {
  const london = getLondonPartsFromDate(fromDate)
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }
  const londonWeekday = weekdayMap[london.weekday] ?? 0
  const daysUntilSunday = (7 - londonWeekday) % 7

  const baseUtc = Date.UTC(london.year, london.month - 1, london.day)
  const targetUtc = new Date(baseUtc + daysUntilSunday * 24 * 60 * 60 * 1000)

  return {
    year: targetUtc.getUTCFullYear(),
    month: targetUtc.getUTCMonth() + 1,
    day: targetUtc.getUTCDate(),
  }
}

function inTargetSundayWindow(isoTime: string, targetSunday: LondonDateKey): boolean {
  const parsed = new Date(isoTime)

  if (Number.isNaN(parsed.getTime())) {
    return false
  }

  const london = getLondonPartsFromDate(parsed)

  return (
    london.year === targetSunday.year &&
    london.month === targetSunday.month &&
    london.day === targetSunday.day &&
    london.hour >= 9 &&
    london.hour <= 13
  )
}

function buildWeatherPoint(point: MetOfficeSeriesPoint): WeatherPoint {
  const weatherCode = getWeatherCode(point)
  const weatherInfo = getWeatherInfo(weatherCode)

  return {
    time: point.time as string,
    temperatureC:
      point.screenTemperature ??
      point.feelsLikeTemperature ??
      point.maxScreenAirTemp ??
      point.minScreenAirTemp ??
      null,
    precipitationChance: point.probabilityOfPrecipitation ?? point.probOfPrecipitation ?? null,
    // Met Office windSpeed10m is metres/sec; convert to mph for display.
    windMph: Number.isFinite(point.windSpeed10m) ? (point.windSpeed10m as number) * 2.236936 : null,
    weatherCode,
    weatherLabel: weatherInfo.label,
  }
}

function formatForecastTime(isoTime: string): string {
  const parsed = new Date(isoTime)

  if (Number.isNaN(parsed.getTime())) {
    return isoTime
  }

  return parsed.toLocaleTimeString('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatForecastDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatLondonDateFromKey(dateKey: LondonDateKey): string {
  const utcDate = new Date(Date.UTC(dateKey.year, dateKey.month - 1, dateKey.day, 12, 0, 0))
  return formatForecastDate(utcDate)
}

function extractSeries(payload: unknown): MetOfficeSeriesPoint[] {
  if (!payload || typeof payload !== 'object') {
    return []
  }

  const maybeFeatures = (payload as { features?: unknown }).features

  if (Array.isArray(maybeFeatures) && maybeFeatures.length > 0) {
    const first = maybeFeatures[0] as { properties?: { timeSeries?: unknown } }

    if (Array.isArray(first?.properties?.timeSeries)) {
      return first.properties.timeSeries as MetOfficeSeriesPoint[]
    }
  }

  const maybeSeries = (payload as { timeSeries?: unknown }).timeSeries

  if (Array.isArray(maybeSeries)) {
    return maybeSeries as MetOfficeSeriesPoint[]
  }

  return []
}

function MeetupsPage() {
  const meetups = useManagedJson<MeetupsContent>('/content/pages/meetups.json', defaultMeetupsContent)
  const [weatherPoints, setWeatherPoints] = useState<WeatherPoint[]>([])
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [weatherNote, setWeatherNote] = useState<string | null>(null)
  const [weatherGranularity, setWeatherGranularity] = useState<'hourly' | 'three-hourly'>('hourly')
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
  const targetSunday = useMemo(() => getTargetSundayKey(new Date()), [])

  useEffect(() => {
    const browserApiKey = import.meta.env.VITE_METOFFICE_API_KEY
    const isLocalDev =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '::1'

    let active = true

    const loadWeather = async () => {
      setIsLoadingWeather(true)
      setWeatherError(null)
      setWeatherNote(null)
      setWeatherGranularity('hourly')

      try {
        const proxiedUrl = `${METOFFICE_PROXY_URL}?latitude=${MEETUP_LAT}&longitude=${MEETUP_LON}`

        let response = await fetch(proxiedUrl, {
          headers: {
            accept: 'application/json',
          },
        })
        let responseSource: 'proxy' | 'direct' = 'proxy'

        // If current host does not expose /api, retry against the known Worker API endpoint.
        if (
          !response.ok &&
          response.status === 404 &&
          METOFFICE_PROXY_URL === DEFAULT_PROXY_URL &&
          window.location.hostname !== 'chatelherault-rc-club.fraz-er.workers.dev'
        ) {
          response = await fetch(
            `${WORKER_FALLBACK_PROXY_URL}?latitude=${MEETUP_LAT}&longitude=${MEETUP_LON}`,
            {
              headers: {
                accept: 'application/json',
              },
            },
          )
        }

        // Local development fallback: direct browser call if proxy endpoint is unavailable.
        if (!response.ok && browserApiKey && isLocalDev) {
          const directUrl = `${METOFFICE_HOURLY_URL}?latitude=${MEETUP_LAT}&longitude=${MEETUP_LON}`
          response = await fetch(directUrl, {
            headers: {
              apikey: browserApiKey,
              'x-api-key': browserApiKey,
              accept: 'application/json',
            },
          })
          responseSource = 'direct'
        }

        if (!response.ok) {
          const contentType = response.headers.get('content-type') || ''

          let details = ''
          try {
            if (contentType.includes('application/json')) {
              const body = (await response.json()) as { error?: string; details?: string }
              details = body?.error || body?.details || ''
            } else {
              details = (await response.text()).slice(0, 240)
            }
          } catch {
            details = ''
          }

          if (response.status === 404 && contentType.includes('text/html')) {
            throw new Error(
              'Weather proxy route not found at /api/metoffice-forecast. Use your Workers deployment URL or ensure the Worker API route is deployed.',
            )
          }

          const detailsSuffix = details ? ` ${details}` : ''
          throw new Error(`Met Office ${responseSource} request failed (${response.status}).${detailsSuffix}`)
        }

        const payload = (await response.json()) as unknown
        const series = extractSeries(payload)

        const filtered = series
          .filter((point) => Boolean(point.time) && inTargetSundayWindow(point.time as string, targetSunday))
          .map((point) => buildWeatherPoint(point))

        if (!active) {
          return
        }

        if (filtered.length > 0) {
          setWeatherGranularity('hourly')
          setWeatherPoints(filtered)
          return
        }

        // Sunday-specific fallback: three-hourly feed usually has a longer horizon than hourly.
        const threeHourlyUrl = `${METOFFICE_PROXY_URL}?latitude=${MEETUP_LAT}&longitude=${MEETUP_LON}&frequency=three-hourly`
        let threeHourlyResponse = await fetch(threeHourlyUrl, {
          headers: {
            accept: 'application/json',
          },
        })

        if (
          !threeHourlyResponse.ok &&
          threeHourlyResponse.status === 404 &&
          METOFFICE_PROXY_URL === DEFAULT_PROXY_URL &&
          window.location.hostname !== 'chatelherault-rc-club.fraz-er.workers.dev'
        ) {
          threeHourlyResponse = await fetch(
            `${WORKER_FALLBACK_PROXY_URL}?latitude=${MEETUP_LAT}&longitude=${MEETUP_LON}&frequency=three-hourly`,
            {
              headers: {
                accept: 'application/json',
              },
            },
          )
        }

        if (!threeHourlyResponse.ok) {
          setWeatherError('Sunday forecast is not available in hourly data yet, and three-hourly fallback is unavailable.')
          setWeatherPoints([])
          return
        }

        const threeHourlyPayload = (await threeHourlyResponse.json()) as unknown
        const threeHourlySeries = extractSeries(threeHourlyPayload)
        const sundayThreeHourly = threeHourlySeries
          .filter((point) => Boolean(point.time) && inTargetSundayWindow(point.time as string, targetSunday))
          .map((point) => buildWeatherPoint(point))

        if (sundayThreeHourly.length > 0) {
          setWeatherGranularity('three-hourly')
          setWeatherNote('Showing three-hourly Sunday forecast because hourly Sunday data is not published yet.')
          setWeatherPoints(sundayThreeHourly)
          return
        }

        setWeatherPoints([])
        setWeatherError(
          `Met Office has not published ${formatLondonDateFromKey(targetSunday)} 09:00-13:00 for this site yet.`,
        )
      } catch (error) {
        if (!active) {
          return
        }

        const message = error instanceof Error ? error.message : 'Unable to load weather forecast right now.'
        setWeatherError(message)
      } finally {
        if (active) {
          setIsLoadingWeather(false)
        }
      }
    }

    loadWeather()

    return () => {
      active = false
    }
  }, [targetSunday])

  return (
    <section className="page-block">
      <PageIntro
        eyebrow={meetups.eyebrow}
        title={meetups.title}
        description={meetups.description}
      />

      <div className="split-layout">
        <article className="info-card">
          <p className="panel-label">Next run</p>
          <h2>{meetups.scheduleTitle}</h2>
          <ul className="bullet-list">
            <li>Arrival Window: {meetups.arrivalWindow}</li>
            <li>Rollout Target: {meetups.rolloutTarget}</li>
            <li>Meet Point: {meetups.meetPointLabel}</li>
            <li>
              what3words: <a href={meetups.what3wordsUrl}>{meetups.what3words}</a>
            </li>
          </ul>
        </article>

        <article className="info-card accent-card">
          <p className="panel-label">What to bring</p>
          <h3>{meetups.checklistTitle}</h3>
          <ul className="bullet-list">
            {meetups.checklistItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className="info-card">
        <p className="panel-label">Meet point</p>
        <h2>Where to find us</h2>
        <p>Satellite view of the meet area — look for the car park off the main entrance road.</p>
        <div className="map-embed-wrapper">
          <iframe
            title="Chatelherault meet point satellite view"
            src={`https://maps.google.com/maps?q=${MEETUP_LAT},${MEETUP_LON}&t=k&z=18&ie=UTF8&iwloc=&output=embed`}
            width="100%"
            height="100%"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
          />
        </div>
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', opacity: 0.7 }}>
          <a
            href={`https://www.google.com/maps?q=${MEETUP_LAT},${MEETUP_LON}&t=k`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps
          </a>
        </p>
      </article>

      <article className="info-card">
        <p className="panel-label">Weather update</p>
        <h2>
          Met Office forecast for {meetups.weatherLocationLabel} on {formatLondonDateFromKey(targetSunday)}
        </h2>
        <p>
          {weatherGranularity === 'three-hourly' ? 'Three-hourly' : 'Hourly'} window: 09:00 to 13:00
          (Europe/London)
        </p>
        {!isLoadingWeather && weatherNote && <p>{weatherNote}</p>}

        {isLoadingWeather && <p>Loading latest forecast...</p>}

        {!isLoadingWeather && weatherError && <p>{weatherError}</p>}

        {!isLoadingWeather && !weatherError && weatherPoints.length > 0 && (
          <div className="forecast-grid" aria-label="Nearest Sunday weather">
            <div className="forecast-row forecast-row-header" role="presentation">
              <span>Time</span>
              <span>Condition</span>
              <span>Temp</span>
              <span>Rain</span>
              <span>Wind</span>
            </div>
            {weatherPoints.map((point) => {
              const weatherInfo = getWeatherInfo(point.weatherCode)

              return (
                <div className="forecast-row" key={point.time}>
                  <span className="forecast-time">{formatForecastTime(point.time)}</span>
                  <span className="forecast-condition">
                    <WeatherIcon icon={weatherInfo.icon} />
                    <span>{point.weatherLabel}</span>
                  </span>
                  <span>{point.temperatureC !== null ? `${Math.round(point.temperatureC)}C` : 'N/A'}</span>
                  <span>{point.precipitationChance !== null ? `${Math.round(point.precipitationChance)}%` : 'N/A'}</span>
                  <span>{point.windMph !== null ? `${Math.round(point.windMph)} mph` : 'N/A'}</span>
                </div>
              )
            })}
          </div>
        )}
      </article>
    </section>
  )
}

export default MeetupsPage
