import { Card, CardContent } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
        <p className="text-muted-foreground">Last updated: January 2024</p>
      </div>
      
      <Card>
        <CardContent className="p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Genius App Builder ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of Genius App Builder per device for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained on the website</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">3. Generated Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of applications generated using our service. However, you are responsible for ensuring that your generated applications comply with all applicable laws and regulations. Genius App Builder is not liable for any legal issues arising from your generated content.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">4. Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              The materials on Genius App Builder are provided on an 'as is' basis. Genius App Builder makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">5. Limitations</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall Genius App Builder or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Genius App Builder, even if Genius App Builder or its authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">6. Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">7. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms & Conditions, please contact us at legal@geniusappbuilder.com.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
