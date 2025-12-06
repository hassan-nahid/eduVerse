import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function TermsPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center mb-2">
            Terms and Conditions
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Last updated: December 6, 2025
          </p>
        </CardHeader>

        <CardContent className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing and using eduVerse (&quot;the Platform&quot;), you accept and agree to be bound by the 
              terms and provisions of this agreement. If you do not agree to abide by the above, please 
              do not use this service.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p className="text-muted-foreground mb-4">
              Permission is granted to temporarily access the materials (information or software) on 
              eduVerse for personal, non-commercial use only. This is the grant of a license, 
              not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the Platform</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
            </ul>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              When you create an account with us, you must provide accurate, complete, and current 
              information at all times. Failure to do so constitutes a breach of the Terms, which may 
              result in immediate termination of your account.
            </p>
            <p className="text-muted-foreground mb-4">
              You are responsible for safeguarding the password that you use to access the Platform and 
              for any activities or actions under your password.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Subscription and Payment</h2>
            <p className="text-muted-foreground mb-4">
              Some parts of the Platform are billed on a subscription basis. You will be billed in 
              advance on a recurring and periodic basis (such as monthly or annually). Billing cycles 
              are set based on the type of subscription plan you select.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>All fees are non-refundable unless otherwise stated</li>
              <li>Payment processing is handled securely through SSLCommerz</li>
              <li>Subscription automatically renews unless cancelled before the renewal date</li>
              <li>We reserve the right to modify subscription fees with 30 days notice</li>
            </ul>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Content and Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              The Platform and its original content (excluding user-generated content), features, and 
              functionality are and will remain the exclusive property of eduVerse and its licensors.
            </p>
            <p className="text-muted-foreground mb-4">
              Users retain ownership of content they post on the Platform but grant eduVerse a 
              non-exclusive, worldwide, royalty-free license to use, display, and distribute such content.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. User Conduct</h2>
            <p className="text-muted-foreground mb-4">
              You agree not to use the Platform to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Post or transmit any content that is unlawful, harmful, or offensive</li>
              <li>Impersonate any person or entity</li>
              <li>Violate any applicable local, state, national, or international law</li>
              <li>Interfere with or disrupt the Platform or servers</li>
              <li>Collect or store personal data about other users without consent</li>
              <li>Engage in any form of cheating or manipulation of challenges and quizzes</li>
            </ul>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Rewards and Gamification</h2>
            <p className="text-muted-foreground mb-4">
              eduVerse offers rewards, badges, avatars, and titles as part of its gamification system. 
              These digital assets:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Have no monetary value and cannot be exchanged for cash</li>
              <li>Are subject to availability and may be modified or discontinued</li>
              <li>May be revoked if terms are violated or account is terminated</li>
              <li>Are earned through legitimate participation in challenges and activities</li>
            </ul>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Privacy Policy</h2>
            <p className="text-muted-foreground mb-4">
              Your use of the Platform is also governed by our Privacy Policy. We collect and use 
              personal information to provide and improve our services. By using the Platform, you 
              consent to our collection and use of personal data as outlined in the Privacy Policy.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimer</h2>
            <p className="text-muted-foreground mb-4">
              The materials on the Platform are provided on an &quot;as is&quot; basis. eduVerse makes no 
              warranties, expressed or implied, and hereby disclaims and negates all other warranties 
              including, without limitation, implied warranties or conditions of merchantability, 
              fitness for a particular purpose, or non-infringement of intellectual property or other 
              violation of rights.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Limitations of Liability</h2>
            <p className="text-muted-foreground mb-4">
              In no event shall eduVerse or its suppliers be liable for any damages (including, without 
              limitation, damages for loss of data or profit, or due to business interruption) arising 
              out of the use or inability to use the Platform, even if eduVerse or an authorized 
              representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
            <p className="text-muted-foreground mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, 
              for any reason whatsoever, including without limitation if you breach the Terms. Upon 
              termination, your right to use the Platform will immediately cease.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
              We will provide notice of any significant changes by posting the new Terms on this page and 
              updating the &quot;Last updated&quot; date. Your continued use of the Platform after any changes 
              constitutes acceptance of those changes.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
            <p className="text-muted-foreground mb-4">
              These Terms shall be governed and construed in accordance with the laws of Bangladesh, 
              without regard to its conflict of law provisions. Any disputes arising from these Terms 
              or your use of the Platform shall be subject to the exclusive jurisdiction of the courts 
              of Bangladesh.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="font-medium">eduVerse Support Team</p>
              <p className="text-muted-foreground">Email: support@eduverse.com</p>
              <p className="text-muted-foreground">Address: Dhaka, Bangladesh</p>
            </div>
          </section>

          <Separator className="my-6" />

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mt-8">
            <p className="text-sm text-muted-foreground text-center">
              By using eduVerse, you acknowledge that you have read, understood, and agree to be 
              bound by these Terms and Conditions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
