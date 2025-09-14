import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                G
              </div>
              <span className="text-xl font-bold">Genius App Builder</span>
            </div>
            <p className="text-muted-foreground text-sm">
              AI-powered Flutter app generation platform for modern developers.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors" data-testid="link-pricing-footer">
                  Pricing
                </Link>
              </li>
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors" data-testid="link-about-footer">
                  About
                </Link>
              </li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors" data-testid="link-contact-footer">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-privacy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-terms">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-foreground transition-colors" data-testid="link-return-policy">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Genius App Builder. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <i className="fab fa-github"></i>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <i className="fab fa-discord"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
