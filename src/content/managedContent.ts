import { useEffect, useState } from 'react'
import { highlights, navItems, shellNotice, socialLinks } from './siteContent'

export type NavItem = {
  label: string
  to: string
}

export type SocialLink = {
  label: string
  href: string
}

export type CardItem = {
  title: string
  description: string
}

export type SiteSettings = {
  footerTitle: string
  footerText: string
  navItems: NavItem[]
  socialLinks: SocialLink[]
}

export type HomeContent = {
  eyebrow: string
  title: string
  description: string
  shellLabel: string
  panelTitle: string
  panelBody: string
  heroImageSrc: string
  heroImageAlt: string
  highlights: Array<{ value: string; label: string }>
  featureCards: CardItem[]
}

export type AboutContent = {
  eyebrow: string
  title: string
  description: string
  valuesTitle: string
  valuesList: string[]
  newcomerTitle: string
  newcomerBody: string
}

export type MeetupsContent = {
  eyebrow: string
  title: string
  description: string
  scheduleTitle: string
  arrivalWindow: string
  rolloutTarget: string
  meetPointLabel: string
  meetPointCoordinates: string
  what3words: string
  what3wordsUrl: string
  weatherLocationLabel: string
  checklistTitle: string
  checklistItems: string[]
}

export type EntryCard = {
  title: string
  description: string
  image?: string
  imageAlt?: string
}

export type EventEntry = {
  title: string
  description: string
  date?: string
  location?: string
}

export type ArticleEntry = {
  title: string
  slug: string
  excerpt: string
  date: string
}

export const defaultSiteSettings: SiteSettings = {
  footerTitle: 'Chatelherault RC Club',
  footerText: 'Built for meetups, media, builds, and club networking.',
  navItems,
  socialLinks,
}

export const defaultHomeContent: HomeContent = {
  eyebrow: 'Sunday mornings in South Lanarkshire',
  title: 'A standout home for Chatelherault RC Club',
  description:
    'This shell launch gives the club a polished foundation for meetup updates, event recaps, galleries, member builds, and partner networking.',
  shellLabel: 'Shell launch status',
  panelTitle: 'Live-ready structure, content phase next',
  panelBody: shellNotice,
  heroImageSrc: '/brand/chattersrc-alt.jpg',
  heroImageAlt: 'Chatelherault RC Club featured branding',
  highlights,
  featureCards: [
    {
      title: 'Weekly Meetups',
      description: 'Sunday details, weather status, and turnout notes will be updated by admins each week.',
    },
    {
      title: 'Event Features',
      description: 'Special crawls, collaborations, and standout recaps are structured and ready to publish.',
    },
    {
      title: 'Member Builds',
      description: 'Build stories, rig specs, and upgrade highlights will be added to a dedicated showcase.',
    },
  ],
}

export const defaultAboutContent: AboutContent = {
  eyebrow: 'About the club',
  title: 'A welcoming Sunday crawler community',
  description:
    'Chatelherault RC Club focuses on trail driving, friendly meetups, and a supportive community for both newcomers and experienced hobbyists.',
  valuesTitle: 'What we are about',
  valuesList: [
    'Consistent Sunday morning trail runs',
    'Beginner-friendly atmosphere and practical support',
    'Strong focus on 1/10 crawler and trail platforms',
    'Community media, build sharing, and collaboration',
  ],
  newcomerTitle: 'New to RC crawling?',
  newcomerBody:
    'You can join as you are. Bring a trail-ready rig, charge your packs, and turn up ready for an easygoing session across some of the best terrain in the area.',
}

export const defaultMeetupsContent: MeetupsContent = {
  eyebrow: 'Sunday meetup hub',
  title: 'Meet every Sunday morning at Chatelherault',
  description: 'This page is designed for quick clarity: where to meet, when to arrive, and what to bring.',
  scheduleTitle: 'Sunday meetup schedule',
  arrivalWindow: '9:00am',
  rolloutTarget: '10:10am',
  meetPointLabel: 'Meet Point',
  meetPointCoordinates: '55.76278, -4.010164',
  what3words: '///lively.woes.tinsel',
  what3wordsUrl: 'https://w3w.co/lively.woes.tinsel',
  weatherLocationLabel: 'Chatelherault (Ferniegair)',
  checklistTitle: 'Sunday prep checklist',
  checklistItems: [
    'Fully charged packs and backup battery',
    'Basic tools and wheel nut wrench',
    'Waterproof gear for changing conditions',
    'Trail-ready 1/10 crawler setup',
  ],
}

export const defaultEvents: EventEntry[] = [
  {
    title: 'Upcoming features',
    description: 'Upcoming collaboration runs and themed event days will appear here.',
  },
  {
    title: 'Recent recaps',
    description: 'Event recap posts with photo highlights and route notes will be published in this block.',
  },
  {
    title: 'Community updates',
    description: 'Announcements about charity runs and club milestones are ready for rollout.',
  },
]

export const defaultGallery: EntryCard[] = [
  {
    title: 'Weekly crawl albums',
    description: 'Regular Sunday photos will be grouped and published as weekly sets.',
  },
  {
    title: 'Event media',
    description: 'Special event coverage and short action clips will live in this stream.',
  },
  {
    title: 'Build feature media',
    description: 'Close-up shots of rigs and modification details will support member build stories.',
  },
]

export const defaultBuilds: EntryCard[] = [
  {
    title: 'Featured rigs',
    description: 'Standout member crawlers will be highlighted with full spec summaries.',
  },
  {
    title: 'Mod breakdowns',
    description: 'Suspension, drivetrain, and bodywork upgrades will be documented as easy read cards.',
  },
  {
    title: 'Build stories',
    description: 'Member write-ups will explain setup goals, trail performance, and lessons learned.',
  },
]

export const defaultArticles: ArticleEntry[] = [
  {
    title: 'Shell launch complete',
    slug: 'shell-launch-complete',
    excerpt: 'The club site foundation is now live and ready for weekly publishing by admins.',
    date: '2026-03-24',
  },
]

export function useManagedJson<T>(path: string, fallback: T): T {
  const [data, setData] = useState<T>(fallback)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const response = await fetch(path, { cache: 'no-cache' })

        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as T

        if (active) {
          setData(payload)
        }
      } catch {
        // Keep fallback data when managed content is unavailable.
      }
    }

    load()

    return () => {
      active = false
    }
  }, [path])

  return data
}
