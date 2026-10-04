const CONFIG={url:'https://zqumthrpodjggnsfmhhp.supabase.co',key:localStorage.getItem('cineartz_supabase_key')||''};
let sb=null;
let state={user:null,videos:[],cats:[],tab:'cats',search:'',favorites:new Set(),downloads:[],auth:'login',loading:true,gate:false};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const icons={Car:'🚗',Festival:'✦',Politics:'🏛',Event:'▣',Others:'•••',Mafia:'◈',default:'▶'};
const categoryImages={
  car:'https://images.unsplash.com/photo-1564435147693-5e6503ba6999?auto=format&fit=crop&w=900&q=82',
  festival:'https://images.unsplash.com/photo-1600146698733-a339319d56e1?auto=format&fit=crop&w=900&q=82',
  politics:'https://upload.wikimedia.org/wikipedia/commons/c/c6/Official_portrait_of_Narendra_Modi%2C_2022.jpg',
  event:'https://images.unsplash.com/photo-1753030722011-c50785aa569b?auto=format&fit=crop&w=900&q=82',
  mafia:'https://images.unsplash.com/photo-1611493098655-11e33398b64e?auto=format&fit=crop&w=900&q=82',
  others:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=82'
};
function categoryKey(name){const n=String(name||'').toLowerCase();if(n.includes('car')||n.includes('delivery')||n.includes('auto'))return 'car';if(n.includes('festival')||n.includes('firework'))return 'festival';if(n.includes('politic')||n.includes('government')||n.includes('election'))return 'politics';if(n.includes('event')||n.includes('wedding')||n.includes('concert'))return 'event';if(n.includes('mafia')||n.includes('gang')||n.includes('crime'))return 'mafia';return 'others'}
function categoryImage(name){return categoryImages[categoryKey(name)]||categoryImages.others}
function categoryClick(e,id){if(e)e.preventDefault();openCategory(id)}
function openCategory(id){const cat=state.cats.find(c=>String(c.id)===String(id));if(!cat){console.error('Category not found:',id,state.cats);return}categoryPageById(cat.id)}
function categoryPageById(id){const cat=state.cats.find(c=>String(c.id)===String(id));if(!cat)return;const name=cat.name||'Others';const list=state.videos.filter(v=>String(v.category_id)===String(id));const img=categoryImage(name);document.body.innerHTML=`<main class="screen category-screen">${header(name,true)}<div class="category-hero" style="background-image:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.88)),url('${img}')"><div class="category-hero-content"><div class="category-hero-icon">${icons[name]||icons[categoryKey(name)]||icons.default}</div><h1>${esc(name)}</h1><p>${list.length} video${list.length===1?'':'s'} • Original quality</p></div></div><div class="category-actions"><button class="primary" onclick="uploadToCategoryById(${JSON.stringify(cat.id)})">＋ Upload to ${esc(name)}</button><button class="secondary" onclick="tab('downloads')">⇩ Downloads</button></div><div class="section-title"><h2>${esc(name)} Videos</h2><span>No compression</span></div><div class="recent-grid">${list.map(recentCard).join('')||'<div class="empty">No videos in this category yet.<br>Tap Upload to add the first one.</div>'}</div><div class="quality-note">Original file • No compression • No resizing • Same uploaded quality</div></main>`}
function uploadToCategoryById(id){const cat=state.cats.find(c=>String(c.id)===String(id));if(!cat)return;state.uploadCategoryId=cat.id;state.uploadCategoryName=cat.name;state.tab='upload';app()}
window.openCategory=openCategory;window.categoryPageById=categoryPageById;window.uploadToCategoryById=uploadToCategoryById
window.categoryClick=categoryClick;
function ready(){return /^https:\/\/[^\s]+$/.test(CONFIG.url)&&/^sb_publishable_[A-Za-z0-9_-]+$/.test(CONFIG.key)}
function saveKey(key){const clean=String(key||'').trim();localStorage.setItem('cineartz_supabase_key',clean);CONFIG.key=clean}
function clearKey(){localStorage.removeItem('cineartz_supabase_key');CONFIG.key='';sb=null}
function setupPage(message=''){document.body.innerHTML=`<main class="auth-screen"><div class="auth-logo">cineartz036</div><div class="auth-tag">From RAW shorts → to Real</div><div class="auth-card compact setup-card"><div class="eyebrow">ONE-TIME CONNECTION</div><h1>Connect Supabase</h1><p class="muted">Paste your current Supabase <b>Publishable Key</b>. Your key stays on this iPhone/browser.</p><div class="form"><input id="setup-url" class="field" value="${esc(CONFIG.url)}" placeholder="Project URL"><input id="setup-key" class="field" type="password" placeholder="sb_publishable_…" autocomplete="off"><button class="primary" onclick="connectSupabase()">Connect & Continue <span>→</span></button><button class="secondary" onclick="clearKey();setupPage()">Clear Saved Key</button><div id="setup-msg" class="msg ${message?'':'hidden'}">${esc(message)}</div></div></div></main>`;const k=$('#setup-key');if(k)k.focus()}
async function connectSupabase(){const url=$('#setup-url').value.trim().replace(/\/$/,'');const key=$('#setup-key').value.trim();const m=$('#setup-msg');m.classList.remove('hidden');if(!/^https:\/\//.test(url)){m.textContent='Enter a valid Supabase Project URL.';return}if(!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)){m.textContent='Enter a valid Supabase Publishable Key starting with sb_publishable_. Do not use a secret key.';return}m.textContent='Checking connection…';try{const test=window.supabase.createClient(url,key);const r=await test.auth.getSession();if(r.error){m.textContent=r.error.message;return}localStorage.setItem('cineartz_supabase_url',url);saveKey(key);CONFIG.url=url;sb=test;m.textContent='Connected. Loading CineArtz036…';setTimeout(()=>init(),250)}catch(e){m.textContent=e?.message||'Could not connect to Supabase.'}}
window.connectSupabase=connectSupabase
async function init(){
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
  if(!CONFIG.url){CONFIG.url=localStorage.getItem('cineartz_supabase_url')||'https://zqumthrpodjggnsfmhhp.supabase.co'}
  if(!ready()){state.loading=false;render();return}
  try{
    sb=window.supabase.createClient(CONFIG.url,CONFIG.key);
    const {data,error}=await sb.auth.getSession();
    if(error) throw error;
    state.user=data.session?.user||null;
    if(state.user) await loadData();
    state.loading=false;
    state.gate=!!state.user;
    render();
  }catch(e){
    state.loading=false;
    if(/invalid api key|apikey|api key/i.test(e?.message||'')){clearKey();setupPage('The saved Supabase key was rejected. Paste the current Publishable Key from Supabase → Project Settings → API Keys.')}else{setupPage(e?.message||'Supabase connection failed.')}
  }
}
async function loadData(){
  const [c,v,f]=await Promise.all([
    sb.from('categories').select('*').order('sort_order'),
    sb.from('videos').select('*').eq('status','ready').order('created_at',{ascending:false}).limit(100),
    sb.from('favorites').select('video_id').eq('user_id',state.user.id)
  ]);
  if(c.error) throw c.error;
  if(v.error) throw v.error;
  state.cats=c.data||[];
  state.videos=v.data||[];
  state.favorites=new Set(f.error?[]:(f.data||[]).map(x=>x.video_id));
}
function render(){
  if(state.loading){document.body.innerHTML='<main class="splash"><div class="camera-glow"></div><div class="logo-big">cineartz036</div><div class="tagline">From RAW shorts → to Real</div><div class="loader"><i></i></div><div class="loading-copy">Creating Stories...<br><span>One Frame at a Time</span></div></main>';return}
  if(!ready()){setupPage();return}
  if(!state.user){authPage();return}
  if(state.gate){brandGate();return}
  app();
}
function authPage(){
  if(state.auth==='signup'){
    document.body.innerHTML=`<main class="auth-screen"><div class="auth-logo">cineartz036</div><div class="auth-tag">From RAW shorts → to Real</div><div class="auth-card"><div class="eyebrow">CREATE ACCOUNT</div><h1>Start creating.</h1><p class="muted">Build your own library of real moments and stories.</p><div class="form"><input id="name" class="field" placeholder="Full Name" autocomplete="name"><input id="email" class="field" type="email" placeholder="Email / Username" autocomplete="email"><input id="pass" class="field" type="password" placeholder="Password" autocomplete="new-password"><input id="pass2" class="field" type="password" placeholder="Confirm Password" autocomplete="new-password"><button class="primary" onclick="signUp()">Create Account <span>→</span></button><div id="msg" class="msg hidden"></div></div><div class="auth-switch">Already have an account? <button onclick="state.auth='login';authPage()">Login</button></div></div></main>`;
    return;
  }
  document.body.innerHTML=`<main class="auth-screen login-screen"><div class="auth-camera"></div><div class="auth-logo">cineartz036</div><div class="auth-tag">From RAW shorts → to Real</div><div class="welcome">Welcome Back!<span>Login to continue</span></div><div class="auth-card compact"><div class="form"><div class="field-wrap"><span>✉</span><input id="email" class="field" type="email" placeholder="Email / Username" autocomplete="email"></div><div class="field-wrap"><span>⌑</span><input id="pass" class="field" type="password" placeholder="Password" autocomplete="current-password"></div><button class="primary" onclick="signIn()">Login <span>→</span></button><div id="msg" class="msg hidden"></div></div><div class="or"><i></i> OR <i></i></div><button class="google">G&nbsp;&nbsp; Login with Google</button><div class="auth-switch">Don't have an account? <button onclick="state.auth='signup';authPage()">Sign Up</button></div></div></main>`;
}
async function signIn(){
  const email=$('#email').value.trim(),password=$('#pass').value,m=$('#msg');m.classList.remove('hidden');
  if(!email||!password){m.textContent='Email and password are required.';return}
  const r=await sb.auth.signInWithPassword({email,password});
  if(r.error){m.textContent=r.error.message;return}
  state.user=r.data.user;await loadData();state.gate=true;render();
}
async function signUp(){
  const name=$('#name').value.trim(),email=$('#email').value.trim(),password=$('#pass').value,pass2=$('#pass2').value,m=$('#msg');m.classList.remove('hidden');
  if(!name||!email||!password||!pass2){m.textContent='Please complete all fields.';return}
  if(password.length<6){m.textContent='Password must be at least 6 characters.';return}
  if(password!==pass2){m.textContent='Passwords do not match.';return}
  const r=await sb.auth.signUp({email,password,options:{data:{full_name:name}}});
  if(r.error){m.textContent=r.error.message;return}
  if(r.data.session) await sb.auth.signOut();
  state.auth='login';authPage();setTimeout(()=>{const x=$('#msg');if(x){x.classList.remove('hidden');x.textContent='Account created successfully. Please login.'}},30);
}
window.signIn=signIn;window.signUp=signUp;
function brandGate(){
  document.body.innerHTML=`<main class="brand-gate"><div class="gate-camera"></div><div class="gate-content"><div class="gate-logo" onclick="enterCategories()">cineartz036</div><div class="gate-tag">From RAW shorts → to Real</div><div class="gate-line"><i></i></div><div class="gate-hint">Tap the logo to continue</div></div></main>`;
  requestAnimationFrame(()=>document.body.classList.add('gate-ready'));
}
function enterCategories(){state.gate=false;state.tab='cats';app();cats(document.querySelector('#view'));}
window.enterCategories=enterCategories;
function app(){
  document.body.innerHTML='<div id="view"></div><button class="fab" onclick="tab(\'upload\')">＋</button><nav class="bottom"><button id="nav-home" onclick="tab(\'home\')">⌂<small>Home</small></button><button id="nav-cats" onclick="tab(\'cats\')">▦<small>Categories</small></button><button id="nav-downloads" onclick="tab(\'downloads\')">⇩<small>Downloads</small></button><button id="nav-profile" onclick="tab(\'profile\')">◉<small>Profile</small></button></nav>';view();
}
function tab(t){state.tab=t;view()}
function view(){const v=$('#view');if(!v)return;['home','cats','downloads','profile'].forEach(t=>{const b=$('#nav-'+t);if(b)b.classList.toggle('active',state.tab===t)});if(state.tab==='home')home(v);else if(state.tab==='cats')cats(v);else if(state.tab==='downloads')downloads(v);else if(state.tab==='upload')upload(v);else profile(v);requestAnimationFrame(()=>document.body.classList.add('page-ready'))}
function goBack(){ if(state.tab==='upload'){state.tab='cats';app();return} state.tab='cats';app(); }
window.goBack=goBack;
function header(title,back=false){return `<div class="topbar">${back?'<button class="icon-btn" onclick="goBack()">‹</button>':'<button class="icon-btn">☰</button>'}<div class="brand">cineartz036<div>From RAW shorts → to Real</div></div><button class="icon-btn">⌕</button></div>`}
function home(v){
  const list=state.videos.filter(x=>(x.title||'').toLowerCase().includes(state.search.toLowerCase()));
  const cats=state.cats.slice(0,4);
  v.innerHTML=`<main class="screen">${header()}<div class="searchbox"><span>⌕</span><input placeholder="Search videos, categories..." oninput="state.search=this.value;home(document.querySelector('#view'))" value="${esc(state.search)}"></div><div class="hero"><div><b>Real Moments</b><b>Real Stories</b><span>From RAW shorts → to Real</span></div><div class="hero-person">◒</div></div><div class="section-title"><h2>Categories</h2><button onclick="tab('cats')">See All →</button></div><div class="cat-grid">${cats.map(catCard).join('')}</div><div class="section-title"><h2>Recently Added</h2><button onclick="tab('cats')">See All →</button></div><div class="recent-grid">${list.slice(0,6).map(recentCard).join('')||'<div class="empty">No videos added yet.</div>'}</div></main>`;
}
function catCard(c,i){const n=(c.name||'Others'),icon=icons[n]||icons[categoryKey(n)]||icons.default;return `<button class="cat-card c${i}" style="--cat-image:url('${categoryImage(n)}')" data-category-id="${esc(c.id)}" onclick="openCategory(this.dataset.categoryId)"><div class="cat-icon">${icon}</div><div><b>${esc(n)}</b><small>${state.videos.filter(v=>v.category_id===c.id).length} Videos</small></div><span>›</span></button>`}
function recentCard(x){return `<button class="recent-card" onclick="detail(${JSON.stringify(x.id)})"><div class="thumb art-${Math.abs(hash(x.id))%6}"><span>▶</span><em>${formatDuration(x)}</em></div><b>${esc(x.title)}</b><small>${esc(x.original_filename||'Video')}</small></button>`}
function hash(s){let h=0;for(let i=0;i<s.length;i++)h=(h<<5)-h+s.charCodeAt(i)|0;return h}
function formatDuration(x){return x.duration_seconds?new Date(x.duration_seconds*1000).toISOString().substr(14,5):'00:48'}
function cats(v){v.innerHTML=`<main class="screen">${header('Categories',false)}<div class="page-title"><div><h1>Categories</h1><span>Explore your video library</span></div></div><div class="quick-actions"><button onclick="tab('upload')"><b>＋</b><span>Upload Video</span><small>Add your original video</small></button><button onclick="tab('downloads')"><b>⇩</b><span>Downloads</span><small>Saved videos</small></button></div><div class="section-title"><h2>Collections</h2><span>${state.cats.length} categories</span></div><div class="category-list">${state.cats.map((c,i)=>catLarge(c,i)).join('')}</div></main>`}
function catLarge(c,i){const n=c.name||'Others';return `<button type="button" class="cat-large c${i%6}" data-category-id="${esc(c.id)}" style="--cat-image:url('${categoryImage(n)}')" onclick="openCategory(this.dataset.categoryId)"><div class="large-icon">${icons[n]||icons[categoryKey(n)]||icons.default}</div><div><b>${esc(n)}</b><small>${state.videos.filter(v=>String(v.category_id)===String(c.id)).length} Videos</small></div><span>›</span></button>`}
function categoryPage(name){const cat=state.cats.find(c=>String(c.name).toLowerCase()===String(name).toLowerCase());const list=cat?state.videos.filter(v=>v.category_id===cat.id):state.videos.filter(v=>(v.title||'').toLowerCase().includes(String(name).toLowerCase()));const img=categoryImage(name);document.body.innerHTML=`<main class="screen category-screen">${header(name,true)}<div class="category-hero" style="background-image:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.88)),url('${img}')"><div class="category-hero-content"><div class="category-hero-icon">${icons[name]||icons[categoryKey(name)]||icons.default}</div><h1>${esc(name)}</h1><p>${list.length} video${list.length===1?'':'s'} • Original quality</p></div></div><div class="category-actions"><button class="primary" onclick="uploadToCategory(${JSON.stringify(name)})">＋ Upload to ${esc(name)}</button><button class="secondary" onclick="tab('downloads')">⇩ Downloads</button></div><div class="section-title"><h2>${esc(name)} Videos</h2><span>No compression</span></div><div class="recent-grid">${list.map(recentCard).join('')||'<div class="empty">No videos in this category yet.<br>Tap Upload to add the first one.</div>'}</div><div class="quality-note">Original file • No compression • No resizing • Same uploaded quality</div></main>`}
window.categoryPage=categoryPage;
function uploadToCategory(name){state.uploadCategoryName=name;state.tab='upload';app()}
async function upload(v){
  const preset=state.uploadCategoryName||'';const presetId=state.uploadCategoryId||'';
  v.innerHTML=`<main class="screen upload-screen">${header('Upload Video',true)}<div class="page-title"><div><h1>Upload Video</h1><span>Original file • no compression</span></div></div><div class="upload-card"><div class="dropzone" id="dropzone"><input id="uf" class="video-file-input" type="file" accept="video/*" capture="environment" onchange="showFile(this)"><span class="cloud">⇧</span><b>Tap to choose a video</b><small>iPhone Photos / Gallery / Files</small><strong id="file-name">No video selected</strong><span class="choose-video-btn">Choose Video</span></div><div class="quality-panel"><b>ORIGINAL VIDEO UPLOAD</b><span>Your selected video is uploaded as the original file. No compression, resizing, FPS conversion or re-encoding.</span></div><button class="primary upload-submit" onclick="doUpload()">⇧ &nbsp; Upload Video</button><div class="upload-progress hidden" id="upload-progress"><div class="progress-track"><i></i></div><span id="upload-progress-text">Preparing…</span></div><div id="um" class="msg hidden"></div></div></main>`;
}

function showFile(input){const f=input.files&&input.files[0],n=$('#file-name');if(n)n.textContent=f?`${f.name} • ${formatBytes(f.size)}`:'No video selected';if(f){const dz=$('#dropzone');if(dz)dz.classList.add('has-file')}}
window.showFile=showFile;
function formatBytes(n){if(!n)return '0 B';const u=['B','KB','MB','GB'];let i=0,v=n;while(v>=1024&&i<u.length-1){v/=1024;i++}return (i===0?v.toFixed(0):v.toFixed(v>=100?0:v>=10?1:2))+' '+u[i]}
async function doUpload(){
  const file=$('#uf')?.files?.[0],m=$('#um'),btn=document.querySelector('.upload-submit'),progress=$('#upload-progress'),pt=$('#upload-progress-text');
  m.classList.remove('hidden');
  if(!file){m.textContent='Please tap Choose Video and select a video from your iPhone.';return}
  if(!file.type.startsWith('video/')){m.textContent='Please select a video file.';return}
  if(!state.user){m.textContent='Please login again.';return}
  if(file.size===0){m.textContent='This video file is empty.';return}
  if(btn)btn.disabled=true;if(progress)progress.classList.remove('hidden');
  const setProgress=(pct,msg)=>{const bar=progress?.querySelector('.progress-track i');if(bar)bar.style.width=pct+'%';if(pt)pt.textContent=msg};
  try{
    setProgress(5,'Preparing original video…');
    const id=crypto.randomUUID();
    const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
    const path=state.user.id+'/'+id+'/'+safeName;
    setProgress(15,'Uploading original video…');
    const up=await sb.storage.from('videos-original').upload(path,file,{contentType:file.type,upsert:false,cacheControl:'3600'});
    if(up.error)throw up.error;
    setProgress(80,'Saving video…');
    const categoryId=$('#uc')?.value||state.uploadCategoryId||null;
    const title=file.name.replace(/\.[^/.]+$/,'')||'Uploaded Video';
    const ins=await sb.from('videos').insert({id,owner_id:state.user.id,category_id:categoryId,title,description:'',original_filename:file.name,storage_path:path,mime_type:file.type,file_size_bytes:file.size,status:'ready'});
    if(ins.error){await sb.storage.from('videos-original').remove([path]);throw ins.error}
    setProgress(100,'Upload complete • original file saved');
    m.textContent=`Uploaded successfully • ${formatBytes(file.size)} • Original quality preserved.`;
    await loadData();
    const target=categoryId;state.uploadCategoryName='';state.uploadCategoryId='';
    setTimeout(()=>target?categoryPageById(target):tab('cats'),700);
  }catch(e){m.textContent=e?.message||'Upload failed. Please try again.';if(progress)progress.classList.add('hidden');if(btn)btn.disabled=false}
}
window.doUpload=doUpload;

async function detail(id){
  const x=state.videos.find(v=>v.id===id);if(!x)return;
  document.body.innerHTML=`<main class="screen detail-screen video-loading"><div class="detail-top">${header('',true)}</div><div class="video-shell"><div class="video-loader"><div class="spinner"></div><span>Loading original video…</span></div></div><div class="detail-copy"><h1>${esc(x.title)}</h1><div class="meta-row"><span>◉ ${esc(categoryName(x.category_id))}</span><span>▣ ${new Date(x.created_at).toLocaleDateString()}</span><span>◉ ${esc(formatBytes(x.file_size_bytes))}</span></div><p class="description">${esc(x.description||'Beautiful original moment captured and edited by CineArtz036.')}</p><div class="detail-actions"><button onclick="favorite(${JSON.stringify(x.id)})">♡ ${state.favorites.has(x.id)?'Favorited':'Favorite'}</button><button class="download-btn" onclick="downloadVideo(${JSON.stringify(x.id)})">⇩ Download Original</button></div><div class="quality-note">Original stored file • No compression • No resizing • No FPS conversion</div></div></main>`;
  const signed=await sb.storage.from('videos-original').createSignedUrl(x.storage_path,3600);
  const url=signed.data?.signedUrl;
  const shell=document.querySelector('.video-shell');
  if(!shell)return;
  if(!url){shell.innerHTML='<div class="empty">Video unavailable</div>';return}
  shell.innerHTML=`<video class="cine-video" controls playsinline webkit-playsinline preload="metadata" src="${esc(url)}"></video><div class="video-badge">ORIGINAL</div>`;
  requestAnimationFrame(()=>document.body.classList.add('page-ready'));
}
function categoryName(id){return state.cats.find(c=>String(c.id)===String(id))?.name||'Others'}
window.detail=detail;
async function favorite(id){if(state.favorites.has(id)){await sb.from('favorites').delete().eq('user_id',state.user.id).eq('video_id',id);state.favorites.delete(id)}else{await sb.from('favorites').insert({user_id:state.user.id,video_id:id});state.favorites.add(id)}detail(id)}
async function downloadVideo(id){
  const x=state.videos.find(v=>v.id===id);if(!x)return;
  const btn=document.querySelector('.download-btn');
  if(btn){btn.disabled=true;btn.textContent='Preparing original…'}
  try{
    const r=await sb.storage.from('videos-original').createSignedUrl(x.storage_path,3600,{download:x.original_filename||'video.mp4'});
    const url=r.data?.signedUrl;
    if(!url)throw new Error(r.error?.message||'Download link could not be created.');
    state.downloads=JSON.parse(localStorage.getItem('cineartz_downloads')||'[]').filter(d=>d.id!==x.id);
    state.downloads.unshift({id:x.id,title:x.title,storage_path:x.storage_path,filename:x.original_filename,size:x.file_size_bytes,mime:x.mime_type,date:Date.now()});
    state.downloads=state.downloads.slice(0,30);localStorage.setItem('cineartz_downloads',JSON.stringify(state.downloads));
    const a=document.createElement('a');a.href=url;a.download=x.original_filename||'video.mp4';a.rel='noopener';a.target='_blank';document.body.appendChild(a);a.click();a.remove();
    if(btn){btn.disabled=false;btn.textContent='✓ Original Download Started'}
  }catch(e){
    if(btn){btn.disabled=false;btn.textContent='⇩ Download Original'}
    alert(e?.message||'Download failed.');
  }
}
async function openDownload(id){const d=state.downloads.find(x=>x.id===id);if(!d)return;const r=await sb.storage.from('videos-original').createSignedUrl(d.storage_path,3600,{download:d.filename||'video.mp4'});const url=r.data?.signedUrl;if(url)window.open(url,'_blank','noopener')}

function downloads(v){state.downloads=JSON.parse(localStorage.getItem('cineartz_downloads')||'[]');v.innerHTML=`<main class="screen">${header('Downloads',true)}<div class="page-title"><h1>Downloads</h1><span>${state.downloads.length} saved</span></div><div class="download-list">${state.downloads.map(d=>`<button class="download-row" onclick="openDownload(${JSON.stringify(d.id)})"><div class="download-thumb">▶</div><div><b>${esc(d.title)}</b><small>${esc(d.filename||'Original video')} · ${esc(formatBytes(d.size))}</small></div><span>⇩</span></button>`).join('')||'<div class="empty">Your downloaded videos will appear here.</div>'}</div><div class="quality-note">Downloads use the original stored file. No re-encoding or quality reduction is performed.</div></main>`}
function profile(v){v.innerHTML=`<main class="screen">${header('Profile')}<div class="profile-head"><div class="avatar">CA</div><div><h2>${esc(state.user?.user_metadata?.full_name||'cineartz036')}</h2><p>${esc(state.user?.email||'')}</p><span>● Active</span></div></div><div class="profile-menu"><button onclick="tab('upload')">⇧ <b>My Uploads</b><span>${state.videos.filter(x=>x.owner_id===state.user.id).length} ›</span></button><button onclick="tab('downloads')">⇩ <b>Downloads</b><span>${state.downloads.length} ›</span></button><button onclick="tab('home');state.search=''">♡ <b>Favorites</b><span>${state.favorites.size} ›</span></button><button onclick="alert('Settings are available in the web app preferences.')">⚙ <b>Settings</b><span>›</span></button><button onclick="alert('CineArtz036 — From RAW shorts → to Real')">ⓘ <b>About App</b><span>›</span></button></div><div class="quote">Create Amazing Edits,<br><b>One Frame at a Time!</b></div><button class="logout" onclick="logout()">Log Out</button></main>`}
async function logout(){await sb.auth.signOut();state.user=null;state.videos=[];state.cats=[];state.favorites=new Set();state.auth='login';render()}
document.addEventListener('click',e=>{
  const card=e.target.closest?.('[data-category-id]');
  if(card){e.preventDefault();e.stopPropagation();openCategory(card.dataset.categoryId);return;}
});

init();
