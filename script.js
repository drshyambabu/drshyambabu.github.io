document.getElementById("year").textContent = new Date().getFullYear();

const search = document.getElementById("search");
const cards = [...document.querySelectorAll(".repo-card")];

search.addEventListener("input", () => {
  const q = search.value.trim().toLowerCase();
  cards.forEach(card => {
    card.style.display = card.dataset.search.includes(q) ? "flex" : "none";
  });
});

const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".site-header nav");
menuBtn.addEventListener("click", () => {
  nav.style.display = nav.style.display === "flex" ? "none" : "flex";
  nav.style.flexDirection = "column";
  nav.style.position = "absolute";
  nav.style.right = "4%";
  nav.style.top = "68px";
  nav.style.background = "#fff";
  nav.style.padding = "18px";
  nav.style.border = "1px solid #e5eaf0";
  nav.style.borderRadius = "12px";
});
