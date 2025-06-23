
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Truck, CheckCircle, Star, ArrowRight, Users, Shield, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TrackingResults from '@/components/TrackingResults';

const LandingPage: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleTrack = () => {
    if (trackingNumber.trim()) {
      setShowResults(true);
    }
  };

  const features = [
    {
      icon: <Package className="h-12 w-12 text-blue-500" />,
      title: "Secure Packaging",
      description: "Your items are handled with care from Miami to Kingston"
    },
    {
      icon: <Truck className="h-12 w-12 text-blue-600" />,
      title: "Fast Delivery",
      description: "Reliable shipping schedules between Miami and Kingston"
    },
    {
      icon: <Shield className="h-12 w-12 text-blue-500" />,
      title: "Full Insurance",
      description: "Complete protection for your valuable shipments"
    },
    {
      icon: <Clock className="h-12 w-12 text-blue-600" />,
      title: "Real-time Tracking",
      description: "Know exactly where your package is at all times"
    }
  ];

  const testimonials = [
    {
      name: "Marcus Johnson",
      role: "Software Engineer",
      content: "JIL International makes sending care packages to my family in Kingston so easy. The tracking is spot-on!",
      rating: 5
    },
    {
      name: "Keisha Williams",
      role: "Marketing Manager",
      content: "Best shipping service for Jamaica! Fast, reliable, and the team is amazing.",
      rating: 5
    },
    {
      name: "David Brown",
      role: "Business Owner",
      content: "I ship products regularly and JIL International always delivers on time. Highly recommended!",
      rating: 5
    }
  ];

  if (showResults) {
    return <TrackingResults trackingNumber={trackingNumber} onBack={() => setShowResults(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navigation */}
      <nav className="relative z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <span className="text-2xl font-bold text-slate-800">YardPack</span>
                <div className="text-xs text-slate-600 -mt-1">by JIL International</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">How It Works</a>
              <a href="#testimonials" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">Reviews</a>
              <a href="#contact" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">Contact</a>
              <Link to="/auth" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Video */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source src="/videos/shipping-hero-bg.mp4" type="video/mp4" />
          </video>
          {/* Video overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-blue-900/70 to-slate-800/80"></div>
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="text-blue-300 text-lg font-medium mb-2">JIL International Solutions</div>
              <div className="flex justify-center items-center space-x-4 text-sm text-blue-200">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Miami: 25.7617° N, 80.1918° W
                </div>
                <div className="hidden sm:block">•</div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Kingston: 17.9712° N, 76.7936° W
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
              Ship to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600"> Jamaica</span>
              <br />
              Made Simple
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto animate-fade-in">
              Professional shipping solutions from Miami to Kingston. Track your packages in real-time and keep your family connected.
            </p>
            
            {/* Tracking Input */}
            <div className="max-w-md mx-auto mb-12 animate-scale-in">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-blue-200 shadow-lg">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Track Your Package</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="bg-white border-blue-200 text-slate-800 placeholder:text-slate-500"
                  />
                  <Button 
                    onClick={handleTrack}
                    className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button className="bg-blue-600 text-white px-8 py-4 text-lg font-semibold hover:bg-blue-700 transition-colors">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">How It Works</h2>
            <p className="text-xl text-slate-600">Simple steps to ship your packages</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="bg-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Create Account</h3>
              <p className="text-slate-600">Sign up and create your shipping profile in minutes</p>
            </div>
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="bg-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Ship Package</h3>
              <p className="text-slate-600">Send your package to our Miami facility with your details</p>
            </div>
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="bg-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Track & Receive</h3>
              <p className="text-slate-600">Monitor your shipment and pick up in Kingston</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Why Choose JIL International?</h2>
            <p className="text-xl text-slate-600">Everything you need for hassle-free shipping</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-blue-100 hover:border-blue-300 transition-colors group hover:scale-105 transform transition-transform shadow-sm">
                <div className="mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-slate-600">Trusted by thousands shipping to Jamaica</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-6 border border-blue-100 hover:scale-105 transition-transform">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-blue-500 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="border-t border-blue-100 pt-4">
                  <p className="text-slate-800 font-semibold">{testimonial.name}</p>
                  <p className="text-slate-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-800 mb-6">Contact JIL International</h2>
          <p className="text-xl text-slate-600 mb-8">Get in touch for shipping inquiries and support</p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-blue-100">
              <Phone className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-2">Phone</h3>
              <p className="text-slate-600">+1 (305) 555-0123</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-blue-100">
              <Mail className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-2">Email</h3>
              <p className="text-slate-600">info@jilinternational.com</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-blue-100">
              <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-2">Miami Office</h3>
              <p className="text-slate-600">123 Shipping Lane<br />Miami, FL 33101</p>
            </div>
          </div>
          
          <Link to="/auth">
            <Button className="bg-blue-600 text-white px-8 py-4 text-lg font-semibold hover:bg-blue-700 transition-colors">
              Start Shipping Today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-6 w-6 text-blue-400" />
                <div>
                  <span className="text-lg font-bold text-white">YardPack</span>
                  <div className="text-xs text-slate-400">by JIL International</div>
                </div>
              </div>
              <p className="text-slate-300">Professional shipping solutions connecting Miami to Kingston, Jamaica.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-slate-300">
                <li>Package Shipping</li>
                <li>Real-time Tracking</li>
                <li>Duty Calculation</li>
                <li>Insurance</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-300">
                <li>Track Package</li>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Shipping Guide</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-300">
                <li>About JIL International</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center">
            <p className="text-slate-400">&copy; 2024 JIL International Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
