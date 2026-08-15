# ELOCIA: Educational Motion Analysis & FSL Assessment System

> **Thesis Manuscript Ref:** `2026CS009-`  
> **Title:** *ELOCIA: A Computer Vision-Based System for FSL Expression Analysis Among Deaf and Hard-of-Hearing Elementary Learners*  
> **Institution:** Mapúa Malayan Colleges Laguna — College of Computer and Information Science  
> **Target Research Site:** Cabuyao Central School, Cabuyao City, Laguna (SPED Section, Grades 1–3 DHH)  

---

## 📄 Executive Summary

**ELOCIA** (Educational Motion Analysis & Filipino Sign Language Assessment System) is an intelligent, computer vision-based pedagogical evaluation system tailored for Deaf and Hard-of-Hearing (DHH) elementary learners (Grades 1 to 3).

Unlike conventional sign language recognition software that maps signs to text or speech for hearing audiences, ELOCIA delivers **structural pedagogical assessment**. Grounded in **Vygotsky's Zone of Proximal Development (ZPD)**, ELOCIA evaluates the four structural phonological parameters of Filipino Sign Language (FSL)—**Handshape**, **Palm Orientation**, **Location**, and **Movement Trajectory**—against teacher-anchored baselines in real time to prevent fine motor habit fossilization and foreign-syntax interference.

---

## 🛠️ Technology Stack

| Layer / Component | Technology | Role & Functionality |
| :--- | :--- | :--- |
| **Desktop UI** | React 18 + Vite (TypeScript) | Renders canvas overlays, gamified workspaces, and student progress. |
| **Desktop Shell** | pywebview | Light native desktop wrapper around the React Vite build. |
| **CV Engine Server** | Python 3.11 + FastAPI + Uvicorn | Local async API & WebSocket host running keypoint tracking and scoring. |
| **Landmark Extraction** | MediaPipe Holistic | Extracts 21 3D hand keypoints per hand + upper-body pose anchors. |
| **Sequence Alignment** | `dtaidistance` | Dynamic Time Warping (DTW) for movement trajectory comparison. |
| **Scoring Engine** | `scikit-learn` + `NumPy` | Distance metrics & composite score calculation. |
| **Web Dashboard** | React 18 + Vite + Tailwind CSS | Teacher, Parent, and Admin analytics portal. |
| **Database** | PostgreSQL (Cloud instance) | Encrypted storage for user profiles, logs, and sub-scores (zero raw video). |

---

## 🧮 Core Pedagogical Mechanics

### 1. Composite Scoring Formula
Each sign attempt is evaluated across all four FSL phonological parameters, weighted equally at 25%:

$$Composite\ Score\ (S) = (H × 0.25) + (P × 0.25) + (L × 0.25) + (M × 0.25)$$

* **$H$ (Handshape):** Derived from MediaPipe 3D joint distance comparison.
* **$P$ (Palm Orientation):** Normal vector orientation check.
* **$L$ (Location):** Distance relative to chest/head anatomical pose anchors.
* **$M$ (Movement Trajectory):** Dynamic Time Warping path alignment via `dtaidistance`.
* **Passing Threshold:** $S \ge 60/100$.

### 2. Four-Tier Adaptive Scaffolding Engine
Grounded in Vygotsky’s Zone of Proximal Development (ZPD):
* **Tier 1 (Attempt 1):** Standard automated evaluation with live visual canvas overlays.
* **Tier 2 (2 Consecutive Sub-Passing Attempts):** Parameter-specific visual corrective guidance (e.g., *"Adjust Wrist Angle by +15°"*).
* **Tier 3 (3 Consecutive Sub-Passing Attempts):** Automatic replay of teacher gold-standard reference video in full or slow motion.
* **Tier 4 (4 Consecutive Sub-Passing Attempts):** Autonomous system pass to prevent learner frustration, flagging the item on the Teacher Dashboard for diagnostic review and routing the sign to Free Practice.

---

## 📦 System Modules

1. **Centralized Administration & User Management (Web):** Role-Based Access Control (RBAC) for Admin, Teacher, Student, and Parent accounts.
2. **Learning Progress & Monitoring Dashboard (Web):** Radar charts, accuracy timelines, and Tier 4 intervention alerts.
3. **Learning Path & Lesson Navigation (Desktop):** Structured access to assigned FSL lessons and practice modes.
4. **FSL Expression Evaluation (Desktop):** Core computer-vision assessment module powered by MediaPipe + DTW.
5. **Student Workspace, Free Practice & Mini-Games (Desktop):** Ungraded environment featuring Fingerspelling, Picture-to-Sign, and Fill-in-the-Blank exercises.
6. **Student Profile & Achievements (Desktop):** Learner badge showcase and historical accuracy summaries.

---

## ⚖️ Legal & Privacy Compliance

* **RA 11106 (Filipino Sign Language Act):** Operationalizes the national mandate for FSL in public elementary classrooms.
* **RA 10173 (Data Privacy Act of 2012):** Zero raw video or biometric data is ever stored remotely or transmitted over networks. Video streams process strictly in volatile local memory, and only non-sensitive numerical metadata synchronizes to the cloud database. No audio data is captured at any point.

---

## 👥 Research Team & Credits

* **Researchers:** Mark Daniel S. Cuntapay, Justine Ryan D. Deluria, Daniel Mark D. Sarabusing
* **Thesis Adviser:** Aurelia Sharlene O. Delos Santos
* **Institution:** Mapúa Malayan Colleges Laguna (MMCL)
