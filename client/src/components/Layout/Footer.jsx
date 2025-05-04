import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, CreditCard, ShieldCheck, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-1 lg:col-span-2">
            <Link to="/" className="inline-flex items-center">
              <div className="bg-blue-600 text-white p-1 rounded mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <span className="text-xl font-bold text-blue-600">RentEase</span>
            </Link>
            <p className="mt-4 text-gray-600 max-w-md">
              Rent anything, anytime. The simple way to share and use items in your community, saving money and reducing waste through the power of sharing economy.
            </p>
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Trust & Safety</h4>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <ShieldCheck className="h-4 w-4 mr-1 text-blue-600" />
                  <span>Verified Users</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <CreditCard className="h-4 w-4 mr-1 text-blue-600" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="h-4 w-4 mr-1 text-blue-600" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 relative">
              <span className="relative z-10">Quick Links</span>
              <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-blue-600"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/browse" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="mr-2 text-xs">→</span> Browse Items
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="mr-2 text-xs">→</span> Dashboard
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="mr-2 text-xs">→</span> List Your Item
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="mr-2 text-xs">→</span> How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="mr-2 text-xs">→</span> Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 relative">
              <span className="relative z-10">Support</span>
              <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-blue-600"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="mr-2 text-xs">→</span> Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="mr-2 text-xs">→</span> Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="mr-2 text-xs">→</span> FAQs
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="mr-2 text-xs">→</span> Community
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="mr-2 text-xs">→</span> Submit Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 relative">
              <span className="relative z-10">Legal</span>
              <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-blue-600"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="mr-2 text-xs">→</span> Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="mr-2 text-xs">→</span> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="mr-2 text-xs">→</span> Safety Guidelines
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="mr-2 text-xs">→</span> Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/dispute" className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <span className="mr-2 text-xs">→</span> Dispute Resolution
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Contact & Social Bar */}
      <div className="bg-gray-50 border-t border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4 md:mb-0">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-1 text-blue-600" />
                <a href="mailto:contact@rentease.com" className="hover:text-blue-600">contact@rentease.com</a>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-1 text-blue-600" />
                <a href="tel:+18001234567" className="hover:text-blue-600">+1 (800) 123-4567</a>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                <span>Available nationwide</span>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright Bar */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} RentEase. All rights reserved.</p>
            <div className="mt-2 md:mt-0 flex flex-wrap justify-center gap-4">
              <Link to="/sitemap" className="hover:text-blue-600 transition-colors">Sitemap</Link>
              <Link to="/accessibility" className="hover:text-blue-600 transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
      
     
    </footer>
  );
};

export default Footer;