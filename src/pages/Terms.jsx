import React from 'react'
import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--notion-border)] bg-[var(--notion-bg)]/80 backdrop-blur px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3 py-3">
          <Link to="/" className="w-8 h-8 rounded-xl bg-black/90 text-white grid place-items-center text-sm font-semibold">IG</Link>
          <div className="font-semibold">Terms of Service</div>
          <div className="ml-auto">
            <Link to="/" className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)]">← Back to App</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-[var(--muted)] mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>
                  By accessing and using Instagram Grid Preview ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Service Description</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>
                  Instagram Grid Preview allows users to visualize how their Instagram posts will appear in a grid layout by connecting to their Notion databases.
                </p>
                <p>
                  <strong>Free Tier:</strong> Limited to basic grid preview functionality with demo data.
                </p>
                <p>
                  <strong>Pro Subscription:</strong> Full Notion integration, unlimited grids, custom styling, and premium features.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. User Responsibilities</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>Users are responsible for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintaining the security of their Notion account credentials</li>
                  <li>Ensuring they have rights to any content they display</li>
                  <li>Using the service in compliance with applicable laws</li>
                  <li>Not attempting to reverse engineer or exploit the service</li>
                  <li>Keeping their payment information current for subscriptions</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Subscription and Billing</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>
                  <strong>Pro Subscription:</strong> $9.99/month, billed monthly. Cancel anytime.
                </p>
                <p>
                  <strong>Billing:</strong> Processed securely through 2Checkout. Subscriptions auto-renew unless cancelled.
                </p>
                <p>
                  <strong>Refunds:</strong> Prorated refunds available within 30 days of payment for unused service time.
                </p>
                <p>
                  <strong>Free Trial:</strong> New users receive a 7-day free trial of Pro features.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Notion Integration</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>
                  By connecting your Notion account, you grant us permission to access the specific database you select for grid preview purposes only.
                </p>
                <p>
                  We do not access, store, or use any other Notion content outside of your selected database.
                </p>
                <p>
                  You can disconnect your Notion account at any time through the app settings.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Service Availability</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>
                  We strive for 99.9% uptime but cannot guarantee uninterrupted service. Planned maintenance will be announced in advance.
                </p>
                <p>
                  Service may be temporarily limited or suspended for maintenance, security, or legal compliance reasons.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Intellectual Property</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>
                  The Instagram Grid Preview service, including its design, features, and code, is owned by us and protected by intellectual property laws.
                </p>
                <p>
                  Users retain all rights to their content. We only access it to provide the grid preview service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>
                  Our liability is limited to the amount paid for the service in the 12 months preceding any claim.
                </p>
                <p>
                  We are not liable for any indirect, incidental, or consequential damages arising from use of the service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Termination</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>
                  Either party may terminate this agreement at any time. Upon termination:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your access to Pro features will end at the current billing period</li>
                  <li>Your data will be deleted within 30 days unless you export it</li>
                  <li>Free tier access may continue to be available</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">10. Contact and Support</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>
                  For support, billing questions, or terms clarification:
                </p>
                <p>
                  Email: support@instagramgridpreview.com<br />
                  Response time: Within 24 hours for Pro users, 48 hours for free users
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">11. Changes to Terms</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>
                  We reserve the right to modify these terms at any time. Material changes will be communicated via email and take effect 30 days after notification.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--notion-border)] bg-[var(--notion-bg)]/60 px-4 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-[var(--muted)]">
          <div>© 2024 Instagram Grid Preview. All rights reserved.</div>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-black">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-black">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
