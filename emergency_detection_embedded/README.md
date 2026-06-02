# Emergency Detection Embedded Subsystem (ESP32)

This folder contains the firmware and hardware layout for the embedded hardware component of the **Smart Real-Time Driver State Monitoring and Emergency Detection System**. 

The system is simulated on **Wokwi** using an ESP32 micro-controller integrated with MPU6050 (accelerometer/gyroscope), GPS, LCD display, LEDs, Buzzer, buttons, and serial telemetry inputs.

## Live Simulation

You can run and interact with the live embedded hardware simulation directly in your browser:
👉 **[Wokwi Embedded Simulation Link](https://wokwi.com/projects/461791596566640641)**

---

## Hardware Component Configuration & Pin Map

| Component | Pin (ESP32) | Purpose / Description |
|---|---|---|
| **ESP32** | Main Board | Core processor running the event-driven system state machine. |
| **Potentiometer** | `GPIO 34` (ADC) | Simulates the live CV driver fatigue score input (0 - 100%). |
| **MPU6050** | `SDA (GPIO 21)`, `SCL (GPIO 22)` | 6-axis IMU sensing acceleration magnitude (G-Force), gyro angular rates, and ambient temperature. |
| **GPS Module** | `RX2 (GPIO 16)`, `TX2 (GPIO 17)` | Telemetry for live driver location (Latitude/Longitude) and vehicle speed. |
| **LCD 16x2 (I2C)** | `SDA (GPIO 21)`, `SCL (GPIO 22)` | Renders telemetry pages, system status, warnings, and emergency SOS count-down timers. |
| **LED Green (OK)** | `GPIO 4` | Glows when driver is in the **Normal** state. |
| **LED Yellow (Warn)** | `GPIO 25` | Glows during minor fatigue or speed thresholds (**Warning** state). |
| **LED Orange (Alarm)**| `GPIO 26` | Flashes during high fatigue or abnormal posture/driving (**Alarm** state). |
| **LED Red (Emerg)** | `GPIO 27` | Flashes rapidly during confirmed accidents or critical drowsiness (**Emergency** state). |
| **Buzzer** | `GPIO 33` | Emits distinct alarm frequencies depending on the alert level. |
| **Cancel Button** | `GPIO 32` | Driver override button. Mutes alerts or cancels false-alarm SOS count-down during the 8-second window. |
| **Crash Button** | `GPIO 14` | Simulates an instant manual crash trigger (bypass sensor validation). |

---

## System State Machine & Threshold Mapping

The ESP32 firmware continuously evaluates driver fatigue scores (simulated via potentiometer) and vehicle crash conditions (MPU6050). The system operates on five main states:

### 1. `NORMAL`
* **Condition**: Fatigue < 75%, G-Force < 1.6G, Gyro < 120 deg/s.
* **Hardware Output**: Green LED ON, LCD scrolls telemetry pages.

### 2. `WARNING`
* **Condition**: Fatigue 75-84% OR G-Force 1.6G - 2.2G OR Speed > 100 km/h.
* **Hardware Output**: Yellow LED ON, LCD displays warning details, intermittent buzzer tone.

### 3. `ALARM`
* **Condition**: Fatigue 85-89% OR G-Force 2.2G - 3.0G OR Speed > 120 km/h.
* **Hardware Output**: Orange LED flashes, LCD indicates alert cause, rapid buzzer beep.

### 4. `EMERGENCY`
* **Condition**: Sensor crash detected (G-Force >= 3.0G / Gyro >= 200 deg/s) OR critical fatigue (>= 90%) persisting for longer than 10 seconds.
* **Hardware Output**: Red LED flashes rapidly, buzzer sounds continuous alarm, LCD starts an 8-second SOS cancel window.
* **GSM SOS Trigger**: If the driver does not press the **Cancel Button** within 8 seconds, the ESP32 initiates GSM SOS AT command sequences to transmit coordinates (live or fallback default: Addis Ababa `9.030100, 38.761300`) and incident details to emergency services.

### 5. `MUTED`
* **Condition**: Driver pressed the Cancel button during a non-accident alarm.
* **Hardware Output**: Buzzer silenced, LCD displays `SYSTEM MUTED`.

---

## How to Test Individually (Local Setup)

1. Open the project in the Arduino IDE or VS Code with PlatformIO.
2. Ensure you have installed the following libraries:
   - `Adafruit MPU6050`
   - `Adafruit Sensor`
   - `TinyGPSPlus`
   - `LiquidCrystal_I2C`
3. Wire the components according to the Pin Map above or open the `diagram.json` layout.
4. Upload `sketch.ino` to the ESP32.
5. Open the Serial Monitor at `115200` baud rate to inspect GSM simulation commands (`AT+CMGS...`) and live telemetry JSON outputs.
