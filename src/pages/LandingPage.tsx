import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Truck, CheckCircle, Star, ArrowRight, Users, Shield, Clock } from 'lucide-react';
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
      icon: <Package className="h-12 w-12 text-yellow-400" />,
      title: "Secure Packaging",
      description: "Your items are handled with care from Miami to Jamaica"
    },
    {
      icon: <Truck className="h-12 w-12 text-green-400" />,
      title: "Fast Delivery",
      description: "Quick transit times with reliable shipping schedules"
    },
    {
      icon: <Shield className="h-12 w-12 text-yellow-400" />,
      title: "Full Insurance",
      description: "Complete protection for your valuable shipments"
    },
    {
      icon: <Clock className="h-12 w-12 text-green-400" />,
      title: "Real-time Tracking",
      description: "Know exactly where your package is at all times"
    }
  ];

  const testimonials = [
    {
      name: "Marcus Johnson",
      role: "Software Engineer",
      content: "YardPack makes sending care packages to my family in Kingston so easy. The tracking is spot-on!",
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
      content: "I ship products regularly and YardPack always delivers on time. Highly recommended!",
      rating: 5
    }
  ];

  if (showResults) {
    return <TrackingResults trackingNumber={trackingNumber} onBack={() => setShowResults(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900">
      {/* Navigation */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-md border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">YardPack</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-green-300 hover:text-yellow-400 transition-colors">Features</a>
              <a href="#how-it-works" className="text-green-300 hover:text-yellow-400 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-green-300 hover:text-yellow-400 transition-colors">Reviews</a>
              <Link to="/auth" className="bg-gradient-to-r from-green-500 to-yellow-500 text-black px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
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
            className="w-full h-full object-cover opacity-20"
          >
            <source src="/videos/shipping-hero-bg.mp4" type="video/mp4" />
          </video>
          {/* Video overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-gray-900/60 to-green-900/70"></div>
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
              Ship to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400"> Jamaica</span>
              <br />
              Made Simple
            </h1>
            <p className="text-xl md:text-2xl text-green-200 mb-8 max-w-3xl mx-auto animate-fade-in">
              Fast, reliable shipping from Miami to Jamaica. Track your packages in real-time and keep your family connected.
            </p>
            
            {/* Tracking Input */}
            <div className="max-w-md mx-auto mb-12 animate-scale-in">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                <h3 className="text-lg font-semibold text-white mb-4">Track Your Package</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="bg-white/20 border-green-500/50 text-white placeholder:text-green-200"
                  />
                  <Button 
                    onClick={handleTrack}
                    className="bg-gradient-to-r from-green-500 to-yellow-500 text-black hover:scale-105 transition-transform"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-green-500 to-yellow-500 text-black px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10 px-8 py-4 text-lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-green-200">Simple steps to ship your packages</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-green-500 to-yellow-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-black">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Create Account</h3>
              <p className="text-green-200">Sign up and create your shipping profile in minutes</p>
            </div>
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-green-500 to-yellow-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-black">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Ship Package</h3>
              <p className="text-green-200">Send your package to our Miami facility with your details</p>
            </div>
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-green-500 to-yellow-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-black">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Track & Receive</h3>
              <p className="text-green-200">Monitor your shipment and pick up in Jamaica</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose YardPack?</h2>
            <p className="text-xl text-green-200">Everything you need for hassle-free shipping</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-green-500/20 hover:border-yellow-500/50 transition-colors group hover:scale-105 transform transition-transform">
                <div className="mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-green-200">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">What Our Customers Say</h2>
            <p className="text-xl text-green-200">Trusted by thousands shipping to Jamaica</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-green-500/20 hover:scale-105 transition-transform">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-green-200 mb-4 italic">"{testimonial.content}"</p>
                <div className="border-t border-green-500/20 pt-4">
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-green-300 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Ship?</h2>
          <p className="text-xl text-green-200 mb-8">Join thousands of satisfied customers shipping to Jamaica</p>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-green-500 to-yellow-500 text-black px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform">
              Start Shipping Today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-green-500/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-6 w-6 text-yellow-400" />
                <span className="text-lg font-bold text-white">YardPack</span>
              </div>
              <p className="text-green-200">Connecting Miami to Jamaica, one package at a time.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-green-200">
                <li>Package Shipping</li>
                <li>Real-time Tracking</li>
                <li>Duty Calculation</li>
                <li>Insurance</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-green-200">
                <li>Track Package</li>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Shipping Guide</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-green-200">
                <li>About Us</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-500/20 mt-8 pt-8 text-center">
            <p className="text-green-200">&copy; 2024 YardPack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
