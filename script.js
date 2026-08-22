document.getElementById("year").textContent=new Date().getFullYear();

const OWNER="drshyambabu";
const REPO="drshyambabu.github.io";
const ROOT="study-material";
const categories=[...document.querySelectorAll("#categories button")];
const resourcesEl=document.getElementById("resources");
const search=document.getElementById("search");
const statusEl=document.getElementById("status");
const emptyEl=document.getElementById("empty");
const heading=document.getElementById("heading");
let allFiles=[],active="all";

const labels={
  all:"All Resources",physics:"Physics",history:"History",polity:"Indian Polity",
  "general-science":"General Science",geography:"Geography",economy:"Economy",
  "competitive-exams":"Competitive Exams","previous-papers":"Previous Papers"
};

function titleFromFile(path){
  const name=path.split("/").pop().replace(/\.[^.]+$/,"");
  return name.replace(/[-_]+/g," ").replace(/\b\w/g,c=>c.toUpperCase());
}
function categoryFromPath(path){
  const parts=path.toLowerCase().split("/");
  const folder=parts[parts.indexOf(ROOT)+1]||"";
  return folder;
}
function iconFor(cat){
  return {physics:"⚛️",history:"🏛️",polity:"⚖️","general-science":"🔬",geography:"🌍",economy:"📈","competitive-exams":"🎯","previous-papers":"📝"}[cat]||"📄";
}
function render(){
  const q=search.value.trim().toLowerCase();
  const filtered=allFiles.filter(f=>(active==="all"||f.category===active)&&(!q||f.title.toLowerCase().includes(q)||f.path.toLowerCase().includes(q)));
  resourcesEl.innerHTML="";
  filtered.forEach(f=>{
    const a=document.createElement("a");
    a.className="resource"; a.href=f.url; a.target="_blank" rel="noopener";
    a.innerHTML=`<span class="icon">${iconFor(f.category)}</span><div><b>${f.title}</b><small>${labels[f.category]||"Study Material"} • PDF</small></div>`;
    resourcesEl.appendChild(a);
  });
  emptyEl.hidden=filtered.length!==0;
  statusEl.textContent=`${filtered.length} resource${filtered.length===1?"":"s"}`;
}
async function loadFolder(folder){
  const url=`https://api.github.com/repos/${OWNER}/${REPO}/contents/${ROOT}/${folder}`;
  const r=await fetch(url,{headers:{"Accept":"application/vnd.github+json"}});
  if(!r.ok)return[];
  const data=await r.json();
  return Array.isArray(data)?data.filter(x=>x.type==="file"&&/\.pdf$/i.test(x.name)).map(x=>({title:titleFromFile(x.path),path:x.path,url:x.html_url,category:folder})):[];
}
async function loadRepository(){
  statusEl.textContent="Loading repository…";
  const folders=categories.map(x=>x.dataset.cat).filter(x=>x!=="all");
  const results=await Promise.all(folders.map(loadFolder));
  allFiles=results.flat();
  if(allFiles.length===0){
    statusEl.textContent="No PDFs found yet";
    emptyEl.hidden=false;
    emptyEl.textContent="No PDFs found yet. Create the study-material folders and upload your first PDF.";
  }else render();
}
categories.forEach(c=>c.addEventListener("click",()=>{categories.forEach(x=>x.classList.remove("active"));c.classList.add("active");active=c.dataset.cat;heading.textContent=labels[active];render()}));
search.addEventListener("input",render);
loadRepository().catch(()=>{statusEl.textContent="Repository could not be loaded";emptyEl.hidden=false;emptyEl.textContent="Please check that the study-material folders exist in the GitHub repository."});

document.getElementById("menu").onclick=()=>{const n=document.querySelector("nav");n.style.display=n.style.display==="flex"?"none":"flex";n.style.flexDirection="column";n.style.position="absolute";n.style.right="4%";n.style.top="68px";n.style.background="#fff";n.style.padding="18px";n.style.border="1px solid #e5eaf0";n.style.borderRadius="12px"};