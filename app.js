/* Live FastAPI client. The backend returns 503 until real trained model adapters
   are registered, so the interface never represents synthetic output as live AI. */
const API = {
  async request(path, options) {
    const response = await fetch(`/api${path}`, options);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.detail || 'The analysis service is unavailable.');
    return body;
  },
  analyzeImage(file) {
    const form = new FormData(); form.append('image', file);
    return this.request('/predict/disease', { method: 'POST', body: form });
  },
  analyzeSoil(values) {
    return this.request('/predict/soil', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(values) });
  },
  analyzeCrop(values) {
    return this.request('/predict/crop', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(values) });
  }
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
function showImageResult(result) { const root=document.querySelector('#image-result'); root.querySelector('.empty-result').classList.add('hidden'); root.querySelector('.result-content').classList.remove('hidden'); document.getElementById('explain-section').classList.remove('hidden'); const stats=root.querySelectorAll('.prediction-stats strong'); root.querySelector('.card-head h3').textContent=`${result.label} detected`; stats[0].textContent=`${Math.round(result.confidence*100)}%`; stats[1].textContent=result.severity == null ? '—' : `${Math.round(result.severity)}%`; stats[2].textContent=result.status.replace('_',' '); const factors=document.querySelectorAll('.factor-list>div'); result.explanation.slice(0,factors.length).forEach((factor,index)=>{factors[index].querySelector('span').textContent=factor.label; factors[index].querySelector('i').style.width=`${Math.abs(factor.contribution)*100}%`; factors[index].querySelector('b').textContent=factor.influence;}); }
function readSoilForm(form) { const values=[...form.querySelectorAll('input')].map(input=>Number(input.value)); return {nitrogen:values[0],phosphorus:values[1],potassium:values[2],ph:values[3],moisture:values[4],temperature:values[5],humidity:values[6],rainfall:values[7],soil_type:form.querySelector('select').value.toLowerCase()}; }
function showSoilResult(result,crop) { const root=document.querySelector('#soil-results'); root.querySelector('.empty-result').classList.add('hidden'); root.querySelector('.soil-content').classList.remove('hidden'); document.getElementById('crops-section').classList.remove('hidden'); root.querySelector('.card-head h3').textContent=`Soil health: ${result.status}`; root.querySelector('.big-score strong').textContent=Math.round(result.score); root.querySelector('.good-tag').textContent=`${Math.round(result.score)} / 100`; const statuses=root.querySelectorAll('.nutrient-grid b'); ['N','P','K','pH'].forEach((key,index)=>statuses[index].textContent=result.nutrient_status[key] || 'Unknown'); if(crop?.recommendations?.length){const top=crop.recommendations[0];document.querySelector('.crop-rank h3').childNodes[0].textContent=`${top.crop} `;document.querySelector('.suitability b').textContent=`${Math.round(top.suitability*100)}%`;document.querySelector('.suitability em').style.width=`${top.suitability*100}%`;}}
document.getElementById('analyze-image').addEventListener('click',async()=>{if(!upload.files[0]){toast('Choose a plant image first.');return;}try{const result=await API.analyzeImage(upload.files[0]);showImageResult(result);toast('Live disease analysis complete.');}catch(error){toast(error.message);}});
document.getElementById('soil-form').addEventListener('submit',async e=>{e.preventDefault();const values=readSoilForm(e.target);try{const [soil,crop]=await Promise.all([API.analyzeSoil(values),API.analyzeCrop(values)]);showSoilResult(soil,crop);toast('Live soil and crop analysis complete.');}catch(error){toast(error.message);}});
document.getElementById('download-report').addEventListener('click',()=>{const text='AGRIVISION AI — COMPLETE ANALYSIS REPORT\n\nDEMO DATA (no ML API connected)\n\nPlant health: Leaf Spot · 94% confidence · 46% moderate severity\nSoil health: Good · 78/100\nRecommended crop: Wheat · 91% suitability\n\nRecommended action: Treat affected tomato leaves and monitor the north plot in 3 days.\n';const blob=new Blob([text],{type:'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='agrivision-demo-report.txt';a.click();URL.revokeObjectURL(a.href);toast('Demo report downloaded.');});
