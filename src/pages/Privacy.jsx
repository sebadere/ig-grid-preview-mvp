import React from 'react'
import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--notion-border)] bg-[var(--notion-bg)]/80 backdrop-blur px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3 py-3">
          <Link to="/" className="w-8 h-8 rounded-xl bg-black/90 text-white grid place-items-center text-sm font-semibold">IG</Link>
          <div className="font-semibold">Privacy Policy</div>
          <div className="ml-auto">
            <Link to="/" className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)]">← Back to App</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-[var(--muted)] mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>
                  <strong>Notion Integration:</strong> When you connect your Notion account, we access only the database you select to display your Instagram grid preview. We do not access other Notion content.
                </p>
                <p>
                  <strong>Usage Data:</strong> We collect basic usage analytics to improve our service, including page views and feature usage.
                </p>
                <p>
                  <strong>Account Information:</strong> For paid subscriptions, we collect email address and payment information through our secure payment processor.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide the Instagram grid preview service</li>
                  <li>Sync your Notion database content</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Send service-related communications</li>
                  <li>Improve our product and user experience</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Data Storage and Security</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>
                  Your data is stored securely using industry-standard encryption. Grid layouts and preferences are cached locally in your browser and on our secure servers to provide fast loading times.
                </p>
                <p>
                  We do not store sensitive Notion content permanently. Data is cached temporarily to provide the grid preview service and is automatically expired.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Third-Party Services</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>We integrate with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Notion:</strong> To access your selected database content for grid preview functionality</li>
                  <li><strong>2Checkout (Verifone):</strong> For secure payment processing and subscription management</li>
                  <li><strong>Vercel:</strong> For reliable hosting and global content delivery</li>
                </ul>
                <p>These services have their own privacy policies governing how they handle your data.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Disconnect your Notion account at any time</li>
                  <li>Request deletion of your account and data</li>
                  <li>Access and update your personal information</li>
                  <li>Cancel your subscription</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Contact Us</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>
                  If you have questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <p>
                  Email: privacy@instagramgridpreview.com<br />
                  Response time: Within 48 hours
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Changes to This Policy</h2>
              <div className="space-y-4 text-[var(--muted)]">
                <p>
                  We may update this Privacy Policy from time to time. We will notify users of any material changes by email or through our service.
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
