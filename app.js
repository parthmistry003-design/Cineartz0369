const CONFIG={
  url:'https://zqumthrpodjggnsfmhhp.supabase.co',
  key:'sb_publishable_K21BgpeFWR6uDeCwNEqnvQ_rnI5IjHu'
};
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
function categoryClick(e,name){const el=e&&e.currentTarget;if(el){el.classList.add('cat-clicked');el.style.setProperty('--click-x',((e.clientX-el.getBoundingClientRect().left)/el.offsetWidth*100)+'%');el.style.setProperty('--click-y',((e.clientY-el.getBoundingClientRect().top)/el.offsetHeight*100)+'%');}setTimeout(()=>{state.search=name;tab('home')},220)}
window.categoryClick=categoryClick;
function ready(){return CONFIG.url.startsWith('http')&&CONFIG.key&&CONFIG.key!=='YOUR_SUPABASE_PUBLISHABLE_KEY'}
async function init(){
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
  if(!ready()){state.loading=false;render();return}
  sb=window.supabase.createClient(CONFIG.url,CONFIG.key);
  const {data}=await sb.auth.getSession();
  state.user=data.session?.user||null;
  if(state.user) await loadData();
  state.loading=false;
  state.gate=!!state.user;
  render();
}
async function loadData(){
  const [c,v,f]=await Promise.all([
    sb.from('categories').select('*').order('sort_order'),
    sb.from('videos').select('*').eq('status','ready').order('created_at',{ascending:false}).limit(100),
    sb.from('favorites').select('video_id').eq('user_id',state.user.id)
  ]);
  state.cats=c.data||[];state.videos=v.data||[];state.favorites=new Set((f.data||[]).map(x=>x.video_id));
}
function render(){
  if(state.loading){document.body.innerHTML='<main class="splash"><div class="camera-glow"></div><div class="logo-big">cineartz036</div><div class="tagline">From RAW shorts → to Real</div><div class="loader"><i></i></div><div class="loading-copy">Creating Stories...<br><span>One Frame at a Time</span></div></main>';return}
  if(!ready()){document.body.innerHTML='<main class="screen"><div class="panel setup"><h2>Connect CineArtz036</h2><p>Open <b>app.js</b> and add your Supabase Project URL and Publishable Key.</p></div></main>';return}
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
function view(){const v=$('#view');if(!v)return;['home','cats','downloads','profile'].forEach(t=>{const b=$('#nav-'+t);if(b)b.classList.toggle('active',state.tab===t)});if(state.tab==='home')home(v);else if(state.tab==='cats')cats(v);else if(state.tab==='downloads')downloads(v);else profile(v)}
function header(title,back=false){return `<div class="topbar">${back?'<button class="icon-btn" onclick="tab(\'home\')">‹</button>':'<button class="icon-btn">☰</button>'}<div class="brand">cineartz036<div>From RAW shorts → to Real</div></div><button class="icon-btn">⌕</button></div>`}
function home(v){
  const list=state.videos.filter(x=>(x.title||'').toLowerCase().includes(state.search.toLowerCase()));
  const cats=state.cats.slice(0,4);
  v.innerHTML=`<main class="screen">${header()}<div class="searchbox"><span>⌕</span><input placeholder="Search videos, categories..." oninput="state.search=this.value;home(document.querySelector('#view'))" value="${esc(state.search)}"></div><div class="hero"><div><b>Real Moments</b><b>Real Stories</b><span>From RAW shorts → to Real</span></div><div class="hero-person">◒</div></div><div class="section-title"><h2>Categories</h2><button onclick="tab('cats')">See All →</button></div><div class="cat-grid">${cats.map(catCard).join('')}</div><div class="section-title"><h2>Recently Added</h2><button onclick="tab('cats')">See All →</button></div><div class="recent-grid">${list.slice(0,6).map(recentCard).join('')||'<div class="empty">No videos added yet.</div>'}</div></main>`;
}
function catCard(c,i){const n=(c.name||'Others'),icon=icons[n]||icons[categoryKey(n)]||icons.default;return `<button class="cat-card c${i}" style="--cat-image:url('${categoryImage(n)}')" onclick="categoryClick(event,${JSON.stringify(n)})"><div class="cat-icon">${icon}</div><div><b>${esc(n)}</b><small>${state.videos.filter(v=>v.category_id===c.id).length} Videos</small></div><span>›</span></button>`}
function recentCard(x){return `<button class="recent-card" onclick="detail(${JSON.stringify(x.id)})"><div class="thumb art-${Math.abs(hash(x.id))%6}"><span>▶</span><em>${formatDuration(x)}</em></div><b>${esc(x.title)}</b><small>${esc(x.original_filename||'Video')}</small></button>`}
function hash(s){let h=0;for(let i=0;i<s.length;i++)h=(h<<5)-h+s.charCodeAt(i)|0;return h}
function formatDuration(x){return x.duration_seconds?new Date(x.duration_seconds*1000).toISOString().substr(14,5):'00:48'}
function cats(v){v.innerHTML=`<main class="screen">${header('Categories',false)}<div class="page-title"><div><h1>Categories</h1><span>Explore your video library</span></div></div><div class="quick-actions"><button onclick="tab('upload')"><b>＋</b><span>Upload Video</span><small>Add your original video</small></button><button onclick="tab('downloads')"><b>⇩</b><span>Downloads</span><small>Saved videos</small></button></div><div class="section-title"><h2>Collections</h2><span>${state.cats.length} categories</span></div><div class="category-list">${state.cats.map((c,i)=>catLarge(c,i)).join('')}</div></main>`}
function catLarge(c,i){const n=c.name||'Others';return `<button class="cat-large c${i%6}" style="--cat-image:url('${categoryImage(n)}')" onclick="categoryClick(event,${JSON.stringify(n)})"><div class="large-icon">${icons[n]||icons[categoryKey(n)]||icons.default}</div><div><b>${esc(n)}</b><small>${state.videos.filter(v=>v.category_id===c.id).length} Videos</small></div><span>›</span></button>`}
async function upload(v){
  v.innerHTML=`<main class="screen">${header('Upload Video',true)}<div class="page-title"><h1>Upload Video</h1><span>Share your original work</span></div><div class="upload-card"><label class="dropzone"><input id="uf" type="file" accept="video/*" onchange="showFile(this)"><span class="cloud">⇧</span><b>Select Video</b><small>from Gallery or Files</small><strong id="file-name">Choose a video</strong></label><input id="ut" class="field" placeholder="Video Title"><select id="uc" class="field"><option value="">Select Category</option>${state.cats.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select><textarea id="ud" class="field" rows="4" placeholder="Description (Optional)"></textarea><button class="primary" onclick="doUpload()">⇧ &nbsp; Upload Video</button><div id="um" class="msg hidden"></div></div></main>`;
}
function showFile(input){const n=$('#file-name');if(n)n.textContent=input.files[0]?.name||'Choose a video'}
window.showFile=showFile;
async function doUpload(){const file=$('#uf').files[0],m=$('#um');m.classList.remove('hidden');if(!file||!$('#ut').value.trim()){m.textContent='Video and title are required.';return}m.textContent='Uploading...';const id=crypto.randomUUID(),path=state.user.id+'/'+id+'/'+file.name;const up=await sb.storage.from('videos-original').upload(path,file,{contentType:file.type,upsert:false});if(up.error){m.textContent=up.error.message;return}const ins=await sb.from('videos').insert({id,owner_id:state.user.id,category_id:$('#uc').value||null,title:$('#ut').value.trim(),description:$('#ud').value,original_filename:file.name,storage_path:path,mime_type:file.type,file_size_bytes:file.size,status:'ready'});if(ins.error){m.textContent=ins.error.message;return}await loadData();m.textContent='Upload complete.';setTimeout(()=>tab('home'),700)}
window.doUpload=doUpload;
async function detail(id){const x=state.videos.find(v=>v.id===id);if(!x)return;const signed=await sb.storage.from('videos-original').createSignedUrl(x.storage_path,3600);const url=signed.data?.signedUrl;document.body.innerHTML=`<main class="screen detail-screen">${header('',true)}<div class="detail-video">${url?`<video controls playsinline src="${url}"></video>`:'<div class="empty">Video unavailable</div>'}</div><h1>${esc(x.title)}</h1><div class="meta-row"><span>◉ ${esc(categoryName(x.category_id))}</span><span>▣ ${new Date(x.created_at).toLocaleDateString()}</span></div><p class="description">${esc(x.description||'Beautiful original moment captured and edited by CineArtz036.')}</p><div class="detail-actions"><button onclick="favorite(${JSON.stringify(x.id)})">♡ ${state.favorites.has(x.id)?'Favorited':'Favorite'}</button><button onclick="downloadVideo(${JSON.stringify(x.id)})">⇩ Download</button></div></main>`}
function categoryName(id){return state.cats.find(c=>c.id===id)?.name||'Others'}
window.detail=detail;
async function favorite(id){if(state.favorites.has(id)){await sb.from('favorites').delete().eq('user_id',state.user.id).eq('video_id',id);state.favorites.delete(id)}else{await sb.from('favorites').insert({user_id:state.user.id,video_id:id});state.favorites.add(id)}detail(id)}
async function downloadVideo(id){const x=state.videos.find(v=>v.id===id);if(!x)return;const r=await sb.storage.from('videos-original').createSignedUrl(x.storage_path,3600);const url=r.data?.signedUrl;if(!url)return;state.downloads.unshift({id,title:x.title,url,date:Date.now()});state.downloads=state.downloads.slice(0,30);localStorage.setItem('cineartz_downloads',JSON.stringify(state.downloads));const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.download=x.original_filename||'video.mp4';a.click()}
function downloads(v){state.downloads=JSON.parse(localStorage.getItem('cineartz_downloads')||'[]');v.innerHTML=`<main class="screen">${header('Downloads',true)}<div class="page-title"><h1>Downloads</h1><span>${state.downloads.length} saved</span></div><div class="download-list">${state.downloads.map(d=>`<button class="download-row" onclick="window.open('${d.url}','_blank')"><div class="download-thumb">▶</div><div><b>${esc(d.title)}</b><small>Available to open</small></div><span>✓</span></button>`).join('')||'<div class="empty">Your downloaded videos will appear here.</div>'}</div></main>`}
function profile(v){v.innerHTML=`<main class="screen">${header('Profile')}<div class="profile-head"><div class="avatar">CA</div><div><h2>${esc(state.user?.user_metadata?.full_name||'cineartz036')}</h2><p>${esc(state.user?.email||'')}</p><span>● Active</span></div></div><div class="profile-menu"><button onclick="tab('upload')">⇧ <b>My Uploads</b><span>${state.videos.filter(x=>x.owner_id===state.user.id).length} ›</span></button><button onclick="tab('downloads')">⇩ <b>Downloads</b><span>${state.downloads.length} ›</span></button><button onclick="tab('home');state.search=''">♡ <b>Favorites</b><span>${state.favorites.size} ›</span></button><button onclick="alert('Settings are available in the web app preferences.')">⚙ <b>Settings</b><span>›</span></button><button onclick="alert('CineArtz036 — From RAW shorts → to Real')">ⓘ <b>About App</b><span>›</span></button></div><div class="quote">Create Amazing Edits,<br><b>One Frame at a Time!</b></div><button class="logout" onclick="logout()">Log Out</button></main>`}
async function logout(){await sb.auth.signOut();state.user=null;state.videos=[];state.cats=[];state.favorites=new Set();state.auth='login';render()}
init();
