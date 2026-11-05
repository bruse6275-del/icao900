/* 检查更新：只从 GitHub Pages 官网获取。全部下载成功才替换，失败时继续用本机版本。 */
(function(){
var REPO='gh/bruse6275-del/icao900@main/';
var SRC=['./'];
var FILES=[['index.html','<html',100000],['retell.html','<html',50000],['part3.html','<html',100000],['dict.js','',500000],['update.js','icaoUpdate',500],['manifest.webmanifest','icons',50]];
var VK='icao900.ver';
function type(f){return /\.html$/.test(f)?'text/html; charset=utf-8':/\.js$/.test(f)?'text/javascript; charset=utf-8':'application/json'}
function get(u,ms){var ac=new AbortController(),t=setTimeout(function(){ac.abort()},ms);var url=u+(u.indexOf('http')===0?'':'?nosw=1&t='+Date.now());return fetch(url,{cache:'no-store',signal:ac.signal}).then(function(r){clearTimeout(t);if(!r.ok)throw new Error(String(r.status));return r.text()},function(e){clearTimeout(t);throw e})}
function verOf(txt){var m=/icao900-(\d{10,14})/.exec(txt||'');return m?m[1]:''}
async function localVer(){var v='';try{v=localStorage.getItem(VK)||''}catch(e){}try{(await caches.keys()).forEach(function(k){var x=verOf(k);if(x>v)v=x})}catch(e){}return v}
async function appCache(){var ks=(await caches.keys()).filter(function(k){return /^icao900-\d/.test(k)}).sort();return caches.open(ks.length?ks[ks.length-1]:'icao900-000000000000')}
function label(v){return v&&v.length>=12?v.slice(4,6)+'-'+v.slice(6,8)+' '+v.slice(8,10)+':'+v.slice(10,12):v}
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(function(){})}catch(e){}
function showVer(v){var e=document.getElementById('csVer')||document.getElementById('verTag');if(e&&v)e.textContent='当前版本 '+label(v)}
localVer().then(showVer).catch(function(){});
window.icaoUpdate=async function(stat){stat=stat||function(){};
 if(!window.caches||!window.AbortController){stat('这个浏览器不支持离线更新，请直接刷新页面');return false}
 if(navigator.onLine===false){stat('设备离线，继续使用本机版本');return false}
 stat('正在检查更新…');
 var found=await Promise.all(SRC.map(function(s){return get(s+'sw.js',8000).then(function(t){return {s:s,v:verOf(t)}},function(){return null})}));
 var ok=found.filter(function(x){return x&&x.v}).sort(function(a,b){return a.v<b.v?1:a.v>b.v?-1:SRC.indexOf(a.s)-SRC.indexOf(b.s)});
 if(!ok.length){stat('连不上 GitHub，继续使用本机版本。换个网络再试');return false}
 var best=ok[0],cur=await localVer();
 stat('正在下载最新文件…');
 var got=[],same=true,base0=new URL('./',location.href).href;
 for(var i=0;i<FILES.length;i++){if(FILES[i][0]==='dict.js'&&best.v<=cur)continue;var f=FILES[i],src=[best.s].concat(ok.slice(1).filter(function(x){return x.v===best.v}).map(function(x){return x.s})),t=null;
  for(var j=0;j<src.length&&t===null;j++){try{var x=await get(src[j]+f[0],60000);if(x.length>=f[2]&&(!f[1]||x.indexOf(f[1])>=0))t=x}catch(e){}}
  if(t===null){stat('下载没有完成，已保留本机版本，请稍后再试');return false}
  try{var hit=await caches.match(base0+f[0]);if(!hit||await hit.text()!==t)same=false}catch(e){same=false}got.push([f[0],t]);stat('正在下载… '+(i+1)+' / '+FILES.length)}
 if(same&&best.v<=cur){stat('已是最新（'+label(best.v)+'）');showVer(best.v);return false}
 var c=await appCache(),base=new URL('./',location.href).href;
 for(var k=0;k<got.length;k++){var res=new Response(got[k][1],{headers:{'Content-Type':type(got[k][0])}});await c.put(base+got[k][0],res.clone());if(got[k][0]==='index.html')await c.put(base,res.clone())}
 try{localStorage.setItem(VK,best.v)}catch(e){}
 try{if(best.s==='./'&&navigator.serviceWorker){var r=await navigator.serviceWorker.getRegistration();if(r)await r.update()}}catch(e){}
 stat('已更新到 '+label(best.v)+'，正在刷新…');setTimeout(function(){location.reload()},600);return true};
})();
