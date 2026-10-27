# FairShift — LinkedIn Launch Story

### 📢 Launching FairShift: Building Institutional Trust & Decent Work for Employee-Intensive Organisations (UN SDG 8)

When millions of frontline workers—crane operators, steel erectors, campus security, and facility staff—clock in every morning, their work underpins the backbone of our communities. Yet too many still face paper registers, unexplained paycheck deductions, unrecorded overtime, and hazardous conditions they fear reporting due to retaliation.

That is why we built **FairShift** for the UN Sustainable Development Goal 8 (Decent Work and Economic Growth).

FairShift is an enterprise, mobile-first workforce platform that bridges the trust deficit between workers and management through radical transparency and verified integrity.

---

### 🛠 What We Built & Tested

1. **Zero-Bias Transparent Wage Ledger:**
Workers can inspect every shift, base hour, and overtime calculation computed server-side with exact decimal arithmetic and 1.5x overtime parity. No vague deductions or missing overtime.

2. **Zero-Retaliation & Zero-Identity Reporting:**
Workers can report safety hazards (missing scaffolding pins, faulty machinery, PPE shortages) using browser-native Speech-to-Text voice recognition in their regional language, or submit completely anonymous reports decoupled from their identity (`reporter_id = NULL`), receiving a cryptographic tracking reference and secret key.

3. **Portable Skill Passport:**
A worker-owned, tamper-evident registry of verified certifications (OSHA 30-Hour Safety, Crane Rigging Specialist, Scaffolding Level 2) that workers retain across employers and export with structured signatures.

4. **Executive Operations Console:**
An executive bento-grid providing operational visibility: active workforce telemetry, station presence rate (95.8%), overtime threshold deltas, fatigue-risk interventions (enforcing mandatory 12h rest), and pay equity audit indices (99.4% parity).

5. **Universal Accessibility & Multi-Industry Engine:**
Built with an **Adaptive Viewport Zoom Engine (80% to 150%)** and complete multilingual translations across **English**, **Hindi (हिंदी)**, and **Bengali (বাংলা)**. Configured out-of-the-box for both **Heavy Construction (Apex Buildcon)** and **Higher Education (Metropolitan University)** without rewriting code.

---

### 💻 Technology & Architecture
- **Frontend:** React 19, TypeScript (Strict Mode), Vite, Tailwind CSS, Lucide Icons
- **Backend:** Python 3.11+, FastAPI, Pydantic V2, SQLAlchemy 2.0
- **Security:** Argon2id password hashing, JWT Bearer tokens, salted SHA-256 case verification
- **Persistence & Cloud:** PostgreSQL, Google Cloud Run multi-stage Docker container
- **Verification:** 100% automated test suite passing (12 backend Pytest/HTTPX tests + frontend Vitest)

---

🔗 **Repository:** https://github.com/ayushdas27/fairshift.git  
🚀 **Live Prototype & Demo:** https://fairshift-7ba0c6c3-uc.a.run.app  

A huge thank you to the hackathon organizers and mentors for championing UN SDG 8 and technological innovation for decent work.

#DecentWork #SDG8 #FairShift #OpenSource #FullStack #FastAPI #React #TypeScript #WorkplaceSafety #SocialImpact #GoogleCloud #Hackathon
