import { useState, useEffect, useRef, useCallback } from "react";

// ─── Inline styles & CSS injection ────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #020408;
    --bg2: #060c14;
    --surface: rgba(255,255,255,0.04);
    --border: rgba(255,255,255,0.08);
    --accent: #00f5d4;
    --accent2: #7b61ff;
    --accent3: #ff6b6b;
    --accent4: #ffd60a;
    --text: #e8edf5;
    --muted: #6b7a99;
    --card: rgba(10,18,35,0.85);
    --glow: 0 0 40px rgba(0,245,212,0.15);
    --glow2: 0 0 40px rgba(123,97,255,0.15);
    --radius: 20px;
    --font-display: 'Syne', sans-serif;
    --font-body: 'Space Grotesk', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    overflow-x: hidden;
    cursor: none;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 2px; }

  /* CURSOR */
  .cursor-ring {
    position: fixed; top: 0; left: 0;
    width: 40px; height: 40px;
    border: 1.5px solid var(--accent);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s, border-color 0.3s, background 0.3s;
    mix-blend-mode: difference;
  }
  .cursor-dot {
    position: fixed; top: 0; left: 0;
    width: 6px; height: 6px;
    background: var(--accent);
    border-radius: 50%;
    pointer-events: none;
    z-index: 10000;
    transform: translate(-50%, -50%);
  }
  .cursor-hover .cursor-ring {
    width: 70px; height: 70px;
    background: rgba(0,245,212,0.08);
    border-color: var(--accent2);
  }

  /* CANVAS */
  #hero-canvas {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    z-index: 0;
  }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 1000;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 60px;
    background: rgba(2,4,8,0.7);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    transition: padding 0.3s;
  }
  nav.scrolled { padding: 14px 60px; }
  .nav-logo {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }
  .nav-links { display: flex; gap: 36px; list-style: none; }
  .nav-links a {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--muted);
    text-decoration: none;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: color 0.2s;
    position: relative;
  }
  .nav-links a::after {
    content: '';
    position: absolute; bottom: -4px; left: 0; right: 0;
    height: 1px;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s;
  }
  .nav-links a:hover { color: var(--accent); }
  .nav-links a:hover::after { transform: scaleX(1); }
  .nav-cta {
    padding: 10px 24px;
    background: transparent;
    border: 1px solid var(--accent);
    border-radius: 8px;
    color: var(--accent);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    text-decoration: none;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: all 0.2s;
    cursor: none;
  }
  .nav-cta:hover { background: var(--accent); color: var(--bg); }

  /* HERO */
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    padding: 120px 60px 80px;
  }
  .hero-content {
    position: relative; z-index: 2;
    max-width: 1000px;
    width: 100%;
    text-align: center;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 20px;
    background: rgba(0,245,212,0.08);
    border: 1px solid rgba(0,245,212,0.2);
    border-radius: 100px;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--accent);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 32px;
    animation: fadeSlideDown 1s ease both;
  }
  .badge-dot {
    width: 6px; height: 6px;
    background: var(--accent);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }
  .hero-name {
    font-family: var(--font-display);
    font-size: clamp(4rem, 10vw, 9rem);
    font-weight: 800;
    line-height: 0.92;
    letter-spacing: -0.04em;
    margin-bottom: 24px;
    animation: fadeSlideUp 1s 0.2s ease both;
  }
  .hero-name .line1 {
    display: block;
    background: linear-gradient(135deg, #e8edf5 0%, #6b7a99 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .hero-name .line2 {
    display: block;
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .hero-tagline {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    color: var(--muted);
    max-width: 600px;
    margin: 0 auto 48px;
    line-height: 1.7;
    animation: fadeSlideUp 1s 0.35s ease both;
  }
  .hero-tagline strong { color: var(--text); }
  .hero-actions {
    display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
    animation: fadeSlideUp 1s 0.5s ease both;
    margin-bottom: 64px;
  }
  .btn-primary {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 16px 36px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border: none; border-radius: 12px;
    color: var(--bg);
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 600;
    text-decoration: none;
    cursor: none;
    transition: all 0.3s;
    box-shadow: 0 0 40px rgba(0,245,212,0.3);
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 60px rgba(0,245,212,0.5);
  }
  .btn-secondary {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 16px 36px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 500;
    text-decoration: none;
    cursor: none;
    transition: all 0.3s;
  }
  .btn-secondary:hover {
    border-color: var(--accent2);
    color: var(--accent2);
    background: rgba(123,97,255,0.08);
    transform: translateY(-2px);
  }

  /* HERO STATS */
  .hero-stats {
    display: flex; gap: 40px; justify-content: center; flex-wrap: wrap;
    animation: fadeSlideUp 1s 0.65s ease both;
  }
  .stat {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
  }
  .stat-val {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .stat-label {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* FLOATING ORBS */
  .orb {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 1;
  }
  .orb-1 {
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(0,245,212,0.08) 0%, transparent 70%);
    top: -100px; left: -200px;
    animation: float1 8s ease-in-out infinite;
  }
  .orb-2 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(123,97,255,0.08) 0%, transparent 70%);
    bottom: -100px; right: -150px;
    animation: float2 10s ease-in-out infinite;
  }
  .orb-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(255,107,107,0.06) 0%, transparent 70%);
    top: 40%; left: 60%;
    animation: float3 12s ease-in-out infinite;
  }
  @keyframes float1 {
    0%, 100% { transform: translate(0,0) scale(1); }
    33% { transform: translate(30px, -20px) scale(1.05); }
    66% { transform: translate(-15px, 30px) scale(0.95); }
  }
  @keyframes float2 {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(-40px, -30px) scale(1.1); }
  }
  @keyframes float3 {
    0%, 100% { transform: translate(0,0); }
    25% { transform: translate(20px, -40px); }
    75% { transform: translate(-30px, 20px); }
  }

  /* FLOATING TECH ICONS */
  .tech-float {
    position: absolute;
    display: flex; align-items: center; justify-content: center;
    border-radius: 16px;
    background: var(--card);
    border: 1px solid var(--border);
    backdrop-filter: blur(12px);
    font-size: 1.4rem;
    padding: 14px;
    pointer-events: none;
    z-index: 3;
    box-shadow: var(--glow);
  }
  .tf1 { top: 15%; left: 8%; animation: floatTech 6s ease-in-out infinite; }
  .tf2 { top: 25%; right: 7%; animation: floatTech 7s 1s ease-in-out infinite; }
  .tf3 { bottom: 30%; left: 6%; animation: floatTech 8s 2s ease-in-out infinite; }
  .tf4 { bottom: 20%; right: 9%; animation: floatTech 5s 0.5s ease-in-out infinite; }
  .tf5 { top: 60%; left: 4%; animation: floatTech 9s 1.5s ease-in-out infinite; }
  .tf6 { top: 10%; right: 20%; animation: floatTech 7s 3s ease-in-out infinite; }
  @keyframes floatTech {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    33% { transform: translateY(-12px) rotate(3deg); }
    66% { transform: translateY(6px) rotate(-2deg); }
  }
  .tech-float span { font-family: var(--font-mono); font-size: 0.65rem; color: var(--muted); margin-top: 4px; display: block; text-align: center; }

  /* SECTIONS */
  section { padding: 120px 60px; max-width: 1300px; margin: 0 auto; }
  .section-eyebrow {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 12px;
  }
  .section-eyebrow::before {
    content: '';
    display: block; width: 32px; height: 1px;
    background: var(--accent);
  }
  .section-title {
    font-family: var(--font-display);
    font-size: clamp(2.2rem, 5vw, 3.8rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.05;
    margin-bottom: 60px;
  }
  .gradient-text {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  /* REVEAL ANIMATION */
  .reveal {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ABOUT */
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: start;
  }
  .about-bio {
    font-size: 1.05rem;
    line-height: 1.85;
    color: var(--muted);
  }
  .about-bio strong { color: var(--text); }
  .about-bio p + p { margin-top: 20px; }
  .edu-cards { display: flex; flex-direction: column; gap: 16px; }
  .edu-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px 28px;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
  }
  .edu-card::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, var(--accent), var(--accent2));
    border-radius: 0 2px 2px 0;
  }
  .edu-card:hover {
    border-color: rgba(0,245,212,0.2);
    transform: translateX(6px);
    box-shadow: var(--glow);
  }
  .edu-degree {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 4px;
  }
  .edu-school {
    font-size: 0.85rem;
    color: var(--muted);
    margin-bottom: 8px;
    font-family: var(--font-mono);
  }
  .edu-score {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 12px;
    background: rgba(0,245,212,0.08);
    border-radius: 100px;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--accent);
  }

  /* SKILLS */
  .skills-tabs {
    display: flex; gap: 8px; flex-wrap: wrap;
    margin-bottom: 40px;
  }
  .skill-tab {
    padding: 10px 22px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 100px;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--muted);
    cursor: none;
    transition: all 0.2s;
    letter-spacing: 0.05em;
  }
  .skill-tab.active, .skill-tab:hover {
    background: rgba(0,245,212,0.1);
    border-color: var(--accent);
    color: var(--accent);
  }
  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }
  .skill-chip {
    display: flex; align-items: center; gap: 12px;
    padding: 16px 20px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    transition: all 0.3s;
    animation: fadeIn 0.4s ease both;
  }
  .skill-chip:hover {
    border-color: rgba(0,245,212,0.25);
    transform: translateY(-4px);
    box-shadow: var(--glow);
  }
  .skill-icon { font-size: 1.4rem; }
  .skill-name { font-size: 0.88rem; font-weight: 500; }
  .skill-level {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* PROJECTS */
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 24px;
  }
  .project-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 32px;
    position: relative;
    overflow: hidden;
    transition: all 0.4s;
    cursor: none;
  }
  .project-card::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(0,245,212,0.04), rgba(123,97,255,0.04));
    opacity: 0;
    transition: opacity 0.4s;
  }
  .project-card:hover {
    border-color: rgba(0,245,212,0.25);
    transform: translateY(-8px);
    box-shadow: 0 24px 60px rgba(0,0,0,0.5), var(--glow);
  }
  .project-card:hover::before { opacity: 1; }
  .project-num {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--accent);
    letter-spacing: 0.15em;
    margin-bottom: 16px;
    display: block;
  }
  .project-name {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 8px;
    line-height: 1.2;
  }
  .project-category {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--accent2);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 16px;
  }
  .project-desc {
    font-size: 0.9rem;
    line-height: 1.7;
    color: var(--muted);
    margin-bottom: 24px;
  }
  .project-tags { display: flex; gap: 8px; flex-wrap: wrap; }
  .tag {
    padding: 5px 12px;
    background: rgba(123,97,255,0.1);
    border: 1px solid rgba(123,97,255,0.2);
    border-radius: 6px;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--accent2);
  }
  .project-arrow {
    position: absolute; top: 32px; right: 32px;
    font-size: 1.2rem;
    color: var(--muted);
    transition: all 0.3s;
  }
  .project-card:hover .project-arrow {
    color: var(--accent);
    transform: translate(4px, -4px);
  }

  /* TRAINING */
  .timeline { position: relative; padding-left: 40px; }
  .timeline::before {
    content: '';
    position: absolute; left: 8px; top: 0; bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, var(--accent), transparent);
  }
  .timeline-item {
    position: relative;
    margin-bottom: 48px;
  }
  .timeline-item::before {
    content: '';
    position: absolute; left: -36px; top: 8px;
    width: 10px; height: 10px;
    background: var(--accent);
    border-radius: 50%;
    box-shadow: 0 0 16px var(--accent);
  }
  .timeline-date {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 8px;
  }
  .timeline-title {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .timeline-org {
    font-size: 0.88rem;
    color: var(--muted);
    margin-bottom: 12px;
    font-family: var(--font-mono);
  }
  .timeline-desc {
    font-size: 0.9rem;
    color: var(--muted);
    line-height: 1.7;
  }

  /* ACHIEVEMENTS */
  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  .achievement-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    display: flex; gap: 18px; align-items: flex-start;
    transition: all 0.3s;
  }
  .achievement-card:hover {
    border-color: rgba(255,214,10,0.3);
    transform: translateY(-4px);
    box-shadow: 0 0 30px rgba(255,214,10,0.08);
  }
  .achievement-icon {
    font-size: 2rem;
    flex-shrink: 0;
    width: 52px; height: 52px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,214,10,0.08);
    border-radius: 12px;
  }
  .achievement-text h4 {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 6px;
    line-height: 1.3;
  }
  .achievement-text p {
    font-size: 0.82rem;
    color: var(--muted);
    line-height: 1.5;
  }

  /* CERTIFICATIONS */
  .certs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
  .cert-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 22px 24px;
    display: flex; align-items: center; gap: 16px;
    transition: all 0.3s;
  }
  .cert-card:hover {
    border-color: rgba(0,245,212,0.2);
    transform: translateX(6px);
  }
  .cert-badge {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
  }
  .cert-name { font-size: 0.88rem; font-weight: 500; line-height: 1.4; }

  /* CONTACT */
  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: start;
  }
  .contact-intro {
    font-size: 1.05rem;
    line-height: 1.8;
    color: var(--muted);
    margin-bottom: 36px;
  }
  .contact-intro strong { color: var(--text); }
  .contact-links { display: flex; flex-direction: column; gap: 16px; }
  .contact-link {
    display: flex; align-items: center; gap: 16px;
    padding: 20px 24px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    text-decoration: none;
    color: var(--text);
    transition: all 0.3s;
  }
  .contact-link:hover {
    border-color: rgba(0,245,212,0.3);
    transform: translateX(8px);
    box-shadow: var(--glow);
  }
  .contact-link-icon {
    width: 44px; height: 44px;
    background: rgba(0,245,212,0.08);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  .contact-link-text { flex: 1; }
  .contact-link-label {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    display: block;
    margin-bottom: 2px;
  }
  .contact-link-val { font-size: 0.9rem; font-weight: 500; }
  .contact-link-arrow { color: var(--accent); font-size: 1rem; }

  /* CONTACT FORM PANEL */
  .contact-form-panel {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 40px;
  }
  .form-group { margin-bottom: 20px; }
  .form-label {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 8px;
  }
  .form-input, .form-textarea {
    width: 100%;
    padding: 14px 18px;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    resize: none;
  }
  .form-input:focus, .form-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(0,245,212,0.08);
  }
  .form-textarea { height: 120px; }
  .form-submit {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border: none;
    border-radius: 10px;
    color: var(--bg);
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 700;
    cursor: none;
    transition: all 0.3s;
    letter-spacing: 0.02em;
  }
  .form-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,245,212,0.4);
  }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--border);
    padding: 40px 60px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    max-width: 100%;
  }
  .footer-name {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.2rem;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .footer-copy {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--muted);
  }

  /* SCROLL INDICATOR */
  .scroll-indicator {
    position: absolute;
    bottom: 40px; left: 50%;
    transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    z-index: 4;
    animation: fadeSlideUp 1s 1s ease both;
  }
  .scroll-mouse {
    width: 24px; height: 38px;
    border: 1.5px solid rgba(255,255,255,0.2);
    border-radius: 12px;
    display: flex; justify-content: center; padding-top: 6px;
  }
  .scroll-wheel {
    width: 3px; height: 8px;
    background: var(--accent);
    border-radius: 2px;
    animation: scrollWheel 2s ease-in-out infinite;
  }
  @keyframes scrollWheel {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(12px); opacity: 0; }
  }
  .scroll-text {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  /* KEYFRAMES */
  @keyframes fadeSlideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  /* GRID LINE BACKGROUND */
  .grid-bg {
    position: fixed; inset: 0; z-index: -1; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  @media (max-width: 900px) {
    nav { padding: 16px 24px; }
    .nav-links { display: none; }
    section { padding: 80px 24px; }
    .hero { padding: 100px 24px 60px; }
    .about-grid, .contact-grid { grid-template-columns: 1fr; gap: 40px; }
    .projects-grid { grid-template-columns: 1fr; }
    .tf1, .tf2, .tf3, .tf4, .tf5, .tf6 { display: none; }
    footer { padding: 30px 24px; flex-direction: column; text-align: center; }
  }
`;

// ─── Particle Canvas (3D feel with depth) ─────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let mouse = { x: W / 2, y: H / 2 };

    const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener("mousemove", handleMouseMove);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.z = Math.random() * 600 + 100;
        this.r = (800 / this.z) * 0.6;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        const t = Math.random();
        this.color = t < 0.5
          ? `rgba(0,245,212,${0.15 + t * 0.3})`
          : `rgba(123,97,255,${0.1 + t * 0.25})`;
      }
      update() {
        this.x += this.vx + (mouse.x - W / 2) * 0.00008;
        this.y += this.vy + (mouse.y - H / 2) * 0.00008;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 120 }, () => new Particle());

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,245,212,${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      drawConnections();
      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} id="hero-canvas" />;
}

// ─── Custom Cursor ─────────────────────────────────────────────────────────────
function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);

    let frame;
    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = ring.current.x + "px";
        ringRef.current.style.top = ring.current.y + "px";
      }
      if (dotRef.current) {
        dotRef.current.style.left = pos.current.x + "px";
        dotRef.current.style.top = pos.current.y + "px";
      }
      frame = requestAnimationFrame(animate);
    };
    animate();

    const onEnter = () => { ringRef.current?.classList.add("cursor-hover"); };
    const onLeave = () => { ringRef.current?.classList.remove("cursor-hover"); };
    document.querySelectorAll("a, button, [data-hover]").forEach(el => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </>
  );
}

// ─── Reveal Hook ──────────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add("visible"), i * 80);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const SKILL_CATEGORIES = {
  "Embedded & IoT": [
    { icon: "🤖", name: "Arduino Uno/Mega/Nano", level: "Expert" },
    { icon: "🍓", name: "Raspberry Pi", level: "Advanced" },
    { icon: "📡", name: "ESP8266 / ESP32", level: "Advanced" },
    { icon: "💻", name: "STM32", level: "Intermediate" },
    { icon: "🔌", name: "MQTT / ThingSpeak", level: "Advanced" },
    { icon: "📊", name: "Sensor Interfacing", level: "Expert" },
  ],
  "Web & MERN": [
    { icon: "⚛️", name: "React.js", level: "Advanced" },
    { icon: "🟢", name: "Node.js", level: "Advanced" },
    { icon: "🍃", name: "MongoDB", level: "Advanced" },
    { icon: "🚂", name: "Express.js", level: "Advanced" },
    { icon: "🌐", name: "HTML5 / CSS3", level: "Expert" },
    { icon: "🟨", name: "JavaScript", level: "Advanced" },
    { icon: "📮", name: "Postman", level: "Advanced" },
  ],
  "Tools & CAD": [
    { icon: "🔧", name: "SolidWorks", level: "Advanced" },
    { icon: "⚡", name: "AutoCAD Electrical", level: "Advanced" },
    { icon: "📐", name: "LT Spice", level: "Intermediate" },
    { icon: "🔬", name: "MATLAB R2023a", level: "Advanced" },
    { icon: "🖥️", name: "Simulink", level: "Advanced" },
    { icon: "🧩", name: "KiCad", level: "Basic" },
  ],
  "Languages & AI": [
    { icon: "🅒", name: "C / Embedded C", level: "Expert" },
    { icon: "🐍", name: "Python (NumPy, Pandas)", level: "Advanced" },
    { icon: "🗄️", name: "MySQL", level: "Advanced" },
    { icon: "🤖", name: "ML / Deep Learning", level: "Basic" },
    { icon: "📊", name: "Matplotlib", level: "Advanced" },
    { icon: "🔌", name: "PLC (Basic)", level: "Basic" },
  ],
};

const PROJECTS = [
{
num: "01",
name: "Knee Motion Analysis System",
category: "IoT / Embedded Systems",
desc: "Real-time joint-angle measurement system using accelerometer & gyroscope sensors with Arduino. Applied complementary filter algorithm to fuse sensor data for flexion-extension angle extraction with reduced drift.",
tags: ["Arduino", "IMU Sensors", "C", "Embedded"],
},
{
num: "02",
name: "IoT-Based Vehicle Safety System",
category: "IoT / Arduino",
desc: "Collision-prevention system using HC-SR04 ultrasonic sensors with threshold-triggered relay and buzzer actuation. Designed for real-time obstacle detection and automated response.",
tags: ["Arduino", "HC-SR04", "IoT", "Safety"],
},
{
num: "03",
name: "Universal Charging Adapter",
category: "SolidWorks / CAD",
desc: "Multi-standard charging adapter prototype designed in SolidWorks with GD&T tolerancing and assembly constraints. Created detailed part drawings and BOM for rapid prototyping.",
tags: ["SolidWorks", "GD&T", "CAD", "3D Modelling"],
},
{
num: "04",
name: "PDF Translator Chatbot",
category: "Python / Web / AI",
desc: "End-to-end web chatbot that ingests PDF documents and returns translated text via Python NLP pipeline. Responsive HTML/CSS frontend integrated with a Python backend for document parsing.",
tags: ["Python", "NLP", "HTML", "CSS"], 
},
{
num: "05",
name: "Urban Sentinel – Climate Portal",
category: "Web Development",
desc: "Fully responsive, multi-section informational website on climate change using semantic HTML5 and CSS.",
tags: ["HTML5", "CSS3", "Responsive", "Semantic"],
live: "https://urban-sentinel-agents.vercel.app/"
},
{
num: "06",
name: "Attendance Management System",
category: "MERN Stack / Full Stack Development",
desc: "A full-stack Attendance Management System built using React.js, Node.js, Express.js, MongoDB and deployed on Render. The system allows administrators to mark attendance, export daily attendance reports to Excel sheets, and manage student records. Students marked absent can submit their absence reasons, which are reviewed by the administrator. The application includes secure role-based login for both Admin and Students with a responsive modern UI.",
tags: [
"React.js",
"Node.js",
"Express.js",
"MongoDB",
"Render",
"Excel Export",
"REST API"
],
live: "https://attendance-management-system-frontend-etbg.onrender.com/"
}
];


const ACHIEVEMENTS = [
  { icon: "🏆", title: "₹3,500 Cash Prize – 1st Place", desc: "Paper Presentation, KIT Coimbatore" },
  { icon: "🤖", title: "4th Place – YUVA AI THON 2k25", desc: "National AI competition at VIT Chennai" },
  { icon: "🔧", title: "Project Showcase – BIT Hackathon", desc: "Working embedded prototype demo at BIT Sathy" },
  { icon: "🎖️", title: "NCC 'B' Certificate", desc: "3 years as NCC Cadet; discipline & leadership" },
  { icon: "🏑", title: "1st Place – District Level Hockey", desc: "Competitive sports award at district level (2018)" },
  { icon: "🌱", title: "Infosys Springboard", desc: "Certified online learning programme" },
];

const CERTS = [
  "Building IoT Projects with Arduino Uno & Raspberry Pi",
  "Machine Learning & Deep Learning using Python",
  "AutoCAD Electrical",
  "SolidWorks Essentials",
  "Formal Fundamentals with Jasper – Cadence Workshop",
  "Infosys Springboard",
  "C++ Programming Language",
  "MERN Stack Frontend Training",
  "MERN Stack Backend Training",
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function VimalPortfolio() {
  const [activeSkillTab, setActiveSkillTab] = useState("Web & MERN");
  const [navScrolled, setNavScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formSent, setFormSent] = useState(false);

  useReveal();

  useEffect(() => {
    // Inject CSS
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleForm = useCallback((e) => {
    e.preventDefault();
    const { name, email, message } = formData;
    window.location.href = `mailto:vimalprabhupk@gmail.com?subject=Portfolio Contact from ${name}&body=${encodeURIComponent(message)}%0A%0AFrom: ${name} <${email}>`;
    setFormSent(true);
  }, [formData]);

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <CustomCursor />
      <div className="grid-bg" />

      {/* NAV */}
      <nav className={navScrolled ? "scrolled" : ""}>
        <div className="nav-logo">V I M A L . P K</div>
        <ul className="nav-links">
          {["about", "skills", "projects", "training", "achievements", "contact"].map(s => (
            <li key={s}><a href={`#${s}`}>{s}</a></li>
          ))}
        </ul>
        <a href="mailto:vimalprabhupk@gmail.com" className="nav-cta">Hire Me</a>
      </nav>

      {/* HERO */}
      <div className="hero" id="home">
        <ParticleCanvas />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Floating tech icons */}
        {[
          { cls: "tf1", icon: "⚛️", label: "React" },
          { cls: "tf2", icon: "🤖", label: "Arduino" },
          { cls: "tf3", icon: "🐍", label: "Python" },
          { cls: "tf4", icon: "🍃", label: "MongoDB" },
          { cls: "tf5", icon: "📡", label: "IoT" },
          { cls: "tf6", icon: "🔧", label: "SolidWorks" },
        ].map(({ cls, icon, label }) => (
          <div key={cls} className={`tech-float ${cls}`}>
            <div>{icon}</div>
            <span>{label}</span>
          </div>
        ))}

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            Open to Internships & Opportunities
          </div>

          <h1 className="hero-name">
            <span className="line1">Vimal</span>
            <span className="line2"> PK</span>
          </h1>

          <p className="hero-tagline">
            <strong>Electronics & Instrumentation Engineer</strong> · MERN Stack Developer · IoT Builder<br />
            Turning hardware signals and software logic into intelligent systems.
          </p>

          <div className="hero-actions">
            <a href="#projects" className="btn-primary">
              <span>🚀</span> View Projects
            </a>
            <a href="mailto:vimalprabhupk@gmail.com" className="btn-secondary">
              <span>📩</span> Get In Touch
            </a>
          </div>

          <div className="hero-stats">
            {[
              { val: "7.74", label: "CGPA / 10" },
              { val: "5+", label: "Projects" },
              { val: "15+", label: "Training Days" },
              { val: "9+", label: "Certifications" },
            ].map(({ val, label }) => (
              <div key={label} className="stat">
                <span className="stat-val">{val}</span>
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel" />
          </div>
          <span className="scroll-text">Scroll</span>
        </div>
      </div>

      {/* ABOUT */}
      <section id="about">
        <div className="section-eyebrow reveal">About Me</div>
        <h2 className="section-title reveal">
          Engineering &<br /><span className="gradient-text">Code Combined</span>
        </h2>
        <div className="about-grid reveal">
          <div className="about-bio">
            <p>
              I'm a <strong>third-year Electronics & Instrumentation Engineering student</strong> at Kongu Engineering College (CGPA 7.74 / 10), with a rare cross-discipline edge — I'm equally comfortable debugging an embedded firmware circuit and building a full-stack React application.
            </p>
            <p>
              My IoT and embedded systems experience spans <strong>Arduino, Raspberry Pi, ESP32, and STM32</strong> platforms. On the software side, I've trained rigorously in the <strong>MERN stack</strong> (MongoDB, Express, React, Node.js), along with JavaScript, Postman, and REST APIs.
            </p>
            <p>
              I've competed in national hackathons, showcased prototypes at inter-college events, and earned industrial exposure through implant programmes at <strong>Coral Coil Limited and Zen Techpark</strong>. I also hold an NCC 'B' certificate — a nod to the discipline and leadership I bring to everything I do.
            </p>
            <p>
              Currently seeking a <strong>core EIE internship</strong> at a semiconductor or embedded systems organisation, and also open to full-stack development roles where hardware meets software.
            </p>
          </div>
          <div className="edu-cards">
            {[
              { degree: "B.E. – Electronics & Instrumentation Engineering", school: "Kongu Engineering College, Erode · Anna University", score: "CGPA 7.74 / 10", year: "2024 – Present" },
              { degree: "Higher Secondary Certificate (Class XII)", school: "PRG VN Mat. Hr. Sec. School, Palani · TN State Board", score: "79.2%", year: "2024" },
              { degree: "Secondary School (Class X)", school: "Veveaham Mat. Hr. Sec. School, Dharapuram · TN State Board", score: "87.6%", year: "2022" },
            ].map(({ degree, school, score, year }) => (
              <div key={year} className="edu-card">
                <div className="edu-degree">{degree}</div>
                <div className="edu-school">{school}</div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span className="edu-score">🎓 {score}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" style={{ background: "rgba(6,12,20,0.6)" }}>
        <div className="section-eyebrow reveal">Technical Arsenal</div>
        <h2 className="section-title reveal">
          What I<br /><span className="gradient-text">Work With</span>
        </h2>
        <div className="skills-tabs reveal">
          {Object.keys(SKILL_CATEGORIES).map(tab => (
            <button
              key={tab}
              className={`skill-tab ${activeSkillTab === tab ? "active" : ""}`}
              onClick={() => setActiveSkillTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="skills-grid">
          {SKILL_CATEGORIES[activeSkillTab].map(({ icon, name, level }, i) => (
            <div key={name} className="skill-chip reveal" style={{ animationDelay: `${i * 60}ms` }}>
              <span className="skill-icon">{icon}</span>
              <span className="skill-name">{name}</span>
              <span className="skill-level">{level}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects">
        <div className="section-eyebrow reveal">Portfolio</div>
        <h2 className="section-title reveal">
          Projects I've<br /><span className="gradient-text">Built & Shipped</span>
        </h2>
        <div className="projects-grid">
          {PROJECTS.map((p, i) => (
            <div key={p.num} className="project-card reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="project-arrow">↗</span>
              <span className="project-num">Project {p.num}</span>
              <h3 className="project-name">{p.name}</h3>
              <div className="project-category">{p.category}</div>
              <p className="project-desc">{p.desc}</p>
              <div className="project-tags">
  {p.tags.map(t => (
    <span key={t} className="tag">{t}</span>
  ))}
</div>

{p.live && (
<a
href={p.live}
target="_blank"
rel="noopener noreferrer"
style={{
display: "inline-block",
marginTop: "24px",
padding: "12px 24px",
background: "linear-gradient(135deg, var(--accent), var(--accent2))",
color: "var(--bg)",
textDecoration: "none",
borderRadius: "10px",
fontWeight: "600"
}}

>

```
🌐 Live Demo
```

  </a>
)}

            </div>
          ))}
        </div>
      </section>

      {/* TRAINING */}
      <section id="training" style={{ background: "rgba(6,12,20,0.6)" }}>
        <div className="section-eyebrow reveal">Industrial Exposure</div>
        <h2 className="section-title reveal">
          Training &<br /><span className="gradient-text">Experience</span>
        </h2>
        <div className="timeline">
          {[
            {
              date: "Dec 2025 · 10 Days",
              title: "Implant Training – Zen Techpark",
              org: "Embedded Systems & IoT · Coimbatore",
              desc: "Explored IoT system architecture, PCB design fundamentals, and real-time troubleshooting of embedded hardware circuits. Hands-on with ESP modules, sensor networks, and embedded debugging tools.",
            },
            {
              date: "May 2025 · 5 Days",
              title: "Implant Training – Coral Coil Limited",
              org: "Industrial Coil Manufacturing & Quality Control · Erode",
              desc: "Observed coil winding processes, in-process quality inspection protocols, and instrument calibration on the production floor. Familiarised with shop-floor instrumentation, safety interlock systems, and standard operating procedures.",
            },
            {
              date: "June 2026 · 8 Days",
              title: "MERN Stack Full Training",
              org: "Frontend & Backend Development",
              desc: "Comprehensive training covering React.js, Node.js, Express.js, MongoDB, REST API design, JavaScript ES6+, and Postman for API testing. Built production-ready full-stack applications.",
            },
          ].map((t) => (
            <div key={t.title} className="timeline-item reveal">
              <div className="timeline-date">{t.date}</div>
              <h3 className="timeline-title">{t.title}</h3>
              <div className="timeline-org">{t.org}</div>
              <p className="timeline-desc">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section id="achievements">
        <div className="section-eyebrow reveal">Recognition</div>
        <h2 className="section-title reveal">
          Awards &<br /><span className="gradient-text">Achievements</span>
        </h2>
        <div className="achievements-grid">
          {ACHIEVEMENTS.map((a, i) => (
            <div key={a.title} className="achievement-card reveal" style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="achievement-icon">{a.icon}</div>
              <div className="achievement-text">
                <h4>{a.title}</h4>
                <p>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CERTS */}
      <section style={{ background: "rgba(6,12,20,0.6)", padding: "80px 60px" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
          <div className="section-eyebrow reveal">Learning</div>
          <h2 className="section-title reveal">
            Certifications &<br /><span className="gradient-text">Courses</span>
          </h2>
          <div className="certs-grid">
            {CERTS.map((c, i) => (
              <div key={c} className="cert-card reveal" style={{ transitionDelay: `${i * 50}ms` }}>
                <div className="cert-badge">🎓</div>
                <div className="cert-name">{c}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact">
        <div className="section-eyebrow reveal">Let's Connect</div>
        <h2 className="section-title reveal">
          Get In<br /><span className="gradient-text">Touch</span>
        </h2>
        <div className="contact-grid">
          <div className="reveal">
            <p className="contact-intro">
              I'm actively looking for <strong>core EIE internships</strong> in semiconductor, embedded systems, or sensor characterisation domains — and open to <strong>full-stack development</strong> roles too.<br /><br />
              Whether you have an opportunity, a project idea, or just want to say hi — my inbox is always open.
            </p>
            <div className="contact-links">
              {[
                { icon: "📧", label: "Email", val: "vimalprabhupk@gmail.com", href: "mailto:vimalprabhupk@gmail.com" },
                { icon: "📱", label: "Phone", val: "+91 9080581036", href: "tel:+919080581036" },
                { icon: "💼", label: "LinkedIn", val: "linkedin.com/in/vimal-prabhu-va2320", href: "https://linkedin.com/in/vimal-prabhu-va2320" },
                { icon: "🐙", label: "GitHub", val: "github.com/vimal-2320", href: "https://github.com/vimal-2320" },
              ].map(({ icon, label, val, href }) => (
                <a key={label} href={href} className="contact-link" target="_blank" rel="noopener noreferrer">
                  <div className="contact-link-icon">{icon}</div>
                  <div className="contact-link-text">
                    <span className="contact-link-label">{label}</span>
                    <span className="contact-link-val">{val}</span>
                  </div>
                  <span className="contact-link-arrow">→</span>
                </a>
              ))}
            </div>
          </div>

          <div className="contact-form-panel reveal">
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, marginBottom: "28px" }}>
              Send a Message
            </h3>
            {formSent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✅</div>
                <p style={{ color: "var(--accent)", fontWeight: 600 }}>Message sent! I'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleForm}>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Tell me about the opportunity or project..."
                    value={formData.message}
                    onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                    required
                  />
                </div>
                <button type="submit" className="form-submit">
                  🚀 Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <span className="footer-name">VIMAL PK</span>
        <span className="footer-copy">
          B.E. EIE · Kongu Engineering College · Erode, TN · 2026
        </span>
        <span className="footer-copy">
          Made with love❤️
        </span>
      </footer>
    </div>
  );
}
