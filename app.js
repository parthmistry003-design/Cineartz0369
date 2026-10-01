const CONFIG={url:'https://zqumthrpodjggnsfmhhp.supabase.co',key:'sb_publishable_K21BgpeFWR6uDeCwNEqnVQ_rnI5IjHu'};
let sb=null;
let state={user:null,videos:[],cats:[],tab:'home',search:'',favorites:new Set(),authPage:'login'};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ready(){return CONFIG.url.startsWith('http')&&CONFIG.key!=='YOUR_SUPABASE_PUBLISHABLE_KEY'}
async function init(){if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});if(ready()){sb=window.supabase.createClient(CONFIG.url,CONFIG.key);const {data}=await sb.auth.getSession();state.user=data.session?.user||null;if(state.user)await loadData()}render()}
async function loadData(){const [c,v,f]=await Promise.all([sb.from('categories').select('*').order('sort_order'),sb.from('videos').select('*').eq('status','ready').order('created_at',{ascending:false}).limit(100),sb.from('favorites').select('video_id').eq('user_id',state.user.id)]);state.cats=c.data||[];state.videos=v.data||[];state.favorites=new Set((f.data||[]).map(x=>x.video_id))}
function render(){if(!state.user&&ready()){state.authPage=state.authPage||'login';authPage();return}if(!ready()){setup();return}app()}
function setup(){document.body.innerHTML='<main class="screen"><div class="top"><div class="brand">cineartz036</div></div><div class="panel" style="padding:20px"><h2>One-time setup</h2><p class="muted">Open <b>app.js</b> and replace your Supabase project values. Then upload this folder to a static host.</p><div class="msg">Your original ZIP contains the database schema in <b>Supabase/schema.sql</b>.</div></div></main>'}
function authPage(message='',isError=false){
  if(state.authPage==='signup') signupPage(message,isError); else loginPage(message,isError);
}
function loginPage(message='',isError=false){
 document.body.innerHTML='<main class="screen"><div class="splash" style="height:45vh"><b>cineartz036</b><span>From RAW shorts → to Real</span></div><div class="form"><h2>Login</h2><input id="email" class="field" type="email" placeholder="Email" autocomplete="email"><input id="pass" class="field" type="password" placeholder="Password" autocomplete="current-password"><button class="primary" onclick="signIn()">Login</button><button class="primary" style="background:#24242a" onclick="showSignup()">Create Account</button><div id="msg" class="msg '+(message?'':'hidden')+'"'+(isError?' style="border-color:#f55"':'')+'>'+esc(message)+'</div></div></main>';
}
function signupPage(message='',isError=false){
 document.body.innerHTML='<main class="screen"><div class="top"><button class="back" onclick="showLogin()">← Back</button></div><div class="form"><h2>Create Account</h2><p class="muted">Create your cineartz036 account.</p><input id="name" class="field" type="text" placeholder="Full Name" autocomplete="name"><input id="email" class="field" type="email" placeholder="Email" autocomplete="email"><input id="pass" class="field" type="password" placeholder="Password" autocomplete="new-password"><input id="pass2" class="field" type="password" placeholder="Confirm Password" autocomplete="new-password"><button class="primary" onclick="signUp()">Create Account</button><button class="primary" style="background:#24242a" onclick="showLogin()">Already have an account? Login</button><div id="msg" class="msg '+(message?'':'hidden')+'"'+(isError?' style="border-color:#f55"':'')+'>'+esc(message)+'</div></div></main>';
}
function showSignup(){state.authPage='signup';authPage()}
function showLogin(message='',isError=false){state.authPage='login';authPage(message,isError)}
async function signIn(){
 const email=$('#email')?.value.trim(),password=$('#pass')?.value||'',m=$('#msg');
 if(!email||!password){m.classList.remove('hidden');m.textContent='Email and password are required.';return}
 m.classList.remove('hidden');m.textContent='Logging in...';
 const r=await sb.auth.signInWithPassword({email,password});
 if(r.error){m.textContent=r.error.message;return}
 state.user=r.data.user||r.data.session?.user||null;
 if(state.user){m.textContent='Login successful.';await loadData();setTimeout(()=>render(),250)}
}
async function signUp(){
 const name=$('#name')?.value.trim(),email=$('#email')?.value.trim(),password=$('#pass')?.value||'',password2=$('#pass2')?.value||'',m=$('#msg');
 if(!name||!email||!password||!password2){m.classList.remove('hidden');m.textContent='All fields are required.';return}
 if(password!==password2){m.classList.remove('hidden');m.textContent='Passwords do not match.';return}
 if(password.length<6){m.classList.remove('hidden');m.textContent='Password must be at least 6 characters.';return}
 m.classList.remove('hidden');m.textContent='Creating account...';
 const r=await sb.auth.signUp({email,password,options:{data:{full_name:name}}});
 if(r.error){m.textContent=r.error.message;return}
 if(r.data.session)await sb.auth.signOut();
 state.user=null;
 showLogin('Account created successfully. Please login with your email and password.');
}
window.signIn=signIn;window.signUp=signUp;window.showSignup=showSignup;window.showLogin=showLogin;
function app(){document.body.innerHTML='<div id="view"></div><nav class="bottom"><button onclick="tab(\'home\')">⌂<br>Home</button><button onclick="tab(\'cats\')">▦<br>Categories</button><button onclick="tab(\'upload\')">＋<br>Upload</button><button onclick="tab(\'profile\')">◉<br>Profile</button></nav>';view()}
function tab(t){state.tab=t;view()}
function view(){const v=$('#view');if(state.tab==='home')home(v);else if(state.tab==='cats')cats(v);else if(state.tab==='upload')upload(v);else profile(v)}
function home(v){let list=state.videos.filter(x=>(x.title||'').toLowerCase().includes(state.search.toLowerCase()));v.innerHTML='<main class="screen"><div class="top"><div><div class="brand">cineartz036</div><div class="muted">From RAW shorts → to Real</div></div></div><input class="search" placeholder="Search videos, categories..." oninput="state.search=this.value;home(document.querySelector(\'#view\'))" value="'+esc(state.search)+'"><div class="banner"><h2>Real Moments</h2><h2>Real Stories</h2><div>From RAW shorts → to Real</div></div><div class="section"><h2>Categories</h2></div><div class="grid">'+state.cats.map(c=>'<button class="card" onclick="state.search='+JSON.stringify(c.name)+';tab(\'home\')">'+esc(c.name)+'</button>').join('')+'</div><div class="section"><h2>Recently Added</h2></div>'+list.slice(0,20).map(row).join('')+'</main>'}
function row(x){return '<button class="row" style="width:100%;text-align:left;color:white" onclick="detail('+JSON.stringify(x.id)+')"><div class="thumb">▶️</div><div><h3>'+esc(x.title)+'</h3><div class="pill">'+esc(x.original_filename)+' · '+new Date(x.created_at).toLocaleDateString()+'</div></div></button>'}
function cats(v){v.innerHTML='<main class="screen"><h1>Categories</h1><div class="grid">'+state.cats.map(c=>'<button class="card" onclick="state.search='+JSON.stringify(c.name)+';tab(\'home\')">'+esc(c.name)+'</button>').join('')+'</div></main>'}
function upload(v){if(!state.user){v.innerHTML='<main class="screen"><div class="msg">Login is required to upload.</div></main>';return}v.innerHTML='<main class="screen"><h1>Upload</h1><div class="form"><input id="ut" class="field" placeholder="Title"><select id="uc" class="field"><option value="">Category</option>'+state.cats.map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join('')+'</select><textarea id="ud" class="field" rows="4" placeholder="Description"></textarea><input id="uf" class="field" type="file" accept="video/*"><button class="primary" onclick="doUpload()">Upload Original Video</button><div id="um" class="msg hidden"></div></div></main>'}
async function doUpload(){const file=$('#uf').files[0],m=$('#um');if(!file||!$('#ut').value){m.classList.remove('hidden');m.textContent='Title and video are required.';return}m.classList.remove('hidden');m.textContent='Uploading...';const id=crypto.randomUUID(),path=state.user.id+'/'+id+'/'+file.name;const up=await sb.storage.from('videos-original').upload(path,file,{contentType:file.type,upsert:false});if(up.error){m.textContent=up.error.message;return}const ins=await sb.from('videos').insert({id,owner_id:state.user.id,category_id:$('#uc').value||null,title:$('#ut').value,description:$('#ud').value,original_filename:file.name,storage_path:path,mime_type:file.type,file_size_bytes:file.size,status:'ready'});m.textContent=ins.error?ins.error.message:'Upload complete.';if(!ins.error){await loadData();setTimeout(()=>tab('home'),700)}}
window.doUpload=doUpload;
async function detail(id){const x=state.videos.find(v=>v.id===id);const signed=await sb.storage.from('videos-original').createSignedUrl(x.storage_path,3600);const url=signed.data?.signedUrl;document.body.innerHTML='<main class="screen"><button class="back" onclick="app()">← Back</button><h1>'+esc(x.title)+'</h1>'+(url?'<video class="video" controls playsinline src="'+url+'"></video>':'<div class="msg">Video unavailable</div>')+'<div class="panel" style="padding:16px;margin-top:14px"><p>'+esc(x.description||'')+'</p><div class="muted">'+esc(x.original_filename)+'</div><br><button class="primary" onclick="favorite('+JSON.stringify(x.id)+')">'+(state.favorites.has(x.id)?'★ Favorited':'☆ Favorite')+'</button><br><br><a class="primary" style="display:block;text-align:center;text-decoration:none" href="'+url+'" target="_blank" rel="noopener">Open / Download Original</a></div></main>'}
window.detail=detail;
async function favorite(id){if(state.favorites.has(id)){await sb.from('favorites').delete().eq('user_id',state.user.id).eq('video_id',id);state.favorites.delete(id)}else{await sb.from('favorites').insert({user_id:state.user.id,video_id:id});state.favorites.add(id)}detail(id)}
function profile(v){v.innerHTML='<main class="screen"><h1>Profile</h1><div class="panel" style="padding:18px"><b>'+esc(state.user?.email||'')+'</b><p class="muted">My uploads: '+state.videos.filter(x=>x.owner_id===state.user.id).length+'</p><button class="primary danger" onclick="sb.auth.signOut().then(()=>{state.user=null;state.authPage=\'login\';render()})">Logout</button></div></main>'}
init();
