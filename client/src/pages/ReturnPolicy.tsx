import { Card, CardContent } from "@/components/ui/card";

export default function ReturnPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Return Policy</h1>
        <p className="text-muted-foreground">Last updated: January 2024</p>
      </div>
      
      <Card>
        <CardContent className="p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Refund Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We want you to be completely satisfied with Genius App Builder. You may be eligible for a refund under the following conditions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Request made within 30 days of purchase</li>
              <li>Technical issues that prevent service usage</li>
              <li>Service not meeting advertised specifications</li>
              <li>Billing errors or unauthorized charges</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Non-Refundable Items</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The following are not eligible for refunds:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Partial month charges for canceled subscriptions</li>
              <li>Services used extensively before requesting refund</li>
              <li>Refund requests made after 30-day window</li>
              <li>Digital downloads that have been successfully generated</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Refund Process</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To request a refund:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>Contact our support team at support@geniusappbuilder.com</li>
              <li>Include your account email and reason for refund request</li>
              <li>Provide any relevant details about technical issues</li>
              <li>Allow 5-7 business days for review and processing</li>
            </ol>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Subscription Cancellation</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can cancel your subscription at any time from your account settings. Cancellation will take effect at the end of your current billing period. No partial refunds are provided for unused time within a billing period.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Processing Time</h2>
            <p className="text-muted-foreground leading-relaxed">
              Approved refunds will be processed within 7-10 business days and credited back to your original payment method. The time it takes for the refund to appear in your account may vary depending on your payment provider.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Support</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about our return policy or need assistance with a refund request, please contact us at support@geniusappbuilder.com or use our contact form.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
