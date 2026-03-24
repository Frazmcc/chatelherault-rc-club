import { useEffect, useMemo, useState } from 'react'
import PageIntro from '../components/PageIntro'
import { defaultMeetupsContent, type MeetupsContent, useManagedJson } from '../content/managedContent'

type WeatherPoint = {
  time: string
  temperatureC: number | null
  precipitationChance: number | null
  windMph: number | null
  weatherType: string | null
}

type MetOfficeSeriesPoint = {
  time?: string
  screenTemperature?: number
  maxScreenAirTemp?: number
  minScreenAirTemp?: number
  feelsLikeTemperature?: number
  probabilityOfPrecipitation?: number
  windSpeed10m?: number
  weatherType?: string
}

const MEETUP_LAT = 55.76278
const MEETUP_LON = -4.010164
const METOFFICE_PROXY_URL = import.meta.env.VITE_METOFFICE_PROXY_URL || '/api/metoffice-forecast'
const METOFFICE_HOURLY_URL =
  import.meta.env.VITE_METOFFICE_HOURLY_URL ||
  'https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/hourly'

function getNextSundayDate(fromDate: Date): Date {
  const date = new Date(fromDate)
  const day = date.getDay()
  const daysUntilSunday = (7 - day) % 7
  const offset = daysUntilSunday === 0 ? 7 : daysUntilSunday
  date.setDate(date.getDate() + offset)
  date.setHours(0, 0, 0, 0)
  return date
}

function inNextSundayWindow(isoTime: string, nextSunday: Date): boolean {
  const parsed = new Date(isoTime)

  if (Number.isNaN(parsed.getTime())) {
    return false
  }

  const local = new Date(parsed.toLocaleString('en-GB', { timeZone: 'Europe/London' }))

  return (
    local.getFullYear() === nextSunday.getFullYear() &&
    local.getMonth() === nextSunday.getMonth() &&
    local.getDate() === nextSunday.getDate() &&
    local.getHours() >= 9 &&
    local.getHours() <= 13
  )
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
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
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
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
  const nextSunday = useMemo(() => getNextSundayDate(new Date()), [])

  useEffect(() => {
    const browserApiKey = import.meta.env.VITE_METOFFICE_API_KEY

    let active = true

    const loadWeather = async () => {
      setIsLoadingWeather(true)
      setWeatherError(null)

      try {
        const proxiedUrl = `${METOFFICE_PROXY_URL}?latitude=${MEETUP_LAT}&longitude=${MEETUP_LON}`

        let response = await fetch(proxiedUrl, {
          headers: {
            accept: 'application/json',
          },
        })

        // Local development fallback: direct browser call if proxy endpoint is unavailable.
        if (!response.ok && browserApiKey) {
          const directUrl = `${METOFFICE_HOURLY_URL}?latitude=${MEETUP_LAT}&longitude=${MEETUP_LON}`
          response = await fetch(directUrl, {
            headers: {
              apikey: browserApiKey,
              'x-api-key': browserApiKey,
              accept: 'application/json',
            },
          })
        }

        if (!response.ok) {
          throw new Error(`Met Office request failed (${response.status}).`)
        }

        const payload = (await response.json()) as unknown
        const series = extractSeries(payload)

        const filtered = series
          .filter((point) => Boolean(point.time) && inNextSundayWindow(point.time as string, nextSunday))
          .map((point) => ({
            time: point.time as string,
            temperatureC:
              point.screenTemperature ??
              point.feelsLikeTemperature ??
              point.maxScreenAirTemp ??
              point.minScreenAirTemp ??
              null,
            precipitationChance: point.probabilityOfPrecipitation ?? null,
            windMph: point.windSpeed10m ?? null,
            weatherType: point.weatherType ?? null,
          }))

        if (!active) {
          return
        }

        if (filtered.length === 0) {
          setWeatherError('No Met Office hourly points were returned yet for next Sunday 09:00-13:00.')
        }

        setWeatherPoints(filtered)
      } catch (error) {
        if (!active) {
          return
        }

        const message = error instanceof Error ? error.message : 'Unable to load weather forecast right now.'
        setWeatherError(
          `${message} Configure Cloudflare Pages env var METOFFICE_API_KEY for /api/metoffice-forecast.`,
        )
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
  }, [nextSunday])

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
          Met Office forecast for {meetups.weatherLocationLabel} on {formatForecastDate(nextSunday)}
        </h2>
        <p>Hourly window: 09:00 to 13:00 (Europe/London)</p>

        {isLoadingWeather && <p>Loading latest forecast...</p>}

        {!isLoadingWeather && weatherError && <p>{weatherError}</p>}

        {!isLoadingWeather && !weatherError && weatherPoints.length > 0 && (
          <ul className="bullet-list" aria-label="Next Sunday weather">
            {weatherPoints.map((point) => (
              <li key={point.time}>
                {formatForecastTime(point.time)} - {point.temperatureC ?? 'N/A'}C, rain{' '}
                {point.precipitationChance ?? 'N/A'}%, wind {point.windMph ?? 'N/A'} mph
                {point.weatherType ? ` (${point.weatherType})` : ''}
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  )
}

export default MeetupsPage
