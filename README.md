# Thommidhi Calibration Check

A client-side calibration review for a decision layer that returns probabilities. It uses only predictions and later outcomes to report mean forecast, observed rate, calibration gap and Brier score.

## Use

Open `index.html` and add rows as:

```text
Pune budget video | 0.72 | 1
```

## Test

```bash
npm test
```

No external services, build step or secrets.
