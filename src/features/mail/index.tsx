import { getCookie } from '@/lib/cookies'
import { MailComponent } from './components/mail'
import { mails } from './components/data'
import { DEFAULT_MAIL_LAYOUT, MAIL_LAYOUT_COOKIE } from './components/mail-layout-config'

export function Mail() {
  const layoutCookie = getCookie(MAIL_LAYOUT_COOKIE)
  const defaultLayout = layoutCookie ? JSON.parse(layoutCookie) : [...DEFAULT_MAIL_LAYOUT]

  return <MailComponent mails={mails} defaultLayout={defaultLayout} />
}
