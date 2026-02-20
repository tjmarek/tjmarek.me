const particlesContainer = document.getElementById("particles");
const colors = ["#F3A904", "#EDF2F7", "#e0e4e6", "#e4e5e0", "#f0f1f2"];
const shapes = ["circle", "square", "triangle", "hexagon"];
const prefersReducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* PARTICLES */
function createShapeElement(shape, color, size) {
  const div = document.createElement("div");
  div.style.position = "absolute";
  div.style.width = size + "px";
  div.style.height = size + "px";
  div.style.backgroundColor = color;

  if (color === "#F3A904") {
    div.style.boxShadow = `0 0 ${size * 0.2}px ${size / 15}px ${color}40`;
  } else {
    div.style.boxShadow = "0 0 8px rgba(0,0,0,0.08)";
  }

  switch (shape) {
    case "circle":
      div.style.borderRadius = "50%";
      break;
    case "triangle":
      div.style.width = "0";
      div.style.height = "0";
      div.style.backgroundColor = "transparent";
      div.style.borderLeft = `${size / 2}px solid transparent`;
      div.style.borderRight = `${size / 2}px solid transparent`;
      div.style.borderBottom = `${size}px solid ${color}`;
      div.style.boxShadow = "none";
      break;
    case "hexagon":
      div.style.clipPath =
        "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)";
      break;
  }

  return div;
}

function initBackgroundParticles() {
  if (!particlesContainer || prefersReducedMotion) return;

  const docWidth = document.documentElement.clientWidth;
  const baseCount = docWidth / 35;
  const count = Math.max(18, Math.min(baseCount, 80));

  particlesContainer.innerHTML = "";
  const w = window.innerWidth;
  const h = window.innerHeight;

  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const size = Math.floor(Math.random() * 12) + 6;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    const div = createShapeElement(shape, color, size);
    div.style.left = x + "px";
    div.style.top = y + "px";
    div.style.opacity = (Math.random() * 0.6 + 0.2).toString();
    div.style.animation = `fall ${Math.random() * 15 + 10}s ease-in infinite`;
    div.style.setProperty("--rotation-end", `${Math.random() * 720 - 360}deg`);
    div.style.setProperty("--drift-x", `${Math.random() * 100 - 50}px`);

    particlesContainer.appendChild(div);
  }
}

function spawnOnClick(e) {
  if (!particlesContainer || prefersReducedMotion) return;

  const color = colors[Math.floor(Math.random() * colors.length)];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const size = Math.floor(Math.random() * 8) + 6;

  const div = createShapeElement(shape, color, size);
  div.style.left = e.clientX + "px";
  div.style.top = e.clientY + "px";
  div.style.animation = "fall 6s ease-in forwards";
  div.style.setProperty("--rotation-end", `${Math.random() * 720 - 360}deg`);
  div.style.setProperty("--drift-x", `${Math.random() * 60 - 30}px`);

  particlesContainer.appendChild(div);
  setTimeout(() => div.remove(), 6000);
}

/* CURSOR TRAIL */
function handleMouseMove(e) {
  if (prefersReducedMotion) return;

  const trail = document.createElement("div");
  trail.classList.add("cursor-trail");
  trail.style.left = `${e.clientX}px`;
  trail.style.top = `${e.clientY}px`;
  trail.style.setProperty("--angle", `${Math.random() * 360}deg`);
  document.body.appendChild(trail);
  setTimeout(() => trail.remove(), 600);
}

/* SKILLS BAR: tap to open on mobile */
function initSkillTiles() {
  const skillTiles = document.querySelectorAll(".skill-tile");

  skillTiles.forEach((tile) => {
    const headerButton = tile.querySelector(".skill-tile__header");
    if (!headerButton) return;

    headerButton.addEventListener("click", () => {
      const isDesktop = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      ).matches;
      if (isDesktop) return; // hover handles desktop

      skillTiles.forEach((t) => {
        if (t !== tile) t.classList.remove("skill-tile--open");
      });

      tile.classList.toggle("skill-tile--open");
    });
  });
}

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  if (!prefersReducedMotion) {
    setTimeout(initBackgroundParticles, 120);
  }

  document.addEventListener("click", spawnOnClick, { passive: true });
  document.addEventListener("mousemove", handleMouseMove, { passive: true });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initBackgroundParticles, 150);
  });

  initSkillTiles();
});
