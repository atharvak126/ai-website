import React, { useState, useEffect, useRef } from 'react';

/**
 * Custom useTypewriter hook
 * @param text The string to type out
 * @param speed Typing speed per character in milliseconds (default 38ms)
 * @param startDelay Delay before typing begins (default 600ms)
 * @returns { displayed: string, done: boolean }
 */
export function useTypewriter(
  text: string,
  speed: number = 38,
  startDelay: number = 600
): { displayed: string; done: boolean } {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let index = 0;
    let intervalId: number | null = null;

    const startTimer = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index++;
        if (index <= text.length) {
          setDisplayed(text.slice(0, index));
        }
        if (index >= text.length) {
          setDone(true);
          if (intervalId !== null) {
            clearInterval(intervalId);
          }
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

type ModalType = 'pitch' | 'careers' | 'hello' | 'operate' | 'studio' | 'labs' | 'shop' | null;

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Typewriter hook setup
  const typewriterText = "Glad you stopped in. Good taste tends to find us. Now, what are we building?";
  const { displayed, done } = useTypewriter(typewriterText, 38, 600);

  // Video scrub setup
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);
  const SENSITIVITY = 0.8;

  // Buttons become visible 400ms after page load, independent of typewriter
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setButtonsVisible(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Video seek queue handler
  const handleSeeked = () => {
    const video = videoRef.current;
    if (!video) return;

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.02) {
      video.currentTime = targetTimeRef.current;
    } else {
      isSeekingRef.current = false;
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      targetTimeRef.current = videoRef.current.currentTime || 0;
    }
  };

  // Horizontal mousemove scrub listener on window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const video = videoRef.current;
      if (!video || !video.duration || Number.isNaN(video.duration)) {
        prevXRef.current = e.clientX;
        return;
      }

      if (prevXRef.current === null) {
        prevXRef.current = e.clientX;
        return;
      }

      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;

      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      const newTarget = Math.min(Math.max(0, targetTimeRef.current + timeOffset), video.duration);
      targetTimeRef.current = newTarget;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = newTarget;
      }
    };

    const handleMouseLeave = () => {
      prevXRef.current = null;
    };

    // Touch support for mobile devices
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const clientX = e.touches[0].clientX;
      const video = videoRef.current;
      if (!video || !video.duration || Number.isNaN(video.duration)) {
        prevXRef.current = clientX;
        return;
      }

      if (prevXRef.current === null) {
        prevXRef.current = clientX;
        return;
      }

      const delta = clientX - prevXRef.current;
      prevXRef.current = clientX;

      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      const newTarget = Math.min(Math.max(0, targetTimeRef.current + timeOffset), video.duration);
      targetTimeRef.current = newTarget;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = newTarget;
      }
    };

    const handleTouchEnd = () => {
      prevXRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Copy email to clipboard handler
  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    const email = 'hello@mainframe.co';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden select-none font-sans">
      {/* BACKGROUND VIDEO (mouse-scrub controlled) */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_041744_63efcd78-bf7d-4039-99e2-2461e8a61903.mp4"
        muted
        playsInline
        preload="auto"
        onSeeked={handleSeeked}
        onLoadedMetadata={handleLoadedMetadata}
        className="fixed inset-0 z-0 w-full h-full object-cover pointer-events-none"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          objectFit: 'cover',
          objectPosition: '70% center',
        }}
      />

      {/* NAVBAR (fixed, z-index: 10) */}
      <header className="fixed top-0 left-0 right-0 z-10 w-full px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center pointer-events-auto">
        {/* Logo (left) */}
        <div className="flex items-center gap-3">
          <span
            className="text-[21px] sm:text-[26px] tracking-tight text-white select-none leading-none"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Mainframe®
          </span>
          <span
            className="text-[25px] sm:text-[30px] text-white select-none leading-none"
            style={{ letterSpacing: '-0.02em' }}
            aria-hidden="true"
          >
            ✳︎
          </span>
        </div>

        {/* Desktop nav links (center, hidden below md) */}
        <nav className="hidden md:flex items-center text-[23px] text-white select-none">
          <button
            type="button"
            onClick={() => setActiveModal('labs')}
            className="hover:opacity-60 transition-opacity cursor-pointer focus:outline-none"
          >
            Labs
          </button>
          <span>,&nbsp;</span>
          <button
            type="button"
            onClick={() => setActiveModal('studio')}
            className="hover:opacity-60 transition-opacity cursor-pointer focus:outline-none"
          >
            Studio
          </button>
          <span>,&nbsp;</span>
          <button
            type="button"
            onClick={() => setActiveModal('careers')}
            className="hover:opacity-60 transition-opacity cursor-pointer focus:outline-none"
          >
            Openings
          </button>
          <span>,&nbsp;</span>
          <button
            type="button"
            onClick={() => setActiveModal('shop')}
            className="hover:opacity-60 transition-opacity cursor-pointer focus:outline-none"
          >
            Shop
          </button>
        </nav>

        {/* Desktop CTA (right, hidden below md) */}
        <div className="hidden md:block">
          <a
            href="mailto:hello@mainframe.co"
            className="text-[23px] text-white underline underline-offset-2 hover:opacity-60 transition-opacity select-none"
          >
            Get in touch
          </a>
        </div>

        {/* Mobile hamburger (visible below md) */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] focus:outline-none cursor-pointer z-20"
        >
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 transform origin-center ${
              menuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ${
              menuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 transform origin-center ${
              menuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </header>

      {/* Mobile overlay (z-index: 9) */}
      <div
        className={`fixed inset-0 z-[9] bg-black/90 backdrop-blur-md flex flex-col justify-center items-start px-8 gap-8 transition-opacity duration-300 md:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            setActiveModal('labs');
          }}
          className="text-[32px] font-medium text-white hover:opacity-60 transition-opacity text-left"
        >
          Labs
        </button>
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            setActiveModal('studio');
          }}
          className="text-[32px] font-medium text-white hover:opacity-60 transition-opacity text-left"
        >
          Studio
        </button>
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            setActiveModal('careers');
          }}
          className="text-[32px] font-medium text-white hover:opacity-60 transition-opacity text-left"
        >
          Openings
        </button>
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            setActiveModal('shop');
          }}
          className="text-[32px] font-medium text-white hover:opacity-60 transition-opacity text-left"
        >
          Shop
        </button>
        <a
          href="mailto:hello@mainframe.co"
          onClick={() => setMenuOpen(false)}
          className="text-[32px] font-medium text-white underline underline-offset-4 hover:opacity-60 transition-opacity text-left"
        >
          Get in touch
        </a>
      </div>

      {/* HERO SECTION (z-index: 1) */}
      <main className="relative z-[1] w-full h-screen flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden pointer-events-none">
        <div className="max-w-xl relative z-10 pointer-events-auto">
          {/* 1. Blurred intro label */}
          <div
            className="pointer-events-none select-none mb-5 sm:mb-6"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.3,
              fontWeight: 400,
              color: '#fff',
              filter: 'blur(4px)',
            }}
          >
            Hey there, meet A.R.I.A,<br />
            Mainframe's Adaptive Response Interface Agent
          </div>

          {/* 2. Typewriter text */}
          <p
            className="text-white mb-5 sm:mb-6 select-text"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.35,
              fontWeight: 400,
              minHeight: '54px',
            }}
          >
            {displayed}
            {!done && (
              <span
                className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px] animate-blink"
                aria-hidden="true"
              />
            )}
          </p>

          {/* 3. Action pill buttons */}
          <div
            className={`flex flex-wrap gap-y-1 transition-all duration-400 ease-out ${
              buttonsVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-[8px]'
            }`}
            style={{
              transitionProperty: 'opacity, transform',
              transitionDuration: '0.4s',
              transitionTimingFunction: 'ease',
            }}
          >
            {/* White pill 1: Pitch us an idea */}
            <button
              type="button"
              onClick={() => setActiveModal('pitch')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              Pitch us an idea
            </button>

            {/* White pill 2: Come work here */}
            <button
              type="button"
              onClick={() => setActiveModal('careers')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              Come work here
            </button>

            {/* White pill 3: Send a brief hello */}
            <button
              type="button"
              onClick={() => setActiveModal('hello')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              Send a brief hello
            </button>

            {/* White pill 4: See how we operate */}
            <button
              type="button"
              onClick={() => setActiveModal('operate')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              See how we operate
            </button>

            {/* Outline pill: Reach us: hello@mainframe.co */}
            <button
              type="button"
              onClick={handleCopyEmail}
              title="Click to copy email"
              className="inline-flex items-center justify-center text-white bg-transparent border border-white rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap gap-2 sm:gap-3 hover:bg-white hover:text-black transition-colors duration-200 cursor-pointer focus:outline-none group"
            >
              <span>
                Reach us: <span className="underline underline-offset-1">hello@mainframe.co</span>
              </span>
              {copied ? (
                <span className="inline-flex items-center text-[11px] uppercase tracking-wider font-semibold text-emerald-400 group-hover:text-emerald-700 transition-colors">
                  Copied!
                </span>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 group-hover:stroke-black transition-colors"
                  aria-hidden="true"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Interactive Modal Sheet for Agency Actions */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors cursor-pointer text-xl p-1"
              aria-label="Close modal"
            >
              ✕
            </button>

            {activeModal === 'pitch' && (
              <div>
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">INTAKE / COMMISSION</span>
                <h3 className="text-2xl sm:text-3xl font-medium tracking-tight mt-1 mb-3">Pitch us an idea</h3>
                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-5">
                  We partner with audacious founders, forward-looking studios, and visionary brands to engineer transformative digital artifacts and identities.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    window.location.href = `mailto:hello@mainframe.co?subject=Project Pitch: New Collaboration`;
                    setActiveModal(null);
                  }}
                  className="space-y-4 text-left"
                >
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">Your Name / Studio</label>
                    <input
                      type="text"
                      placeholder="e.g. Elena Rostova / Lumina Labs"
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">Brief Description</label>
                    <textarea
                      rows={3}
                      placeholder="What are we building together?"
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-white text-black hover:bg-neutral-200 py-2.5 rounded-full font-medium text-sm transition-colors cursor-pointer"
                    >
                      Continue via Email ↗
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="border border-neutral-700 hover:bg-neutral-800 text-neutral-300 py-2.5 px-5 rounded-full text-sm transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeModal === 'careers' && (
              <div>
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">CAREERS / OPENINGS</span>
                <h3 className="text-2xl sm:text-3xl font-medium tracking-tight mt-1 mb-3">Come work here</h3>
                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-5">
                  Mainframe operates at the bleeding edge of kinetic typography, dynamic graphics, computational aesthetic systems, and interface architecture.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm text-white">Creative Technologist (WebGL / GLSL)</div>
                      <div className="text-xs text-neutral-400">Remote / Tokyo / San Francisco</div>
                    </div>
                    <span className="text-xs border border-white/20 rounded-full px-2.5 py-1">Full-time</span>
                  </div>
                  <div className="p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm text-white">Design Systems Lead</div>
                      <div className="text-xs text-neutral-400">Remote / Hybrid</div>
                    </div>
                    <span className="text-xs border border-white/20 rounded-full px-2.5 py-1">Full-time</span>
                  </div>
                  <div className="p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm text-white">Interface Engineering Fellow</div>
                      <div className="text-xs text-neutral-400">Remote</div>
                    </div>
                    <span className="text-xs border border-white/20 rounded-full px-2.5 py-1">Apprenticeship</span>
                  </div>
                </div>
                <a
                  href="mailto:careers@mainframe.co?subject=Application: Mainframe Team"
                  className="block text-center w-full bg-white text-black hover:bg-neutral-200 py-2.5 rounded-full font-medium text-sm transition-colors"
                >
                  Apply directly via careers@mainframe.co ↗
                </a>
              </div>
            )}

            {activeModal === 'hello' && (
              <div>
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">INQUIRIES</span>
                <h3 className="text-2xl sm:text-3xl font-medium tracking-tight mt-1 mb-3">Send a brief hello</h3>
                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-6">
                  Whether you have an upcoming launch, need advisory, or just want to discuss digital craft, our lines are always open.
                </p>
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 mb-6">
                  <div className="text-xs text-neutral-400 mb-1">Direct Line</div>
                  <div className="text-lg font-mono text-white select-all">hello@mainframe.co</div>
                </div>
                <div className="flex gap-3">
                  <a
                    href="mailto:hello@mainframe.co"
                    className="flex-1 text-center bg-white text-black hover:bg-neutral-200 py-2.5 rounded-full font-medium text-sm transition-colors"
                  >
                    Open Mail Client ↗
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="border border-neutral-700 hover:bg-neutral-800 text-neutral-300 py-2.5 px-5 rounded-full text-sm transition-colors cursor-pointer"
                  >
                    {copied ? 'Copied!' : 'Copy Address'}
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'operate' && (
              <div>
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">MANIFESTO</span>
                <h3 className="text-2xl sm:text-3xl font-medium tracking-tight mt-1 mb-3">How we operate</h3>
                <div className="space-y-4 text-sm text-neutral-300 leading-relaxed mb-6">
                  <p>
                    <strong className="text-white">1. Direct-to-Craft:</strong> No bloated hierarchy or account middle-layers. You communicate directly with the designers and engineers shaping your pixels and architecture.
                  </p>
                  <p>
                    <strong className="text-white">2. Adaptive Responsiveness:</strong> From screen-responsive layouts to mouse-scrubbed interactive media (like A.R.I.A.), every viewport is treated as a tactile instrument.
                  </p>
                  <p>
                    <strong className="text-white">3. Enduring Taste:</strong> Trends dissipate; deliberate typography, disciplined contrast, and performance-first engineering remain timeless.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full bg-white text-black hover:bg-neutral-200 py-2.5 rounded-full font-medium text-sm transition-colors cursor-pointer"
                >
                  Understood
                </button>
              </div>
            )}

            {activeModal === 'studio' && (
              <div>
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">STUDIO</span>
                <h3 className="text-2xl sm:text-3xl font-medium tracking-tight mt-1 mb-3">Mainframe Studio</h3>
                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-4">
                  We are an independent creative agency and technology laboratory producing interactive artifacts, sensory brand identities, and real-time digital experiences.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-neutral-300">
                  <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                    <span className="text-neutral-400 block mb-1">DISCIPLINES</span>
                    Art Direction<br />Interactive Systems<br />Kinetic Typography<br />Spatial Computing
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                    <span className="text-neutral-400 block mb-1">SELECT CLIENTS</span>
                    Modern Hardware<br />AI Research Labs<br />Independent Fashion<br />Next-gen Protocols
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full bg-white text-black hover:bg-neutral-200 py-2.5 rounded-full font-medium text-sm transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}

            {activeModal === 'labs' && (
              <div>
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">R&D</span>
                <h3 className="text-2xl sm:text-3xl font-medium tracking-tight mt-1 mb-3">Mainframe Labs</h3>
                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-4">
                  Experimental prototypes, real-time procedural shaders, generative audio environments, and browser interactions pushing the frontier of the open web.
                </p>
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 mb-6 text-xs text-neutral-400">
                  Active prototype: <strong className="text-white">A.R.I.A (Adaptive Response Interface Agent)</strong> scrubbing dynamic video frames across user cursor velocity vectors.
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full bg-white text-black hover:bg-neutral-200 py-2.5 rounded-full font-medium text-sm transition-colors cursor-pointer"
                >
                  Explore Experiment
                </button>
              </div>
            )}

            {activeModal === 'shop' && (
              <div>
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">EDITIONS</span>
                <h3 className="text-2xl sm:text-3xl font-medium tracking-tight mt-1 mb-3">Artifacts & Editions</h3>
                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-4">
                  Limited hardware objects, printed monographs, custom typefaces, and digital licenses created in-house.
                </p>
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-center mb-6">
                  <span className="text-neutral-400 text-xs block mb-1">NEXT RELEASE</span>
                  <div className="text-white font-medium text-base">Drop 004 — Spatial Specimen Book</div>
                  <div className="text-xs text-neutral-500 mt-1">Available Q4 / Invite & Private Access</div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full bg-white text-black hover:bg-neutral-200 py-2.5 rounded-full font-medium text-sm transition-colors cursor-pointer"
                >
                  Join Waitlist
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
