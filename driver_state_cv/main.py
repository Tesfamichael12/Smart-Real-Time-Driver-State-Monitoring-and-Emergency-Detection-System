"""
Smart Real-Time Driver State Monitoring - Computer Vision Demo

This demo-ready application implements the computer vision subsystem
for the Smart Real-Time Driver State Monitoring and Emergency Detection
System.

Main features:
- Webcam or video-file input
- OpenCV frame acquisition and dashboard overlay
- MediaPipe Face Mesh facial landmark detection
- Eye Aspect Ratio (EAR)
- Mouth Aspect Ratio (MAR)
- PERCLOS
- Blink detection
- Yawn detection
- Micro-sleep detection
- Head pose estimation
- Face lost detection
- Fatigue score generation from 0 to 100
- Driver state classification
- CSV event logging
- JSON output to terminal
- Optional serial output to ESP32

In the current Wokwi embedded demo, the potentiometer represents this
same fatigueScore output from 0 to 100.
"""

import os
import cv2
import csv
import json
import time
import math
import argparse
import platform
import threading
from collections import deque

import numpy as np
import mediapipe as mp

try:
    import serial
except ImportError:
    serial = None

import config


# ============================================================
# Utility Functions
# ============================================================

def ensure_directory(path):
    if not os.path.exists(path):
        os.makedirs(path)


def clamp(value, min_value, max_value):
    return max(min_value, min(max_value, value))


def euclidean_distance(p1, p2):
    return float(np.linalg.norm(np.array(p1) - np.array(p2)))


def normalized_to_pixel(landmark, frame_width, frame_height):
    x = int(landmark.x * frame_width)
    y = int(landmark.y * frame_height)
    return x, y


def current_timestamp_string():
    return time.strftime("%Y-%m-%d %H:%M:%S")


def beep():
    """
    Simple demo beep.
    On Windows it uses winsound.
    On other systems it prints terminal bell.
    Runs in a background thread to prevent frame loop lag.
    """
    if not config.ENABLE_AUDIO_BEEP:
        return

    def _beep_thread():
        try:
            if platform.system().lower() == "windows":
                import winsound
                winsound.Beep(1200, 120)
            else:
                print("\a", end="", flush=True)
        except Exception:
            pass

    threading.Thread(target=_beep_thread, daemon=True).start()


def draw_text(frame, text, x, y, colour=(255, 255, 255), scale=0.65, thickness=2):
    cv2.putText(
        frame,
        text,
        (x, y),
        cv2.FONT_HERSHEY_SIMPLEX,
        scale,
        colour,
        thickness,
        cv2.LINE_AA
    )


def draw_filled_box(frame, x1, y1, x2, y2, colour):
    cv2.rectangle(frame, (x1, y1), (x2, y2), colour, -1)


def state_colour_bgr(state):
    if state == "CALIBRATING":
        return 235, 140, 20
    if state == "NORMAL":
        return 0, 180, 0
    if state == "WARNING":
        return 0, 215, 255
    if state == "ALARM":
        return 0, 140, 255
    if state == "CRITICAL":
        return 0, 0, 255
    if state == "CAMERA_LOST":
        return 150, 0, 150
    return 180, 180, 180


# ============================================================
# Landmark Indices for MediaPipe Face Mesh
# ============================================================

# Eye landmarks chosen for EAR calculation.
# Order: horizontal corner, upper lid, upper lid, horizontal corner, lower lid, lower lid
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]

# Additional eye contour indices for drawing.
LEFT_EYE_DRAW = [33, 160, 158, 133, 153, 144]
RIGHT_EYE_DRAW = [362, 385, 387, 263, 373, 380]

# Mouth indices for MAR.
MOUTH_LEFT = 61
MOUTH_RIGHT = 291
MOUTH_UPPER_1 = 13
MOUTH_LOWER_1 = 14
MOUTH_UPPER_2 = 82
MOUTH_LOWER_2 = 87
MOUTH_UPPER_3 = 312
MOUTH_LOWER_3 = 317

# Head pose landmark indices.
NOSE_TIP = 1
CHIN = 152
LEFT_EYE_OUTER = 33
RIGHT_EYE_OUTER = 263
MOUTH_LEFT_POSE = 61
MOUTH_RIGHT_POSE = 291


# ============================================================
# Metric Calculation Functions
# ============================================================

def calculate_ear(points):
    """
    Calculate Eye Aspect Ratio.

    points must contain six points:
    p1, p2, p3, p4, p5, p6

    EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
    """
    p1, p2, p3, p4, p5, p6 = points

    vertical_1 = euclidean_distance(p2, p6)
    vertical_2 = euclidean_distance(p3, p5)
    horizontal = euclidean_distance(p1, p4)

    if horizontal == 0:
        return 0.0

    ear = (vertical_1 + vertical_2) / (2.0 * horizontal)
    return float(ear)


def calculate_mar(landmarks, frame_width, frame_height):
    """
    Calculate Mouth Aspect Ratio.

    MAR = average vertical mouth opening / horizontal mouth width.
    """
    left = normalized_to_pixel(landmarks[MOUTH_LEFT], frame_width, frame_height)
    right = normalized_to_pixel(landmarks[MOUTH_RIGHT], frame_width, frame_height)

    upper_1 = normalized_to_pixel(landmarks[MOUTH_UPPER_1], frame_width, frame_height)
    lower_1 = normalized_to_pixel(landmarks[MOUTH_LOWER_1], frame_width, frame_height)

    upper_2 = normalized_to_pixel(landmarks[MOUTH_UPPER_2], frame_width, frame_height)
    lower_2 = normalized_to_pixel(landmarks[MOUTH_LOWER_2], frame_width, frame_height)

    upper_3 = normalized_to_pixel(landmarks[MOUTH_UPPER_3], frame_width, frame_height)
    lower_3 = normalized_to_pixel(landmarks[MOUTH_LOWER_3], frame_width, frame_height)

    horizontal = euclidean_distance(left, right)
    vertical_1 = euclidean_distance(upper_1, lower_1)
    vertical_2 = euclidean_distance(upper_2, lower_2)
    vertical_3 = euclidean_distance(upper_3, lower_3)

    if horizontal == 0:
        return 0.0

    mar = (vertical_1 + vertical_2 + vertical_3) / (3.0 * horizontal)
    return float(mar)


def get_eye_points(landmarks, indices, frame_width, frame_height):
    points = []
    for idx in indices:
        points.append(normalized_to_pixel(landmarks[idx], frame_width, frame_height))
    return points


def estimate_head_pose(landmarks, frame_width, frame_height):
    """
    Estimate approximate head pose using solvePnP.

    Returns:
        pitch, yaw, roll in degrees, success flag
    """

    image_points = np.array([
        normalized_to_pixel(landmarks[NOSE_TIP], frame_width, frame_height),
        normalized_to_pixel(landmarks[CHIN], frame_width, frame_height),
        normalized_to_pixel(landmarks[LEFT_EYE_OUTER], frame_width, frame_height),
        normalized_to_pixel(landmarks[RIGHT_EYE_OUTER], frame_width, frame_height),
        normalized_to_pixel(landmarks[MOUTH_LEFT_POSE], frame_width, frame_height),
        normalized_to_pixel(landmarks[MOUTH_RIGHT_POSE], frame_width, frame_height),
    ], dtype="double")

    model_points = np.array([
        (0.0, 0.0, 0.0),             # Nose tip
        (0.0, -63.6, -12.5),         # Chin
        (-43.3, 32.7, -26.0),        # Left eye outer corner
        (43.3, 32.7, -26.0),         # Right eye outer corner
        (-28.9, -28.9, -24.1),       # Left mouth corner
        (28.9, -28.9, -24.1),        # Right mouth corner
    ], dtype="double")

    focal_length = frame_width
    centre = (frame_width / 2, frame_height / 2)

    camera_matrix = np.array([
        [focal_length, 0, centre[0]],
        [0, focal_length, centre[1]],
        [0, 0, 1]
    ], dtype="double")

    dist_coeffs = np.zeros((4, 1))

    try:
        success, rotation_vector, translation_vector = cv2.solvePnP(
            model_points,
            image_points,
            camera_matrix,
            dist_coeffs,
            flags=cv2.SOLVEPNP_ITERATIVE
        )

        if not success:
            return 0.0, 0.0, 0.0, False

        rotation_matrix, _ = cv2.Rodrigues(rotation_vector)

        projection_matrix = np.hstack((rotation_matrix, translation_vector))
        _, _, _, _, _, _, euler_angles = cv2.decomposeProjectionMatrix(projection_matrix)

        pitch = float(euler_angles[0])
        yaw = float(euler_angles[1])
        roll = float(euler_angles[2])

        # Normalise angles into a more readable range.
        if pitch > 180:
            pitch -= 360
        if yaw > 180:
            yaw -= 360
        if roll > 180:
            roll -= 360

        return pitch, yaw, roll, True

    except Exception:
        return 0.0, 0.0, 0.0, False


# ============================================================
# Real-Time Video Capture (Non-blocking Reader Thread)
# ============================================================

class RealTimeVideoCapture:
    def __init__(self, source, width=None, height=None):
        self.cap = cv2.VideoCapture(source)
        if width:
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        if height:
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

        self.ret = False
        self.frame = None
        self.running = True
        self.lock = threading.Lock()

        # Start background frame grabber thread
        self.thread = threading.Thread(target=self._update, daemon=True)
        self.thread.start()

    def _update(self):
        while self.running:
            if self.cap.isOpened():
                ret, frame = self.cap.read()
                if ret:
                    with self.lock:
                        self.ret = ret
                        self.frame = frame
                else:
                    with self.lock:
                        self.ret = False
                    time.sleep(0.01)
            else:
                time.sleep(0.01)

    def read(self):
        with self.lock:
            if self.frame is not None:
                return self.ret, self.frame.copy()
            return self.ret, None

    def isOpened(self):
        return self.cap.isOpened()

    def release(self):
        self.running = False
        if self.thread.is_alive():
            self.thread.join(timeout=1.0)
        self.cap.release()


# ============================================================
# Serial Output Class
# ============================================================

class SerialBridge:
    def __init__(self):
        self.enabled = False
        self.ser = None
        self.last_write_time = 0.0

        if not config.ENABLE_SERIAL_OUTPUT:
            return

        if serial is None:
            print("WARNING: pyserial is not installed. Serial output disabled.")
            return

        try:
            self.ser = serial.Serial(
                config.SERIAL_PORT,
                config.SERIAL_BAUDRATE,
                timeout=1
            )
            self.enabled = True
            print(f"Serial output enabled on {config.SERIAL_PORT}")
        except Exception as exc:
            print(f"WARNING: Could not open serial port {config.SERIAL_PORT}: {exc}")
            self.enabled = False

    def write_json(self, payload):
        if not self.enabled or self.ser is None:
            return

        now = time.time()
        if now - self.last_write_time < config.SERIAL_WRITE_INTERVAL_SECONDS:
            return

        self.last_write_time = now

        try:
            line = json.dumps(payload) + "\n"
            self.ser.write(line.encode("utf-8"))
        except Exception as exc:
            print(f"WARNING: Serial write failed: {exc}")

    def close(self):
        if self.ser is not None:
            try:
                self.ser.close()
            except Exception:
                pass


# ============================================================
# CSV Logger
# ============================================================

class CSVLogger:
    def __init__(self):
        ensure_directory(config.LOG_DIRECTORY)
        self.path = os.path.join(config.LOG_DIRECTORY, config.CSV_LOG_FILENAME)
        self.file_exists = os.path.exists(self.path)

        self.fieldnames = [
            "timestamp",
            "frameIndex",
            "fps",
            "faceDetected",
            "ear",
            "mar",
            "perclos",
            "blinkCount",
            "yawnCount",
            "eyeClosedSeconds",
            "faceLostSeconds",
            "pitch",
            "yaw",
            "roll",
            "fatigueScore",
            "driverState",
            "eventReason"
        ]

        self.file = open(self.path, mode="a", newline="", encoding="utf-8")
        self.writer = csv.DictWriter(self.file, fieldnames=self.fieldnames)

        if not self.file_exists:
            self.writer.writeheader()

    def log(self, row):
        self.writer.writerow(row)
        self.file.flush()

    def close(self):
        try:
            self.file.close()
        except Exception:
            pass


# ============================================================
# Driver State Monitor Class
# ============================================================

class DriverStateMonitor:
    def __init__(self):
        self.frame_index = 0

        self.start_time = time.time()
        self.prev_frame_time = time.time()
        self.fps = 0.0

        self.eye_closed_start_time = None
        self.yawn_start_time = None
        self.head_pose_abnormal_start_time = None
        self.face_lost_start_time = None

        self.blink_active = False
        self.blink_count = 0
        self.yawn_count = 0

        self.last_beep_time = 0.0
        self.last_json_print_time = 0.0

        self.perclos_window = deque()
        self.blink_window = deque()

        self.latest_state = "NORMAL"
        self.latest_reason = "Driver appears alert"

        # Head Pose Calibration state
        self.pitch_offset = 0.0
        self.yaw_offset = 0.0
        self.roll_offset = 0.0
        self.calibration_frames = []
        self.is_calibrated = False
        
        # EMA Smoothing state
        self.smooth_pitch = 0.0
        self.smooth_yaw = 0.0
        self.smooth_roll = 0.0
        self.pose_initialized = False

    def trigger_recalibration(self):
        """Reset baseline pose calibration offsets."""
        self.calibration_frames = []
        self.pitch_offset = 0.0
        self.yaw_offset = 0.0
        self.roll_offset = 0.0
        self.is_calibrated = False
        self.pose_initialized = False
        print("Driver Head Pose Calibration Triggered. Please look straight at the camera.")

    def update_fps(self):
        now = time.time()
        delta = now - self.prev_frame_time
        self.prev_frame_time = now

        if delta > 0:
            instant_fps = 1.0 / delta
            if self.fps == 0:
                self.fps = instant_fps
            else:
                self.fps = (0.85 * self.fps) + (0.15 * instant_fps)

    def update_perclos(self, eyes_closed):
        now = time.time()
        self.perclos_window.append((now, eyes_closed))

        while self.perclos_window and now - self.perclos_window[0][0] > config.PERCLOS_WINDOW_SECONDS:
            self.perclos_window.popleft()

        if not self.perclos_window:
            return 0.0

        closed_count = sum(1 for _, closed in self.perclos_window if closed)
        total_count = len(self.perclos_window)

        return (closed_count / total_count) * 100.0

    def update_blink_detection(self, eyes_closed):
        now = time.time()

        if eyes_closed and not self.blink_active:
            self.blink_active = True

        if not eyes_closed and self.blink_active:
            self.blink_active = False
            self.blink_count += 1
            self.blink_window.append(now)

        while self.blink_window and now - self.blink_window[0] > config.BLINK_WINDOW_SECONDS:
            self.blink_window.popleft()

        return len(self.blink_window)

    def calculate_eye_closed_seconds(self, eyes_closed):
        now = time.time()

        if eyes_closed:
            if self.eye_closed_start_time is None:
                self.eye_closed_start_time = now
            return now - self.eye_closed_start_time

        self.eye_closed_start_time = None
        return 0.0

    def calculate_yawn(self, mar):
        now = time.time()

        if mar > config.MAR_THRESHOLD:
            if self.yawn_start_time is None:
                self.yawn_start_time = now

            yawn_seconds = now - self.yawn_start_time

            if yawn_seconds >= config.YAWN_MIN_SECONDS:
                return True, yawn_seconds

            return False, yawn_seconds

        else:
            if self.yawn_start_time is not None:
                yawn_duration = now - self.yawn_start_time
                if yawn_duration >= config.YAWN_MIN_SECONDS:
                    self.yawn_count += 1

            self.yawn_start_time = None
            return False, 0.0

    def calculate_head_pose_state(self, pitch, yaw, roll, pose_success):
        if not self.is_calibrated:
            return "CALIBRATING", 0.0

        if not pose_success:
            return "UNKNOWN", 0.0

        abnormal = (
            abs(yaw) >= config.HEAD_YAW_WARNING or
            abs(pitch) >= config.HEAD_PITCH_WARNING or
            abs(roll) >= config.HEAD_ROLL_WARNING
        )

        now = time.time()

        if abnormal:
            if self.head_pose_abnormal_start_time is None:
                self.head_pose_abnormal_start_time = now

            duration = now - self.head_pose_abnormal_start_time

            if (
                abs(yaw) >= config.HEAD_YAW_ALARM or
                abs(pitch) >= config.HEAD_PITCH_ALARM or
                abs(roll) >= config.HEAD_ROLL_ALARM
            ):
                return "ALARM", duration

            return "WARNING", duration

        self.head_pose_abnormal_start_time = None
        return "NORMAL", 0.0

    def calculate_face_lost_seconds(self, face_detected):
        now = time.time()

        if not face_detected:
            if self.face_lost_start_time is None:
                self.face_lost_start_time = now
            return now - self.face_lost_start_time

        self.face_lost_start_time = None
        return 0.0

    def generate_fatigue_score(
        self,
        face_detected,
        ear,
        mar,
        perclos,
        eye_closed_seconds,
        yawn_active,
        head_pose_state,
        head_pose_duration,
        face_lost_seconds
    ):
        score = 0
        reasons = []

        if not face_detected:
            if face_lost_seconds >= config.FACE_LOST_ALARM_SECONDS:
                score += 90
                reasons.append("Face lost for too long")
            elif face_lost_seconds >= config.FACE_LOST_WARNING_SECONDS:
                score += 75
                reasons.append("Face not detected")
            else:
                score += 40
                reasons.append("Searching for face")

            return clamp(score, 0, 100), ", ".join(reasons)

        # EAR / eye closure contribution
        if ear < config.EAR_THRESHOLD:
            score += 20
            reasons.append("Low EAR")

        if eye_closed_seconds >= config.EYE_WARNING_SECONDS:
            score += 20
            reasons.append("Sustained eye closure")

        if eye_closed_seconds >= config.EYE_ALARM_SECONDS:
            score += 20
            reasons.append("Long eye closure")

        if eye_closed_seconds >= config.MICROSLEEP_SECONDS:
            score = max(score, 95)
            reasons.append("Micro-sleep detected")

        # PERCLOS contribution
        if perclos >= config.PERCLOS_WARNING:
            score += 15
            reasons.append("PERCLOS warning")

        if perclos >= config.PERCLOS_ALARM:
            score += 15
            reasons.append("High PERCLOS")

        if perclos >= config.PERCLOS_CRITICAL:
            score = max(score, 90)
            reasons.append("Critical PERCLOS")

        # Yawning contribution
        if mar > config.MAR_THRESHOLD:
            score += 10
            reasons.append("Mouth opening high")

        if yawn_active:
            score += 15
            reasons.append("Yawning detected")

        # Head pose contribution
        if head_pose_state == "WARNING":
            if head_pose_duration >= config.HEAD_POSE_WARNING_SECONDS:
                score += 10
                reasons.append("Abnormal head pose")

        if head_pose_state == "ALARM":
            if head_pose_duration >= config.HEAD_POSE_ALARM_SECONDS:
                score += 20
                reasons.append("Sustained abnormal head pose")
            else:
                score += 12
                reasons.append("Head pose alarm angle")

        score = clamp(score, 0, 100)

        if not reasons:
            reasons.append("Driver appears alert")

        return score, ", ".join(reasons)

    def classify_state(self, fatigue_score, face_detected, face_lost_seconds):
        if not self.is_calibrated:
            return "CALIBRATING"
        if not face_detected:
            if face_lost_seconds >= config.FACE_LOST_ALARM_SECONDS:
                return "CAMERA_LOST"
            if face_lost_seconds >= config.FACE_LOST_WARNING_SECONDS:
                return "WARNING"

        if fatigue_score >= config.FATIGUE_CRITICAL_SCORE:
            return "CRITICAL"

        if fatigue_score >= config.FATIGUE_ALARM_SCORE:
            return "ALARM"

        if fatigue_score >= config.FATIGUE_WARNING_SCORE:
            return "WARNING"

        return "NORMAL"

    def maybe_alert(self, state):
        now = time.time()

        if state in ["NORMAL", "CALIBRATING"]:
            return

        if state == "WARNING":
            interval = 2.0
        elif state == "ALARM":
            interval = 1.0
        elif state == "CRITICAL":
            interval = 0.5
        else:
            interval = 1.5

        if now - self.last_beep_time >= interval:
            self.last_beep_time = now
            beep()

    def build_payload(
        self,
        face_detected,
        ear,
        mar,
        perclos,
        blink_rate,
        eye_closed_seconds,
        yawn_active,
        pitch,
        yaw,
        roll,
        face_lost_seconds,
        fatigue_score,
        state,
        reason
    ):
        payload = {
            "timestamp": current_timestamp_string(),
            "frameIndex": self.frame_index,
            "fps": round(self.fps, 2),
            "faceDetected": bool(face_detected),
            "ear": round(float(ear), 4),
            "mar": round(float(mar), 4),
            "perclos": round(float(perclos), 2),
            "blinkRatePerMin": int(blink_rate),
            "eyeClosedSeconds": round(float(eye_closed_seconds), 2),
            "yawnActive": bool(yawn_active),
            "yawnCount": int(self.yawn_count),
            "headPose": {
                "pitch": round(float(pitch), 2),
                "yaw": round(float(yaw), 2),
                "roll": round(float(roll), 2)
            },
            "faceLostSeconds": round(float(face_lost_seconds), 2),
            "fatigueScore": int(fatigue_score),
            "driverState": state,
            "eventReason": reason,
            "isCalibrating": not self.is_calibrated,
            "calibrationProgress": min(1.0, len(self.calibration_frames) / float(config.POSE_CALIBRATION_FRAMES))
        }
        return payload

    def print_json_periodically(self, payload):
        now = time.time()

        if now - self.last_json_print_time >= 1.0:
            self.last_json_print_time = now
            print(json.dumps(payload))

    def update(
        self,
        frame,
        face_detected,
        landmarks=None
    ):
        self.frame_index += 1
        self.update_fps()

        frame_height, frame_width = frame.shape[:2]

        ear = 0.0
        mar = 0.0
        pitch = 0.0
        yaw = 0.0
        roll = 0.0
        pose_success = False

        if face_detected and landmarks is not None:
            left_eye_points = get_eye_points(landmarks, LEFT_EYE, frame_width, frame_height)
            right_eye_points = get_eye_points(landmarks, RIGHT_EYE, frame_width, frame_height)

            left_ear = calculate_ear(left_eye_points)
            right_ear = calculate_ear(right_eye_points)
            ear = (left_ear + right_ear) / 2.0

            mar = calculate_mar(landmarks, frame_width, frame_height)

            pitch, yaw, roll, pose_success = estimate_head_pose(landmarks, frame_width, frame_height)

            if pose_success:
                if len(self.calibration_frames) < config.POSE_CALIBRATION_FRAMES:
                    self.calibration_frames.append((pitch, yaw, roll))
                    if len(self.calibration_frames) == config.POSE_CALIBRATION_FRAMES:
                        self.pitch_offset = sum(p for p, _, _ in self.calibration_frames) / float(config.POSE_CALIBRATION_FRAMES)
                        self.yaw_offset = sum(y for _, y, _ in self.calibration_frames) / float(config.POSE_CALIBRATION_FRAMES)
                        self.roll_offset = sum(r for _, _, r in self.calibration_frames) / float(config.POSE_CALIBRATION_FRAMES)
                        self.is_calibrated = True
                        print(f"Pose calibration completed. Offsets - Pitch: {self.pitch_offset:.2f}, Yaw: {self.yaw_offset:.2f}, Roll: {self.roll_offset:.2f}")

                # Apply calibration offsets
                pitch -= self.pitch_offset
                yaw -= self.yaw_offset
                roll -= self.roll_offset

                # Apply EMA Smoothing
                if not self.pose_initialized:
                    self.smooth_pitch = pitch
                    self.smooth_yaw = yaw
                    self.smooth_roll = roll
                    self.pose_initialized = True
                else:
                    alpha = 0.05 # Stronger Smoothing factor (lower = more smoothing)
                    alpha_pitch = 0.02 # Even stronger smoothing for pitch which is sensitive
                    self.smooth_pitch = (alpha_pitch * pitch) + ((1.0 - alpha_pitch) * self.smooth_pitch)
                    self.smooth_yaw = (alpha * yaw) + ((1.0 - alpha) * self.smooth_yaw)
                    self.smooth_roll = (alpha * roll) + ((1.0 - alpha) * self.smooth_roll)

                pitch, yaw, roll = self.smooth_pitch, self.smooth_yaw, self.smooth_roll

                # Center Dead-zone Filter (snap to 0 if within +/- 15 degrees independently)
                if abs(pitch) < 15.0: # Increased dead-zone specifically for pitch
                    pitch = 0.0
                if abs(yaw) < 5.0:
                    yaw = 0.0
                if abs(roll) < 5.0:
                    roll = 0.0

            if config.SHOW_LANDMARK_POINTS:
                for point in left_eye_points + right_eye_points:
                    cv2.circle(frame, point, 2, (0, 255, 255), -1)

                mouth_points = [
                    normalized_to_pixel(landmarks[MOUTH_LEFT], frame_width, frame_height),
                    normalized_to_pixel(landmarks[MOUTH_RIGHT], frame_width, frame_height),
                    normalized_to_pixel(landmarks[MOUTH_UPPER_1], frame_width, frame_height),
                    normalized_to_pixel(landmarks[MOUTH_LOWER_1], frame_width, frame_height)
                ]

                for point in mouth_points:
                    cv2.circle(frame, point, 2, (255, 0, 255), -1)

        eyes_closed = face_detected and ear < config.EAR_THRESHOLD

        perclos = self.update_perclos(eyes_closed)
        blink_rate = self.update_blink_detection(eyes_closed)
        eye_closed_seconds = self.calculate_eye_closed_seconds(eyes_closed)

        yawn_active, yawn_seconds = self.calculate_yawn(mar)

        head_pose_state, head_pose_duration = self.calculate_head_pose_state(
            pitch,
            yaw,
            roll,
            pose_success
        )

        face_lost_seconds = self.calculate_face_lost_seconds(face_detected)

        fatigue_score, reason = self.generate_fatigue_score(
            face_detected,
            ear,
            mar,
            perclos,
            eye_closed_seconds,
            yawn_active,
            head_pose_state,
            head_pose_duration,
            face_lost_seconds
        )

        state = self.classify_state(fatigue_score, face_detected, face_lost_seconds)

        self.latest_state = state
        self.latest_reason = reason

        self.maybe_alert(state)

        payload = self.build_payload(
            face_detected=face_detected,
            ear=ear,
            mar=mar,
            perclos=perclos,
            blink_rate=blink_rate,
            eye_closed_seconds=eye_closed_seconds,
            yawn_active=yawn_active,
            pitch=pitch,
            yaw=yaw,
            roll=roll,
            face_lost_seconds=face_lost_seconds,
            fatigue_score=fatigue_score,
            state=state,
            reason=reason
        )

        return payload


# ============================================================
# Dashboard Drawing
# ============================================================

def draw_dashboard(frame, payload):
    height, width = frame.shape[:2]

    state = payload["driverState"]
    score = payload["fatigueScore"]
    colour = state_colour_bgr(state)

    # 1. Header Panel (Glassmorphic translucent dark block)
    header_h = 85
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (width, header_h), (15, 15, 15), -1)
    cv2.addWeighted(overlay, 0.75, frame, 0.25, 0, dst=frame)
    # Header Bottom Line separator
    cv2.line(frame, (0, header_h), (width, header_h), (50, 50, 50), 1, cv2.LINE_AA)

    # Header Column 1: Title & Subheading
    draw_text(
        frame,
        "SAFEDRIVE GUARDIAN",
        20,
        35,
        (255, 255, 255),
        0.7,
        2
    )
    draw_text(
        frame,
        "Driver Monitoring Subsystem",
        20,
        62,
        (160, 160, 160),
        0.45,
        1
    )

    # Header Column 2: Center Fatigue Score progress bar
    bar_x = 350
    bar_y = 42
    bar_w = 260
    bar_h = 16
    
    # Progress Bar Background
    cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_w, bar_y + bar_h), (40, 40, 40), -1)
    # Progress Bar Fill
    filled_w = int((score / 100.0) * bar_w)
    if filled_w > 0:
        cv2.rectangle(frame, (bar_x, bar_y), (bar_x + filled_w, bar_y + bar_h), colour, -1)
    # Progress Bar Border
    cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_w, bar_y + bar_h), (80, 80, 80), 1, cv2.LINE_AA)

    draw_text(frame, f"FATIGUE LEVEL: {score}%", bar_x, bar_y - 10, (220, 220, 220), 0.45, 1)

    # Header Column 3: State Badge on Right
    badge_w = 180
    badge_h = 45
    badge_x = width - badge_w - 20
    badge_y = 20
    
    # State Badge overlay (colored translucent background)
    badge_overlay = frame.copy()
    cv2.rectangle(badge_overlay, (badge_x, badge_y), (badge_x + badge_w, badge_y + badge_h), colour, -1)
    cv2.addWeighted(badge_overlay, 0.85, frame, 0.15, 0, dst=frame)
    # State Badge border
    cv2.rectangle(frame, (badge_x, badge_y), (badge_x + badge_w, badge_y + badge_h), (255, 255, 255), 1, cv2.LINE_AA)
    
    # Center text inside badge
    badge_text = state
    (text_w, text_h), _ = cv2.getTextSize(badge_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
    text_x = badge_x + int((badge_w - text_w) / 2)
    text_y = badge_y + int((badge_h + text_h) / 2)
    draw_text(frame, badge_text, text_x, text_y, (255, 255, 255), 0.5, 2)

    # Left panel - System Diagnostics (Glassmorphic dark block)
    panel_x = 20
    panel_y = 95
    panel_w = 380
    panel_h = 280

    overlay = frame.copy()
    cv2.rectangle(overlay, (panel_x, panel_y), (panel_x + panel_w, panel_y + panel_h), (12, 12, 12), -1)
    cv2.addWeighted(overlay, 0.70, frame, 0.30, 0, dst=frame)
    # Thin panel borders
    cv2.rectangle(frame, (panel_x, panel_y), (panel_x + panel_w, panel_y + panel_h), (60, 60, 60), 1, cv2.LINE_AA)

    # Sub-header for Diagnostics
    draw_text(frame, "DIAGNOSTICS & TELEMETRY", panel_x + 15, panel_y + 30, (255, 255, 255), 0.55, 2)
    cv2.line(frame, (panel_x + 15, panel_y + 40), (panel_x + panel_w - 15, panel_y + 40), (50, 50, 50), 1, cv2.LINE_AA)

    # Align metrics in columns (Label -> Value)
    metrics_left = [
        ("FPS", f"{payload['fps']:.1f}"),
        ("FACE DETECTED", "YES" if payload["faceDetected"] else "NO"),
        ("EYE APERTURE (EAR)", f"{payload['ear']:.2f}"),
        ("MOUTH APERTURE (MAR)", f"{payload['mar']:.2f}"),
        ("PERCLOS SCORE", f"{payload['perclos']}%"),
    ]
    metrics_right = [
        ("BLINK RATE", f"{payload['blinkRatePerMin']:.0f}/m"),
        ("EYE CLOSED TIME", f"{payload['eyeClosedSeconds']:.1f}s"),
        ("YAWN ACTIVE", "YES" if payload["yawnActive"] else "NO"),
        ("YAWN COUNT", f"{payload['yawnCount']}"),
        ("FACE LOST TIME", f"{payload['faceLostSeconds']:.1f}s"),
    ]

    # Draw diagnostics rows
    y = panel_y + 65
    for label, val in metrics_left:
        # Label (darker gray)
        draw_text(frame, label, panel_x + 15, y, (150, 150, 150), 0.40, 1)
        # Value (white, right-aligned relative to first column boundary at panel_x + 175)
        (val_w, _), _ = cv2.getTextSize(val, cv2.FONT_HERSHEY_SIMPLEX, 0.42, 1)
        draw_text(frame, val, panel_x + 175 - val_w, y, (255, 255, 255), 0.42, 1)
        y += 20

    y = panel_y + 65
    for label, val in metrics_right:
        # Label
        draw_text(frame, label, panel_x + 185, y, (150, 150, 150), 0.40, 1)
        # Value
        (val_w, _), _ = cv2.getTextSize(val, cv2.FONT_HERSHEY_SIMPLEX, 0.42, 1)
        val_color = (255, 255, 255)
        # Highlight anomalous values
        if label == "EYE CLOSED TIME" and float(val[:-1]) > 0.0:
            val_color = (100, 100, 255) # Light red/orange in BGR
        elif label == "FACE LOST TIME" and float(val[:-1]) > 0.0:
            val_color = (100, 100, 255)
        draw_text(frame, val, panel_x + panel_w - 15 - val_w, y, val_color, 0.42, 1)
        y += 20

    # Quick summary metrics indicators (dynamic color bars)
    bar_y = panel_y + 180
    
    # EAR status visual bar
    draw_text(frame, "EAR threshold (0.23)", panel_x + 15, bar_y, (180, 180, 180), 0.38, 1)
    ear_val = payload["ear"]
    ear_pct = min(1.0, max(0.0, ear_val / 0.5))
    cv2.rectangle(frame, (panel_x + 15, bar_y + 6), (panel_x + panel_w - 15, bar_y + 12), (30, 30, 30), -1)
    ear_color = (100, 255, 100) if ear_val >= 0.23 else (100, 100, 255)
    cv2.rectangle(frame, (panel_x + 15, bar_y + 6), (panel_x + 15 + int(ear_pct * (panel_w - 30)), bar_y + 12), ear_color, -1)
    cv2.rectangle(frame, (panel_x + 15, bar_y + 6), (panel_x + panel_w - 15, bar_y + 12), (70, 70, 70), 1, cv2.LINE_AA)
    # Threshold indicator notch
    notch_x = panel_x + 15 + int((0.23 / 0.5) * (panel_w - 30))
    cv2.line(frame, (notch_x, bar_y + 4), (notch_x, bar_y + 14), (255, 255, 255), 1)

    bar_y += 35
    # MAR status visual bar
    draw_text(frame, "MAR threshold (0.60)", panel_x + 15, bar_y, (180, 180, 180), 0.38, 1)
    mar_val = payload["mar"]
    mar_pct = min(1.0, max(0.0, mar_val / 1.0))
    cv2.rectangle(frame, (panel_x + 15, bar_y + 6), (panel_x + panel_w - 15, bar_y + 12), (30, 30, 30), -1)
    mar_color = (100, 255, 100) if mar_val < 0.60 else (100, 100, 255)
    cv2.rectangle(frame, (panel_x + 15, bar_y + 6), (panel_x + 15 + int(mar_pct * (panel_w - 30)), bar_y + 12), mar_color, -1)
    cv2.rectangle(frame, (panel_x + 15, bar_y + 6), (panel_x + panel_w - 15, bar_y + 12), (70, 70, 70), 1, cv2.LINE_AA)
    # Threshold indicator notch
    notch_x = panel_x + 15 + int((0.60 / 1.0) * (panel_w - 30))
    cv2.line(frame, (notch_x, bar_y + 4), (notch_x, bar_y + 14), (255, 255, 255), 1)

    # Right panel - Head Pose & Event Logs
    right_w = 390
    right_x = width - right_w - 20
    right_y = 95
    right_h = 280

    overlay = frame.copy()
    cv2.rectangle(overlay, (right_x, right_y), (right_x + right_w, right_y + right_h), (12, 12, 12), -1)
    cv2.addWeighted(overlay, 0.70, frame, 0.30, 0, dst=frame)
    cv2.rectangle(frame, (right_x, right_y), (right_x + right_w, right_y + right_h), (60, 60, 60), 1, cv2.LINE_AA)

    # Sub-header for Orientation
    draw_text(frame, "HEAD ORIENTATION & POSE", right_x + 15, right_y + 30, (255, 255, 255), 0.55, 2)
    cv2.line(frame, (right_x + 15, right_y + 40), (right_x + right_w - 15, right_y + 40), (50, 50, 50), 1, cv2.LINE_AA)

    head = payload["headPose"]
    pitch, yaw, roll = head["pitch"], head["yaw"], head["roll"]

    # Yaw & Pitch crosshair widget
    widget_r = 45
    widget_cx = right_x + right_w - 65
    widget_cy = right_y + 105
    # Draw radar circles
    cv2.circle(frame, (widget_cx, widget_cy), widget_r, (60, 60, 60), 1, cv2.LINE_AA)
    cv2.circle(frame, (widget_cx, widget_cy), int(widget_r / 2), (40, 40, 40), 1, cv2.LINE_AA)
    # Axes
    cv2.line(frame, (widget_cx - widget_r, widget_cy), (widget_cx + widget_r, widget_cy), (50, 50, 50), 1)
    cv2.line(frame, (widget_cx, widget_cy - widget_r), (widget_cx, widget_cy + widget_r), (50, 50, 50), 1)

    # Map pitch/yaw to target space (clamped max yaw=35, pitch=40)
    # Yaw maps to X axis, Pitch maps to Y axis (positive yaw is looking left, positive pitch is looking down/up depending on frame coordinate direction)
    norm_x = min(1.0, max(-1.0, yaw / 35.0))
    norm_y = min(1.0, max(-1.0, pitch / 40.0)) # Made visually less sensitive
    cross_x = widget_cx + int(norm_x * widget_r)
    cross_y = widget_cy + int(norm_y * widget_r)

    # Crosshair dot
    cross_color = (100, 255, 100)
    # Determine if head is out of limits
    head_state_desc = "CENTERED"
    if abs(yaw) >= config.HEAD_YAW_WARNING or abs(pitch) >= config.HEAD_PITCH_WARNING:
        cross_color = (100, 100, 255)
        if abs(yaw) >= config.HEAD_YAW_WARNING:
            head_state_desc = "DISTRACTED L/R"
        else:
            head_state_desc = "DISTRACTED U/D"

    # Draw indicator target crosshair dot
    cv2.circle(frame, (cross_x, cross_y), 5, cross_color, -1, cv2.LINE_AA)
    cv2.circle(frame, (cross_x, cross_y), 9, (255, 255, 255), 1, cv2.LINE_AA)

    # Text metrics for Head Pose
    draw_text(frame, f"PITCH: {pitch:+.1f} deg", right_x + 15, right_y + 65, (220, 220, 220), 0.42, 1)
    draw_text(frame, f"YAW:   {yaw:+.1f} deg", right_x + 15, right_y + 87, (220, 220, 220), 0.42, 1)
    draw_text(frame, f"ROLL:  {roll:+.1f} deg", right_x + 15, right_y + 109, (220, 220, 220), 0.42, 1)
    
    # Orientation status label
    draw_text(frame, "STATUS: ", right_x + 15, right_y + 135, (150, 150, 150), 0.42, 1)
    draw_text(frame, head_state_desc, right_x + 75, right_y + 135, cross_color, 0.42, 2)

    # Horizontal divider
    cv2.line(frame, (right_x + 15, right_y + 155), (right_x + right_w - 15, right_y + 155), (50, 50, 50), 1, cv2.LINE_AA)

    # Event Reason
    draw_text(frame, "DIAGNOSTIC STATUS LOG", right_x + 15, right_y + 175, (255, 255, 255), 0.50, 2)
    
    reason = payload["eventReason"]
    wrapped_reason = wrap_text(reason, max_chars=36)
    
    reason_y = right_y + 198
    for line in wrapped_reason:
        # Event details text
        draw_text(frame, line, right_x + 15, reason_y, colour, 0.42, 1)
        reason_y += 18

    # Bottom instruction bar
    draw_filled_box(frame, 0, height - 40, width, height, (20, 20, 20))
    cv2.line(frame, (0, height - 40), (width, height - 40), (60, 60, 60), 1, cv2.LINE_AA)
    draw_text(
        frame,
        "Controls: [Q]/[ESC] Exit  |  [C] Calibrate Head Pose  |  Fatigue score bridges to Wokwi Simulator Potentiometer",
        20,
        height - 15,
        (180, 180, 180),
        0.42,
        1
    )

    # Critical warning banner
    if state in ["ALARM", "CRITICAL", "CAMERA_LOST"]:
        banner_y = height - 90
        # Translucent dark backing behind warning line
        banner_overlay = frame.copy()
        draw_filled_box(banner_overlay, 0, banner_y, width, banner_y + 50, (15, 15, 15))
        cv2.addWeighted(banner_overlay, 0.4, frame, 0.6, 0, dst=frame)
        
        # Outer thick status colored block
        draw_filled_box(frame, 0, banner_y, 10, banner_y + 50, colour)
        cv2.line(frame, (0, banner_y), (width, banner_y), colour, 1, cv2.LINE_AA)
        
        if state == "CRITICAL":
            warning_text = "CRITICAL STATE: EMERGENCY THRESHOLD BREACHED - TRIGGERING ESCALATION ROUTINE"
        elif state == "CAMERA_LOST":
            warning_text = "VISIBILITY ALERT: NO FACE DETECTED - MONITORING INACTIVE"
        else:
            warning_text = "ATTENTION WARNING: HIGH FATIGUE SCORE OR PROLONGED DISTRACTION DETECTED"
        draw_text(frame, warning_text, 25, banner_y + 32, colour, 0.50, 2)

    # Calibration Overlay / Banner
    if payload.get("isCalibrating"):
        # Draw a beautiful glassmorphic prompt in the center/upper area of the camera feed
        prompt_w = 420
        prompt_h = 65
        prompt_x = int((width - prompt_w) / 2)
        prompt_y = header_h + 30
        
        prompt_overlay = frame.copy()
        cv2.rectangle(prompt_overlay, (prompt_x, prompt_y), (prompt_x + prompt_w, prompt_y + prompt_h), (25, 20, 10), -1)
        cv2.addWeighted(prompt_overlay, 0.8, frame, 0.2, 0, dst=frame)
        cv2.rectangle(frame, (prompt_x, prompt_y), (prompt_x + prompt_w, prompt_y + prompt_h), (235, 140, 20), 1, cv2.LINE_AA)
        
        pct = int(payload.get("calibrationProgress", 0.0) * 100)
        draw_text(frame, f"CALIBRATING HEAD POSE - LOOK STRAIGHT ({pct}%)", prompt_x + 20, prompt_y + 25, (255, 255, 255), 0.42, 1)
        
        # Draw a tiny progress bar inside prompt box
        pbar_y = prompt_y + 40
        pbar_w = prompt_w - 40
        pbar_h = 6
        cv2.rectangle(frame, (prompt_x + 20, pbar_y), (prompt_x + 20 + pbar_w, pbar_y + pbar_h), (40, 40, 40), -1)
        cv2.rectangle(frame, (prompt_x + 20, pbar_y), (prompt_x + 20 + int((pct / 100.0) * pbar_w), pbar_y + pbar_h), (235, 140, 20), -1)
        cv2.rectangle(frame, (prompt_x + 20, pbar_y), (prompt_x + 20 + pbar_w, pbar_y + pbar_h), (80, 80, 80), 1, cv2.LINE_AA)


def wrap_text(text, max_chars=40):
    words = text.split()
    lines = []
    current = ""

    for word in words:
        if len(current) + len(word) + 1 <= max_chars:
            if current:
                current += " "
            current += word
        else:
            if current:
                lines.append(current)
            current = word

    if current:
        lines.append(current)

    if not lines:
        lines.append("Telemetry Nominal")

    return lines[:4]


# ============================================================
# Main Application
# ============================================================

def parse_args():
    parser = argparse.ArgumentParser(
        description="Smart Driver State Monitoring Computer Vision Demo"
    )

    parser.add_argument(
        "--video",
        type=str,
        default=None,
        help="Optional path to prerecorded driver video. If omitted, webcam is used."
    )

    parser.add_argument(
        "--camera",
        type=int,
        default=config.CAMERA_INDEX,
        help="Camera index. Default is taken from config.py"
    )

    parser.add_argument(
        "--show-landmarks",
        action="store_true",
        help="Draw selected eye and mouth landmarks."
    )

    parser.add_argument(
        "--no-beep",
        action="store_true",
        help="Disable audio beep."
    )

    return parser.parse_args()


def open_video_source(args):
    if args.video:
        cap = cv2.VideoCapture(args.video)
        print(f"Using video file: {args.video}")
        if not cap.isOpened():
            raise RuntimeError("Could not open video file.")
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, config.FRAME_WIDTH)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config.FRAME_HEIGHT)
        return cap
    else:
        print(f"Using webcam index: {args.camera}")
        cap = RealTimeVideoCapture(args.camera, config.FRAME_WIDTH, config.FRAME_HEIGHT)
        if not cap.isOpened():
            raise RuntimeError("Could not open webcam.")
        return cap


def main():
    args = parse_args()

    if args.show_landmarks:
        config.SHOW_LANDMARK_POINTS = True

    if args.no_beep:
        config.ENABLE_AUDIO_BEEP = False

    ensure_directory(config.LOG_DIRECTORY)

    cap = open_video_source(args)

    logger = CSVLogger()
    serial_bridge = SerialBridge()
    monitor = DriverStateMonitor()

    mp_face_mesh = mp.solutions.face_mesh

    face_mesh = mp_face_mesh.FaceMesh(
        max_num_faces=config.MAX_NUM_FACES,
        refine_landmarks=config.REFINE_LANDMARKS,
        min_detection_confidence=config.MIN_DETECTION_CONFIDENCE,
        min_tracking_confidence=config.MIN_TRACKING_CONFIDENCE
    )

    cv2.namedWindow(config.WINDOW_NAME, cv2.WINDOW_NORMAL)

    print("Computer vision module started.")
    print("Output fatigueScore range: 0-100")
    print("In Wokwi, the slide potentiometer represents this fatigueScore.")
    print("Press Q or ESC to exit.")
    print()

    try:
        while True:
            ret, frame = cap.read()

            if not ret:
                if args.video:
                    print("End of video file reached.")
                    break
                print("WARNING: Frame capture failed.")
                time.sleep(0.1)
                continue

            frame = cv2.resize(frame, (config.FRAME_WIDTH, config.FRAME_HEIGHT))

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            rgb_frame.flags.writeable = False

            results = face_mesh.process(rgb_frame)

            rgb_frame.flags.writeable = True

            face_detected = False
            landmarks = None

            if results.multi_face_landmarks:
                face_detected = True
                landmarks = results.multi_face_landmarks[0].landmark

            payload = monitor.update(
                frame=frame,
                face_detected=face_detected,
                landmarks=landmarks
            )

            draw_dashboard(frame, payload)

            monitor.print_json_periodically(payload)
            serial_bridge.write_json(payload)

            if monitor.frame_index % config.LOG_EVERY_N_FRAMES == 0:
                logger.log({
                    "timestamp": payload["timestamp"],
                    "frameIndex": payload["frameIndex"],
                    "fps": payload["fps"],
                    "faceDetected": payload["faceDetected"],
                    "ear": payload["ear"],
                    "mar": payload["mar"],
                    "perclos": payload["perclos"],
                    "blinkCount": payload["blinkRatePerMin"],
                    "yawnCount": payload["yawnCount"],
                    "eyeClosedSeconds": payload["eyeClosedSeconds"],
                    "faceLostSeconds": payload["faceLostSeconds"],
                    "pitch": payload["headPose"]["pitch"],
                    "yaw": payload["headPose"]["yaw"],
                    "roll": payload["headPose"]["roll"],
                    "fatigueScore": payload["fatigueScore"],
                    "driverState": payload["driverState"],
                    "eventReason": payload["eventReason"]
                })

            cv2.imshow(config.WINDOW_NAME, frame)

            key = cv2.waitKey(1) & 0xFF

            if key == ord("q") or key == 27:
                break
            elif key == ord("c") or key == ord("C"):
                monitor.trigger_recalibration()

    finally:
        cap.release()
        cv2.destroyAllWindows()
        face_mesh.close()
        logger.close()
        serial_bridge.close()

        print()
        print("Computer vision module stopped.")
        print(f"CSV log saved to: {os.path.join(config.LOG_DIRECTORY, config.CSV_LOG_FILENAME)}")


if __name__ == "__main__":
    main()