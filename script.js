document.getElementById("year").textContent = new Date().getFullYear();
const OWNER = "drshyambabu",
  REPO = "drshyambabu.github.io",
  BRANCH = "main",
  ROOT = "study-material";
const labels = {
  all: "All Resources",
  physics: "Physics",
  history: "History",
  polity: "Indian Polity",
  "general-science": "General Science",
  geography: "Geography",
  economy: "Economy",
  "social-issues": "Social Issues",
  "competitive-exams": "Competitive Exams",
  "previous-papers": "Previous Papers",
};
const icons = {
  physics: "⚛️",
  history: "🏛️",
  polity: "⚖️",
  "general-science": "🔬",
  geography: "🌍",
  economy: "📈",
  "social-issues": "🌐",
  "competitive-exams": "🎯",
  "previous-papers": "📝",
};
let files = [],
  active = "all";
const el = (id) => document.getElementById(id);
function title(path) {
  return path
    .split("/")
    .pop()
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
function category(path) {
  let p = path.split("/"),
    i = p.indexOf(ROOT);
  return i >= 0 && p[i + 1] ? p[i + 1].toLowerCase() : "";
}
async function load() {
  el("status").textContent = "Reading GitHub repository…";
  const u = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`;
  const r = await fetch(u, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!r.ok) throw Error("GitHub API " + r.status);
  const d = await r.json();
  files = (d.tree || [])
    .filter(
      (x) =>
        x.type === "blob" &&
        /\.pdf$/i.test(x.path) &&
        x.path.toLowerCase().startsWith(ROOT + "/")
    )
    .map((x) => {
      let c = category(x.path);
      return {
        path: x.path,
        title: title(x.path),
        category: c,
        url: `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${x.path .split("/") .map(encodeURIComponent) .join("/")}`,
      };
    });
  render();
}
function render() {
  const q = el("search").value.toLowerCase().trim();
  const shown = files.filter(
    (f) =>
      (active === "all" || f.category === active) &&
      (!q ||
        f.title.toLowerCase().includes(q) ||
        f.path.toLowerCase().includes(q))
  );
  el("resources").innerHTML = shown
    .map(
      (f) =>
        `<a class="resource" href="${ f.url }" target="_blank" rel="noopener"><span class="icon">${ icons[f.category] || "📄" }</span><div><b>${f.title}</b><small>${ labels[f.category] || "Study Material" } • PDF</small></div></a>`
    )
    .join("");
  el("empty").hidden = shown.length > 0;
  if (!shown.length)
    el("empty").textContent = files.length
      ? "No matching resources in this category."
      : "No PDFs found inside study-material yet.";
  el("status").textContent = `${shown.length} resource${ shown.length === 1 ? "" : "s" } available`;
}
document.querySelectorAll("#categories button").forEach(
  (b) =>
    (b.onclick = () => {
      document
        .querySelectorAll("#categories button")
        .forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      active = b.dataset.cat;
      el("heading").textContent = labels[active];
      render();
    })
);
el("search").oninput = render;
load().catch((e) => {
  el("status").textContent = "Could not read GitHub repository";
  el("empty").hidden = false;
  el("empty").textContent =
    "Repository could not be read. Check that the repository is public and refresh.";
  console.error(e);
});
document.getElementById("menu").onclick = () => {
  let n = document.querySelector("nav");
  n.style.display = n.style.display === "flex" ? "none" : "flex";
  n.style.flexDirection = "column";
  n.style.position = "absolute";
  n.style.right = "4%";
  n.style.top = "68px";
  n.style.background = "#fff";
  n.style.padding = "18px";
  n.style.border = "1px solid #e5eaf0";
  n.style.borderRadius = "12px";
};
