# ml/

This prototype's anomaly detection and risk scoring are implemented directly in
the backend (`backend/src/services/riskEngine.ts`) as plain, explainable
TypeScript — deliberately not a black-box ML model, since every flagged project
needs a human-readable reason an officer can act on.

This folder documents the *approach* in the same terms a notebook or model card
would, so it can be swapped for a heavier model later without changing the
product's contract (a project in, a `RiskResult` out).

- **`anomaly/`** — the four detectors: cost, delay, expenditure/progress
  mismatch, and similarity. See `docs/anomaly-detection.md` at the project root
  for the full method and thresholds for each.
- **`risk/`** — how detector outputs are combined into the 0–100 Prototype Risk
  Score and LOW/MEDIUM/HIGH level. See the "Combining signals" section of
  `docs/anomaly-detection.md`.

**Why rule-based instead of a trained model for this prototype:** with a small,
synthetic sample dataset there isn't enough labelled ground truth to train or
evaluate a classifier honestly. Explicit rules also mean every score comes with
an exact, auditable explanation — which matters more for a review-prioritization
tool than raw predictive accuracy. A natural next step (see the README's
"Future improvements") is a learned model that's calibrated against officers'
actual review outcomes over time, with the current rules kept as a transparent
baseline/fallback.
