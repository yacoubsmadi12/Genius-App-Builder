import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageCircle, Book, Send, CheckCircle, Loader2 } from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiRequest("POST", "/api/contact", {
        name,
        email,
        subject,
        message
      });

      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you soon.",
      });
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
        <p className="text-muted-foreground text-lg">Have questions? We'd love to hear from you</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4 mt-1">
                <Mail className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email Us</h3>
                <p className="text-muted-foreground">support@geniusappbuilder.com</p>
                <p className="text-muted-foreground text-sm">We'll respond within 24 hours</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mr-4 mt-1">
                <MessageCircle className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Live Chat</h3>
                <p className="text-muted-foreground">Available 9AM - 6PM PST</p>
                <p className="text-muted-foreground text-sm">Get instant help from our team</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mr-4 mt-1">
                <Book className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Documentation</h3>
                <p className="text-muted-foreground">Comprehensive guides and tutorials</p>
                <p className="text-muted-foreground text-sm">Self-service help resources</p>
              </div>
            </div>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  data-testid="input-name"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  data-testid="input-email"
                />
              </div>
              
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select value={subject} onValueChange={setSubject} required>
                  <SelectTrigger data-testid="select-subject">
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="billing">Billing Question</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Tell us how we can help..."
                  required
                  data-testid="textarea-message"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full btn-primary" 
                disabled={loading}
                data-testid="button-send-message"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
            
            {success && (
              <Alert className="mt-6" data-testid="alert-success">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Message sent successfully! We'll get back to you soon.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
