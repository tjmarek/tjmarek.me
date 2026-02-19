// COLORS & SHAPES FOR PARTICLES
const particlesContainer = document.getElementById("particles");
const colors = ["#F3A904", "#EDF2F7", "#e0e4e6", "#e4e5e0", "#f0f1f2"];
const shapes = ["circle", "square", "triangle", "hexagon"];

// Guard for environments without documentElement (SSR, etc.)
const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Create a single shape element
 */
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
      div.style.clipPath = "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)";
      break;
    default:
      break;
  }

  return div;
}

/**
 * Seed initial background particles
 */
function initBackgroundParticles() {
  if (!particlesContainer || prefersReducedMotion) return;

  const docWidth = document.documentElement.clientWidth;
  const baseCount = docWidth / 35;
  const count = Math.max(18, Math.min(baseCount, 80)); // clamp for perf

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

/**
 * Spawn single particle on click
 */
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

/**
 * Mouse trail effect
 */
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

/**
 * Bottom nav toggle
 */
function setupHeroNavToggle() {
  const trigger = document.querySelector(".hero-nav-trigger");
  const nav = document.querySelector(".hero-nav");
  if (!trigger || !nav) return;

  const toggleNav = () => {
    nav.classList.toggle("hero-nav--visible");
  };

  trigger.addEventListener("click", toggleNav);

  // Also open nav on hover for desktop
  let hoverTimeout;
  trigger.addEventListener("mouseenter", () => {
    if (window.matchMedia("(pointer: fine)").matches) {
      clearTimeout(hoverTimeout);
      nav.classList.add("hero-nav--visible");
    }
  });

  trigger.addEventListener("mouseleave", () => {
    if (window.matchMedia("(pointer: fine)").matches) {
      hoverTimeout = setTimeout(() => {
        nav.classList.remove("hero-nav--visible");
      }, 400);
    }
  });

  // Click outside to close
  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("hero-nav--visible")) return;
    const isTrigger = trigger.contains(e.target);
    const isNav = nav.contains(e.target);
    if (!isTrigger && !isNav) {
      nav.classList.remove("hero-nav--visible");
    }
  });
}

/**
 * Init on DOM ready
 */
document.addEventListener("DOMContentLoaded", () => {
  // Seed particles after a tiny delay to avoid blocking first paint
  if (!prefersReducedMotion) {
    window.setTimeout(() => {
      initBackgroundParticles();
    }, 150);
  }

  document.addEventListener("click", spawnOnClick, { passive: true });
  document.addEventListener("mousemove", handleMouseMove, { passive: true });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initBackgroundParticles, 150);
  });

  setupHeroNavToggle();
});

