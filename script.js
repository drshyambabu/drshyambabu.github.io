document.getElementById("year").textContent = new Date().getFullYear();

const OWNER = "drshyambabu";
const REPO = "drshyambabu.github.io";
const BRANCH = "main";
const ROOT = "study-material";

const labels = {
  all: "All Resources",
  physics: "Physics",
  history: "History",
  polity: "Indian Polity",
  "general-science": "General Science",
  geography: "Geography",
  economy: "Economy",
  "social-issues": "Social Issues",
  "ai-technology": "AI & Technology",
  environment: "Environment",
  economics: "Economics",
  "competitive-exams": "Competitive Exams",
  "previous-papers": "Previous Papers"
};

const icons = {
  physics: "⚛️",
  history: "🏛️",
  polity: "⚖️",
  "general-science": "🔬",
  geography: "🌍",
  economy: "📈",
  "social-issues": "🌐",
  "ai-technology": "🤖",
  environment: "🌱",
  economics: "📊",
  "competitive-exams": "🎯",
  "previous-papers": "📝"
};

let files = [];
let active = "all";

const el = (id) => document.getElementById(id);


/* =========================================================
   FILE TITLE
   ========================================================= */

function title(path) {
  return path
    .split("/")
    .pop()
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}


/* =========================================================
   CATEGORY
   ========================================================= */

function category(path) {
  const p = path.split("/");
  const i = p.indexOf(ROOT);

  return i >= 0 && p[i + 1]
    ? p[i + 1].toLowerCase()
    : "";
}


/* =========================================================
   LOAD GITHUB REPOSITORY
   ========================================================= */

async function load() {

  el("status").textContent =
    "Reading GitHub repository…";

  const u =
    `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`;

  const r = await fetch(u, {
    headers: {
      Accept: "application/vnd.github+json"
    }
  });

  if (!r.ok) {
    throw Error("GitHub API " + r.status);
  }

  const d = await r.json();

  files = (d.tree || [])
    .filter(
      (x) =>
        x.type === "blob" &&
        /\.pdf$/i.test(x.path) &&
        x.path.toLowerCase().startsWith(ROOT + "/")
    )
    .map((x) => {

      const c = category(x.path);

      return {
        path: x.path,
        title: title(x.path),
        category: c,
        url:
          `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/` +
          x.path
            .split("/")
            .map(encodeURIComponent)
            .join("/")
      };

    });

  render();
}


/* =========================================================
   RENDER RESOURCES
   ========================================================= */

function render() {

  const q =
    el("search").value.toLowerCase().trim();

  const shown = files.filter(
    (f) =>
      (active === "all" || f.category === active) &&
      (
        !q ||
        f.title.toLowerCase().includes(q) ||
        f.path.toLowerCase().includes(q)
      )
  );

  el("resources").innerHTML = shown
    .map(
      (f) =>
        `<a class="resource"
            href="${f.url}"
            target="_blank"
            rel="noopener">
          <span class="icon">
            ${icons[f.category] || "📄"}
          </span>

          <div>
            <b>${f.title}</b>
            <small>
              ${labels[f.category] || "Study Material"} • PDF
            </small>
          </div>
        </a>`
    )
    .join("");

  el("empty").hidden = shown.length > 0;

  if (!shown.length) {

    el("empty").textContent =
      files.length
        ? "No matching resources in this category."
        : "No PDFs found inside study-material yet.";

  }

  el("status").textContent =
    `${shown.length} resource${shown.length === 1 ? "" : "s"} available`;
}


/* =========================================================
   NORMAL CATEGORY BUTTONS
   E-CONTENTS BUTTON IS EXCLUDED
   ========================================================= */

document
  .querySelectorAll("#categories button:not(.econtent-button)")
  .forEach((b) => {

    b.onclick = () => {

      document
        .querySelectorAll(
          "#categories button:not(.econtent-button)"
        )
        .forEach((x) =>
          x.classList.remove("active")
        );

      b.classList.add("active");

      active = b.dataset.cat;

      if (el("heading")) {
        el("heading").textContent =
          labels[active] || "All Resources";
      }

      render();
    };

  });


/* =========================================================
   SEARCH
   ========================================================= */

if (el("search")) {
  el("search").oninput = render;
}


/* =========================================================
   E-CONTENTS TOGGLE
   ========================================================= */

function toggleEContents() {

  const panel =
    document.getElementById("eContentsPanel");

  if (!panel) return;

  if (panel.style.display === "block") {

    panel.style.display = "none";

  } else {

    panel.style.display = "block";

  }
}


/* =========================================================
   CLASSICAL MECHANICS TOGGLE
   ========================================================= */

function toggleClassicalMechanics() {

  const content =
    document.getElementById(
      "classicalMechanicsContent"
    );

  if (!content) return;


  /*
     Your HTML uses:
     id="cm-arrow"

     This code also supports:
     id="cmArrow"
  */

  const arrow =
    document.getElementById("cm-arrow") ||
    document.getElementById("cmArrow");


  if (content.style.display === "block") {

    content.style.display = "none";

    if (arrow) {
      arrow.innerHTML = "+";
    }

  } else {

    content.style.display = "block";

    if (arrow) {
      arrow.innerHTML = "−";
    }

  }
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

const menu = document.getElementById("menu");

if (menu) {

  menu.onclick = () => {

    const n =
      document.querySelector("nav");

    if (!n) return;

    n.style.display =
      n.style.display === "flex"
        ? "none"
        : "flex";

    n.style.flexDirection = "column";
    n.style.position = "absolute";
    n.style.right = "4%";
    n.style.top = "68px";
    n.style.background = "#fff";
    n.style.padding = "18px";
    n.style.border = "1px solid #e5eaf0";
    n.style.borderRadius = "12px";

  };

}


/* =========================================================
   LOAD ERROR HANDLING
   ========================================================= */

load().catch((e) => {

  if (el("status")) {
    el("status").textContent =
      "Could not read GitHub repository";
  }

  if (el("empty")) {

    el("empty").hidden = false;

    el("empty").textContent =
      "Repository could not be read. Check that the repository is public and refresh.";

  }

  console.error(e);

});  );

  el("resources").innerHTML = shown
    .map(
      (f) =>
        `<a class="resource" href="${f.url}" target="_blank" rel="noopener">
          <span class="icon">${icons[f.category] || "📄"}</span>
          <div>
            <b>${f.title}</b>
            <small>${labels[f.category] || "Study Material"} • PDF</small>
          </div>
        </a>`
    )
    .join("");

  el("empty").hidden = shown.length > 0;

  if (!shown.length) {
    el("empty").textContent = files.length
      ? "No matching resources in this category."
      : "No PDFs found inside study-material yet.";
  }

  el("status").textContent =
    `${shown.length} resource${shown.length === 1 ? "" : "s"} available`;
}


/* =========================================================
   NORMAL RESOURCE CATEGORY BUTTONS
   E-CONTENTS IS EXCLUDED
   ========================================================= */

document
  .querySelectorAll("#categories button:not(.econtent-button)")
  .forEach((b) => {
    b.onclick = () => {

      document
        .querySelectorAll("#categories button:not(.econtent-button)")
        .forEach((x) => x.classList.remove("active"));

      b.classList.add("active");

      active = b.dataset.cat;

      el("heading").textContent =
        labels[active] || "All Resources";

      render();
    };
  });


/* =========================================================
   E-CONTENTS TOGGLE
   ========================================================= */

function toggleEContents() {

  const panel = document.getElementById("eContentsPanel");

  if (!panel) return;

  if (panel.style.display === "block") {
    panel.style.display = "none";
  } else {
    panel.style.display = "block";
  }
}


/* =========================================================
   CLASSICAL MECHANICS TOGGLE
   ========================================================= */

function toggleClassicalMechanics() {

  const content =
    document.getElementById("classicalMechanicsContent");

  const arrow =
    document.getElementById("cmArrow");

  if (!content) return;

  if (content.style.display === "block") {

    content.style.display = "none";

    if (arrow) {
      arrow.innerHTML = "+";
    }

  } else {

    content.style.display = "block";

    if (arrow) {
      arrow.innerHTML = "−";
    }
  }
}


/* =========================================================
   SEARCH
   ========================================================= */

el("search").oninput = render;


/* =========================================================
   LOAD REPOSITORY
   ========================================================= */

load().catch((e) => {

  el("status").textContent =
    "Could not read GitHub repository";

  el("empty").hidden = false;

  el("empty").textContent =
    "Repository could not be read. Check that the repository is public and refresh.";

  console.error(e);
});


/* =========================================================
   MOBILE MENU
   ========================================================= */

document.getElementById("menu").onclick = () => {

  let n = document.querySelector("nav");

  n.style.display =
    n.style.display === "flex" ? "none" : "flex";

  n.style.flexDirection = "column";
  n.style.position = "absolute";
  n.style.right = "4%";
  n.style.top = "68px";
  n.style.background = "#fff";
  n.style.padding = "18px";
  n.style.border = "1px solid #e5eaf0";
  n.style.borderRadius = "12px";
};        .querySelectorAll("#categories button")
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
function toggleEContents(){

  const panel =
    document.getElementById("eContentsPanel");

  if(panel.style.display === "block"){
    panel.style.display = "none";
  }else{
    panel.style.display = "block";
  }

}


function toggleClassicalMechanics(){

  const content =
    document.getElementById("classicalMechanicsContent");

  const arrow =
    document.getElementById("cmArrow");

  if(content.style.display === "block"){

    content.style.display = "none";
    arrow.innerHTML = "+";

  }else{

    content.style.display = "block";
    arrow.innerHTML = "−";

  }

}

