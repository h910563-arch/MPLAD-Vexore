# Anomaly Detection

All logic below lives in `backend/src/services/riskEngine.ts`. It is written to
be read and explained in a judging room, not just executed — every function maps
directly to one sentence in the UI.

MPLAD Sentinel checks four independent signals for every project. A project can
trigger any combination of them (including none).

## 1. Cost anomaly

**Question:** is this project unusually expensive compared to similar projects?

**Method:** for a project of type *T*, take the **median cost** of every project
of type *T* in the dataset as the comparable baseline (a simple, explainable
prototype approach — a production system could narrow the comparison group to
type + district + implementing agency). If the project's cost is **35% or more**
above that baseline, it is flagged.

**Severity:**
| Deviation above baseline | Severity | Points |
|---|---|---|
| 35–44% | LOW | 10 |
| 45–59% | MEDIUM | 20 |
| 60%+ | HIGH | 30 |

**Example message:** *"Project cost is 62% higher than comparable projects."*

## 2. Delay anomaly

**Question:** is this project significantly behind its own expected schedule?

**Method:** every project has a sanction date and an expected completion date,
which together imply an expected duration. If today's date is past that expected
completion date and the project isn't marked `COMPLETED`, the overdue time (in
months) is flagged once it passes **2 months**.

**Severity:**
| Months behind | Severity | Points |
|---|---|---|
| 2–4.9 | LOW | 8 |
| 5–9.9 | MEDIUM | 16 |
| 10+ | HIGH | 25 |

**Example message:** *"Project is approximately 14 months behind the expected
schedule."*

## 3. Expenditure / progress mismatch

**Question:** has more money been spent than the physical work justifies?

**Method:** compare `expenditurePercentage` (share of sanctioned funds spent) to
`progressPercentage` (share of physical work completed). A gap of **20
percentage points or more** is flagged.

**Severity:**
| Gap (expenditure − progress) | Severity | Points |
|---|---|---|
| 20–29pp | LOW | 10 |
| 30–44pp | MEDIUM | 17 |
| 45pp+ | HIGH | 25 |

**Example message:** *"85% of funds have been spent while reported progress is
only 32%."*

## 4. Similar / duplicate project

**Question:** could this project be a near-duplicate of another one nearby?

**Method (two signals combined):**

1. **Proximity** — haversine (great-circle) distance between the two projects'
   latitude/longitude, restricted to a **5 km radius** and the **same project
   type**.
2. **Text similarity** — a bag-of-words cosine similarity over each project's
   type + description, using simple term-frequency vectors (no external NLP
   dependency, chosen for transparency in a prototype).

These are combined as `similarity = 0.6 × textSimilarity + 0.4 × proximityScore`,
scaled to 0–100%. Projects scoring **55%+** are shown as "potentially similar";
the *highest*-scoring match determines whether the project itself is flagged.

**Severity (based on the top match):**
| Similarity | Severity | Points |
|---|---|---|
| 55–67% | LOW | 8 |
| 68–79% | MEDIUM | 14 |
| 80%+ | HIGH | 20 |

**Example message:** *"A potentially similar project was detected 2.4 km away."*
Always paired with the explicit note: *"Potential similarity — requires human
verification."*

## Combining signals into a risk score

`computeRisk` runs all four checks and sums whichever ones triggered (max 30 +
25 + 25 + 20 = 100). The total is the **Prototype Risk Score**:

- **0–39 → LOW** — no action needed.
- **40–69 → MEDIUM** — worth a look, but not urgent.
- **70–100 → HIGH** — should be reviewed soon.

Because no single anomaly type can exceed 30 points on its own, a project only
reaches MEDIUM or HIGH by triggering **multiple** independent signals — which is
intentional: the system is designed to surface *compounding* evidence, not
overreact to one noisy number.

## What this system deliberately does not do

- It does not claim to detect fraud, corruption, or any specific wrongdoing.
- It does not use any protected personal data about individuals.
- It does not make a final decision — every flagged project still requires a
  human officer's review, and every message in the product is worded as an
  observation ("X is unusual"), never an accusation.
