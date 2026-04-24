# Seesaw Simulation

A small physics playground built with pure HTML, CSS and vanilla JavaScript. Click the plank, drop an object, watch it tilt.

**Live demo:** https://erenerayyilmaz.github.io/seesaw-simulation-eren-eray-yilmaz/

---

## What it does

- Click anywhere on the plank to drop a random 1–10 kg object at that spot
- Torque is calculated per side as `weight × distance from pivot`
- The plank tilts with `(rightTorque − leftTorque) / 10`, clamped at ±30°
- A short sound plays on every drop (frequency drops as weight grows)
- State is saved to localStorage, so a page refresh keeps your progress
- Reset clears everything, Pause stops new drops
- Keyboard users can drop at the center with Enter or Space

---

## My decisions

### Click correction when the plank is tilted
When the plank rotates, the browser still gives me screen coordinates. If I used them raw, clicks near a tilted edge would land in the wrong place. I take `dx` and `dy` from the plank center and rotate them back by the current angle using `cos` and `sin`, so the click always maps to the correct spot on the plank.

### Position stored as a percentage
Each object's position is a `pct` value between 0 and 1, not a pixel value. That way it still renders correctly if the plank width changes on mobile.

### Pivot edge case
A click exactly on the center gives distance zero, so torque is zero. But the weight still exists, so I split it half-half between the two sides — otherwise the weight cards would lie.

### CSS handles the motion
I update the `transform: rotate(...)` once per click and let a `cubic-bezier` transition do the smoothing. No animation loop in JS.

### Green left, gray right
Just a color convention so the log and the balls stay readable at a glance. Nothing physics-related.

### Dark, quiet theme
A playground should feel calm. I used a near-black background with one green accent for the pivot, left side, and balanced-state glow.

---

## Trade-offs

- **No touch-specific handling** — tap works via click, but a production version would wire up `touchstart` for better mobile precision.
- **Balls can overlap** — I didn't add spacing logic for clicks on the same spot.
- **Log is session-only** — it's feedback, not persistent history.

---

## AI usage

I used AI tools (Claude, ChatGPT) while building this — mainly for:
- Debugging the tilted-click rotation math
- Sanity-checking the torque formula against the brief
- Reviewing the cubic-bezier timing for the plank transition

The structure, decisions, and final code are mine. I can walk through every line.

---

## Run it locally

```
git clone https://github.com/erenerayyilmaz/seesaw-simulation-eren-eray-yilmaz.git
cd seesaw-simulation-eren-eray-yilmaz
```

Open `index.html` in any modern browser. No build step, no dependencies.

---

## Commits

Broken into small logical commits: structure, styling, state setup, interaction, physics, polish. Each commit is a single concern.
