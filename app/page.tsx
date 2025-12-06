"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Shader, Swirl } from "shaders/react";
import { GrainOverlay } from "@/components/grain-overlay";

// Custom SVG visuals for each slide
const SlideVisuals: Record<number, React.FC> = {
  // Title - Abstract network constellation
  0: () => (
    <svg viewBox="0 0 200 120" className="w-full h-32 md:h-40 opacity-90">
      <defs>
        <linearGradient id="grad0" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* Central node */}
      <circle cx="100" cy="60" r="8" fill="url(#grad0)" />
      <circle cx="100" cy="60" r="12" fill="none" stroke="url(#grad0)" strokeWidth="1" opacity="0.5" />
      {/* Orbiting nodes */}
      <circle cx="40" cy="40" r="4" fill="#3b82f6" opacity="0.7" />
      <circle cx="160" cy="35" r="5" fill="#8b5cf6" opacity="0.7" />
      <circle cx="50" cy="90" r="3" fill="#a855f7" opacity="0.6" />
      <circle cx="150" cy="85" r="4" fill="#3b82f6" opacity="0.7" />
      <circle cx="75" cy="25" r="3" fill="#6366f1" opacity="0.5" />
      <circle cx="130" cy="95" r="3" fill="#6366f1" opacity="0.5" />
      {/* Connection lines */}
      <line x1="100" y1="60" x2="40" y2="40" stroke="url(#grad0)" strokeWidth="1" opacity="0.4" />
      <line x1="100" y1="60" x2="160" y2="35" stroke="url(#grad0)" strokeWidth="1" opacity="0.4" />
      <line x1="100" y1="60" x2="50" y2="90" stroke="url(#grad0)" strokeWidth="1" opacity="0.3" />
      <line x1="100" y1="60" x2="150" y2="85" stroke="url(#grad0)" strokeWidth="1" opacity="0.4" />
      <line x1="40" y1="40" x2="75" y2="25" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3" />
      <line x1="150" y1="85" x2="130" y2="95" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.3" />
    </svg>
  ),

  // At a Glance - Dashboard/radar
  1: () => (
    <svg viewBox="0 0 200 120" className="w-full h-32 md:h-40 opacity-90">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Radar circles */}
      <circle cx="100" cy="60" r="45" fill="none" stroke="url(#grad1)" strokeWidth="1" opacity="0.2" />
      <circle cx="100" cy="60" r="30" fill="none" stroke="url(#grad1)" strokeWidth="1" opacity="0.3" />
      <circle cx="100" cy="60" r="15" fill="none" stroke="url(#grad1)" strokeWidth="1" opacity="0.4" />
      {/* Radar lines */}
      <line x1="100" y1="15" x2="100" y2="105" stroke="url(#grad1)" strokeWidth="0.5" opacity="0.2" />
      <line x1="55" y1="60" x2="145" y2="60" stroke="url(#grad1)" strokeWidth="0.5" opacity="0.2" />
      <line x1="68" y1="28" x2="132" y2="92" stroke="url(#grad1)" strokeWidth="0.5" opacity="0.2" />
      <line x1="132" y1="28" x2="68" y2="92" stroke="url(#grad1)" strokeWidth="0.5" opacity="0.2" />
      {/* Data points */}
      <circle cx="100" cy="35" r="4" fill="#3b82f6" />
      <circle cx="125" cy="50" r="3" fill="#8b5cf6" />
      <circle cx="80" cy="75" r="3.5" fill="#a855f7" />
      <circle cx="115" cy="80" r="3" fill="#6366f1" />
      {/* Sweep line */}
      <line x1="100" y1="60" x2="130" y2="30" stroke="url(#grad1)" strokeWidth="2" opacity="0.8" />
    </svg>
  ),

  // AI Paradox - Empty fuel gauge
  2: () => (
    <svg viewBox="0 0 200 120" className="w-full h-32 md:h-40 opacity-90">
      <defs>
        <linearGradient id="grad2" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Gauge arc */}
      <path d="M 40 90 A 60 60 0 0 1 160 90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />
      {/* Filled portion - very low */}
      <path d="M 40 90 A 60 60 0 0 1 55 65" fill="none" stroke="url(#grad2)" strokeWidth="12" strokeLinecap="round" />
      {/* Tick marks */}
      <line x1="45" y1="80" x2="55" y2="75" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line x1="70" y1="50" x2="78" y2="55" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line x1="100" y1="35" x2="100" y2="45" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line x1="130" y1="50" x2="122" y2="55" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line x1="155" y1="80" x2="145" y2="75" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      {/* Needle */}
      <line x1="100" y1="90" x2="60" y2="55" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="100" cy="90" r="6" fill="white" />
      {/* Labels */}
      <text x="35" y="105" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="monospace">E</text>
      <text x="160" y="105" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="monospace">F</text>
    </svg>
  ),

  // Diagnosis - Calendar with gaps
  3: () => (
    <svg viewBox="0 0 200 120" className="w-full h-32 md:h-40 opacity-90">
      <defs>
        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Calendar frame */}
      <rect x="40" y="25" width="120" height="80" rx="8" fill="none" stroke="url(#grad3)" strokeWidth="1.5" opacity="0.6" />
      <rect x="40" y="25" width="120" height="20" rx="8" fill="url(#grad3)" opacity="0.3" />
      {/* Grid lines */}
      <line x1="70" y1="45" x2="70" y2="105" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <line x1="100" y1="45" x2="100" y2="105" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <line x1="130" y1="45" x2="130" y2="105" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <line x1="40" y1="65" x2="160" y2="65" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <line x1="40" y1="85" x2="160" y2="85" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      {/* Filled cells - scattered with gaps */}
      <rect x="45" y="50" width="20" height="12" rx="2" fill="#3b82f6" opacity="0.6" />
      <rect x="105" y="50" width="20" height="12" rx="2" fill="#8b5cf6" opacity="0.6" />
      <rect x="75" y="70" width="20" height="12" rx="2" fill="#6366f1" opacity="0.5" />
      <rect x="135" y="90" width="20" height="12" rx="2" fill="#a855f7" opacity="0.5" />
      {/* Question marks for gaps */}
      <text x="52" y="80" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="sans-serif">?</text>
      <text x="112" y="100" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="sans-serif">?</text>
    </svg>
  ),

  // Structural Reality - Network graph
  4: () => (
    <svg viewBox="0 0 200 120" className="w-full h-32 md:h-40 opacity-90">
      <defs>
        <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Top node - CEO */}
      <circle cx="100" cy="20" r="8" fill="url(#grad4)" />
      {/* Middle layer */}
      <circle cx="60" cy="55" r="6" fill="#6366f1" opacity="0.8" />
      <circle cx="100" cy="55" r="6" fill="#6366f1" opacity="0.8" />
      <circle cx="140" cy="55" r="6" fill="#6366f1" opacity="0.8" />
      {/* Bottom layer - dense connections */}
      <circle cx="30" cy="95" r="4" fill="#8b5cf6" opacity="0.6" />
      <circle cx="55" cy="95" r="4" fill="#8b5cf6" opacity="0.6" />
      <circle cx="80" cy="95" r="4" fill="#8b5cf6" opacity="0.6" />
      <circle cx="105" cy="95" r="4" fill="#8b5cf6" opacity="0.6" />
      <circle cx="130" cy="95" r="4" fill="#8b5cf6" opacity="0.6" />
      <circle cx="155" cy="95" r="4" fill="#8b5cf6" opacity="0.6" />
      <circle cx="170" cy="95" r="4" fill="#8b5cf6" opacity="0.6" />
      {/* Connections - sparse at top */}
      <line x1="100" y1="28" x2="60" y2="49" stroke="url(#grad4)" strokeWidth="1" opacity="0.5" />
      <line x1="100" y1="28" x2="100" y2="49" stroke="url(#grad4)" strokeWidth="1" opacity="0.5" />
      <line x1="100" y1="28" x2="140" y2="49" stroke="url(#grad4)" strokeWidth="1" opacity="0.5" />
      {/* Connections - dense at bottom */}
      <line x1="60" y1="61" x2="30" y2="91" stroke="#6366f1" strokeWidth="0.5" opacity="0.4" />
      <line x1="60" y1="61" x2="55" y2="91" stroke="#6366f1" strokeWidth="0.5" opacity="0.4" />
      <line x1="60" y1="61" x2="80" y2="91" stroke="#6366f1" strokeWidth="0.5" opacity="0.4" />
      <line x1="100" y1="61" x2="80" y2="91" stroke="#6366f1" strokeWidth="0.5" opacity="0.4" />
      <line x1="100" y1="61" x2="105" y2="91" stroke="#6366f1" strokeWidth="0.5" opacity="0.4" />
      <line x1="140" y1="61" x2="130" y2="91" stroke="#6366f1" strokeWidth="0.5" opacity="0.4" />
      <line x1="140" y1="61" x2="155" y2="91" stroke="#6366f1" strokeWidth="0.5" opacity="0.4" />
      <line x1="140" y1="61" x2="170" y2="91" stroke="#6366f1" strokeWidth="0.5" opacity="0.4" />
      {/* Cross connections at bottom */}
      <line x1="30" y1="95" x2="55" y2="95" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.3" />
      <line x1="55" y1="95" x2="80" y2="95" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.3" />
      <line x1="80" y1="95" x2="105" y2="95" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.3" />
      <line x1="105" y1="95" x2="130" y2="95" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.3" />
      <line x1="130" y1="95" x2="155" y2="95" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.3" />
    </svg>
  ),

  // Context Scarce - Funnel narrowing
  5: () => (
    <svg viewBox="0 0 200 120" className="w-full h-32 md:h-40 opacity-90">
      <defs>
        <linearGradient id="grad5" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {/* Funnel shape */}
      <path d="M 40 20 L 160 20 L 115 70 L 115 100 L 85 100 L 85 70 Z" fill="url(#grad5)" opacity="0.3" />
      <path d="M 40 20 L 160 20 L 115 70 L 115 100 L 85 100 L 85 70 Z" fill="none" stroke="url(#grad5)" strokeWidth="1.5" />
      {/* Input items at top */}
      <circle cx="55" cy="12" r="3" fill="#3b82f6" opacity="0.8" />
      <circle cx="75" cy="10" r="3" fill="#6366f1" opacity="0.8" />
      <circle cx="95" cy="8" r="3" fill="#8b5cf6" opacity="0.8" />
      <circle cx="115" cy="10" r="3" fill="#a855f7" opacity="0.8" />
      <circle cx="135" cy="12" r="3" fill="#3b82f6" opacity="0.8" />
      <circle cx="150" cy="14" r="3" fill="#6366f1" opacity="0.8" />
      {/* Items in funnel */}
      <circle cx="70" cy="35" r="2.5" fill="#3b82f6" opacity="0.6" />
      <circle cx="100" cy="40" r="2.5" fill="#8b5cf6" opacity="0.6" />
      <circle cx="130" cy="35" r="2.5" fill="#6366f1" opacity="0.6" />
      <circle cx="95" cy="55" r="2" fill="#a855f7" opacity="0.5" />
      {/* Tiny output */}
      <circle cx="100" cy="108" r="2" fill="#8b5cf6" />
    </svg>
  ),

  // Core Tension - Balance/scale
  6: () => (
    <svg viewBox="0 0 200 120" className="w-full h-32 md:h-40 opacity-90">
      <defs>
        <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Center pivot */}
      <polygon points="100,35 95,45 105,45" fill="url(#grad6)" />
      <line x1="100" y1="45" x2="100" y2="100" stroke="url(#grad6)" strokeWidth="2" />
      <rect x="85" y="95" width="30" height="8" rx="2" fill="url(#grad6)" opacity="0.5" />
      {/* Beam - tilted */}
      <line x1="35" y1="55" x2="165" y2="35" stroke="url(#grad6)" strokeWidth="3" strokeLinecap="round" />
      {/* Left pan (Agile - lighter, higher) */}
      <line x1="35" y1="55" x2="35" y2="75" stroke="#3b82f6" strokeWidth="1" />
      <ellipse cx="35" cy="78" rx="25" ry="6" fill="none" stroke="#3b82f6" strokeWidth="1" />
      <text x="25" y="95" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="sans-serif">AGILE</text>
      {/* Right pan (AI Needs - heavier, lower) */}
      <line x1="165" y1="35" x2="165" y2="55" stroke="#8b5cf6" strokeWidth="1" />
      <ellipse cx="165" cy="58" rx="25" ry="6" fill="none" stroke="#8b5cf6" strokeWidth="1" />
      <text x="150" y="75" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="sans-serif">AI NEEDS</text>
      {/* Weight indicators */}
      <rect x="155" y="48" width="8" height="8" rx="1" fill="#8b5cf6" opacity="0.6" />
      <rect x="163" y="48" width="8" height="8" rx="1" fill="#8b5cf6" opacity="0.6" />
    </svg>
  ),

  // Beyond KM - Stacked layers/altitude
  7: () => (
    <svg viewBox="0 0 200 120" className="w-full h-32 md:h-40 opacity-90">
      <defs>
        <linearGradient id="grad7" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* Horizontal layers */}
      <rect x="40" y="15" width="120" height="18" rx="4" fill="url(#grad7)" opacity="0.9" />
      <rect x="50" y="40" width="100" height="18" rx="4" fill="url(#grad7)" opacity="0.7" />
      <rect x="60" y="65" width="80" height="18" rx="4" fill="url(#grad7)" opacity="0.5" />
      <rect x="70" y="90" width="60" height="18" rx="4" fill="url(#grad7)" opacity="0.3" />
      {/* Connecting lines */}
      <line x1="100" y1="33" x2="100" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2,2" />
      <line x1="100" y1="58" x2="100" y2="65" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2,2" />
      <line x1="100" y1="83" x2="100" y2="90" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2,2" />
      {/* Labels */}
      <text x="85" y="27" fill="white" fontSize="7" fontFamily="sans-serif" opacity="0.9">STRATEGY</text>
      <text x="85" y="52" fill="white" fontSize="7" fontFamily="sans-serif" opacity="0.8">DOMAIN</text>
      <text x="90" y="77" fill="white" fontSize="7" fontFamily="sans-serif" opacity="0.7">TEAM</text>
      <text x="90" y="102" fill="white" fontSize="7" fontFamily="sans-serif" opacity="0.6">TASK</text>
    </svg>
  ),

  // Solution - Four pillars
  8: () => (
    <svg viewBox="0 0 200 120" className="w-full h-32 md:h-40 opacity-90">
      <defs>
        <linearGradient id="grad8" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Foundation */}
      <rect x="25" y="100" width="150" height="10" rx="2" fill="url(#grad8)" opacity="0.4" />
      {/* Four pillars */}
      <rect x="35" y="40" width="22" height="60" rx="3" fill="url(#grad8)" opacity="0.7" />
      <rect x="67" y="40" width="22" height="60" rx="3" fill="url(#grad8)" opacity="0.75" />
      <rect x="99" y="40" width="22" height="60" rx="3" fill="url(#grad8)" opacity="0.8" />
      <rect x="131" y="40" width="22" height="60" rx="3" fill="url(#grad8)" opacity="0.85" />
      {/* Roof/cap */}
      <rect x="25" y="30" width="150" height="10" rx="2" fill="url(#grad8)" opacity="0.5" />
      {/* Pillar numbers */}
      <text x="42" y="75" fill="white" fontSize="10" fontFamily="sans-serif" fontWeight="bold">1</text>
      <text x="74" y="75" fill="white" fontSize="10" fontFamily="sans-serif" fontWeight="bold">2</text>
      <text x="106" y="75" fill="white" fontSize="10" fontFamily="sans-serif" fontWeight="bold">3</text>
      <text x="138" y="75" fill="white" fontSize="10" fontFamily="sans-serif" fontWeight="bold">4</text>
    </svg>
  ),

  // High-Leverage - Pyramid layers
  9: () => (
    <svg viewBox="0 0 200 120" className="w-full h-32 md:h-40 opacity-90">
      <defs>
        <linearGradient id="grad9a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="grad9b" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="grad9c" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      {/* Pyramid layers */}
      <polygon points="100,15 70,45 130,45" fill="url(#grad9a)" opacity="0.9" />
      <polygon points="70,50 50,80 150,80 130,50" fill="url(#grad9b)" opacity="0.7" />
      <polygon points="50,85 30,110 170,110 150,85" fill="url(#grad9c)" opacity="0.4" />
      {/* Labels */}
      <text x="80" y="37" fill="white" fontSize="6" fontFamily="sans-serif">SLOW</text>
      <text x="85" y="70" fill="white" fontSize="6" fontFamily="sans-serif">FAST</text>
      <text x="75" y="102" fill="rgba(255,255,255,0.6)" fontSize="6" fontFamily="sans-serif">TRANSIENT</text>
      {/* Time indicators */}
      <circle cx="175" cy="30" r="8" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.6" />
      <text x="171" y="33" fill="#3b82f6" fontSize="7" fontFamily="sans-serif">∞</text>
    </svg>
  ),

  // Value Proposition - Lightning speed
  10: () => (
    <svg viewBox="0 0 200 120" className="w-full h-32 md:h-40 opacity-90">
      <defs>
        <linearGradient id="grad10" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Lightning bolt */}
      <polygon points="110,10 70,55 95,55 85,110 130,50 105,50" fill="url(#grad10)" opacity="0.9" />
      {/* Speed lines */}
      <line x1="40" y1="35" x2="60" y2="35" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="35" y1="50" x2="55" y2="50" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="40" y1="65" x2="60" y2="65" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <line x1="140" y1="55" x2="165" y2="55" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="145" y1="70" x2="170" y2="70" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="140" y1="85" x2="165" y2="85" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      {/* Time labels */}
      <text x="30" y="95" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="monospace">5 min</text>
      <text x="140" y="95" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="monospace">3 min</text>
    </svg>
  ),

  // Economics - Value exchange
  11: () => (
    <svg viewBox="0 0 200 120" className="w-full h-32 md:h-40 opacity-90">
      <defs>
        <linearGradient id="grad11" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Left side - Meetings (expensive) */}
      <rect x="25" y="50" width="60" height="50" rx="6" fill="none" stroke="rgba(239,68,68,0.6)" strokeWidth="1.5" />
      <text x="38" y="70" fill="rgba(239,68,68,0.8)" fontSize="20" fontFamily="sans-serif">📅</text>
      <text x="35" y="90" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="sans-serif">MEETINGS</text>
      {/* Arrow */}
      <path d="M 95 75 L 105 75 L 102 70 M 105 75 L 102 80" fill="none" stroke="url(#grad11)" strokeWidth="2" />
      {/* Right side - Context (valuable) */}
      <rect x="115" y="50" width="60" height="50" rx="6" fill="none" stroke="url(#grad11)" strokeWidth="1.5" />
      <text x="130" y="70" fill="url(#grad11)" fontSize="20" fontFamily="sans-serif">📄</text>
      <text x="125" y="90" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="sans-serif">CONTEXT</text>
      {/* Cost indicators */}
      <text x="40" y="40" fill="rgba(239,68,68,0.6)" fontSize="10" fontFamily="sans-serif">$$$</text>
      <text x="135" y="40" fill="url(#grad11)" fontSize="10" fontFamily="sans-serif">→ ∞</text>
    </svg>
  ),

  // Objections - Shield/check
  12: () => (
    <svg viewBox="0 0 200 120" className="w-full h-32 md:h-40 opacity-90">
      <defs>
        <linearGradient id="grad12" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Shield shape */}
      <path d="M 100 15 L 145 30 L 145 65 C 145 85 125 100 100 110 C 75 100 55 85 55 65 L 55 30 Z"
        fill="url(#grad12)" opacity="0.2" />
      <path d="M 100 15 L 145 30 L 145 65 C 145 85 125 100 100 110 C 75 100 55 85 55 65 L 55 30 Z"
        fill="none" stroke="url(#grad12)" strokeWidth="2" />
      {/* Checkmark */}
      <path d="M 75 60 L 92 77 L 125 44" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* X marks for myths */}
      <text x="25" y="45" fill="rgba(239,68,68,0.5)" fontSize="14" fontFamily="sans-serif">✗</text>
      <text x="165" y="45" fill="rgba(239,68,68,0.5)" fontSize="14" fontFamily="sans-serif">✗</text>
      <text x="25" y="90" fill="rgba(239,68,68,0.5)" fontSize="14" fontFamily="sans-serif">✗</text>
      <text x="165" y="90" fill="rgba(239,68,68,0.5)" fontSize="14" fontFamily="sans-serif">✗</text>
    </svg>
  ),

  // How Work Changes - Transformation
  13: () => (
    <svg viewBox="0 0 200 120" className="w-full h-32 md:h-40 opacity-90">
      <defs>
        <linearGradient id="grad13" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="grad13b" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Before boxes */}
      <rect x="25" y="20" width="50" height="16" rx="3" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <rect x="25" y="42" width="50" height="16" rx="3" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <rect x="25" y="64" width="50" height="16" rx="3" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <rect x="25" y="86" width="50" height="16" rx="3" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      {/* Arrows */}
      <path d="M 85 28 L 115 28" stroke="url(#grad13)" strokeWidth="2" markerEnd="url(#arrow)" />
      <path d="M 85 50 L 115 50" stroke="url(#grad13)" strokeWidth="2" />
      <path d="M 85 72 L 115 72" stroke="url(#grad13)" strokeWidth="2" />
      <path d="M 85 94 L 115 94" stroke="url(#grad13)" strokeWidth="2" />
      {/* After boxes */}
      <rect x="125" y="20" width="50" height="16" rx="3" fill="url(#grad13b)" opacity="0.6" />
      <rect x="125" y="42" width="50" height="16" rx="3" fill="url(#grad13b)" opacity="0.6" />
      <rect x="125" y="64" width="50" height="16" rx="3" fill="url(#grad13b)" opacity="0.6" />
      <rect x="125" y="86" width="50" height="16" rx="3" fill="url(#grad13b)" opacity="0.6" />
      {/* Arrow tips */}
      <polygon points="115,25 115,31 120,28" fill="url(#grad13b)" />
      <polygon points="115,47 115,53 120,50" fill="url(#grad13b)" />
      <polygon points="115,69 115,75 120,72" fill="url(#grad13b)" />
      <polygon points="115,91 115,97 120,94" fill="url(#grad13b)" />
    </svg>
  ),

  // How We Start - Rocket launch
  14: () => (
    <svg viewBox="0 0 200 120" className="w-full h-32 md:h-40 opacity-90">
      <defs>
        <linearGradient id="grad14" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="flame" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Launch pad */}
      <rect x="70" y="95" width="60" height="8" rx="2" fill="rgba(255,255,255,0.2)" />
      {/* Rocket body */}
      <ellipse cx="100" cy="55" rx="15" ry="35" fill="url(#grad14)" />
      {/* Rocket tip */}
      <ellipse cx="100" cy="22" rx="8" ry="12" fill="#8b5cf6" />
      {/* Window */}
      <circle cx="100" cy="45" r="6" fill="rgba(255,255,255,0.3)" />
      <circle cx="100" cy="45" r="4" fill="rgba(59,130,246,0.5)" />
      {/* Fins */}
      <polygon points="85,75 75,95 85,85" fill="url(#grad14)" opacity="0.8" />
      <polygon points="115,75 125,95 115,85" fill="url(#grad14)" opacity="0.8" />
      {/* Flame */}
      <ellipse cx="100" cy="100" rx="10" ry="15" fill="url(#flame)" />
      {/* Stars */}
      <circle cx="40" cy="25" r="1.5" fill="white" opacity="0.6" />
      <circle cx="160" cy="35" r="1" fill="white" opacity="0.4" />
      <circle cx="150" cy="20" r="1.5" fill="white" opacity="0.5" />
      <circle cx="50" cy="45" r="1" fill="white" opacity="0.3" />
      <circle cx="170" cy="60" r="1" fill="white" opacity="0.4" />
    </svg>
  ),

  // Conclusion - Infrastructure foundation
  15: () => (
    <svg viewBox="0 0 200 120" className="w-full h-32 md:h-40 opacity-90">
      <defs>
        <linearGradient id="grad15" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* Foundation blocks */}
      <rect x="30" y="85" width="140" height="20" rx="3" fill="url(#grad15)" opacity="0.4" />
      <rect x="40" y="65" width="120" height="18" rx="3" fill="url(#grad15)" opacity="0.5" />
      <rect x="50" y="45" width="100" height="18" rx="3" fill="url(#grad15)" opacity="0.6" />
      {/* Building rising from foundation */}
      <rect x="75" y="15" width="50" height="28" rx="3" fill="url(#grad15)" opacity="0.8" />
      {/* Windows/details */}
      <rect x="82" y="22" width="8" height="8" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="96" y="22" width="8" height="8" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="110" y="22" width="8" height="8" rx="1" fill="rgba(255,255,255,0.3)" />
      {/* Upward arrows */}
      <path d="M 100 8 L 95 15 M 100 8 L 105 15" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
      <path d="M 100 0 L 100 8" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
      {/* Label */}
      <text x="58" y="78" fill="rgba(255,255,255,0.6)" fontSize="7" fontFamily="sans-serif" letterSpacing="0.5">CONTEXT INFRASTRUCTURE</text>
    </svg>
  ),
};

// Types for our content
interface SlideContent {
  heading?: string;
  text?: string;
  quote?: string;
  listItems?: string[];
  type?: 'paragraph' | 'quote' | 'list' | 'subsection';
}

interface Slide {
  title: string;
  subtitle?: string;
  isTitle?: boolean;
  isConclusion?: boolean;
  content: SlideContent[];
}

const slides: Slide[] = [
  {
    title: "Show me the context, and I'll show you the output.",
    subtitle: "The Context-First Organisation",
    isTitle: true,
    content: [
      {
        text: "Why AI demands we rethink how we work. The bottleneck isn't AI's ability to do tasks. It's our ability to give AI the context it needs to do them well."
      }
    ]
  },
  {
    title: "Executive Summary",
    subtitle: "The Context-First Organisation",
    content: [
      {
        heading: "The Problem:",
        text: "Critical organisational knowledge is trapped in people's heads, and our primary method for transmitting it is through meetings and emails. This 'context flow problem' creates a bottleneck that prevents effective AI adoption, as AI requires explicit context to function reliably."
      },
      {
        heading: "The Solution:",
        text: "The Context-First Framework solves this by shifting from a 'broadcaster' model to a 'publisher' model. By creating structured Context Artefacts, high-leverage documents designed for both human and AI consumption, we unlock the context needed for AI to deliver value."
      },
      {
        heading: "The Value:",
        text: "This approach transforms AI from a tool that produces 'faster wrong answers' into a genuine productivity engine. The result is not just efficiency, but an organisation that learns, adapts, and aligns at the speed of AI."
      }
    ]
  },
  {
    title: "The Context Flow Problem",
    subtitle: "Why Context is the New Bottleneck",
    content: [
      {
        text: "\"Too many meetings. Too many emails.\" How many times have you heard this? We have a context flow problem. Critical knowledge is trapped in people's heads, accessible only through endless meetings and emails."
      },
      {
        text: "Unsolved, this could be a huge constraint on AI adoption and our ability to leverage AI to help us deliver value."
      },
      {
        text: "Why? The bottleneck isn't AI's ability to do tasks. It's our ability to give AI the context it needs to do them well. Quality context availability, not execution capability, is now the limiting factor for AI value."
      }
    ]
  },
  {
    title: "The Organisational Graph",
    subtitle: "Why Context is the New Bottleneck",
    content: [
      {
        text: "Work doesn't happen in clean vertical lines. It happens in a dense, chaotic web of dependencies. Every meeting, every email is a 'transaction' passing context from one person to another."
      },
      {
        text: "When we fall behind, our instinct is to add more people. But adding more nodes exponentially increases the connections, noise, and coordination tax."
      },
      {
        heading: "Real-World Example: Risk Assessment",
        text: "Consider a Risk Assessment. It rarely takes long to <em>do</em>, but it takes weeks to <em>start</em>. Why? Because the Risk Specialist needs to gather context from various people accrued over time. The bottleneck isn't the task; it's the 'transactional volume' of meetings required to get the context."
      }
    ]
  },
  {
    title: "The AI Ceiling",
    subtitle: "Why Context is the New Bottleneck",
    content: [
      {
        text: "There's so much energy pushing towards building AI agents to do tasks. But an AI agent is just another node in this chaotic graph. If the bottleneck is <em>gathering context</em>, AI doesn't help. It just generates 'faster wrong answers.'"
      },
      {
        text: "To get value, we must reduce the <em>volume of transactions</em> by establishing context <em>before</em> the work starts."
      },
      {
        heading: "Real-World Example: Strategy Refresh",
        text: "When strategy is communicated via PowerPoint, people are left with the burden of documenting the 'why.' Without a structured <strong>Context Artefact</strong>, I have to write that context myself before AI becomes useful. Most won't, so AI remains a toy."
      }
    ]
  },
  {
    title: "The New Bottleneck",
    subtitle: "Why AI Changes Everything",
    content: [
      {
        text: "We are investing in AI tools to help us accelerate. But the bottleneck isn't AI's ability to do tasks. It's our ability to give AI the context it needs to do them well."
      },
      {
        text: "Think about how we actually spend time today. Writing code or drafting documents often takes less time than gathering the context needed to do it right. We spend hours in meetings clarifying requirements."
      },
      {
        text: "If AI can't access the context it needs, it will produce faster wrong answers. Context availability, not execution capability, becomes the limiting factor for AI value."
      }
    ]
  },
  {
    title: "The Documentation Inversion",
    subtitle: "Why AI Changes Everything",
    content: [
      {
        text: "There is a fundamental tension between how we have been trained to work and what AI requires. The Agile Manifesto's 'Working software over comprehensive documentation' was a necessary correction, but now this mindset is antithetical to progress."
      },
      {
        text: "Traditional Agile relies on tacit knowledge. <strong>This is fatal for AI adoption.</strong> AI cannot 'set up a meeting' to clarify a requirement. It requires explicit, structured context <em>before</em> the work starts."
      },
      {
        text: "This is why the economics of documentation have flipped. Before AI, writing extensive documentation was expensive. Now, creating structured <strong>Context Artefacts</strong> is cheap and essential."
      }
    ]
  },
  {
    title: "The Responsibility Shift",
    subtitle: "Why AI Changes Everything",
    content: [
      {
        text: "The emergence of AI has further exposed the context flow problem. Communicating context verbally is no longer sufficient."
      },
      {
        heading: "A New Responsibility",
        text: "The holder of the context must share it in a form that allows the recipient to consume it effectively with AI tools. The context holder must now be a 'publisher,' not just a broadcaster."
      },
      {
        text: "By providing this detailed, accessible context, they enable their teams to immediately leverage it in their own AI workflows, preventing massive duplication of effort and misalignment."
      }
    ]
  },
  {
    title: "The Solution Overview",
    subtitle: "Context-First Framework",
    content: [
      {
        text: "We must change our approach. Instead of using collaboration to find context, we need to create context to enable collaboration. This new operating model is built on producing, managing, and leveraging <strong>Context Artefacts</strong>."
      },
      {
        heading: "The Four Components",
        listItems: [
          "<strong>Context Artefacts:</strong> Structured, high-leverage documents designed to be used as seed context for AI.",
          "<strong>Context Cascade:</strong> The process of distilling and flowing Context Artefacts down through the organisation.",
          "<strong>Context Core:</strong> The practice of using foundational context to easily create detailed context for specific components.",
          "<strong>Patterns of Work:</strong> The new patterns of work that are oriented around the creation, distribution and use of Context Artefacts."
        ]
      }
    ]
  },
  {
    title: "Context Artefacts",
    subtitle: "The Solution",
    content: [
      {
        text: "Think of <strong>Context Artefacts</strong> as 'Claude Skills' but for organisational context. They are curated, high-leverage documents designed to be used as seed context when your people use AI tools."
      },
      {
        heading: "Two Types of Artefacts",
        listItems: [
          "<strong>Fixed Artefacts:</strong> Enduring context that rarely changes (e.g., Vision, Values, Leadership Principles).",
          "<strong>Variable Artefacts:</strong> Context that evolves over time (e.g., Quarterly OKRs, Priorities, Reflections)."
        ]
      },
      {
        heading: "The Intent",
        text: "To improve the quality of context available to your people. By making high-quality context easily accessible, we reduce the barriers to using AI effectively."
      }
    ]
  },
  {
    title: "Context Cascade: What is it?",
    subtitle: "The Solution",
    content: [
      {
        text: "Context Cascade establishes a hierarchy of shared context that flows throughout the organisation. It supplements traditional communication with structured <strong>Context Artefacts</strong>."
      },
      {
        heading: "Key Levels",
        listItems: [
          "<strong>Group Level:</strong> The primary source of truth. Structured into Fixed (Strategy, Vision) and Variable (Quarterly Priorities) layers.",
          "<strong>Division/Domain Level:</strong> More detail for that division showing how they align to and extend the Group context.",
          "<strong>Team Level:</strong> Teams can then query these documents with AI to understand implications for their specific work."
        ]
      },
      {
        text: "Shared context flows down, local context extends and refines it, and consistency consolidates upward."
      }
    ]
  },
  {
    title: "Context Cascade: In Practice",
    subtitle: "The Solution",
    content: [
      {
        heading: "Why it matters",
        text: "<strong>Alignment through Inheritance:</strong> The intent is to cascade context so that each level of the organisation inherits the full context from the levels above. This ensures that every team is working from a single, shared source of truth."
      },
      {
        heading: "Example: The Quarterly Leaders' Call",
        text: "Imagine a CEO presenting strategy to 1,000 leaders via slides. <strong>Without Context Cascade</strong>, 1,000 leaders individually interpret the message, leading to noise. <strong>With Context Cascade</strong>, everyone inherits the <em>exact same</em> structured artefact to seed their team's planning."
      }
    ]
  },
  {
    title: "Context Core: What is it?",
    subtitle: "The Solution",
    content: [
      {
        text: "The Context Core is a team's living repository of <strong>Context Artefacts</strong>. It is where knowledge moves from people's heads into shared, queryable assets."
      },
      {
        heading: "Foundational Artifacts",
        listItems: [
          "<strong>Vision/Purpose:</strong> The fundamental purpose, problem, and intended outcomes.",
          "<strong>Product Overview:</strong> High-level description of the product and its core value.",
          "<strong>Annual/Quarterly Priorities:</strong> The 'why-now' rationale and OKRs.",
          "<strong>Reflections / Decision Log:</strong> A running log of key decisions and learnings."
        ]
      },
      {
        text: "These artifacts are then used to seed the creation of new context (e.g., feature specs, tickets)."
      }
    ]
  },
  {
    title: "Context Core: In Practice",
    subtitle: "The Solution",
    content: [
      {
        heading: "Why it matters",
        listItems: [
          "<strong>Reducing the 'Meeting Loop':</strong> The goal is to document context, not just requirements—to reduce the volume of meetings.",
          "<strong>Seed Context for Delivery:</strong> Curated Context Artefacts provide the essential 'seed context' for AI tools. The AI isn't guessing; it's building upon a foundation of established truth."
        ]
      },
      {
        heading: "Example: New Feature",
        text: "Instead of a meeting to explain the 'why', the team uses their Product Overview to seed an AI session, generating a <strong>Feature Context</strong> artifact. Stakeholders review this <em>before</em> any meeting."
      }
    ]
  },
  {
    title: "Patterns of Work",
    subtitle: "The Solution",
    content: [
      {
        text: "We must shift our operating rhythm to prioritize the creation and maintenance of context. We need to unlearn the Agile habit of low documentation."
      },
      {
        heading: "The Methodology: Pause and Prime",
        listItems: [
          "<strong>Pause:</strong> Take a short, focused pause before jumping into building to write down the 'why' and 'what' into an initial Context Artefact.",
          "<strong>Prime:</strong> Immediately publish this seed context to all stakeholders (Risk, Change, Engineering) so they have context from day zero."
        ]
      },
      {
        text: "This enables parallel delivery. Experts typically engaged later can be brought in earlier because they have the context to perform their function immediately."
      }
    ]
  },
  {
    title: "Stitching It Together",
    subtitle: "The Solution",
    content: [
      {
        text: "How does this come together in a quarterly cycle?"
      },
      {
        listItems: [
          "<strong>1. The Inputs:</strong> Leaders hold town halls. Afterward, every delivery team receives a structured <strong>Context Artefact</strong> containing the Group context.",
          "<strong>2. The Planning:</strong> Teams combine this cascaded context with their own <strong>Persistent Team Context</strong> to plan effectively.",
          "<strong>3. The Outputs:</strong> Teams update their own local <strong>Context Artefacts</strong> (Quarterly Priorities, Strategy Alignment). This becomes their foundational <strong>Context Core</strong>."
        ]
      }
    ]
  },
  {
    title: "The Business Case",
    subtitle: "The ROI",
    content: [
      {
        heading: "The ROI",
        listItems: [
          "<strong>Reduced Rework:</strong> By providing explicit context upfront, we eliminate the 'guessing game'.",
          "<strong>Faster Onboarding:</strong> New team members (and AI agents) can get up to speed in minutes by querying the Context Core.",
          "<strong>Higher Quality:</strong> Outputs are consistently aligned with strategy and quality standards."
        ]
      },
      {
        heading: "How Work Changes",
        listItems: [
          "<strong>Docs-Last → Context-First:</strong> Critical context captured before work starts.",
          "<strong>Status Meetings → Update-Don't-Meet:</strong> Asynchronous updates replace status calls.",
          "<strong>Tacit 'Hero' Knowledge → Explicit Shared Context:</strong> Instinct made verifiable.",
          "<strong>Centralised Quality → Socialised Quality:</strong> Standards embedded in the Context Cascade."
        ]
      }
    ]
  },
  {
    title: "Getting Started",
    subtitle: "Where and How to Start",
    content: [
      {
        heading: "Immediate Start",
        text: "Take a strategic document and include it in your AI prompts. Ask AI to draft something with that context attached. The difference is immediate and visceral."
      },
      {
        heading: "Context Tiers",
        listItems: [
          "<strong>Tier 1 - Strategic (Highest Leverage):</strong> Annual strategy, OKRs.",
          "<strong>Tier 2 - Domain/Team (High Leverage):</strong> Quarterly memos, decisions.",
          "<strong>Tier 3 - Project (Medium Leverage):</strong> Feature specs.",
          "<strong>Tier 4 - Tactical (Low Leverage):</strong> Bug tickets, meeting notes."
        ]
      },
      {
        heading: "Addressing Objections",
        text: "<strong>'Waterfall 2.0'?</strong> No, it's about making intent explicit, not locking in specs.<br/><strong>'Maintenance?'</strong> 15 mins updating a doc is better than hours in repetitive meetings."
      }
    ]
  },
  {
    title: "How We Start",
    subtitle: "/ The Quarterly Context Pilot",
    content: [
      {
        text: "We do not need a massive rollout. We can get the basics right in one Quarterly Planning cycle."
      },
      {
        heading: "Top-Down:",
        text: "Leaders publish context documents. What we're doing, what's stopping us, what's non-negotiable."
      },
      {
        heading: "Bottom-Up:",
        text: "Squads set up their own team context. What 'done' looks like. What they're prioritising."
      },
      {
        heading: "The Tool:",
        text: "The Quarterly Context Memo—the place where teams write down their context so everyone, and AI, can understand."
      }
    ]
  },
  {
    title: "Conclusion",
    subtitle: "/ In the age of AI, context is infrastructure",
    isConclusion: true,
    content: [
      {
        text: "We cannot 'prompt engineer' our way out of a lack of strategy. AI amplifies whatever it is given."
      },
      {
        heading: "We do not have an AI adoption problem.",
        text: "We have a context problem."
      },
      {
        heading: "The solution:",
        text: "Build Context Artefacts. Establish a Context Cascade. Create Context Cores. Shift to Pause and Prime. Treat context as a first-class asset."
      },
      {
        quote: "The real question is not whether we can afford the time to capture it, but whether we can afford an organisation that cannot clearly articulate its own reasoning to the intelligence it seeks to employ."
      }
    ]
  }
];

export default function ContextFirstWhitepaper() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const shaderContainerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas");
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true);
          return true;
        }
      }
      return false;
    };

    if (checkShaderReady()) return;

    const intervalId = setInterval(() => {
      if (checkShaderReady()) {
        clearInterval(intervalId);
      }
    }, 100);

    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 1500);

    return () => {
      clearInterval(intervalId);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    if (touchStart) {
      setDragOffset((currentTouch - touchStart) * 0.3);
    }
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    setDragOffset(0);

    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const progress = ((currentSlide + 1) / slides.length) * 100;
  const slide = slides[currentSlide];
  const Visual = SlideVisuals[currentSlide];

  return (
    <div
      className="min-h-screen w-full flex flex-col relative overflow-hidden select-none bg-black"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <GrainOverlay />

      <div
        ref={shaderContainerRef}
        className={`fixed inset-0 z-0 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ contain: "strict" }}
      >
        <Shader className="h-full w-full">
          <Swirl
            colorA="#000000"
            colorB="#0066ff"
            speed={0.8}
            detail={0.8}
            blend={50}
            coarseX={40}
            coarseY={40}
            mediumX={40}
            mediumY={40}
            fineX={40}
            fineY={40}
          />
        </Shader>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Ambient glow effects */}
      <div
        className="absolute top-[-10%] right-[-10%] w-[60%] h-[40%] opacity-30 blur-[100px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #3b82f6 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[20%] left-[-10%] w-[40%] h-[30%] opacity-20 blur-[80px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #a855f7 0%, transparent 70%)' }}
      />

      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1">
        <div className="h-full bg-white/5">
          <div
            className="h-full transition-all duration-700 ease-out relative"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #d946ef)'
            }}
          >
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-4 blur-md"
              style={{ background: 'linear-gradient(90deg, transparent, #d946ef)' }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col px-6 md:px-12 lg:px-24 py-16 pb-40 max-w-4xl mx-auto w-full transition-transform duration-100 overflow-y-auto"
        style={{
          transform: isDragging ? `translateX(${dragOffset}px)` : 'translateX(0)',
        }}
      >

        {/* Slide Counter Pill */}
        <div className="mb-4 flex items-center gap-3">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(0, 102, 255, 0.05)',
              backdropFilter: 'blur(16px) saturate(180%)',
              border: '1px solid rgba(0, 102, 255, 0.2)',
              boxShadow: 'inset 0 1px 0 rgba(100, 180, 255, 0.2), 0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            <span className="text-blue-400 font-mono text-sm font-bold">
              {String(currentSlide + 1).padStart(2, '0')}
            </span>
            <span className="text-white/30 text-sm">/</span>
            <span className="text-white/50 font-mono text-sm">
              {String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Visual */}
        <div className="mb-6">
          {Visual && <Visual />}
        </div>

        {/* Title */}
        <h1
          className={`text-white font-semibold tracking-tight mb-3 leading-[1.1] ${slide.isTitle ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-2xl md:text-3xl lg:text-4xl'
            }`}
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textShadow: '0 2px 20px rgba(0,0,0,0.3)'
          }}
        >
          {slide.title}
        </h1>

        {/* Subtitle */}
        {slide.subtitle && (
          <p
            className="text-transparent bg-clip-text text-xs md:text-sm mb-8 tracking-[0.2em] uppercase font-medium"
            style={{
              fontFamily: 'ui-monospace, monospace',
              backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa)'
            }}
          >
            {slide.subtitle}
          </p>
        )}

        {/* Content */}
        <div className={`space-y-4 ${slide.isTitle ? 'mt-4' : ''}`}>
          {slide.content.map((item, index) => (
            <div
              key={`${currentSlide}-${index}`}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {item.quote ? (
                <blockquote
                  className="relative text-white/95 text-base md:text-lg italic pl-5 py-3 my-4"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full"
                    style={{ background: 'linear-gradient(to bottom, #3b82f6, #8b5cf6, #d946ef)' }}
                  />
                  "{item.quote}"
                </blockquote>
              ) : item.listItems ? (
                <div className="text-white/75 text-[15px] md:text-base leading-[1.7]">
                  {item.heading && (
                    <div
                      className="font-semibold text-white mb-2"
                      style={{ textShadow: '0 0 20px rgba(59,130,246,0.3)' }}
                    >
                      {item.heading}
                    </div>
                  )}
                  <ul className="list-disc pl-5 space-y-2">
                    {item.listItems.map((li, i) => (
                      <li key={i}>
                        <span dangerouslySetInnerHTML={{ __html: li }} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-white/75 text-[15px] md:text-base leading-[1.7]">
                  {item.heading && (
                    <span
                      className="font-semibold text-white inline"
                      style={{ textShadow: '0 0 20px rgba(59,130,246,0.3)' }}
                    >
                      {item.heading}{' '}
                    </span>
                  )}
                  {item.text && <span dangerouslySetInnerHTML={{ __html: item.text }} />}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-5 pb-8">
        <div
          className="max-w-sm mx-auto rounded-full p-1.5 flex items-center gap-1.5"
          style={{
            background: 'rgba(0, 5, 20, 0.4)',
            backdropFilter: 'blur(40px) saturate(150%)',
            border: '1px solid rgba(0, 102, 255, 0.15)',
            boxShadow: 'inset 0 0 20px rgba(0, 102, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 20px 40px -10px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Prev Button */}
          <button
            onClick={() => currentSlide > 0 && setCurrentSlide(currentSlide - 1)}
            disabled={currentSlide === 0}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${currentSlide === 0
              ? 'opacity-20 cursor-not-allowed'
              : 'hover:bg-white/10 active:scale-90'
              }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Center - Menu Button */}
          <button
            onClick={() => setShowMenu(true)}
            className="flex-1 h-14 rounded-full flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.25), rgba(0, 102, 255, 0.1))',
              border: '1px solid rgba(0, 102, 255, 0.2)'
            }}
          >
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-white/60" />
              <div className="w-1 h-1 rounded-full bg-white/60" />
              <div className="w-1 h-1 rounded-full bg-white/60" />
            </div>
            <span className="text-white/80 text-sm font-medium">Jump to</span>
          </button>

          {/* Next Button */}
          <button
            onClick={() => currentSlide < slides.length - 1 && setCurrentSlide(currentSlide + 1)}
            disabled={currentSlide === slides.length - 1}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${currentSlide === slides.length - 1
              ? 'opacity-20 cursor-not-allowed'
              : 'active:scale-90'
              }`}
            style={{
              background: currentSlide === slides.length - 1
                ? 'transparent'
                : 'linear-gradient(135deg, #0066ff, #3b82f6)',
              boxShadow: currentSlide === slides.length - 1
                ? 'none'
                : '0 4px 15px rgba(0, 102, 255, 0.4)'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <p className="text-center text-white/25 text-[11px] mt-3 tracking-wide md:hidden">
          ← Swipe to navigate →
        </p>
      </div>

      {/* Slide Menu Overlay */}
      {showMenu && (
        <div
          className="fixed inset-0 z-[100] flex items-end"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
              animation: 'fadeIn 0.25s ease-out'
            }}
          />

          <div
            className="relative w-full max-h-[75vh] rounded-t-[28px] overflow-hidden"
            style={{
              background: 'rgba(5, 10, 30, 0.7)',
              backdropFilter: 'blur(50px) saturate(150%)',
              boxShadow: '0 -10px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0, 102, 255, 0.2)',
              animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h3 className="text-white font-semibold text-lg">All Slides</h3>
                <p className="text-white/40 text-sm mt-0.5">Jump to any section</p>
              </div>
              <button
                onClick={() => setShowMenu(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <X size={18} className="text-white/60" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[58vh] px-4 pb-10 space-y-2">
              {slides.map((s, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index);
                    setShowMenu(false);
                  }}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-200 active:scale-[0.98] ${index === currentSlide
                    ? ''
                    : 'hover:bg-white/5'
                    }`}
                  style={index === currentSlide ? {
                    background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.2), rgba(59, 130, 246, 0.1))',
                    border: '1px solid rgba(0, 102, 255, 0.3)',
                    boxShadow: '0 4px 20px rgba(0, 102, 255, 0.15)'
                  } : {
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid transparent'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`text-sm font-mono font-bold mt-0.5 w-6 ${index === currentSlide ? 'text-blue-400' : 'text-white/30'
                        }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${index === currentSlide ? 'text-white' : 'text-white/70'
                        }`}>
                        {s.title}
                      </p>
                      {s.subtitle && (
                        <p className="text-[11px] text-white/35 truncate mt-1 uppercase tracking-wider">
                          {s.subtitle}
                        </p>
                      )}
                    </div>
                    {index === currentSlide && (
                      <div
                        className="w-2.5 h-2.5 rounded-full mt-1.5"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          boxShadow: '0 0 10px rgba(99,102,241,0.6)'
                        }}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
