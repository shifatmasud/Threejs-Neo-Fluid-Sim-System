<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Interactive Fluid Simulation

This repository contains a visually stunning, real-time fluid simulation. You can interact with it by moving your mouse and customize the fluid's appearance with a wide array of controls and presets.

The project exists in two forms: a standalone web application and a reusable component for the Framer design tool.

---

## Demos

*   **Web Application**: [View in AI Studio](https://ai.studio/apps/drive/1ZETrrcQbFYPXQ5fYL_jh5VMjbLvmkmb6)
*   **Framer Component Demo**: [View on Framer Sites](https://conclusive-form-676715.framer.app/home)

---

## How It Works (Explained Like I'm 5)

Imagine you have a magical painting that's made of liquid. This project is like that!

*   **The Magic Paint (Shaders):** We use special computer instructions called "shaders" to tell your graphics card how to draw the fluid. This is what makes it move, ripple, and reflect light in such a realistic and beautiful way.
*   **The Brains (React & Three.js):** We use React to build the user interface (like the control panel) and Three.js to manage the 3D scene where our liquid lives.
*   **Two Ways to Play:**
    1.  **Web App:** A full website where you can play with the fluid.
    2.  **Framer Component:** A special "Lego block" that designers can drag and drop into their own website designs using a tool called Framer.

---

## Project Structure (Explained Like I'm 5)

Here's a map of our project's treasure chest:

```
/
├── 📄 index.html             -> The front door to our app.
├── 📄 index.tsx               -> The main brain that tells React what to do.
├── 📂 src/                    -> A treasure chest with all our app's code.
│   ├── 📂 components/         -> Reusable Lego blocks for our app's UI.
│   ├── 📂 hooks/              -> Special "superpowers" for our components.
│   ├── 📂 presets/            -> Different saved styles for the fluid.
│   ├── 📂 shaders/            -> The "magic paint" code that draws the fluid.
│   └── 📄 types.ts            -> A dictionary to keep our code organized.
├── 📂 Framer/                 -> Code for the special Framer version of our app.
│   ├── 📄 engine.tsx           -> The core fluid logic for Framer.
│   └── 📄 main.tsx             -> The main component file for Framer.
├── 📂 Flattened/              -> The whole app squished into one big file.
└── 📄 README.md              -> You are here! The map to the treasure chest.
```

---

