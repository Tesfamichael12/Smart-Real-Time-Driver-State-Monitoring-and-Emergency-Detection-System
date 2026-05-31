"""
Configuration file for Smart Real-Time Driver State Monitoring
Computer Vision Module.

This module stores all thresholds, timing windows, display settings,
logging settings, and optional serial communication settings.

The output fatigue score from this computer vision module is designed
to match the ESP32/Wokwi embedded simulation, where the potentiometer
represents the same 0-100 fatigue score.
"""

# ============================================================
# Camera and Display Configuration
# ============================================================

CAMERA_INDEX = 0
FRAME_WIDTH = 960
FRAME_HEIGHT = 540
WINDOW_NAME = "Smart Driver State Monitoring - Computer Vision Demo"

SHOW_LANDMARK_POINTS = False
SHOW_DEBUG_VALUES = True
ENABLE_AUDIO_BEEP = True

# ============================================================
# MediaPipe Face Mesh Configuration
# ============================================================

MAX_NUM_FACES = 1
REFINE_LANDMARKS = True
MIN_DETECTION_CONFIDENCE = 0.5
MIN_TRACKING_CONFIDENCE = 0.5

# ============================================================
# Eye Aspect Ratio Configuration
# ============================================================

EAR_THRESHOLD = 0.23

# If eyes remain closed for this many seconds, treat as warning.
EYE_WARNING_SECONDS = 0.7

# If eyes remain closed for this many seconds, treat as alarm.
EYE_ALARM_SECONDS = 1.5

# If eyes remain closed for this many seconds, treat as micro-sleep.
MICROSLEEP_SECONDS = 3.0

# ============================================================
# Mouth Aspect Ratio / Yawning Configuration
# ============================================================

MAR_THRESHOLD = 0.60
YAWN_MIN_SECONDS = 1.0

# ============================================================
# PERCLOS Configuration
# ============================================================

# PERCLOS rolling window in seconds.
PERCLOS_WINDOW_SECONDS = 30.0

# Percentage thresholds.
PERCLOS_WARNING = 20.0
PERCLOS_ALARM = 35.0
PERCLOS_CRITICAL = 50.0

# ============================================================
# Blink Rate Configuration
# ============================================================

BLINK_WINDOW_SECONDS = 60.0
SLOW_BLINK_SECONDS = 0.45

# ============================================================
# Head Pose Configuration
# ============================================================

# Approximate angle thresholds in degrees.
HEAD_YAW_WARNING = 25.0
HEAD_YAW_ALARM = 35.0

HEAD_PITCH_WARNING = 18.0
HEAD_PITCH_ALARM = 28.0

HEAD_ROLL_WARNING = 18.0
HEAD_ROLL_ALARM = 28.0

HEAD_POSE_WARNING_SECONDS = 1.5
HEAD_POSE_ALARM_SECONDS = 3.0

# ============================================================
# Face Lost Configuration
# ============================================================

FACE_LOST_WARNING_SECONDS = 2.0
FACE_LOST_ALARM_SECONDS = 5.0

# ============================================================
# Fatigue Score Configuration
# ============================================================

# Output score is clamped to 0-100.
FATIGUE_WARNING_SCORE = 75
FATIGUE_ALARM_SCORE = 85
FATIGUE_CRITICAL_SCORE = 90

# ============================================================
# Logging Configuration
# ============================================================

LOG_DIRECTORY = "logs"
CSV_LOG_FILENAME = "driver_state_log.csv"

# Log every N frames to avoid extremely huge files.
LOG_EVERY_N_FRAMES = 5

# ============================================================
# Optional Serial Output
# ============================================================

# Set to True if you want to send JSON fatigue data to real ESP32.
ENABLE_SERIAL_OUTPUT = False

# Example:
# Windows: "COM3"
# Linux: "/dev/ttyUSB0"
# macOS: "/dev/cu.usbserial-0001"
SERIAL_PORT = "COM3"
SERIAL_BAUDRATE = 115200
SERIAL_WRITE_INTERVAL_SECONDS = 1.0