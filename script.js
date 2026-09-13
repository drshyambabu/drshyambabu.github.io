document.getElementById("year").textContent = new Date().getFullYear();

const OWNER = "drshyambabu",
    REPO = "drshyambabu.github.io",
    BRANCH = "main",
    ROOT = "study-material";

const STUDY_ROOT = "study";

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


/* =========================
   CREATE TITLE
========================= */

function title(path) {

    return path
        .split("/")
        .pop()
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

}


/* =========================
   FIND CATEGORY
========================= */

function category(path) {

    let p = path.split("/");
    let i = p.indexOf(ROOT);

    if (i >= 0 && p[i + 1]) {
        return p[i + 1].toLowerCase();
    }

    return "";
}


/* =========================
   LOAD RESOURCES
========================= */

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


    /* =========================
       PDF RESOURCES
    ========================= */

    const pdfFiles = (d.tree || [])
        .filter(
            (x) =>
                x.type === "blob" &&
                /\.pdf$/i.test(x.path) &&
                x.path
                    .toLowerCase()
                    .startsWith(ROOT + "/")
        )
        .map((x) => {

            let c = category(x.path);

            return {

                path: x.path,

                title: title(x.path),

                category: c,

                type: "PDF",

                url:
                    `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${x.path
                        .split("/")
                        .map(encodeURIComponent)
                        .join("/")}`

            };

        });


    /* =========================
       HTML STUDY ARTICLES
       
       ONLY CATEGORY-LEVEL PAGES
       WILL APPEAR ON HOMEPAGE.
       
       Example:
       study/geography/indian-rivers/index.html
                             ↑
                  length = 4 → SHOW

       But:
       study/geography/index.html
                       ↑
                  length = 3 → HIDE

       And:
       study/geography/indian-rivers/ganga-river/index.html
                                      ↑
                  length = 5 → HIDE
    ========================= */

    const htmlFiles = (d.tree || [])
        .filter(
            (x) =>
                x.type === "blob" &&
                /\/index\.html$/i.test(x.path) &&
                x.path
                    .toLowerCase()
                    .startsWith(STUDY_ROOT + "/")
        )
        .filter(
            (x) =>
                !x.path
                    .toLowerCase()
                    .startsWith(
                        "study-material/"
                    )
        )
        .filter(
            (x) =>
                x.path.split("/").length === 4
        )
        .map((x) => {

            let parts = x.path.split("/");

            let c = "";

            if (
                parts.length >= 2 &&
                parts[1]
            ) {
                c = parts[1].toLowerCase();
            }

            let articleTitle =
                parts.length >= 3
                    ? parts[parts.length - 2]
                    : "Study Material";

            articleTitle =
                articleTitle
                    .replace(/[-_]+/g, " ")
                    .replace(/\b\w/g, (c) =>
                        c.toUpperCase()
                    );

            return {

                path: x.path,

                title: articleTitle,

                category: c,

                type: "ARTICLE",

                url:
                    `https://${location.host}/${x.path
                        .split("/")
                        .map(encodeURIComponent)
                        .join("/")}`

            };

        });


    /* =========================
       COMBINE PDF + ARTICLES
    ========================= */

    files = [
        ...pdfFiles,
        ...htmlFiles
    ];


    render();

}


/* =========================
   RENDER RESOURCES
========================= */

function render() {

    const q =
        el("search").value
            .toLowerCase()
            .trim();


    const shown =
        files.filter(
            (f) =>
                (
                    active === "all" ||
                    f.category === active
                )
                &&
                (
                    !q ||
                    f.title
                        .toLowerCase()
                        .includes(q)
                    ||
                    f.path
                        .toLowerCase()
                        .includes(q)
                )
        );


    el("resources").innerHTML =

        shown
            .map(
                (f) => {

                    const icon =
                        f.type === "ARTICLE"
                            ? "📖"
                            : (
                                icons[f.category]
                                || "📄"
                            );


                    const typeText =
                        f.type === "ARTICLE"
                            ? "Study Article"
                            : "PDF";


                    return `

<a class="resource"
   href="${f.url}"
   target="_blank"
   rel="noopener">

    <span class="icon">
        ${icon}
    </span>

    <div>

        <b>
            ${f.title}
        </b>

        <small>
            ${labels[f.category]
                || "Study Material"}
            •
            ${typeText}
        </small>

    </div>

</a>

`;

                }
            )
            .join("");


    el("empty").hidden =
        shown.length > 0;


    if (!shown.length) {

        el("empty").textContent =
            files.length
                ? "No matching resources in this category."
                : "No study resources found yet.";

    }


    el("status").textContent =
        `${shown.length} resource${shown.length === 1 ? "" : "s"} available`;

}


/* =========================
   CATEGORY BUTTONS
========================= */

document
    .querySelectorAll("#categories button")
    .forEach(

        (b) =>

            (b.onclick = () => {

                document
                    .querySelectorAll(
                        "#categories button"
                    )
                    .forEach(
                        (x) =>
                            x.classList
                                .remove("active")
                    );


                b.classList.add("active");

                active =
                    b.dataset.cat;


                el("heading").textContent =
                    labels[active];


                render();

            })

    );


/* =========================
   SEARCH
========================= */

el("search").oninput = render;


/* =========================
   LOAD ERROR
========================= */

load().catch((e) => {

    el("status").textContent =
        "Could not read GitHub repository";

    el("empty").hidden = false;

    el("empty").textContent =
        "Repository could not be read. Check that the repository is public and refresh.";

    console.error(e);

});


/* =========================
   MOBILE MENU
========================= */

document.getElementById("menu").onclick = () => {

    let n =
        document.querySelector("nav");


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


/* =========================
   E-CONTENTS
========================= */

function toggleEContents() {

    const panel =
        document.getElementById(
            "eContentsPanel"
        );


    if (
        panel.style.display === "block"
    ) {

        panel.style.display = "none";

    } else {

        panel.style.display = "block";

    }

}


/* =========================
   CLASSICAL MECHANICS
========================= */

function toggleClassicalMechanics() {

    const content =
        document.getElementById(
            "classicalMechanicsContent"
        );


    const arrow =
        document.getElementById(
            "cm-arrow"
        );


    if (
        content.style.display === "block"
    ) {

        content.style.display = "none";

        arrow.innerHTML = "+";

    } else {

        content.style.display = "block";

        arrow.innerHTML = "−";

    }

}


/* =========================
   UG CONTENT
========================= */

function openUGContent() {

    const panel =
        document.getElementById(
            "ugContent"
        );


    if (!panel) return;


    panel.style.display = "block";


    setTimeout(() => {

        panel.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }, 50);

}
