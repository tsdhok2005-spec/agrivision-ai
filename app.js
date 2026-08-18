/* API bridge: replace demo branches with calls to your Python/FastAPI backend.
   POST /predict/disease, /predict/pest, /predict/severity, /predict/soil, /predict/crop */
const API = {
  async analyzeImage(file) { return { demo: true, file }; },
  async analyzeSoil(values) { return { demo: true, values }; }
};

const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const pageTitles = { dashboard:['OVERVIEW','Good morning, grower.'], 'plant-analysis':['IMAGE INTELLIGENCE','Plant & pest analysis'], 'soil-analysis':['FIELD INTELLIGENCE','Soil health & crop suitability'], models:['MODEL OBSERVABILITY','Model analysis'], history:['ANALYSIS LOG','Field history'], report:['COMPLETE REPORT','Complete analysis report'] };
function showPage(id) { if (!document.getElementById(id)) return; pages.forEach(p=>p.classList.toggle('active',p.id===id)); navLinks.forEach(l=>l.classList.toggle('active',l.dataset.page===id)); document.getElementById('page-kicker').textContent=pageTitles[id][0]; document.getElementById('page-title').textContent=pageTitles[id][1]; window.scrollTo({top:0,behavior:'smooth'}); document.querySelector('.sidebar').classList.remove('open'); }
document.querySelectorAll('[data-go], .nav-link').forEach(el=>el.addEventListener('click', e=>{const id=el.dataset.go||el.dataset.page; if(id){e.preventDefault();showPage(id);history.replaceState(null,'','#'+id)}}));
window.addEventListener('hashchange',()=>showPage(location.hash.slice(1)||'dashboard')); if(location.hash)showPage(location.hash.slice(1));
document.querySelector('.menu-btn').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('open'));
const upload=document.getElementById('image-upload'), preview=document.getElementById('image-preview');
upload.addEventListener('change',()=>{const file=upload.files[0];if(!file)return;const url=URL.createObjectURL(file);preview.src=url;document.getElementById('result-image').src=url;preview.classList.add('show');document.getElementById('upload-empty').classList.add('hidden');});
function toast(message){const t=document.getElementById('toast');t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500)}
document.getElementById('analyze-image').addEventListener('click',async()=>{if(!upload.files[0]){toast('Choose a plant image first.');return;}await API.analyzeImage(upload.files[0]);document.querySelector('#image-result .empty-result').classList.add('hidden');document.querySelector('#image-result .result-content').classList.remove('hidden');document.getElementById('explain-section').classList.remove('hidden');toast('Demo image analysis complete — connect an API for live predictions.');});
document.getElementById('soil-form').addEventListener('submit',async e=>{e.preventDefault();await API.analyzeSoil(Object.fromEntries(new FormData(e.target)));document.querySelector('#soil-results .empty-result').classList.add('hidden');document.querySelector('#soil-results .soil-content').classList.remove('hidden');document.getElementById('crops-section').classList.remove('hidden');toast('Demo soil assessment complete — connect an API for live predictions.');});
document.getElementById('download-report').addEventListener('click',()=>{const text='AGRIVISION AI — COMPLETE ANALYSIS REPORT\n\nDEMO DATA (no ML API connected)\n\nPlant health: Leaf Spot · 94% confidence · 46% moderate severity\nSoil health: Good · 78/100\nRecommended crop: Wheat · 91% suitability\n\nRecommended action: Treat affected tomato leaves and monitor the north plot in 3 days.\n';const blob=new Blob([text],{type:'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='agrivision-demo-report.txt';a.click();URL.revokeObjectURL(a.href);toast('Demo report downloaded.');});
