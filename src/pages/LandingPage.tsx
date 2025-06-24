import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Truck, CheckCircle, Star, ArrowRight, Users, Shield, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TrackingResults from '@/components/TrackingResults';

const LandingPage: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTrack = () => {
    if (trackingNumber.trim()) {
      setShowResults(true);
    }
  };

  const features = [{
    icon: <Package className="h-12 w-12 text-teal-400" />,
    title: "Secure Packaging",
    description: "Your items are handled with care from Miami to Kingston"
  }, {
    icon: <Truck className="h-12 w-12 text-coral-400" />,
    title: "Fast Delivery",
    description: "Reliable shipping schedules between Miami and Kingston"
  }, {
    icon: <Shield className="h-12 w-12 text-purple-400" />,
    title: "Full Insurance",
    description: "Complete protection for your valuable shipments"
  }, {
    icon: <Clock className="h-12 w-12 text-amber-400" />,
    title: "Real-time Tracking",
    description: "Know exactly where your package is at all times"
  }];

  const testimonials = [{
    name: "Marcus Johnson",
    role: "Software Engineer",
    content: "JIL International makes sending care packages to my family in Kingston so easy. The tracking is spot-on!",
    rating: 5
  }, {
    name: "Keisha Williams",
    role: "Marketing Manager",
    content: "Best shipping service for Jamaica! Fast, reliable, and the team is amazing.",
    rating: 5
  }, {
    name: "David Brown",
    role: "Business Owner",
    content: "I ship products regularly and JIL International always delivers on time. Highly recommended!",
    rating: 5
  }];

  if (showResults) {
    return <TrackingResults trackingNumber={trackingNumber} onBack={() => setShowResults(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-teal-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 -left-40 w-96 h-96 bg-gradient-to-br from-coral-400/20 to-amber-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 right-20 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-6 h-6 border-2 border-teal-400/30 rotate-45 animate-bounce" style={{
          animationDelay: '0.5s'
        }}></div>
        <div className="absolute top-40 right-32 w-4 h-4 bg-coral-400/40 rounded-full animate-ping" style={{
          animationDelay: '1s'
        }}></div>
        <div className="absolute bottom-60 left-40 w-8 h-8 border-2 border-purple-400/30 rounded-full animate-spin" style={{
          animationDuration: '8s'
        }}></div>
        <div className="absolute bottom-32 right-60 w-5 h-5 bg-amber-400/40 transform rotate-45 animate-pulse" style={{
          animationDelay: '1.5s'
        }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <Package className="h-8 w-8 text-teal-400 transform group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">YardPack</span>
                <div className="text-xs text-slate-300 -mt-1">by JIL International</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-200 hover:text-teal-400 transition-all duration-300 font-medium relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-400 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#how-it-works" className="text-slate-200 hover:text-purple-400 transition-all duration-300 font-medium relative group">
                How It Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#testimonials" className="text-slate-200 hover:text-coral-400 transition-all duration-300 font-medium relative group">
                Reviews
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral-400 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#contact" className="text-slate-200 hover:text-amber-400 transition-all duration-300 font-medium relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
              </a>
              <Link to="/auth" className="bg-gradient-to-r from-teal-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:from-teal-400 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <section className="relative overflow-hidden pt-20 pb-32" style={{
        transform: `translateY(${scrollY * 0.1}px)`
      }}>
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/videos/jlvid.mp4"
          >
            <source src="/videos/jlvid.mp4" type="video/mp4" />
          </video>
          
          {/* Video Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/80 to-teal-900/90"></div>
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8 animate-fade-in">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 mb-8">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm font-medium">Connecting Miami to Kingston</span>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8 animate-fade-in leading-tight">
              <span className="bg-gradient-to-r from-teal-400 via-purple-400 to-amber-400 bg-clip-text text-transparent drop-shadow-2xl">
                J|L International
              </span>
              <br />
              <span className="text-white/90 text-4xl md:text-5xl font-light">
                Solutions
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto animate-fade-in leading-relaxed" style={{
              animationDelay: '0.2s'
            }}>
              Premium shipping solutions that connect hearts across the Caribbean. 
              <span className="text-teal-300 font-medium"> Track with confidence, ship with care.</span>
            </p>
            
            {/* Enhanced Tracking Input */}
            <div className="max-w-lg mx-auto mb-16 animate-scale-in" style={{
              animationDelay: '0.4s'
            }}>
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
                  <h3 className="text-xl font-semibold text-white">Track Your Journey</h3>
                </div>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 rounded-2xl backdrop-blur-md focus:bg-white/30 transition-all duration-300"
                  />
                  <Button
                    onClick={handleTrack}
                    className="bg-gradient-to-r from-teal-500 to-purple-600 text-white hover:from-teal-400 hover:to-purple-500 transition-all duration-300 transform hover:scale-110 rounded-2xl px-6 shadow-lg hover:shadow-xl"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in" style={{
              animationDelay: '0.6s'
            }}>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-teal-500 to-purple-600 text-white px-10 py-4 text-lg font-semibold hover:from-teal-400 hover:to-purple-500 transition-all duration-300 transform hover:scale-110 rounded-2xl shadow-xl hover:shadow-2xl group">
                  Start Your Journey 
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Button variant="outline" className="border-white/30 px-10 py-4 text-lg backdrop-blur-md text-white rounded-2xl transition-all duration-300 transform hover:scale-105 bg-amber-400 hover:bg-amber-300">
                Discover More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-white via-slate-50 to-purple-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 via-purple-400 to-coral-400"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 border border-purple-300 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-teal-300 rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block bg-gradient-to-r from-teal-100 to-purple-100 rounded-full px-6 py-2 mb-6">
              <span className="text-purple-700 font-semibold text-sm uppercase tracking-wide">Our Process</span>
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-purple-800 bg-clip-text text-transparent mb-6">How Magic Happens</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Three simple steps to connect your world</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Create Account",
                desc: "Join our family and create your shipping profile in minutes",
                color: "teal"
              },
              {
                step: "2",
                title: "Ship Package",
                desc: "Send your package to our Miami facility with your unique details",
                color: "purple"
              },
              {
                step: "3",
                title: "Track & Receive",
                desc: "Monitor your shipment's journey and celebrate its arrival in Kingston",
                color: "coral"
              }
            ].map((item, index) => (
              <div key={index} className="text-center group animate-fade-in" style={{
                animationDelay: `${index * 0.2}s`
              }}>
                <div className={`bg-gradient-to-br ${
                  item.color === 'teal' ? 'from-teal-400 to-teal-600' : 
                  item.color === 'purple' ? 'from-purple-400 to-purple-600' : 
                  'from-coral-400 to-coral-600'
                } rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:scale-110 transition-all duration-500 relative overflow-hidden`}>
                  <span className="text-3xl font-bold text-white relative z-10">{item.step}</span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-amber-400"></div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-purple-600 transition-colors duration-300">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block bg-white/10 backdrop-blur-md rounded-full px-6 py-2 mb-6 border border-white/20">
              <span className="text-teal-300 font-semibold text-sm uppercase tracking-wide">Why Choose Us</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">Crafted with Excellence</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">Every detail designed for your peace of mind</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 group hover:scale-105 transform shadow-2xl hover:shadow-3xl animate-fade-in" style={{
                animationDelay: `${index * 0.1}s`
              }}>
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300 relative">
                  {feature.icon}
                  <div className="absolute inset-0 bg-current opacity-20 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-teal-300 transition-colors duration-300">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-white via-teal-50 to-purple-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 400">
            <defs>
              <pattern id="testimonial-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="#14b8a6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#testimonial-pattern)" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block bg-gradient-to-r from-teal-100 to-purple-100 rounded-full px-6 py-2 mb-6">
              <span className="text-purple-700 font-semibold text-sm uppercase tracking-wide">Testimonials</span>
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-purple-800 bg-clip-text text-transparent mb-6">Stories of Connection</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Real experiences from our shipping family</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/50 hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-2xl animate-fade-in group" style={{
                animationDelay: `${index * 0.2}s`
              }}>
                <div className="flex mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic text-lg leading-relaxed">"{testimonial.content}"</p>
                <div className="border-t border-slate-200 pt-6 group-hover:border-teal-200 transition-colors duration-300">
                  <p className="text-slate-800 font-bold text-lg">{testimonial.name}</p>
                  <p className="text-slate-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-teal-900 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-teal-400/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-bl from-purple-400/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-12">
            <div className="inline-block bg-white/10 backdrop-blur-md rounded-full px-6 py-2 mb-6 border border-white/20">
              <span className="text-teal-300 font-semibold text-sm uppercase tracking-wide">Get In Touch</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">Let's Connect</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">Ready to start your shipping journey? We're here to help</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: Phone,
                title: "Phone",
                info: "+1 (305) 555-0123",
                color: "teal"
              },
              {
                icon: Mail,
                title: "Email",
                info: "info@jilinternational.com",
                color: "purple"
              },
              {
                icon: MapPin,
                title: "Miami Office",
                info: "123 Shipping Lane\nMiami, FL 33101",
                color: "coral"
              }
            ].map((contact, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 group hover:scale-105 transform shadow-2xl animate-fade-in" style={{
                animationDelay: `${index * 0.1}s`
              }}>
                <contact.icon className={`h-10 w-10 mx-auto mb-4 ${
                  contact.color === 'teal' ? 'text-teal-400' : 
                  contact.color === 'purple' ? 'text-purple-400' : 
                  'text-coral-400'
                } group-hover:scale-110 transition-transform duration-300`} />
                <h3 className="font-bold text-white mb-3 text-lg">{contact.title}</h3>
                <p className="text-white/70 whitespace-pre-line">{contact.info}</p>
              </div>
            ))}
          </div>
          
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-teal-500 to-purple-600 text-white px-10 py-4 text-lg font-semibold hover:from-teal-400 hover:to-purple-500 transition-all duration-300 transform hover:scale-110 rounded-2xl shadow-xl hover:shadow-2xl group">
              Begin Your Adventure
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-xl border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6 group">
                <Package className="h-8 w-8 text-teal-400 group-hover:rotate-12 transition-transform duration-300" />
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">YardPack</span>
                  <div className="text-xs text-slate-400">by JIL International</div>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed">Connecting hearts across the Caribbean with premium shipping solutions that you can trust.</p>
            </div>
            {[
              {
                title: "Services",
                items: ["Package Shipping", "Real-time Tracking", "Duty Calculation", "Insurance"]
              },
              {
                title: "Support",
                items: ["Track Package", "Help Center", "Contact Us", "Shipping Guide"]
              },
              {
                title: "Company",
                items: ["About JIL International", "Careers", "Privacy Policy", "Terms of Service"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="text-white font-bold mb-6 text-lg">{section.title}</h4>
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i}>
                      <a href="#" className="text-slate-300 hover:text-teal-400 transition-colors duration-300 relative group">
                        {item}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-400 group-hover:w-full transition-all duration-300"></span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-slate-400">&copy; 2024 JIL International Solutions. Crafted with ❤️ for the Caribbean community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
