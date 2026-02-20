document.addEventListener("DOMContentLoaded", () => {
  const heroBg = document.querySelector('.background-animation');
  if (!heroBg) return;

  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;
    heroBg.style.transform = `translate(${x}px, ${y}px) scale(1.04)`;
  });
});
