# Product Principles — DOS Club TalentOS

DOS Club TalentOS is built on a set of immutable product principles designed to uphold ground-truth engineering evidence over speculative claims.

---

## 1. Ground Truth Over Speculative Résumés

Conventional resumes and LinkedIn endorsements rely on self-reported assertions with zero auditability. TalentOS is designed to make actual engineering execution visible:
- Every completed workshop requires either a signed git commit SHA, an audited deliverable repository, an uploaded document, or a verified session reflection.
- Attendance is recorded via real-time GPS geofencing with zero-grace arrival windows, not casual retrospective sign-ins.

---

## 2. Zero Composite or Algorithmic Scoring

TalentOS strictly forbids synthetic "talent scores", algorithmic percentiles, or AI rankings:
- **No Artificial Aggregations**: We never calculate a weighted composite number (e.g. "87% Readiness Score").
- **Factual Counts Only**: A student is represented by raw, factual counts (e.g. `14 / 27 Workshops Completed`, `10 Tools in Inventory`, `3 Verified Certifications`).
- **Verifiable Proof**: Reviewers evaluate tangible deliverables, passing CI test outcomes, and trainer observations directly.

---

## 3. Developmental Growth Language

All qualitative evaluations and progress bands use developmental language rather than evaluative or punitive grading:
- `Developing`: Concept introduced; fundamental mechanics currently being practiced.
- `Progressing`: Competence demonstrated in guided exercises; moving toward independent implementation.
- `Consistent`: Reliable, production-ready execution across multiple workshops without regression.
- `Demonstrated`: Exceptional execution evidenced by audited deliverables and peer code sign-offs.
- `Growth Opportunity`: Explicit area identified for further study and deliberate practice.

Evaluative labels such as `Fail`, `Poor`, `Weak`, or `Below Average` are strictly prohibited.

---

## 4. Multi-Dimensional Skill Separation

Technical capability is non-linear and multidimensional. TalentOS enforces three distinct, unmerged skill dimensions:
1. **Self-Reported Confidence (1–5)**: The student's internal assessment of comfort and autonomy with the tool.
2. **Audited Exposure Count**: The factual number of workshops, repositories, and commits utilizing the tool.
3. **Developmental Maturity Level**: Structured progression (`Introduced` $\rightarrow$ `Explored` $\rightarrow$ `Applied` $\rightarrow$ `Demonstrated` $\rightarrow$ `Consistently Demonstrated`).

These dimensions are displayed side-by-side and are never merged into a single metric.

---

## 5. Auditability and Cryptographic Integrity

Every state transition in TalentOS produces an immutable audit record:
- Attendance events record timestamp, GPS latitude/longitude, distance from venue center, and check-in source (`QR_SCAN`, `TRAINER_MANUAL`, `COLLEGE_CONFIRMED`).
- Manual overrides require a mandatory audit reason.
- Deliverables link directly to Git commit SHAs and SHA-256 cryptographic verification digests.
