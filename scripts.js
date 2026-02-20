document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector('.background-animation');
  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 10;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 10;
    hero.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(1.03)`;
  });
});
