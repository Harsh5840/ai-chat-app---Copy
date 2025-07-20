import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  Stethoscope,
  ChefHat,
  Code,
  Scale,
  Dumbbell,
  DollarSign,
  BookOpen,
  Menu,
  X,
  Star,
  Users,
  Zap,
  Shield
} from 'lucide-react';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const aiRooms = [
    {
      id: 'devgpt',
      name: 'DevGPT',
      description: 'Your personal coding assistant',
      icon: Code,
      imageUrl: '/images/devgpt.png',
      color: 'from-green-400 to-teal-400',
      neonColor: 'shadow-green-500/50',
      borderColor: 'border-green-400/30',
      members: '15.2k'
    },
    {
      id: 'chefgpt',
      name: 'ChefGPT',
      description: 'Your culinary expert',
      icon: ChefHat,
      imageUrl: '/images/chefgpt.png',
      color: 'from-orange-400 to-yellow-400',
      neonColor: 'shadow-orange-500/50',
      borderColor: 'border-orange-400/30',
      members: '8.7k'
    },
    {
      id: 'docgpt',
      name: 'DocGPT',
      description: 'Your medical consultant',
      icon: Stethoscope,
      imageUrl: '/images/docgpt.png',
      color: 'from-red-400 to-pink-400',
      neonColor: 'shadow-red-500/50',
      borderColor: 'border-red-400/30',
      members: '12.4k'
    },
    {
      id: 'legalgpt',
      name: 'LegalGPT',
      description: 'Your legal guide',
      icon: Scale,
      imageUrl: '/images/legalgpt.png',
      color: 'from-purple-400 to-violet-400',
      neonColor: 'shadow-purple-500/50',
      borderColor: 'border-purple-400/30',
      members: '4.9k'
    },
    {
      id: 'fitgpt',
      name: 'FitGPT',
      description: 'Your fitness coach',
      icon: Dumbbell,
      imageUrl: '/images/fitgpt.png',
      color: 'from-pink-400 to-rose-400',
      neonColor: 'shadow-pink-500/50',
      borderColor: 'border-pink-400/30',
      members: '7.1k'
    },
    {
      id: 'financegpt',
      name: 'FinanceGPT',
      description: 'Your financial advisor',
      icon: DollarSign,
      imageUrl: '/images/financegpt.png',
      color: 'from-emerald-400 to-green-400',
      neonColor: 'shadow-emerald-500/50',
      borderColor: 'border-emerald-400/30',
      members: '6.3k'
    },
    {
      id: 'storygpt',
      name: 'StoryGPT',
      description: 'Your storytelling companion',
      icon: BookOpen,
      imageUrl: '/images/storygpt.png',
      color: 'from-blue-400 to-indigo-400',
      neonColor: 'shadow-blue-500/50',
      borderColor: 'border-blue-400/30',
      members: '5.5k'
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Medical Student',
      content: 'DocGPT has been incredibly helpful for my studies. The responses are accurate and well-explained.',
      rating: 5
    },
    {
      name: 'Mark Chen',
      role: 'Software Developer',
      content: 'DevGPT saved me hours of debugging. The real-time chat format makes it so much better than traditional forums.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Home Cook',
      content: 'ChefGPT helped me master French cooking techniques. The step-by-step guidance is amazing!',
      rating: 5
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Chat',
      description: 'Instant responses from specialized AI assistants'
    },
    {
      icon: Users,
      title: 'Expert Communities',
      description: 'Join rooms with like-minded learners and experts'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your conversations are protected and confidential'
    }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20 animate-pulse"></div>
      <div className="fixed inset-0 bg-gradient-to-tr from-pink-900/10 via-transparent to-green-900/10 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="fixed inset-0 bg-gradient-to-bl from-transparent via-indigo-900/10 to-red-900/10 animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Content */}
      <div className="relative z-10">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm border-b border-cyan-500/30 shadow-lg shadow-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-cyan-400 drop-shadow-lg" />
              <span className="ml-2 text-xl font-bold text-white">AIChat Pro</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#rooms" className="text-gray-300 hover:text-cyan-400 font-medium transition-colors hover:drop-shadow-lg">
                Chat Rooms
              </a>
              <a href="#features" className="text-gray-300 hover:text-cyan-400 font-medium transition-colors hover:drop-shadow-lg">
                Features
              </a>
              <a href="#testimonials" className="text-gray-300 hover:text-cyan-400 font-medium transition-colors hover:drop-shadow-lg">
                Reviews
              </a>
              <a href="#about" className="text-gray-300 hover:text-cyan-400 font-medium transition-colors hover:drop-shadow-lg">
                About
              </a>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <button className="text-gray-300 hover:text-cyan-400 font-medium transition-all hover:drop-shadow-lg border border-cyan-500/30 px-4 py-2 rounded-lg hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30">
                  Log In
                </button>
              </Link>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-4 py-2 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all font-medium shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-400/60 border border-cyan-400/50">
                Sign Up
              </button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/90 backdrop-blur-sm border-t border-cyan-500/30">
            <div className="px-4 py-4 space-y-3">
              <a href="#rooms" className="block text-gray-300 hover:text-cyan-400 font-medium">
                Chat Rooms
              </a>
              <a href="#features" className="block text-gray-300 hover:text-cyan-400 font-medium">
                Features
              </a>
              <a href="#testimonials" className="block text-gray-300 hover:text-cyan-400 font-medium">
                Reviews
              </a>
              <a href="#about" className="block text-gray-300 hover:text-cyan-400 font-medium">
                About
              </a>
              <div className="pt-3 border-t space-y-2">
                <Link href="/login">
                  <button className="block w-full text-left text-gray-300 hover:text-cyan-400 font-medium border border-cyan-500/30 px-4 py-2 rounded-lg hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30">
                    Log In
                  </button>
                </Link>
                <button className="block w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-4 py-2 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all font-medium shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-400/60 border border-cyan-400/50">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                Chat with AI Experts in{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
                  Real Time
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Join specialized AI chat rooms where expert assistants provide instant, personalized guidance 
                on everything from health and cooking to coding, law, fitness, finance, and storytelling.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all transform hover:scale-105 font-semibold text-lg shadow-xl shadow-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-400/60 border border-cyan-400/50">
                    Log In to Start Chatting
                  </button>
                </Link>
                <button className="border-2 border-purple-500 text-purple-400 px-8 py-3 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-400/50">
                  Explore Rooms
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
              <img 
                src="https://www.lummi.ai/photo/futuristic-robot-with-red-visor-y06wf" 
                alt="Futuristic AI Robot" 
                className="relative z-10 w-full h-auto rounded-2xl shadow-2xl shadow-cyan-500/30 border border-cyan-500/30"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Why Choose AIChat Pro?</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Experience the future of AI-assisted learning and problem-solving
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6 rounded-xl hover:shadow-xl hover:shadow-cyan-500/20 transition-all bg-black/40 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-400/40">
                  <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
                    <Icon className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Rooms Section */}
      <section id="rooms" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Available AI Specialists
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Connect with specialized AI assistants, each trained to excel in their field of expertise
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiRooms.map((room) => {
              const Icon = room.icon;
              return (
                <div 
                  key={room.id} 
                  className={`bg-black/60 backdrop-blur-sm rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border ${room.borderColor} hover:${room.neonColor}`}
                >
                  <div className={`h-32 bg-gradient-to-br ${room.color} relative`}>
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                    <div className="absolute bottom-4 left-4">
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute top-4 right-4 bg-white bg-opacity-20 rounded-full px-3 py-1">
                      <span className="text-white text-sm font-medium">{room.members} members</span>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <img src={room.imageUrl} alt={room.name} className="h-10 w-10 rounded-full border-2 border-white shadow" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{room.name}</h3>
                    <p className="text-gray-300 mb-4 leading-relaxed">{room.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
              What Our Users Say
            </h2>
            <p className="text-gray-300 text-lg">
              Join thousands of satisfied users who have transformed their learning experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-black/40 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-purple-500/20 transition-all border border-purple-500/20 hover:border-purple-400/40">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current drop-shadow-lg" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative bg-gradient-to-r from-purple-900/50 to-cyan-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
            Ready to Connect with AI Experts?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users already getting expert AI assistance. Create your account and start chatting with specialized AI assistants.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all font-semibold text-lg shadow-xl shadow-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-400/60 border border-cyan-400/50 hover:scale-105">
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/80 backdrop-blur-sm text-white py-12 border-t border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-8 w-8 text-cyan-400 drop-shadow-lg" />
                <span className="ml-2 text-xl font-bold">AIChat Pro</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Connecting you with specialized AI assistants for expert guidance and real-time problem solving.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors hover:drop-shadow-lg">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors hover:drop-shadow-lg">Terms of Service</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Popular Rooms</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors hover:drop-shadow-lg">DocGPT</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors hover:drop-shadow-lg">DevGPT</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors hover:drop-shadow-lg">ChefGPT</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors hover:drop-shadow-lg">EduGPT</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors hover:drop-shadow-lg">About Us</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors hover:drop-shadow-lg">Contact</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors hover:drop-shadow-lg">Careers</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors hover:drop-shadow-lg">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-cyan-500/30 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AIChat Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

export default App;