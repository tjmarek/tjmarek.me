document.addEventListener("DOMContentLoaded", () => {
  // existing init code for particles/nav here...

  // Skills bar: tap to open on mobile
  const skillTiles = document.querySelectorAll(".skill-tile");

  skillTiles.forEach((tile) => {
    const headerButton = tile.querySelector(".skill-tile__header");
    if (!headerButton) return;

    headerButton.addEventListener("click", () => {
      const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (isDesktop) {
        // On desktop, let hover handle it
        return;
      }

      // Close others
      skillTiles.forEach((t) => {
        if (t !== tile) t.classList.remove("skill-tile--open");
      });

      tile.classList.toggle("skill-tile--open");
    });
  });
});
