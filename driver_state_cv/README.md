# Smart Real-Time Driver State Monitoring - Computer Vision Demo

This is the computer vision subsystem for the Smart Real-Time Driver State Monitoring and Emergency Detection System.

It detects driver fatigue and distraction indicators using:

- OpenCV
- MediaPipe Face Mesh
- Eye Aspect Ratio (EAR)
- Mouth Aspect Ratio (MAR)
- PERCLOS
- Blink rate
- Yawning detection
- Micro-sleep detection
- Head pose estimation
- Face lost detection
- Fatigue score generation from 0 to 100
- CSV logging
- JSON terminal output
- Optional serial output to ESP32

## How It Connects to the Embedded System

The computer vision module generates a fatigue score from 0 to 100.

In the current Wokwi embedded demo, the slide potentiometer represents this same fatigue score.

Mapping:

- 0-74: Normal or low risk
- 75-84: Warning
- 85-89: Alarm
- 90-100: Critical fatigue

The ESP32 embedded system then combines this fatigue score with MPU6050 crash detection, GPS, LCD, LEDs, buzzer, and GSM SOS simulation.

## Folder Structure

```text
driver_state_cv_demo/
│
├── main.py
├── config.py
├── requirements.txt
├── README.md
│
└── logs/