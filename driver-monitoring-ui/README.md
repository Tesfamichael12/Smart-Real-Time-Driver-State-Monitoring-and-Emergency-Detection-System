# SafeDrive Guardian — Driver Monitoring Dashboard

Frontend website for the **Smart Real-Time Driver State Monitoring and Emergency Detection System**.

## Tech Stack

- **Vite 6** + **React 18** + **TypeScript**
- **Tailwind CSS 3** — dark theme with black & white palette
- **lucide-react** — icons
- **Recharts** — charts and analytics

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
driver-monitoring-ui/
├── src/
│   ├── components/
│   │   ├── landing/     # 14 landing page sections
│   │   ├── dashboard/   # 15 dashboard panels
│   │   └── shared/      # Gauge, StatusBadge, AnimatedCounter
│   ├── pages/
│   │   ├── LandingPage.tsx    # Public product website
│   │   └── DashboardPage.tsx  # Admin monitoring dashboard
│   ├── data/
│   │   └── simulation.ts      # Local simulation engine
│   ├── hooks/
│   │   └── useSimulation.ts   # React hook for simulation state
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## Features

### Landing Page
- Hero with product mockup
- Problem / Solution sections
- Interactive architecture diagram
- Computer vision module showcase
- Embedded system visualization
- State machine with interactive transitions
- Team section
- Testing & evaluation results

### Admin Dashboard
- **KPI Hero Row** — live metrics overview
- **Fleet Map** — simulated GPS map with vehicle markers
- **Live Driver Panel** — CV metrics with face mesh overlay
- **Embedded Telemetry** — G-force, speed, GPS, temperature
- **Alert Feed** — real-time notification system
- **Emergency Centre** — SOS countdown with GSM log simulation
- **Vehicle Table** — filterable fleet table
- **Charts** — fatigue, G-force, speed trends with Recharts
- **Event Timeline** — chronological event log
- **Scenario Controls** — trigger any system state manually
- **Data Protocol** — live CV and ESP32 JSON payloads
- **Driver Detail Drawer** — full driver profile modal

### Simulation
- 5 drivers with vehicles in Addis Ababa area
- State machine: NORMAL → WARNING → ALARM → EMERGENCY → MUTED
- Fatgue, EAR, PERCLOS, head pose auto-correlation
- SOS countdown with GSM AT command simulation
- Scenario triggers for live demos

## Theme

Pure black & white dark mode with:
- Backgrounds: `#0a0a0a` / `#1a1a1a`
- Surfaces: glassmorphism with `backdrop-blur-xl`
- Accents: subtle white/gray gradients
- Status colors: green, yellow, orange, red for states

## Notes

- No backend required — all data is client-side simulated
- No external API dependencies
- All processing is local and privacy-aware
- This is an academic demonstration, not a certified safety product
