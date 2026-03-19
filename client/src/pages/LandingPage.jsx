import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function LandingPage() {
  const revealRefs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' })

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

    // Prompt highlight cycle
    const promptItems = document.querySelectorAll('.prompt-item')
    let current = 0
    const interval = setInterval(() => {
      promptItems.forEach((item, i) => {
        item.style.background = i === current ? 'rgba(0, 255, 156, 0.04)' : ''
        item.style.color = i === current ? 'rgba(255, 255, 255, 0.85)' : ''
      })
      current = (current + 1) % promptItems.length
    }, 3000)

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="font-inter">
      <Navbar variant="landing" />

      {/* ═══════ HERO ═══════ */}
      <section id="hero" className="section-dark bg-hero-glow min-h-screen flex flex-col items-center justify-center pt-24 pb-32 lg:pt-32 lg:pb-40 px-6">
        <div className="max-w-[1280px] mx-auto text-center">
          <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border border-white/10 bg-white/[0.03]">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-gray-400">Now in Public Beta</span>
          </div>

          <h1 className="reveal reveal-delay-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight max-w-4xl mx-auto mb-6">
            Turn Anything on the<br className="hidden sm:block" />
            Internet into a <span className="text-neon-green">Trigger</span>
          </h1>

          <p className="reveal reveal-delay-2 text-base sm:text-lg lg:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Get notified when prices drop, domains become available, or markets move — instantly. No code. No complexity.
          </p>

          <div className="reveal reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/signup" className="btn-primary animate-glow-pulse">
              Create Your First Trigger
              <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
            <a href="#how-it-works" className="btn-ghost">See How It Works</a>
          </div>

          {/* Demo Access Banner */}
          <div className="reveal reveal-delay-4 inline-flex flex-col sm:flex-row items-center gap-3 px-5 py-3 rounded-2xl border border-neon-green/20 bg-neon-green/[0.04] backdrop-blur-sm mb-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse flex-shrink-0" />
              <span className="text-xs font-semibold text-neon-green uppercase tracking-wider">Quick Demo Access</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-gray-400">
              <span>
                <span className="text-gray-500">Email: </span>
                <span className="font-mono text-gray-200 select-all">khushabkhan223@gmail.com</span>
              </span>
              <span className="text-gray-600 hidden sm:block">·</span>
              <span>
                <span className="text-gray-500">Pass: </span>
                <span className="font-mono text-gray-200 select-all">Triggerly_pass731</span>
              </span>
            </div>
          </div>

          {/* Prompt Box */}
          <div className="reveal reveal-delay-4 prompt-box">
            <div className="prompt-box-inner">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.04]">
                <svg className="w-4 h-4 text-neon-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span className="text-xs text-gray-500 font-medium">Try an example trigger...</span>
              </div>
              <div className="prompt-item">
                <svg className="w-4 h-4 flex-shrink-0 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                <span>Alert me if Bitcoin drops below $50k</span>
              </div>
              <div className="prompt-item">
                <svg className="w-4 h-4 flex-shrink-0 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                <span>Alert me if Tesla goes above $300</span>
              </div>
              <div className="prompt-item">
                <svg className="w-4 h-4 flex-shrink-0 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span>Tell me if myidea.com becomes available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="reveal max-w-[1280px] mx-auto mt-16 lg:mt-24 px-6 w-full">
          <div className="hero-dashboard p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-gray-500 ml-2">Triggerly Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-md bg-white/[0.04] text-xs text-gray-500">All Triggers</div>
                <div className="px-3 py-1 rounded-md bg-neon-green/10 text-xs text-neon-green font-medium">+ New</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
              <div className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.05]">
                <p className="text-xs text-gray-500 mb-1">Active Triggers</p>
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-xs text-neon-green mt-1">↑ 3 this week</p>
              </div>
              <div className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.05]">
                <p className="text-xs text-gray-500 mb-1">Alerts Triggered</p>
                <p className="text-2xl font-bold text-white">847</p>
                <p className="text-xs text-accent-purple-light mt-1">↑ 24 today</p>
              </div>
              <div className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.05]">
                <p className="text-xs text-gray-500 mb-1">Avg Response</p>
                <p className="text-2xl font-bold text-white">1.2s</p>
                <p className="text-xs text-gray-500 mt-1">~98.9% uptime</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-white/[0.02] border border-white/[0.05] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
                <span className="text-xs font-medium text-gray-400">Recent Triggers</span>
                <span className="text-xs text-gray-600">Status</span>
              </div>
              {[
                { icon: '₿', iconColor: 'text-yellow-500', name: 'BTC below $50,000', status: 'Active', statusClass: 'bg-neon-green/10 text-neon-green' },
                { icon: '📈', iconColor: 'text-green-400', name: 'TSLA above $300', status: 'Triggered', statusClass: 'bg-accent-purple/10 text-accent-purple-light' },
                { icon: '🌐', iconColor: 'text-blue-400', name: 'myidea.com availability', status: 'Active', statusClass: 'bg-neon-green/10 text-neon-green' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 hover:bg-white/[0.01] transition-colors ${i < 2 ? 'border-b border-white/[0.03]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className={`${item.iconColor} text-sm`}>{item.icon}</span>
                    <span className="text-sm text-gray-300">{item.name}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${item.statusClass}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SUPPORTED TRIGGERS ═══════ */}
      <section id="triggers" className="section-light py-24 lg:py-32 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <p className="reveal text-sm font-semibold text-accent-purple uppercase tracking-widest mb-4">Supported Triggers</p>
            <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark tracking-tight mb-5">Monitor What Matters to You</h2>
            <p className="reveal reveal-delay-2 text-base lg:text-lg text-muted max-w-2xl mx-auto">From crypto prices to domain availability — Triggerly watches the internet so you don't have to.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <svg className="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, bg: 'rgba(234, 179, 8, 0.08)', title: 'Crypto Alerts', desc: 'Track Bitcoin, Ethereum, and 1000+ tokens. Get notified when prices cross your thresholds.' },
              { icon: <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>, bg: 'rgba(34, 197, 94, 0.08)', title: 'Stock Alerts', desc: 'Monitor NASDAQ, NYSE, and global exchanges. Set triggers for any stock price movement.' },
              { icon: <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>, bg: 'rgba(59, 130, 246, 0.08)', title: 'Product Price Alerts', desc: 'Watch Amazon, Flipkart, and any e-commerce site. Never miss a price drop again.' },
              { icon: <svg className="w-6 h-6 text-accent-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, bg: 'rgba(124, 58, 237, 0.08)', title: 'Domain Availability', desc: 'Watch any domain name and get alerted the instant it becomes available to register.' },
            ].map((card, i) => (
              <div key={i} className={`reveal ${i > 0 ? `reveal-delay-${i}` : ''} card-light group`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300" style={{ background: card.bg }}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">{card.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section id="how-it-works" className="section-dark bg-glow-green py-24 lg:py-36 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16 lg:mb-24">
            <p className="reveal text-sm font-semibold text-neon-green uppercase tracking-widest mb-4">How It Works</p>
            <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-5">Three Steps. Zero Complexity.</h2>
            <p className="reveal reveal-delay-2 text-base lg:text-lg text-muted max-w-2xl mx-auto">Setting up a trigger takes less than 30 seconds. Here's how it works.</p>
          </div>
          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">
            <div className="step-connector" style={{ top: '2.5rem' }} />
            {[
              { num: '1', color: 'neon-green', title: 'Describe What to Watch', desc: 'Type what you want to monitor in plain English. No technical setup, no complex forms.' },
              { num: '2', color: 'accent-purple-light', title: 'Triggerly Monitors 24/7', desc: 'Our engine continuously watches the internet — prices, availability, changes — around the clock.', border: 'accent-purple' },
              { num: '3', color: 'neon-green', title: 'Get Notified Instantly', desc: 'Receive instant alerts via email, SMS, or push notification the moment your condition is met.' },
            ].map((step, i) => (
              <div key={i} className={`reveal ${i > 0 ? `reveal-delay-${i}` : ''} text-center lg:text-left`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 border border-${step.border || 'neon-green'}/20 bg-${step.border || 'neon-green'}/[0.05]`}>
                  <span className={`text-2xl font-bold text-${step.color}`}>{step.num}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed max-w-xs mx-auto lg:mx-0">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ DASHBOARD PREVIEW ═══════ */}
      <section id="dashboard" className="section-light py-24 lg:py-36 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <p className="reveal text-sm font-semibold text-accent-purple uppercase tracking-widest mb-4">Dashboard</p>
            <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark tracking-tight mb-5">Your Command Center</h2>
            <p className="reveal reveal-delay-2 text-base lg:text-lg text-muted max-w-2xl mx-auto">A clean, intuitive dashboard to manage all your triggers in one place.</p>
          </div>
          <div className="reveal dashboard-card max-w-4xl mx-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00FF9C, #7C3AED)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                </div>
                <span className="text-sm font-semibold text-dark">My Triggers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">5 active</span>
                <button className="px-3 py-1.5 rounded-lg bg-dark text-white text-xs font-medium">+ New Trigger</button>
              </div>
            </div>
            {[
              { icon: '₿', bg: 'bg-yellow-50', name: 'Bitcoin Price Alert', desc: 'BTC drops below $50,000', freq: 'Every 30s', status: 'active' },
              { icon: '📈', bg: 'bg-green-50', name: 'Tesla Stock Watch', desc: 'TSLA goes above $300', freq: 'Every 1m', status: 'triggered' },
              { icon: '💻', bg: 'bg-blue-50', name: 'MacBook Price Drop', desc: 'MacBook Air below ₹70,000', freq: 'Every 5m', status: 'active' },
              { icon: '🌐', bg: 'bg-purple-50', name: 'Domain Watch', desc: 'myidea.com becomes available', freq: 'Every 1h', status: 'active' },
              { icon: '📦', bg: 'bg-red-50', name: 'PS5 Restock Alert', desc: 'PS5 back in stock on Amazon', freq: 'Every 2m', status: 'paused' },
            ].map((item, i) => {
              const statusStyles = { active: 'status-active', triggered: 'status-triggered', paused: 'status-paused' }
              return (
                <div key={i} className="alert-row">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg}`}><span className="text-sm">{item.icon}</span></div>
                    <div>
                      <p className="font-medium text-dark text-sm">{item.name}</p>
                      <p className="text-xs text-muted">{item.desc}</p>
                    </div>
                  </div>
                  <div className="hidden sm:block text-xs text-muted">{item.freq}</div>
                  <div className={`status-badge ${statusStyles[item.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'active' ? 'bg-neon-green-dim' : item.status === 'triggered' ? 'bg-accent-purple' : 'bg-gray-400'}`} />
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section id="features" className="section-dark bg-glow-purple py-24 lg:py-36 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <p className="reveal text-sm font-semibold text-neon-green uppercase tracking-widest mb-4">Features</p>
            <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-5">Built for Speed & Simplicity</h2>
            <p className="reveal reveal-delay-2 text-base lg:text-lg text-muted max-w-2xl mx-auto">Everything you need to stay ahead of what matters on the internet.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <svg className="w-6 h-6 text-neon-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, bg: 'rgba(0, 255, 156, 0.08)', title: 'Natural Language', desc: 'Just type what you want in plain English. No code, no complex rules to configure.' },
              { icon: <svg className="w-6 h-6 text-accent-purple-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, bg: 'rgba(124, 58, 237, 0.08)', title: 'Reliable Monitoring', desc: '99.9% uptime with redundant infrastructure. Your triggers never miss a beat.' },
              { icon: <svg className="w-6 h-6 text-neon-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, bg: 'rgba(0, 255, 156, 0.08)', title: 'Fast Notifications', desc: 'Get alerts in under 2 seconds via email, SMS, Slack, or push notifications.' },
              { icon: <svg className="w-6 h-6 text-accent-purple-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, bg: 'rgba(124, 58, 237, 0.08)', title: 'Simple Automation', desc: 'Connect triggers to actions. Auto-buy, auto-notify your team, or chain multiple triggers.' },
            ].map((card, i) => (
              <div key={i} className={`reveal ${i > 0 ? `reveal-delay-${i}` : ''} card text-center lg:text-left`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-5" style={{ background: card.bg }}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section id="cta" className="section-dark py-24 lg:py-36 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(0, 255, 156, 0.08), transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.06), transparent 70%)' }} />
        </div>
        <div className="max-w-[1280px] mx-auto text-center relative z-10">
          <h2 className="reveal text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 max-w-3xl mx-auto leading-[1.1]">
            Start Watching<br />Opportunities <span className="text-neon-green">Today</span>
          </h2>
          <p className="reveal reveal-delay-1 text-base lg:text-lg text-muted max-w-xl mx-auto mb-10">Join thousands of users who never miss a price drop, market move, or domain release.</p>
          <div className="reveal reveal-delay-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary text-base !px-10 !py-4 animate-glow-pulse">
              Create Your First Trigger
              <svg className="ml-2 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>
          <p className="reveal reveal-delay-3 text-xs text-gray-600 mt-6">No credit card required · Free forever plan available</p>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-white/[0.05] py-12 lg:py-16 px-6" style={{ background: '#030308' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00FF9C, #7C3AED)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#050510" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                </div>
                <span className="text-base font-bold text-white">Triggerly</span>
              </Link>
              <p className="text-sm text-muted leading-relaxed">Turn anything on the internet into an instant trigger.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li><a href="#features" className="text-sm text-muted hover:text-white transition-colors">Features</a></li>
                <li><a href="#triggers" className="text-sm text-muted hover:text-white transition-colors">Triggers</a></li>
                <li><a href="#" className="text-sm text-muted hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-muted hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-muted hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-muted hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-muted hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-muted hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-muted hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-muted hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-muted hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/[0.05]">
            <p className="text-xs text-gray-600 mb-4 sm:mb-0">© 2026 Triggerly. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-600 hover:text-white transition-colors" aria-label="Twitter"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
              <a href="#" className="text-gray-600 hover:text-white transition-colors" aria-label="GitHub"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>
              <a href="#" className="text-gray-600 hover:text-white transition-colors" aria-label="LinkedIn"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
