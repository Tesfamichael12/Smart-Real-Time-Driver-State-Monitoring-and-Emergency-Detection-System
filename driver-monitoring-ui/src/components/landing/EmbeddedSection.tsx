import { useState } from 'react'
import { Cpu, Gauge, MapPin, Wifi, Monitor, Bell, Volume2, ShieldOff, Terminal } from 'lucide-react'
import RevealSection from '../shared/RevealSection'

interface HardwareComponent {
  id: string
  icon: any
  title: string
  desc: string
  color: string
  pins: string
  code: string
}

const components: HardwareComponent[] = [
  {
    id: 'esp32',
    icon: Cpu,
    title: 'ESP32 Controller',
    desc: 'Dual-core MCU executing state machine, sensor fusion, and safety alerts.',
    color: 'text-amber-400',
    pins: 'GPIO 21 (SDA), GPIO 22 (SCL), GPIO 16 (RX2), GPIO 17 (TX2)',
    code: `#include <Wire.h>

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // SDA on 21, SCL on 22
  Serial.println("SafeDrive ESP32 Init completed.");
}`
  },
  {
    id: 'mpu6050',
    icon: Gauge,
    title: 'MPU6050 IMU',
    desc: '6-axis accel/gyro for crash & rollover detection.',
    color: 'text-amber-400',
    pins: 'GPIO 21 (SDA), GPIO 22 (SCL), INT (GPIO 19)',
    code: `#include <Adafruit_MPU6050.h>

Adafruit_MPU6050 mpu;

void setup() {
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) delay(10);
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
}`
  },
  {
    id: 'gps',
    icon: MapPin,
    title: 'GPS NEO-6M',
    desc: 'Provides continuous coordinates for emergency SOS broadcasts.',
    color: 'text-emerald-400',
    pins: 'GPIO 16 (RX2), GPIO 17 (TX2)',
    code: `#include <TinyGPS++.h>

TinyGPSPlus gps;
HardwareSerial gpsSerial(2); // Serial2 on ESP32

void setup() {
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17); // RX=16, TX=17
}`
  },
  {
    id: 'lcd',
    icon: Monitor,
    title: '16x2 LCD Display',
    desc: 'Displays real-time fatigue index, connection status, and coordinates.',
    color: 'text-yellow-400',
    pins: 'I2C Bus Address 0x27',
    code: `#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("SAFE-DRIVE: ON");
}`
  },
  {
    id: 'leds',
    icon: Bell,
    title: 'Alert LEDs',
    desc: 'Tri-color status LEDs representing green (alert), yellow (warn), red (alarm).',
    color: 'text-rose-400',
    pins: 'GPIO 4 (Green), GPIO 25 (Yellow), GPIO 26 (Red)',
    code: `#define LED_GREEN 4
#define LED_YELLOW 25
#define LED_RED 26

void updateStatusLEDs(int state) {
  digitalWrite(LED_GREEN, state == 0);
  digitalWrite(LED_YELLOW, state == 1);
  digitalWrite(LED_RED, state >= 2);
}`
  },
  {
    id: 'buzzer',
    icon: Volume2,
    title: 'Active Buzzer',
    desc: 'Generates frequency-escalating auditory warnings to wake sleep-deprived drivers.',
    color: 'text-yellow-400',
    pins: 'GPIO 33 (PWM)',
    code: `#define BUZZER_PIN 33

void playAlarmTone(int frequency, int durationMs) {
  tone(BUZZER_PIN, frequency, durationMs);
  delay(durationMs);
  noTone(BUZZER_PIN);
}`
  },
  {
    id: 'cancel',
    icon: ShieldOff,
    title: 'Cancel Button',
    desc: 'Mutes sirens and cancels emergency dispatch if trigger was a false positive.',
    color: 'text-white/50',
    pins: 'GPIO 32 (Input Pullup)',
    code: `#define CANCEL_PIN 32

void setup() {
  pinMode(CANCEL_PIN, INPUT_PULLUP);
}

bool checkCancelPressed() {
  return digitalRead(CANCEL_PIN) == LOW; // Active Low
}`
  },
  {
    id: 'pot',
    icon: Cpu,
    title: 'Fatigue Potentiometer',
    desc: 'Analog input simulation simulating real-time fatigue score overrides.',
    color: 'text-cyan-400',
    pins: 'GPIO 34 (Analog Input)',
    code: `#define POT_PIN 34

int getFatigueSimulation() {
  int raw = analogRead(POT_PIN);
  return map(raw, 0, 4095, 0, 100); // map to 0-100%
}`
  }
]

export default function EmbeddedSection() {
  const [selectedId, setSelectedId] = useState<string>('esp32')
  const currentComp = components.find(c => c.id === selectedId) || components[0]

  return (
    <section id="embedded" className="relative py-24 md:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-white/[0.01] to-black pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white/40 mb-6 font-mono tracking-wider uppercase">
            Hardware Layer
          </div>
          <h2 className="section-title font-display mb-5">Embedded Safety System</h2>
          <p className="section-subtitle">
            ESP32-based hardware architecture combining IMU sensors, GPS tracking, and safety sirens
          </p>
        </RevealSection>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: Component Cards List (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            {components.map((comp) => {
              const Icon = comp.icon
              const isSelected = selectedId === comp.id
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedId(comp.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-start gap-4 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.08)]'
                      : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${
                    isSelected ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'
                  }`}>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-white/40'}`} />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold font-display ${isSelected ? 'text-amber-400' : 'text-white/70'}`}>
                      {comp.title}
                    </h4>
                    <p className="text-[11px] text-white/35 mt-1 leading-relaxed">
                      {comp.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* COLUMN 2: Wokwi SVG Interactive Circuit (4 Cols) */}
          <div className="lg:col-span-4 glass-card-strong p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold font-display uppercase tracking-widest text-white/50">Interactive Schematic</span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-amber-400">CLK-NODE TO INSPECT</span>
            </div>

            <div className="relative aspect-square rounded-xl bg-black/80 border border-white/15 overflow-hidden p-2">
              <svg viewBox="0 0 400 400" className="w-full h-full select-none">
                {/* Connections (Buses) */}
                <line x1="200" y1="90" x2="200" y2="130" stroke="rgba(245,158,11,0.2)" strokeWidth="1.5" />
                <line x1="140" y1="55" x2="75" y2="160" stroke="rgba(245,158,11,0.15)" strokeWidth="1" />
                <line x1="75" y1="220" x2="75" y2="260" stroke="rgba(34, 197, 94, 0.15)" strokeWidth="1" />
                <line x1="200" y1="200" x2="220" y2="260" stroke="rgba(239, 68, 68, 0.15)" strokeWidth="1" />
                <line x1="280" y1="200" x2="280" y2="310" stroke="rgba(245,158,11,0.15)" strokeWidth="1" />
                <line x1="100" y1="80" x2="140" y2="55" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                {/* ESP32 Main MCU Node */}
                <g 
                  onClick={() => setSelectedId('esp32')}
                  className="cursor-pointer group"
                >
                  <rect 
                    x="140" y="20" width="120" height="70" rx="8" 
                    fill={selectedId === 'esp32' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.02)'} 
                    stroke={selectedId === 'esp32' ? 'rgba(245, 158, 11, 0.8)' : 'rgba(255, 255, 255, 0.1)'} 
                    strokeWidth={selectedId === 'esp32' ? '2' : '1'} 
                    className="transition-all duration-300"
                  />
                  <text x="200" y="55" textAnchor="middle" fill={selectedId === 'esp32' ? '#f59e0b' : '#a1a1aa'} fontSize="10" fontFamily="monospace" fontWeight="bold">ESP32 Core</text>
                  <text x="200" y="70" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="monospace">GPIO MATRIX</text>
                </g>

                {/* MPU6050 Node */}
                <g 
                  onClick={() => setSelectedId('mpu6050')}
                  className="cursor-pointer group"
                >
                  <rect 
                    x="30" y="160" width="90" height="60" rx="6" 
                    fill={selectedId === 'mpu6050' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.02)'} 
                    stroke={selectedId === 'mpu6050' ? 'rgba(245, 158, 11, 0.8)' : 'rgba(255, 255, 255, 0.1)'} 
                    strokeWidth={selectedId === 'mpu6050' ? '2' : '1'} 
                    className="transition-all duration-300"
                  />
                  <text x="75" y="195" textAnchor="middle" fill={selectedId === 'mpu6050' ? '#f59e0b' : '#71717a'} fontSize="9" fontFamily="monospace" fontWeight="bold">MPU6050</text>
                  <text x="75" y="210" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="monospace">6-AXIS IMU</text>
                </g>

                {/* GPS NEO-6M Node */}
                <g 
                  onClick={() => setSelectedId('gps')}
                  className="cursor-pointer group"
                >
                  <rect 
                    x="30" y="260" width="90" height="60" rx="6" 
                    fill={selectedId === 'gps' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.02)'} 
                    stroke={selectedId === 'gps' ? 'rgba(52, 211, 153, 0.8)' : 'rgba(255, 255, 255, 0.1)'} 
                    strokeWidth={selectedId === 'gps' ? '2' : '1'} 
                    className="transition-all duration-300"
                  />
                  <text x="75" y="295" textAnchor="middle" fill={selectedId === 'gps' ? '#34d399' : '#71717a'} fontSize="9" fontFamily="monospace" fontWeight="bold">GPS NEO-6M</text>
                  <text x="75" y="310" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="monospace">TX/RX SERIAL</text>
                </g>

                {/* 16x2 LCD Display Node */}
                <g 
                  onClick={() => setSelectedId('lcd')}
                  className="cursor-pointer group"
                >
                  <rect 
                    x="210" y="120" width="160" height="70" rx="6" 
                    fill={selectedId === 'lcd' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255, 255, 255, 0.02)'} 
                    stroke={selectedId === 'lcd' ? 'rgba(234, 179, 8, 0.8)' : 'rgba(255, 255, 255, 0.1)'} 
                    strokeWidth={selectedId === 'lcd' ? '2' : '1'} 
                    className="transition-all duration-300"
                  />
                  <text x="290" y="150" textAnchor="middle" fill={selectedId === 'lcd' ? '#eab308' : '#71717a'} fontSize="9" fontFamily="monospace" fontWeight="bold">16x2 LCD</text>
                  <text x="290" y="165" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="monospace">I2C BUS 0x27</text>
                  <text x="290" y="180" textAnchor="middle" fill="#22c55e" fontSize="6.5" fontFamily="monospace" className="animate-pulse">SYSTEM: ACTIVE</text>
                </g>

                {/* Status LEDs Node */}
                <g 
                  onClick={() => setSelectedId('leds')}
                  className="cursor-pointer group"
                >
                  <circle 
                    cx="220" cy="255" r="13" 
                    fill={selectedId === 'leds' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.1)'} 
                    stroke={selectedId === 'leds' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(34, 197, 94, 0.3)'} 
                    strokeWidth={selectedId === 'leds' ? '2' : '1'} 
                  />
                  <circle 
                    cx="260" cy="255" r="13" 
                    fill={selectedId === 'leds' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(234, 179, 8, 0.1)'} 
                    stroke={selectedId === 'leds' ? 'rgba(234, 179, 8, 0.8)' : 'rgba(234, 179, 8, 0.3)'} 
                    strokeWidth={selectedId === 'leds' ? '2' : '1'} 
                  />
                  <circle 
                    cx="300" cy="255" r="13" 
                    fill={selectedId === 'leds' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.1)'} 
                    stroke={selectedId === 'leds' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(239, 68, 68, 0.3)'} 
                    strokeWidth={selectedId === 'leds' ? '2' : '1'} 
                  />
                  <text x="260" y="285" textAnchor="middle" fill={selectedId === 'leds' ? '#f43f5e' : '#71717a'} fontSize="8.5" fontFamily="monospace">STATUS LEDS</text>
                </g>

                {/* Buzzer Node */}
                <g 
                  onClick={() => setSelectedId('buzzer')}
                  className="cursor-pointer group"
                >
                  <rect 
                    x="230" y="315" width="100" height="40" rx="20" 
                    fill={selectedId === 'buzzer' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255, 255, 255, 0.02)'} 
                    stroke={selectedId === 'buzzer' ? 'rgba(234, 179, 8, 0.8)' : 'rgba(255, 255, 255, 0.1)'} 
                    strokeWidth={selectedId === 'buzzer' ? '2' : '1'} 
                    className="transition-all duration-300"
                  />
                  <text x="280" y="340" textAnchor="middle" fill={selectedId === 'buzzer' ? '#eab308' : '#71717a'} fontSize="9.5" fontFamily="monospace" fontWeight="bold">SIREN BUZZER</text>
                </g>

                {/* Cancel Button Node */}
                <g 
                  onClick={() => setSelectedId('cancel')}
                  className="cursor-pointer group"
                >
                  <circle 
                    cx="360" cy="270" r="16" 
                    fill={selectedId === 'cancel' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.03)'} 
                    stroke={selectedId === 'cancel' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.15)'} 
                    strokeWidth={selectedId === 'cancel' ? '2' : '1'} 
                  />
                  <text x="360" y="273" textAnchor="middle" fill={selectedId === 'cancel' ? '#ffffff' : '#52525b'} fontSize="7" fontFamily="monospace" fontWeight="bold">MUTE</text>
                  <text x="360" y="300" textAnchor="middle" fill="#71717a" fontSize="7" fontFamily="monospace">CANCEL BTN</text>
                </g>

                {/* Fatigue Potentiometer Node */}
                <g 
                  onClick={() => setSelectedId('pot')}
                  className="cursor-pointer group"
                >
                  <rect 
                    x="25" y="30" width="80" height="75" rx="6" 
                    fill={selectedId === 'pot' ? 'rgba(34, 211, 238, 0.2)' : 'rgba(255, 255, 255, 0.02)'} 
                    stroke={selectedId === 'pot' ? 'rgba(34, 211, 238, 0.8)' : 'rgba(255, 255, 255, 0.1)'} 
                    strokeWidth={selectedId === 'pot' ? '2' : '1'} 
                    className="transition-all duration-300"
                  />
                  <text x="65" y="55" textAnchor="middle" fill={selectedId === 'pot' ? '#22d3ee' : '#71717a'} fontSize="8" fontFamily="monospace" fontWeight="bold">POTENTIO</text>
                  <text x="65" y="70" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="monospace">FATIGUE SLIDER</text>
                  <text x="65" y="90" textAnchor="middle" fill="#eab308" fontSize="11" fontFamily="monospace" fontWeight="bold">42%</text>
                </g>
              </svg>
            </div>
          </div>

          {/* COLUMN 3: Pinouts, Firmware Inspector and Faux Breadboard Rendering (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Firmware Code Inspector */}
            <div className="glass-card-strong p-5">
              <div className="flex items-center gap-2 mb-3 text-white/80">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold font-mono uppercase tracking-widest">Firmware Snippet</span>
              </div>
              <div className="p-3 bg-[#030712] rounded-lg border border-white/5">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[9px] font-mono text-white/30">
                  <span>{currentComp.title}</span>
                  <span>pins: {currentComp.pins}</span>
                </div>
                <pre className="text-[10px] font-mono text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed select-all">
                  <code>{currentComp.code}</code>
                </pre>
              </div>
            </div>

            {/* Breadboard Setup Photo Preview */}
            <div className="glass-card p-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-3">ESP32 Breadboard Lab Rendering</h4>
              <div className="relative aspect-video rounded-lg border border-white/5 overflow-hidden bg-black">
                <img 
                  src="/esp32_breadboard_setup.png" 
                  alt="High fidelity realistic ESP32 breadboard circuit layout illustration" 
                  className="w-full h-full object-cover filter brightness-[0.8] contrast-[1.1] transition-transform duration-500 hover:scale-105"
                />
              </div>
              <p className="text-[9px] text-white/30 mt-2 leading-relaxed">
                3D realistic representation of the emergency alert nodes connected on a prototyping breadboard.
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
