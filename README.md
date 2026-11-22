# recall.dev — Interactive CS Engineering Flashcards

A lightweight, keyboard-first flashcard and MCQ study engine built for Computer Science fundamentals (**DSA**, **Operating Systems**, **DBMS**, and **Computer Networks**).

## Live Demo
**[Launch recall.dev Live](https://github.io)**

## Key Features
- **Instant Answer Telemetry:** Highlights valid and invalid choices with time/space complexity metadata and concise engineering explanations.
- **Dynamic Topic Filtering:** Filter study decks across core B.Tech CS subjects (`All`, `DSA`, `OS`, `DBMS`, `Networks`).
- **Keyboard-First Workflow:** Press `1`–`4` to select an option and `Enter` to advance to the next card.
- **Session Audit & Persistence:** Tracks live answer streaks, persists personal high scores via `localStorage`, and generates an end-of-session pass/fail log.

## Tech Stack
- **HTML5:** Semantic markup with `aria-live` accessibility regions.
- **CSS3:** Obsidian design system built with CSS custom properties and responsive layouts.
- **Vanilla JavaScript (ES6+):** Unidirectional state management and unbiased Fisher-Yates deck shuffling.

## Run Locally
```bash
git clone https://github.com
cd interactive-flash-cards
```
Open `index.html` in any browser to run locally.
