# ELOCIA: Educational Motion Analysis & FSL Assessment System

> **Thesis Manuscript Ref:** `2026CS009-`  
> **Title:** *ELOCIA: A Computer Vision-Based System for FSL Expression Analysis Among Deaf and Hard-of-Hearing Elementary Learners*  
> **Institution:** Mapúa Malayan Colleges Laguna — College of Computer and Information Science  
> **Target Research Site:** Cabuyao Central School, Cabuyao City, Laguna (SPED Section, Grades 1–3 DHH)  

---

## 📄 Executive Summary

**ELOCIA** (Educational Motion Analysis & Filipino Sign Language Assessment System) is an intelligent, computer vision-based pedagogical evaluation system tailored for Deaf and Hard-of-Hearing (DHH) elementary learners (Grades 1 to 3) [cite: 1]. 

Unlike conventional sign language recognition software that maps signs to text or speech for hearing audiences, ELOCIA delivers **structural pedagogical assessment** [cite: 1]. Grounded in **Vygotsky's Zone of Proximal Development (ZPD)**, ELOCIA evaluates the four structural phonological parameters of Filipino Sign Language (FSL)—**Handshape**, **Palm Orientation**, **Location**, and **Movement Trajectory**—against teacher-anchored baselines in real time to prevent fine motor habit fossilization and foreign-syntax interference [cite: 1].

---

## 🏗️ Architecture & Deployment Model

ELOCIA operates as a **two-tier architecture** that isolates local, high-frequency computer-vision execution from remote administrative analytics [cite: 1]:

```
+-----------------------------------------------------------------------+
|                    LOCAL DESKTOP APPLICATION TIER                     |
|                                                                       |
|  +--------------------+   WebSockets   +---------------------------+  |
|  | React 18 UI        | <------------> | Python FastAPI + Uvicorn  |  |
|  | (pywebview Shell)  |   (30 FPS)     | + MediaPipe Holistic      |  |
|  +--------------------+                | + dtaidistance (DTW)      |  |
|            |                           | + scikit-learn            |  |
|            | local assets              +---------------------------+  |
|            v                                         |                |
|  [ Local Media Cache ]                   Background Metadata Sync     |
|  (Teacher Gold Videos)                   (Offline Queue / SQLite)     |
+------------------------------------------------------|----------------+
                                                       | (JSON Metadata)
                                                       v
+-----------------------------------------------------------------------+
|                      CLOUD WEB DASHBOARD TIER                         |
|                                                                       |
|  +--------------------+   HTTPS/REST   +---------------------------+  |
|  | React Web          | -------------> | Managed Cloud PostgreSQL  |  |
|  | Dashboard          |                | (User profiles, scores,   |  |
|  +--------------------+                |   session attempt logs)   |  |
+-----------------------------------------------------------------------+
```

1. **Local Desktop Application (Student-Facing):** Runs on-device to execute the 30 FPS machine vision pipeline without cloud dependency, network latency, or streaming raw video over the internet [cite: 1].
2. **Cloud Web Dashboard (Teacher/Parent/Admin-Facing):** Aggregates anonymized numerical sub-scores, session metrics, and progress logs for pedagogical monitoring and class management [cite: 1].

---

## 🛠️ Technology Stack

| Layer / Component | Technology | Role & Functionality |
| :--- | :--- | :--- |
| **Desktop UI** | React 18 + Vite (TypeScript) | Renders canvas overlays, gamified workspaces, and student progress [cite: 1]. |
| **Desktop Shell** | pywebview | Light native desktop wrapper around the React Vite build [cite: 1]. |
| **CV Engine Server** | Python 3.11 + FastAPI + Uvicorn | Local async API & WebSocket host running keypoint tracking and scoring [cite: 1]. |
| **Landmark Extraction** | MediaPipe Holistic | Extracts 21 3D hand keypoints per hand + upper-body pose anchors [cite: 1]. |
| **Sequence Alignment** | `dtaidistance` | Dynamic Time Warping (DTW) for movement trajectory comparison [cite: 1]. |
| **Scoring Engine** | `scikit-learn` + `NumPy` | Distance metrics & composite score calculation [cite: 1]. |
| **Web Dashboard** | React 18 + Vite + Tailwind CSS | Teacher, Parent, and Admin analytics portal [cite: 1]. |
| **Database** | PostgreSQL (Cloud instance) | Encrypted storage for user profiles, logs, and sub-scores (zero raw video) [cite: 1]. |

---

## 🧮 Core Pedagogical Mechanics

### 1. Composite Scoring Formula
Each sign attempt is evaluated across all four FSL phonological parameters, weighted equally at 25% [cite: 1]:

$$	ext{Composite Score } (S) = (H 	imes 0.25) + (P 	imes 0.25) + (L 	imes 0.25) + (M 	imes 0.25)$$

* **$H$ (Handshape):** Derived from MediaPipe 3D joint distance comparison [cite: 1].
* **$P$ (Palm Orientation):** Normal vector orientation check [cite: 1].
* **$L$ (Location):** Distance relative to chest/head anatomical pose anchors [cite: 1].
* **$M$ (Movement Trajectory):** Dynamic Time Warping path alignment via `dtaidistance` [cite: 1].
* **Passing Threshold:** $S \ge 60/100$ [cite: 1].

### 2. Four-Tier Adaptive Scaffolding Engine
Grounded in Vygotsky’s Zone of Proximal Development (ZPD) [cite: 1]:
* **Tier 1 (Attempt 1):** Standard automated evaluation with live visual canvas overlays [cite: 1].
* **Tier 2 (2 Consecutive Sub-Passing Attempts):** Parameter-specific visual corrective guidance (e.g., *"Adjust Wrist Angle by +15°"*) [cite: 1].
* **Tier 3 (3 Consecutive Sub-Passing Attempts):** Automatic replay of teacher gold-standard reference video in full or slow motion [cite: 1].
* **Tier 4 (4 Consecutive Sub-Passing Attempts):** Autonomous system pass to prevent learner frustration, flagging the item on the Teacher Dashboard for diagnostic review and routing the sign to Free Practice [cite: 1].

---

## 📦 System Modules

1. **Centralized Administration & User Management (Web):** Role-Based Access Control (RBAC) for Admin, Teacher, Student, and Parent accounts [cite: 1].
2. **Learning Progress & Monitoring Dashboard (Web):** Radar charts, accuracy timelines, and Tier 4 intervention alerts [cite: 1].
3. **Learning Path & Lesson Navigation (Desktop):** Structured access to assigned FSL lessons and practice modes [cite: 1].
4. **FSL Expression Evaluation (Desktop):** Core computer-vision assessment module powered by MediaPipe + DTW [cite: 1].
5. **Student Workspace, Free Practice & Mini-Games (Desktop):** Ungraded environment featuring Fingerspelling, Picture-to-Sign, and Fill-in-the-Blank exercises [cite: 1].
6. **Student Profile & Achievements (Desktop):** Learner badge showcase and historical accuracy summaries [cite: 1].

---

## ⚖️ Legal & Privacy Compliance

* **RA 11106 (Filipino Sign Language Act):** Operationalizes the national mandate for FSL in public elementary classrooms [cite: 1].
* **RA 10173 (Data Privacy Act of 2012):** Zero raw video or biometric data is ever stored remotely or transmitted over networks [cite: 1]. Video streams process strictly in volatile local memory, and only non-sensitive numerical metadata synchronizes to the cloud database [cite: 1]. No audio data is captured at any point [cite: 1].

---

## 👥 Research Team & Credits

* **Researchers:** Mark Daniel S. Cuntapay, Justine Ryan D. Deluria, Daniel Mark D. Sarabusing [cite: 1]
* **Thesis Adviser:** Aurelia Sharlene O. Delos Santos [cite: 1]
* **Institution:** Mapúa Malayan Colleges Laguna (MMCL) [cite: 1]
