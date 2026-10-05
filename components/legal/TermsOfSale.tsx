// The Terms & Refund Policy text (shown at /terms): how online ordering, payment, collection and refunds work.
// If you change how ordering works or the refund rules, update this text too.

import Link from 'next/link'
import LegalPage, { LegalSection } from '@/components/legal/LegalPage'
import { cafeLocations, contactEmail } from '@/lib/cafe-locations'

export const TERMS_UPDATED = '5 October 2026'

export default function TermsOfSale() {
  const branchNames = cafeLocations.map((location) => location.name).join(' or ')

  return (
    <LegalPage title="Terms & Refund Policy" updated={TERMS_UPDATED}>
      <p>
        These terms apply when you order from Nambita Cafe on this website. By paying for an order you agree to them.
        They don&apos;t take away any of your rights under South African consumer law.
      </p>

      <LegalSection title="1. Ordering">
        <ul>
          <li>Orders on this website are for collection at {branchNames}. We don&apos;t deliver.</li>
          <li>
            Prices are in South African rand (ZAR). The total shown before you pay is the full amount: there are no
            extra fees.
          </li>
          <li>
            Your order is confirmed once your payment succeeds. You&apos;ll see your order number on screen and, if you
            gave an email address, receive a receipt.
          </li>
          <li>Menu items, photos and prices can change. Photos show how an item is served and may differ slightly.</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Payment">
        <p>
          Payments are processed securely by Yoco. Your card details are entered on Yoco&apos;s page and never reach us.
          If your payment doesn&apos;t go through, you are not charged and the order isn&apos;t made.
        </p>
        <p>
          If money left your account but you didn&apos;t see a confirmation, please don&apos;t pay again: email{' '}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a> or ask at the counter, and we&apos;ll check it.
        </p>
      </LegalSection>

      <LegalSection title="3. Collecting your order">
        <ul>
          <li>
            We start preparing your order once it&apos;s paid. The confirmation page shows its progress, and we email
            you when it&apos;s ready (if you gave an email address).
          </li>
          <li>Collect it from the branch you chose and show your order number at the counter.</li>
          <li>
            Please collect your order on the same day. Our food is made fresh, so orders not collected by closing time
            can&apos;t be kept or refunded.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Refunds">
        <p>We give a full refund when:</p>
        <ul>
          <li>we can&apos;t make your order (for example, an item has run out or the branch has to close),</li>
          <li>your order is wrong or something is missing, or</li>
          <li>you were charged more than once for the same order.</li>
        </ul>
        <p>
          If your order is wrong or incomplete, please tell staff when you collect it so we can fix it straight away,
          or email <a href={`mailto:${contactEmail}`}>{contactEmail}</a> on the same day with your order number.
        </p>
        <p>
          Because food and drinks are made to order, we can&apos;t take them back or refund them once they&apos;ve been
          correctly prepared.
        </p>
        <p>
          Refunds go back to the card you paid with. Banks usually take up to 7 working days to show the money in your
          account.
        </p>
      </LegalSection>

      <LegalSection title="5. Allergies">
        <p>
          Please tell us about allergies in the order note. We&apos;ll do our best, but our kitchens handle many
          ingredients, so we can&apos;t promise any item is completely free of an allergen.
        </p>
      </LegalSection>

      <LegalSection title="6. Your information">
        <p>
          How we use the details you give us is explained in our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact us">
        <p>
          Questions or complaints: email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>, or speak to us at
          either branch:
        </p>
        <ul>
          {cafeLocations.map((location) => (
            <li key={location.id}>
              {location.name}, {location.addressLine1}, {location.addressLine2}
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="8. Changes to these terms">
        <p>
          We may update these terms. The version on this page when you pay is the one that applies to your order.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
