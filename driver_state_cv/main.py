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
    """
    if not config.ENABLE_AUDIO_BEEP:
        return

    try:
        if platform.system().lower() == "windows":
            import winsound
            winsound.Beep(1200, 120)
        else:
            print("\a", end="", flush=True)
    except Exception:
        pass


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

        if state == "NORMAL":
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
            "eventReason": reason
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

    # Header
    draw_filled_box(frame, 0, 0, width, 70, (30, 30, 30))
    draw_text(
        frame,
        "SMART DRIVER STATE MONITORING - COMPUTER VISION MODULE",
        20,
        30,
        (255, 255, 255),
        0.75,
        2
    )

    draw_text(
        frame,
        f"STATE: {state}",
        20,
        60,
        colour,
        0.8,
        2
    )

    # Fatigue score bar
    bar_x = 360
    bar_y = 40
    bar_w = 360
    bar_h = 18

    cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_w, bar_y + bar_h), (220, 220, 220), 2)
    filled_w = int((score / 100.0) * bar_w)
    cv2.rectangle(frame, (bar_x, bar_y), (bar_x + filled_w, bar_y + bar_h), colour, -1)

    draw_text(frame, f"Fatigue Score: {score}/100", bar_x, bar_y - 8, (255, 255, 255), 0.55, 1)

    # Left panel
    panel_x = 20
    panel_y = 95
    panel_w = 340
    panel_h = 265

    overlay = frame.copy()
    cv2.rectangle(overlay, (panel_x, panel_y), (panel_x + panel_w, panel_y + panel_h), (20, 20, 20), -1)
    frame[:] = cv2.addWeighted(overlay, 0.45, frame, 0.55, 0)

    draw_text(frame, "Live Metrics", panel_x + 15, panel_y + 30, (255, 255, 255), 0.7, 2)

    metrics = [
        f"FPS: {payload['fps']}",
        f"Face Detected: {payload['faceDetected']}",
        f"EAR: {payload['ear']}",
        f"MAR: {payload['mar']}",
        f"PERCLOS: {payload['perclos']}%",
        f"Blink Rate: {payload['blinkRatePerMin']}/min",
        f"Eye Closed: {payload['eyeClosedSeconds']}s",
        f"Yawn Active: {payload['yawnActive']}",
        f"Yawn Count: {payload['yawnCount']}",
        f"Face Lost: {payload['faceLostSeconds']}s"
    ]

    y = panel_y + 60
    for item in metrics:
        draw_text(frame, item, panel_x + 15, y, (230, 230, 230), 0.52, 1)
        y += 22

    # Right panel
    right_x = width - 370
    right_y = 95
    right_w = 350
    right_h = 210

    overlay = frame.copy()
    cv2.rectangle(overlay, (right_x, right_y), (right_x + right_w, right_y + right_h), (20, 20, 20), -1)
    frame[:] = cv2.addWeighted(overlay, 0.45, frame, 0.55, 0)

    draw_text(frame, "Head Pose", right_x + 15, right_y + 30, (255, 255, 255), 0.7, 2)

    head = payload["headPose"]
    draw_text(frame, f"Pitch: {head['pitch']} deg", right_x + 15, right_y + 65, (230, 230, 230), 0.55, 1)
    draw_text(frame, f"Yaw:   {head['yaw']} deg", right_x + 15, right_y + 90, (230, 230, 230), 0.55, 1)
    draw_text(frame, f"Roll:  {head['roll']} deg", right_x + 15, right_y + 115, (230, 230, 230), 0.55, 1)

    draw_text(frame, "Event Reason:", right_x + 15, right_y + 150, (255, 255, 255), 0.55, 1)

    reason = payload["eventReason"]
    wrapped_reason = wrap_text(reason, max_chars=38)

    reason_y = right_y + 175
    for line in wrapped_reason:
        draw_text(frame, line, right_x + 15, reason_y, colour, 0.48, 1)
        reason_y += 20

    # Bottom instruction bar
    draw_filled_box(frame, 0, height - 45, width, height, (35, 35, 35))
    draw_text(
        frame,
        "Press Q or ESC to exit | This CV fatigue score maps to the Wokwi potentiometer value",
        20,
        height - 15,
        (255, 255, 255),
        0.55,
        1
    )

    # Critical warning banner
    if state in ["ALARM", "CRITICAL", "CAMERA_LOST"]:
        banner_y = height - 95
        draw_filled_box(frame, 0, banner_y, width, banner_y + 45, colour)
        if state == "CRITICAL":
            warning_text = "CRITICAL DRIVER STATE DETECTED - EMBEDDED SYSTEM SHOULD ESCALATE TO EMERGENCY"
        elif state == "CAMERA_LOST":
            warning_text = "CAMERA / FACE LOST - DRIVER VISIBILITY PROBLEM"
        else:
            warning_text = "ALARM - STRONG SIGNS OF DROWSINESS OR DISTRACTION"
        draw_text(frame, warning_text, 20, banner_y + 30, (255, 255, 255), 0.65, 2)


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
        lines.append("None")

    return lines[:3]


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
    else:
        cap = cv2.VideoCapture(args.camera)
        print(f"Using webcam index: {args.camera}")

    if not cap.isOpened():
        raise RuntimeError("Could not open camera or video source.")

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, config.FRAME_WIDTH)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config.FRAME_HEIGHT)

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