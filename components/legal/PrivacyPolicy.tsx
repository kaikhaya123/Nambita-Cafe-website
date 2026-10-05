// The Privacy Policy text (shown at /privacy). Written to match what the site really does: if you change
// what checkout collects, which services we use, or how long orders are kept, update this text too.

import Link from 'next/link'
import LegalPage, { LegalSection } from '@/components/legal/LegalPage'
import { cafeLocations, contactEmail } from '@/lib/cafe-locations'

export const PRIVACY_UPDATED = '5 October 2026'

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" updated={PRIVACY_UPDATED}>
      <p>
        This policy explains what personal information Nambita Cafe collects when you use this website, why, who
        we share it with and your rights under the Protection of Personal Information Act (POPIA).
      </p>

      <LegalSection title="1. Who we are">
        <p>Nambita Cafe, with branches at:</p>
        <ul>
          {cafeLocations.map((location) => (
            <li key={location.id}>
              {location.name}, {location.addressLine1}, {location.addressLine2}
            </li>
          ))}
        </ul>
        <p>
          For anything about your personal information, email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. What we collect">
        <p>When you place an order:</p>
        <ul>
          <li>your first name and surname,</li>
          <li>your phone number,</li>
          <li>your email address, if you give it,</li>
          <li>the branch you&apos;ll collect from and any note you add (for example, allergies),</li>
          <li>what you ordered, the amount and the time of the order.</li>
        </ul>
        <p>
          You pay on Yoco&apos;s secure payment page. Your card details go straight to Yoco: we never see or store them.
        </p>
        <p>
          If you accept analytics cookies, Google Analytics records which pages you visit, roughly where you are (city
          level) and what kind of device and browser you use. See <a href="#cookies">Cookies</a> below.
        </p>
        <p>
          On the <Link href="/map">Find Nambita Cafe</Link> page, &quot;Share Location&quot; uses your location only
          inside your own browser to show the nearest branch. It is never sent to us.
        </p>
      </LegalSection>

      <LegalSection title="3. Why we use it">
        <ul>
          <li>to prepare your order and hand it to the right person,</li>
          <li>to email your receipt and tell you when your order is ready (if you gave an email address),</li>
          <li>to contact you about a problem with your order, or a refund,</li>
          <li>to keep financial records, as the law requires,</li>
          <li>
            to stop abuse of the website, for example too many payment attempts. For this we briefly keep a scrambled
            version of your internet address and your phone number, and delete them regularly.
          </li>
          <li>with your permission only, to understand how people use the website (Google Analytics).</li>
        </ul>
        <p>We don&apos;t sell your information, and we don&apos;t send you marketing.</p>
      </LegalSection>

      <LegalSection title="4. Who we share it with">
        <p>Only the services that run the website and your order, and only what each one needs:</p>
        <ul>
          <li>Yoco: takes your payment.</li>
          <li>Supabase: stores orders in our database.</li>
          <li>Resend: sends our emails.</li>
          <li>Vercel: hosts the website.</li>
          <li>Google: website statistics, only if you accept analytics cookies.</li>
        </ul>
        <p>
          Some of these services store information on servers outside South Africa. We only use providers that are
          required to protect it. We will share information with the authorities only if the law requires it.
        </p>
      </LegalSection>

      <LegalSection title="5. How long we keep it">
        <p>
          We keep order records for five years, because South African tax law requires us to keep financial records
          for that long. After that we delete them. Our staff can only see orders after logging in.
        </p>
      </LegalSection>

      <LegalSection title="6. Your rights">
        <p>Under POPIA you can ask us to:</p>
        <ul>
          <li>tell you what personal information we hold about you,</li>
          <li>correct it if it&apos;s wrong,</li>
          <li>delete it, unless the law requires us to keep it,</li>
          <li>stop using it for something you object to.</li>
        </ul>
        <p>
          Email <a href={`mailto:${contactEmail}`}>{contactEmail}</a> with your order reference if you have one. If
          you&apos;re not happy with our answer, you can complain to the Information Regulator at{' '}
          <a href="https://inforegulator.org.za" target="_blank" rel="noreferrer">
            inforegulator.org.za
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="7. Cookies and your browser">
        <p>We store a few small things in your browser:</p>
        <ul>
          <li>
            <strong>Your cart</strong>, so it&apos;s still there if you refresh the page. Needed for ordering.
          </li>
          <li>
            <strong>Your cookie choice</strong>, so we don&apos;t ask again on every page.
          </li>
          <li>
            <strong>Google Analytics cookies</strong> (named <code>_ga</code>…), only if you press Accept. They&apos;re
            used for visitor statistics, never for ads.
          </li>
        </ul>
        <p>
          You can change your choice at any time with <strong>Cookie settings</strong> at the bottom of every page.
          Saying no removes the Google Analytics cookies.
        </p>
      </LegalSection>

      <LegalSection title="8. Keeping it safe">
        <p>
          The website only works over a secure (HTTPS) connection, payments are handled by Yoco, and customer details
          can only be seen by our staff after they log in.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to this policy">
        <p>If we change this policy, we&apos;ll update it on this page and change the date at the top.</p>
      </LegalSection>
    </LegalPage>
  )
}
