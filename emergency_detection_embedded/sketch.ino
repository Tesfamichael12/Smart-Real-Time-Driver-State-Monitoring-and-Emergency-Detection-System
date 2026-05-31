#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>
#include <LiquidCrystal_I2C.h>
#include <math.h>

// =====================================================
// SMART REAL-TIME DRIVER STATE MONITORING
// AND EMERGENCY DETECTION SYSTEM
// ESP32 + MPU6050 + GPS + LCD + LEDs + BUZZER
// Potentiometer simulates fatigue/drowsiness score
// =====================================================

// ---------------- Pin Definitions ----------------
#define LED_OK      4
#define LED_WARN    25
#define LED_ALARM   26
#define LED_EMERG   27
#define BUZZER      33
#define BTN_CANCEL  32
#define BTN_CRASH   14
#define POT_FATIGUE 34

// ---------------- Objects ----------------
Adafruit_MPU6050 mpu;
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ---------------- Demo / Alert Settings ----------------
const char EMERGENCY_PHONE[] = "+2519XXXXXXXX";

// If GPS has not locked yet, these fallback coordinates are used for demo.
// You can replace them with your university/demo location.
const double DEFAULT_LAT = 9.030100;
const double DEFAULT_LNG = 38.761300;

// Emergency SOS delay window.
// During this time, the driver can press MUTE/CANCEL to cancel false emergency.
// Set this to 0 if you want instant SOS.
const unsigned long SOS_CANCEL_WINDOW_MS = 8000;

// Critical fatigue must persist before it escalates to emergency.
const unsigned long FATIGUE_ESCALATE_MS = 10000;

// LCD and telemetry intervals
const unsigned long LCD_INTERVAL_MS = 800;
const unsigned long TELEMETRY_INTERVAL_MS = 1000;

// ---------------- Thresholds ----------------
// Acceleration magnitude thresholds in G
const float warnG  = 1.6;
const float alarmG = 2.2;
const float crashG = 3.0;

// Gyroscope thresholds in degrees/sec
const float warnGyroDps  = 120.0;
const float alarmGyroDps = 160.0;
const float crashGyroDps = 200.0;

// MPU temperature thresholds.
// In real crash detection, temperature is not the main factor.
// Here it is kept as an additional simulated hazard input.
const float warnTemp  = 60.0;
const float alarmTemp = 70.0;
const float crashTemp = 80.0;

// Speed thresholds in km/h
const float speedWarnLimit  = 100.0;
const float speedAlarmLimit = 120.0;

// Fatigue/drowsiness thresholds from potentiometer
const int fatigueWarnLevel  = 75;
const int fatigueAlarmLevel = 85;
const int fatigueCritLevel  = 90;

// Crash confirmation counter
const int CRASH_CONFIRM_COUNT = 2;

// ---------------- System State ----------------
enum SystemState {
  STATE_NORMAL,
  STATE_WARNING,
  STATE_ALARM,
  STATE_EMERGENCY,
  STATE_MUTED
};

SystemState currentState = STATE_NORMAL;
SystemState previousState = STATE_NORMAL;

// ---------------- Runtime Variables ----------------
unsigned long lastLcd = 0;
unsigned long lastTelemetry = 0;
unsigned long lastAlertToggle = 0;
unsigned long lastHeartbeat = 0;
unsigned long emergencyStartMs = 0;
unsigned long criticalFatigueStartMs = 0;

bool alertToggleState = false;
bool heartbeatState = false;
bool systemMuted = false;
bool sosSent = false;
bool lastCancelButton = HIGH;
bool mpuReady = false;

int lcdPage = 0;
int crashCounter = 0;

String emergencyCause = "";

// =====================================================
// Helper Functions
// =====================================================

float toDegPerSec(float rads) {
  return rads * 57.2957795;
}

const char* stateName(SystemState s) {
  switch (s) {
    case STATE_NORMAL:    return "NORMAL";
    case STATE_WARNING:   return "WARNING";
    case STATE_ALARM:     return "ALARM";
    case STATE_EMERGENCY: return "EMERGENCY";
    case STATE_MUTED:     return "MUTED";
    default:              return "UNKNOWN";
  }
}

void allOff() {
  digitalWrite(LED_OK, LOW);
  digitalWrite(LED_WARN, LOW);
  digitalWrite(LED_ALARM, LOW);
  digitalWrite(LED_EMERG, LOW);
  noTone(BUZZER);
}

void show2(const char *line1, const char *line2) {
  lcd.clear();

  lcd.setCursor(0, 0);
  lcd.print(line1);

  lcd.setCursor(0, 1);
  lcd.print(line2);
}

double getLatitude() {
  if (gps.location.isValid()) {
    return gps.location.lat();
  }
  return DEFAULT_LAT;
}

double getLongitude() {
  if (gps.location.isValid()) {
    return gps.location.lng();
  }
  return DEFAULT_LNG;
}

bool gpsValid() {
  return gps.location.isValid();
}

// =====================================================
// GSM / SMS Simulation
// =====================================================

void sendSOS(
  float gForce,
  float gyroDps,
  int fatiguePct,
  float speedKmph,
  float tempC,
  double lat,
  double lng,
  bool liveGps,
  String cause
) {
  Serial.println();
  Serial.println("=================================================");
  Serial.println("              GSM SOS SIMULATION");
  Serial.println("=================================================");

  Serial.println("AT");
  delay(100);
  Serial.println("OK");

  Serial.println("AT+CMGF=1");
  delay(100);
  Serial.println("OK");

  Serial.print("AT+CMGS=\"");
  Serial.print(EMERGENCY_PHONE);
  Serial.println("\"");
  delay(100);

  Serial.println("EMERGENCY ALERT!");
  Serial.println("Smart Driver Monitoring System detected a critical event.");
  Serial.print("Cause: ");
  Serial.println(cause);

  Serial.print("System State: ");
  Serial.println(stateName(currentState));

  Serial.print("G-Force: ");
  Serial.print(gForce, 2);
  Serial.println(" G");

  Serial.print("Gyroscope Peak: ");
  Serial.print(gyroDps, 1);
  Serial.println(" deg/s");

  Serial.print("Fatigue Level: ");
  Serial.print(fatiguePct);
  Serial.println("%");

  Serial.print("Speed: ");
  Serial.print(speedKmph, 1);
  Serial.println(" km/h");

  Serial.print("Temperature: ");
  Serial.print(tempC, 1);
  Serial.println(" C");

  Serial.print("GPS Source: ");
  Serial.println(liveGps ? "LIVE GPS" : "DEMO/FALLBACK GPS");

  Serial.print("Location: ");
  Serial.print(lat, 6);
  Serial.print(", ");
  Serial.println(lng, 6);

  Serial.print("Google Maps: ");
  Serial.print("https://maps.google.com/?q=");
  Serial.print(lat, 6);
  Serial.print(",");
  Serial.println(lng, 6);

  Serial.write(26); // Ctrl+Z, end of SMS in real GSM modems
  Serial.println();
  Serial.println("SOS MESSAGE SENT SUCCESSFULLY.");
  Serial.println("=================================================");
  Serial.println();
}

// =====================================================
// Output Behaviour
// =====================================================

void handleOutputs(unsigned long now, SystemState state) {
  if (state == STATE_NORMAL) {
    digitalWrite(LED_WARN, LOW);
    digitalWrite(LED_ALARM, LOW);
    digitalWrite(LED_EMERG, LOW);
    noTone(BUZZER);

    // Green heartbeat LED
    if (now - lastHeartbeat >= 700) {
      lastHeartbeat = now;
      heartbeatState = !heartbeatState;
      digitalWrite(LED_OK, heartbeatState);
    }
  }

  else if (state == STATE_WARNING) {
    digitalWrite(LED_OK, LOW);
    digitalWrite(LED_WARN, HIGH);
    digitalWrite(LED_ALARM, LOW);
    digitalWrite(LED_EMERG, LOW);

    if (now - lastAlertToggle >= 500) {
      lastAlertToggle = now;
      alertToggleState = !alertToggleState;

      if (alertToggleState) {
        tone(BUZZER, 650);
      } else {
        noTone(BUZZER);
      }
    }
  }

  else if (state == STATE_ALARM) {
    digitalWrite(LED_OK, LOW);
    digitalWrite(LED_WARN, HIGH);
    digitalWrite(LED_EMERG, LOW);

    if (now - lastAlertToggle >= 250) {
      lastAlertToggle = now;
      alertToggleState = !alertToggleState;

      digitalWrite(LED_ALARM, alertToggleState);

      if (alertToggleState) {
        tone(BUZZER, 950);
      } else {
        noTone(BUZZER);
      }
    }
  }

  else if (state == STATE_EMERGENCY) {
    digitalWrite(LED_OK, LOW);
    digitalWrite(LED_WARN, LOW);
    digitalWrite(LED_ALARM, HIGH);

    if (now - lastAlertToggle >= 150) {
      lastAlertToggle = now;
      alertToggleState = !alertToggleState;

      digitalWrite(LED_EMERG, alertToggleState);

      // Siren-like effect
      if (alertToggleState) {
        tone(BUZZER, 1300);
      } else {
        tone(BUZZER, 850);
      }
    }
  }

  else if (state == STATE_MUTED) {
    digitalWrite(LED_WARN, LOW);
    digitalWrite(LED_ALARM, LOW);
    digitalWrite(LED_EMERG, LOW);
    noTone(BUZZER);

    // Slow green blink means system is muted but alive
    if (now - lastHeartbeat >= 1000) {
      lastHeartbeat = now;
      heartbeatState = !heartbeatState;
      digitalWrite(LED_OK, heartbeatState);
    }
  }
}

// =====================================================
// LCD Display
// =====================================================

void updateLCD(
  unsigned long now,
  SystemState state,
  float tempC,
  float gForce,
  float gyroDps,
  float speedKmph,
  int fatiguePct,
  double lat,
  double lng,
  bool liveGps
) {
  if (now - lastLcd < LCD_INTERVAL_MS) {
    return;
  }

  lastLcd = now;

  char line1[17];
  char line2[17];

  if (state == STATE_EMERGENCY) {
    snprintf(line1, sizeof(line1), "STATUS: EMERG!");

    if (!sosSent && SOS_CANCEL_WINDOW_MS > 0) {
      unsigned long elapsed = now - emergencyStartMs;
      unsigned long remaining = 0;

      if (elapsed < SOS_CANCEL_WINDOW_MS) {
        remaining = (SOS_CANCEL_WINDOW_MS - elapsed + 999) / 1000;
      }

      snprintf(line2, sizeof(line2), "SOS IN: %lus", remaining);
    } else if (sosSent) {
      snprintf(line2, sizeof(line2), "SOS SENT        ");
    } else {
      snprintf(line2, sizeof(line2), "SENDING SOS...  ");
    }

    show2(line1, line2);
    return;
  }

  if (state == STATE_MUTED) {
    snprintf(line1, sizeof(line1), "STATUS: MUTED");
    snprintf(line2, sizeof(line2), "Return to safe");
    show2(line1, line2);
    return;
  }

  if (lcdPage == 0) {
    snprintf(line1, sizeof(line1), "STATUS: %-7s", stateName(state));
    snprintf(line2, sizeof(line2), "FAT:%d%% SPD:%03.0f", fatiguePct, speedKmph);
  }
  else if (lcdPage == 1) {
    snprintf(line1, sizeof(line1), "MOTION SENSOR");
    snprintf(line2, sizeof(line2), "G:%.2f Gy:%03.0f", gForce, gyroDps);
  }
  else if (lcdPage == 2) {
    snprintf(line1, sizeof(line1), "TEMP & GPS");
    snprintf(line2, sizeof(line2), "T:%.1fC %s", tempC, liveGps ? "GPS" : "SIM");
  }
  else {
    snprintf(line1, sizeof(line1), "LOCATION PAGE");
    snprintf(line2, sizeof(line2), "%.2f,%.2f", lat, lng);
  }

  show2(line1, line2);
  lcdPage = (lcdPage + 1) % 4;
}

// =====================================================
// Telemetry Logging
// =====================================================

void printTelemetry(
  unsigned long now,
  SystemState state,
  float tempC,
  float gForce,
  float gyroDps,
  float speedKmph,
  int fatiguePct,
  double lat,
  double lng,
  bool liveGps,
  bool crashDetected,
  bool criticalFatigue
) {
  if (now - lastTelemetry < TELEMETRY_INTERVAL_MS) {
    return;
  }

  lastTelemetry = now;

  Serial.print("{\"timeMs\":");
  Serial.print(now);

  Serial.print(",\"state\":\"");
  Serial.print(stateName(state));
  Serial.print("\"");

  Serial.print(",\"speedKmph\":");
  Serial.print(speedKmph, 1);

  Serial.print(",\"gForce\":");
  Serial.print(gForce, 2);

  Serial.print(",\"gyroDps\":");
  Serial.print(gyroDps, 1);

  Serial.print(",\"temperatureC\":");
  Serial.print(tempC, 1);

  Serial.print(",\"fatiguePct\":");
  Serial.print(fatiguePct);

  Serial.print(",\"gpsValid\":");
  Serial.print(liveGps ? "true" : "false");

  Serial.print(",\"lat\":");
  Serial.print(lat, 6);

  Serial.print(",\"lng\":");
  Serial.print(lng, 6);

  Serial.print(",\"crashDetected\":");
  Serial.print(crashDetected ? "true" : "false");

  Serial.print(",\"criticalFatigue\":");
  Serial.print(criticalFatigue ? "true" : "false");

  Serial.print(",\"sosSent\":");
  Serial.print(sosSent ? "true" : "false");

  Serial.print(",\"cause\":\"");
  Serial.print(emergencyCause);
  Serial.print("\"");

  Serial.println("}");
}

// =====================================================
// Setup
// =====================================================

void setup() {
  Serial.begin(115200);

  pinMode(LED_OK, OUTPUT);
  pinMode(LED_WARN, OUTPUT);
  pinMode(LED_ALARM, OUTPUT);
  pinMode(LED_EMERG, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  pinMode(BTN_CANCEL, INPUT_PULLUP);
  pinMode(BTN_CRASH, INPUT_PULLUP);
  pinMode(POT_FATIGUE, INPUT);

  Wire.begin();

  lcd.init();
  lcd.backlight();

  allOff();
  show2("SMART DRIVER", "SYSTEM BOOTING");
  delay(1200);

  if (!mpu.begin()) {
    mpuReady = false;
    Serial.println("ERROR: MPU6050 not found. Check wiring.");
    show2("MPU6050 ERROR", "Check wiring");
    delay(1500);
  } else {
    mpuReady = true;

    // Optional configuration for more stable readings
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

    Serial.println("MPU6050 initialised successfully.");
  }

  // ESP32 Hardware Serial 2
  // GPS TX -> ESP32 RX2 GPIO16
  // GPS RX -> ESP32 TX2 GPIO17
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);

  show2("SYSTEM READY", "Drive Safely");
  Serial.println("System ready.");
  Serial.println("Potentiometer = simulated computer-vision fatigue score.");
  Serial.println("Crash button = manual emergency demo trigger.");
  Serial.println();

  delay(1500);
}

// =====================================================
// Main Loop
// =====================================================

void loop() {
  unsigned long now = millis();

  // ---------------- Read GPS Non-Blocking ----------------
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // ---------------- Read MPU6050 ----------------
  sensors_event_t a, g, t;

  float ax = 0.0;
  float ay = 0.0;
  float az = 1.0;
  float gForce = 1.0;

  float gx = 0.0;
  float gy = 0.0;
  float gz = 0.0;
  float gyroDps = 0.0;

  float tempC = 25.0;

  if (mpuReady) {
    mpu.getEvent(&a, &g, &t);

    ax = a.acceleration.x / 9.80665;
    ay = a.acceleration.y / 9.80665;
    az = a.acceleration.z / 9.80665;

    gForce = sqrt((ax * ax) + (ay * ay) + (az * az));

    gx = toDegPerSec(g.gyro.x);
    gy = toDegPerSec(g.gyro.y);
    gz = toDegPerSec(g.gyro.z);

    gyroDps = fmaxf(fabsf(gx), fmaxf(fabsf(gy), fabsf(gz)));

    tempC = t.temperature;
  }

  // ---------------- Read GPS Data ----------------
  float speedKmph = gps.speed.isValid() ? gps.speed.kmph() : 0.0;
  bool liveGps = gpsValid();
  double latitude = getLatitude();
  double longitude = getLongitude();

  // ---------------- Read Simulated Fatigue ----------------
  int rawFatigue = analogRead(POT_FATIGUE);
  int fatiguePct = map(rawFatigue, 0, 4095, 0, 100);
  fatiguePct = constrain(fatiguePct, 0, 100);

  // ---------------- Buttons ----------------
  bool cancelButton = digitalRead(BTN_CANCEL);
  bool crashButtonPressed = digitalRead(BTN_CRASH) == LOW;

  bool cancelPressedEdge = (lastCancelButton == HIGH && cancelButton == LOW);
  lastCancelButton = cancelButton;

  // ---------------- Condition Evaluation ----------------
  bool warningCondition =
    (gForce >= warnG) ||
    (gyroDps >= warnGyroDps) ||
    (tempC >= warnTemp) ||
    (speedKmph >= speedWarnLimit) ||
    (fatiguePct >= fatigueWarnLevel);

  bool alarmCondition =
    (gForce >= alarmG) ||
    (gyroDps >= alarmGyroDps) ||
    (tempC >= alarmTemp) ||
    (speedKmph >= speedAlarmLimit) ||
    (fatiguePct >= fatigueAlarmLevel);

  bool rawCrashCondition =
    (gForce >= crashG) ||
    (gyroDps >= crashGyroDps) ||
    (tempC >= crashTemp) ||
    crashButtonPressed;

  if (rawCrashCondition) {
    if (crashCounter < CRASH_CONFIRM_COUNT) {
      crashCounter++;
    }
  } else {
    crashCounter = 0;
  }

  bool crashDetected = crashButtonPressed || (crashCounter >= CRASH_CONFIRM_COUNT);

  bool criticalFatigue = fatiguePct >= fatigueCritLevel;

  if (criticalFatigue) {
    if (criticalFatigueStartMs == 0) {
      criticalFatigueStartMs = now;
    }
  } else {
    criticalFatigueStartMs = 0;
  }

  bool fatigueEscalated =
    criticalFatigue &&
    criticalFatigueStartMs > 0 &&
    (now - criticalFatigueStartMs >= FATIGUE_ESCALATE_MS);

  bool emergencyCondition = crashDetected || fatigueEscalated;

  bool safeBaseline =
    !warningCondition &&
    !alarmCondition &&
    !emergencyCondition &&
    !criticalFatigue;

  // ---------------- Cancel / Mute Handling ----------------
  if (cancelPressedEdge) {
    systemMuted = true;
    allOff();

    Serial.println();
    Serial.println("Driver pressed MUTE/CANCEL.");
    Serial.println("Local alerts muted. SOS countdown cancelled if not already sent.");

    if (currentState == STATE_EMERGENCY && !sosSent) {
      Serial.println("Pending SOS was cancelled by driver acknowledgement.");
    }

    show2("SYSTEM MUTED", "Driver Ack");
  }

  // Auto-unmute only when everything returns to safe
  if (systemMuted && safeBaseline) {
    systemMuted = false;
    sosSent = false;
    emergencyStartMs = 0;
    emergencyCause = "";
    criticalFatigueStartMs = 0;

    Serial.println("System automatically returned to NORMAL after safe readings.");
  }

  // ---------------- State Machine ----------------
  previousState = currentState;

  if (systemMuted) {
    currentState = STATE_MUTED;
  }
  else if (emergencyCondition) {
    currentState = STATE_EMERGENCY;
  }
  else if (alarmCondition || criticalFatigue) {
    currentState = STATE_ALARM;
  }
  else if (warningCondition) {
    currentState = STATE_WARNING;
  }
  else {
    currentState = STATE_NORMAL;
  }

  // ---------------- State Entry Actions ----------------
  if (currentState != previousState) {
    Serial.print("STATE CHANGE: ");
    Serial.print(stateName(previousState));
    Serial.print(" -> ");
    Serial.println(stateName(currentState));

    if (currentState == STATE_EMERGENCY) {
      emergencyStartMs = now;
      sosSent = false;

      if (crashDetected) {
        emergencyCause = crashButtonPressed ? "MANUAL CRASH TEST BUTTON" : "CRASH-LIKE IMPACT DETECTED";
      } else if (fatigueEscalated) {
        emergencyCause = "CRITICAL FATIGUE UNACKNOWLEDGED";
      } else {
        emergencyCause = "UNKNOWN EMERGENCY";
      }

      Serial.print("Emergency cause: ");
      Serial.println(emergencyCause);
    }

    if (currentState == STATE_NORMAL) {
      sosSent = false;
      emergencyStartMs = 0;
      emergencyCause = "";
      criticalFatigueStartMs = 0;
    }
  }

  // ---------------- Emergency SOS Logic ----------------
  if (currentState == STATE_EMERGENCY && !sosSent && !systemMuted) {
    bool sendNow = false;

    if (SOS_CANCEL_WINDOW_MS == 0) {
      sendNow = true;
    } else if (now - emergencyStartMs >= SOS_CANCEL_WINDOW_MS) {
      sendNow = true;
    }

    if (sendNow) {
      sendSOS(
        gForce,
        gyroDps,
        fatiguePct,
        speedKmph,
        tempC,
        latitude,
        longitude,
        liveGps,
        emergencyCause
      );

      sosSent = true;
    }
  }

  // ---------------- Outputs, LCD, Telemetry ----------------
  handleOutputs(now, currentState);

  updateLCD(
    now,
    currentState,
    tempC,
    gForce,
    gyroDps,
    speedKmph,
    fatiguePct,
    latitude,
    longitude,
    liveGps
  );

  printTelemetry(
    now,
    currentState,
    tempC,
    gForce,
    gyroDps,
    speedKmph,
    fatiguePct,
    latitude,
    longitude,
    liveGps,
    crashDetected,
    criticalFatigue
  );
}
