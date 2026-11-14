(function(){
"use strict";
var DATA=window.PLAN_DATA||{daily:[],weekly:[],courses:[]};
var KEY="learning-os-state-v1",THEME="learning-os-theme-v1";
var FIRST="2026-11-14",LAST="2027-05-14",LAST_DAILY="2027-01-13";
var state={done:{},notes:{}},view="today",selected=tbilisiToday(),search="";
var root=document.getElementById("content"),toastEl=document.getElementById("toast");
try{var stored=JSON.parse(localStorage.getItem(KEY)||"null");if(stored&&typeof stored==="object"){state.done=stored.done||{};state.notes=stored.notes||{}}}catch(e){}
if(selected<FIRST)selected=FIRST;if(selected>LAST)selected=LAST;
try{if(localStorage.getItem(THEME)==="dark")document.documentElement.dataset.theme="dark"}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){showToast("მონაცემის შენახვა ვერ მოხერხდა. სცადე ექსპორტი.")}}
function escapeHtml(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function tb(t){return escapeHtml(t)}
function tbilisiToday(){var p=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Tbilisi",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()),o={};p.forEach(function(x){o[x.type]=x.value});return o.year+"-"+o.month+"-"+o.day}
function dateFrom(s){return new Date(s+"T12:00:00")}
function moveDate(s,n){var d=dateFrom(s);d.setDate(d.getDate()+n);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function dateKa(s,options){return new Intl.DateTimeFormat("ka-GE",options||{day:"numeric",month:"long",year:"numeric",weekday:"long"}).format(dateFrom(s))}
function clampDate(s){return s<FIRST?FIRST:s>LAST?LAST:s}
function itemId(t,s,a){return t+":"+s+":"+a}
function complete(t,s,a){return Boolean(state.done[itemId(t,s,a)])}
function pct(n,d){return d?Math.round(n/d*100):0}
function percentFor(t,s){return pct(Number(complete(t,s,"learn"))+Number(complete(t,s,"practice")),2)}
function totals(list,t){var total=list.length*2,done=0;list.forEach(function(x){var s=t==="d"?x.date:x.start;done+=Number(complete(t,s,"learn"))+Number(complete(t,s,"practice"))});return {done:done,total:total,percent:pct(done,total)}}
function allTotals(){var d=totals(DATA.daily,"d"),w=totals(DATA.weekly,"w");return {done:d.done+w.done,total:d.total+w.total,percent:pct(d.done+w.done,d.total+w.total),daily:d,weekly:w}}
function weekFor(date){return DATA.weekly.find(function(w){return w.start<=date&&w.end>=date})||DATA.weekly[0]}
function getDay(date){return DATA.daily.find(function(d){return d.date===date})}
function cleanUrl(s){try{var u=new URL(s);return u.protocol==="https:"?u.href:"#"}catch(e){return "#"}}
function link(text,url){return '<a class="linkchip" target="_blank" rel="noopener noreferrer" href="'+escapeHtml(cleanUrl(url))+'">'+tb(text)+' ↗</a>'}
function courseLinks(d){
 var links=[],seen={};function add(name,url){if(!url||seen[url])return;seen[url]=true;links.push(link(name,url))}
 var s=(d.course||"")+" "+(d.track||"");
 if(/Claude Code 101/i.test(s))add("Claude Code 101","https://www.coursera.org/learn/claude-code-101");
 if(/Google Introduction to AI/i.test(s))add("Google: Introduction to AI","https://www.coursera.org/learn/google-introduction-to-ai");
 if(/Maximize Productivity|Productivity \+/i.test(s))add("Google: Productivity","https://www.coursera.org/learn/google-maximize-productivity-with-ai-tools");
 if(/Discover the Art of Prompting|Discover \+/i.test(s))add("Google: Prompting","https://www.coursera.org/learn/google-discover-the-art-of-prompting");
 if(/Use AI Responsibly/i.test(s))add("Google: Responsible AI","https://www.coursera.org/learn/google-use-ai-responsibly");
 DATA.courses.forEach(function(c){
   if(s.toLowerCase().includes(c.title.toLowerCase()))add(c.title,c.url)
 });
 if(d.url)add(links.length?"მოდულის ბმული":"კურსის გახსნა",d.url);
 return links.join("");
}
function weekLinks(w){
 var t=w.track.toLowerCase(),m=w.module.toLowerCase(),links=[];
 function by(frag){var c=DATA.courses.find(function(a){return a.title.toLowerCase().includes(frag)});if(c)links.push(link(c.title,c.url))}
 if(t.includes("claude"))by("building with the claude api");
 if(t.includes("security"))by("foundations of cybersecurity");
 if(t.includes("agent"))by("ai agents and agentic");
 if(t.includes("research"))by("qualitative research");
 if(t.includes("law"))by("ai & law");
 if(t.includes("privacy"))by("privacy law");
 if(t.includes("skneli"))by("graphic design");
 if(!links.length&&m.includes("claude"))by("building with the claude api");
 return links.join("");
}
function iconCheck(t,s,a,label){var yes=complete(t,s,a);return '<label class="check-row"><input type="checkbox" data-kind="'+t+'" data-key="'+s+'" data-action="'+a+'" '+(yes?"checked":"")+'><span>'+tb(label)+'</span></label>'}
function progressLine(value){return '<div class="line"><span style="width:'+Math.min(100,value)+'%"></span></div>'}
function ring(value){return '<div class="ring" style="--pct:'+value+'%"><span>'+value+'%</span></div>'}
function hero(kind,headline,sub,percent){return '<div class="hero"><div><span class="eyebrow">'+tb(kind)+'</span><h1>'+tb(headline)+'</h1><p>'+tb(sub)+'</p></div>'+ring(percent)+'</div>'}
function dailyStrip(){
 var out='<div class="daystrip">';
 for(var n=-3;n<=3;n++){var dt=moveDate(selected,n),d=getDay(dt),p=d?percentFor("d",dt):0;out+='<button type="button" class="day-dot '+(dt===selected?"active ":"")+(p===100?"finished":"")+'" data-date="'+dt+'" '+((dt<FIRST||dt>LAST)?"disabled":"")+'><small>'+dateKa(dt,{weekday:"short"})+'</small><strong>'+dateKa(dt,{day:"numeric"})+'</strong></button>'}
 return out+"</div>";
}
function dailyMain(d){
 var value=percentFor("d",d.date),tot=allTotals(),hr=String(d.hours).replace(".",",");
 return '<div class="page-intro"><div><span class="eyebrow">YOUR DAILY ROUTINE</span><h1>დღის სასწავლო გეგმა</h1><p class="sub">კურსი, მოდული და პრაქტიკა ერთ სამუშაო სივრცეში.</p></div><button class="btn" data-jump="today">დღევანდელი დღე ↗</button></div>'+
 '<div class="grid-head">'+hero(dateKa(d.date,{weekday:"long"}),dateKa(d.date,{day:"numeric",month:"long"}),d.track+" · "+hr+" სთ",value)+
 '<div class="metric-card"><span class="metric-label">დღის შესრულება</span><div class="metric-value">'+value+'%</div>'+progressLine(value)+'<span class="metric-foot">'+(Number(complete("d",d.date,"learn"))+Number(complete("d",d.date,"practice")))+'/2 ამოცანა</span></div>'+
 '<div class="metric-card"><span class="metric-label">მთლიანი პროგრამა</span><div class="metric-value">'+tot.percent+'%</div>'+progressLine(tot.percent)+'<span class="metric-foot">'+tot.done+' / '+tot.total+' დავალება</span></div></div>'+
 '<div class="date-panel"><button class="btn small nav-arrow" data-shift="-1" aria-label="წინა დღე">‹</button><input type="date" id="chooseDate" class="date-picker" min="'+FIRST+'" max="'+LAST+'" value="'+selected+'" aria-label="აირჩიე თარიღი"><button class="btn small nav-arrow" data-shift="1" aria-label="შემდეგი დღე">›</button><span class="date-summary">ინტენსიური ეტაპი · 61 დღე</span>'+dailyStrip()+'</div>'+
 '<div class="section-head"><h2>დღის ამოცანები</h2><small>ორი დამოუკიდებელი მონიშვნა</small></div>'+
 '<div class="tasks">'+
 '<article class="task-card '+(complete("d",d.date,"learn")?"done":"")+'"><div class="task-card-head"><span class="eyebrow">01 / LEARN</span><span class="badge accent">სასწავლო მოდული</span></div><h3>'+tb(d.course)+'</h3><div class="module-name">'+tb(d.module)+'</div><div class="links">'+courseLinks(d)+'</div><div class="task-footer">'+iconCheck("d",d.date,"learn","მოდული შესრულებულია")+'<span class="badge">'+hr+' სთ / დღეში</span></div></article>'+
 '<article class="task-card '+(complete("d",d.date,"practice")?"done":"")+'"><div class="task-card-head"><span class="eyebrow">02 / APPLY</span><span class="badge">პრაქტიკული სამუშაო</span></div><h3>ცოდნა პრაქტიკაში</h3><p class="practice-quote">'+tb(d.practice)+'</p>'+(d.note?'<p class="muted" style="font-size:11px">'+tb(d.note)+'</p>':'')+'<div class="task-footer">'+iconCheck("d",d.date,"practice","პრაქტიკული დავალება შესრულებულია")+'<span class="badge">PROJECT LAB</span></div></article></div>'+
 '<div class="panel notes-panel"><h3>✎ სამუშაო ჩანაწერები</h3><textarea data-notes="d:'+d.date+'" placeholder="რა ვისწავლე? რა უნდა შევამოწმო? რა გავაკეთე პრაქტიკაში?">'+tb(state.notes["d:"+d.date]||"")+'</textarea><p class="hint">ჩანაწერი ავტომატურად ინახება მხოლოდ ამ ბრაუზერში.</p></div>';
}
function weeklyMain(w){
 var value=percentFor("w",w.start),tot=allTotals();
 return '<div class="page-intro"><div><span class="eyebrow">PHASE II / WEEKLY STUDY</span><h1>კვირის სასწავლო გეგმა</h1><p class="sub">14 იანვრიდან პროგრამა უფრო მსუბუქ კვირეულ რეჟიმზე გადადის.</p></div><button class="btn" data-jump="today">დღევანდელი დღე ↗</button></div>'+
 '<div class="grid-head">'+hero("კვირა · "+dateKa(w.start,{day:"numeric",month:"short"}),dateKa(w.end,{day:"numeric",month:"long"}),w.track+" · "+w.hours+" სთ/კვირა",value)+
 '<div class="metric-card"><span class="metric-label">ამ კვირის შესრულება</span><div class="metric-value">'+value+'%</div>'+progressLine(value)+'<span class="metric-foot">'+(Number(complete("w",w.start,"learn"))+Number(complete("w",w.start,"practice")))+'/2 ამოცანა</span></div>'+
 '<div class="metric-card"><span class="metric-label">მთლიანი პროგრამა</span><div class="metric-value">'+tot.percent+'%</div>'+progressLine(tot.percent)+'<span class="metric-foot">'+tot.done+' / '+tot.total+' დავალება</span></div></div>'+
 '<div class="date-panel"><button class="btn small nav-arrow" data-shift="-7" aria-label="წინა კვირა">‹</button><input type="date" id="chooseDate" class="date-picker" min="'+FIRST+'" max="'+LAST+'" value="'+selected+'"><button class="btn small nav-arrow" data-shift="7" aria-label="შემდეგი კვირა">›</button><span class="date-summary">14.01.2027 — 14.05.2027</span></div>'+
 '<div class="section-head"><h2>კვირის ამოცანები</h2><small>შეასრულე შენთვის მოსახერხებელ დღეებში</small></div>'+
 '<div class="tasks"><article class="task-card"><div class="task-card-head"><span class="eyebrow">01 / LEARN</span><span class="badge accent">'+tb(w.track)+'</span></div><h3>სასწავლო მოდულები</h3><p class="module-name">'+tb(w.module)+'</p><div class="links">'+weekLinks(w)+'</div><div class="task-footer">'+iconCheck("w",w.start,"learn","მოდულები შესრულებულია")+'</div></article>'+
 '<article class="task-card"><div class="task-card-head"><span class="eyebrow">02 / APPLY</span><span class="badge">პრაქტიკა</span></div><h3>კვირის პრაქტიკული შედეგი</h3><p class="practice-quote">'+tb(w.practice)+'</p><div class="task-footer">'+iconCheck("w",w.start,"practice","პრაქტიკული შედეგი მზადაა")+'</div></article></div>'+
 '<div class="panel notes-panel"><h3>✎ კვირის ჩანაწერები</h3><textarea data-notes="w:'+w.start+'" placeholder="რა გაკეთდა? რა გადავიტანოთ შემდეგ კვირაში?">'+tb(state.notes["w:"+w.start]||"")+'</textarea><p class="hint">ჩანაწერი ავტომატურად ინახება ამ მოწყობილობაზე.</p></div>';
}
function renderToday(){var d=getDay(selected);return d?dailyMain(d):weeklyMain(weekFor(selected))}
function progressRows(){
 var groups=[{title:"პირველი ორი თვე",list:DATA.daily,t:"d"},{title:"შემდეგი ოთხი თვე",list:DATA.weekly,t:"w"}];
 return groups.map(function(g){var x=totals(g.list,g.t);return '<div class="progress-bar-row"><span>'+g.title+'</span>'+progressLine(x.percent)+'<strong>'+x.percent+'%</strong></div>'}).join("");
}
function renderOverview(){
 var t=allTotals();var next=DATA.daily.filter(function(d){return percentFor("d",d.date)<100}).slice(0,5);
 var nextRows=next.map(function(d){return '<div style="border-top:1px solid var(--line);padding:11px 0;display:flex;gap:12px;align-items:center;justify-content:space-between"><div><strong style="font-size:12px">'+tb(dateKa(d.date,{day:"numeric",month:"short"}))+'</strong><div class="muted" style="font-size:11px">'+tb(d.course)+'</div></div><button class="btn small" data-date="'+d.date+'" data-open-day="1">გახსნა ↗</button></div>'}).join("");
 return '<div class="page-intro"><div><span class="eyebrow">THE BIG PICTURE</span><h1>შენი პროგრესი</h1><p class="sub">მთლიანი გეგმის შესრულება და მომდევნო ნაბიჯები.</p></div></div>'+
 '<div class="grid-head">'+hero("14 ნოემბერი, 2026 — 14 მაისი, 2027","ერთი ნაბიჯით წინ",t.done+" შესრულებული ამოცანა · "+t.total+" სულ",t.percent)+
 '<div class="metric-card"><span class="metric-label">სასწავლო ნაწილი</span><div class="metric-value">'+t.daily.percent+'%</div>'+progressLine(t.daily.percent)+'<span class="metric-foot">61 დღიანი პროგრამა</span></div>'+
 '<div class="metric-card"><span class="metric-label">გრძელვადიანი ეტაპი</span><div class="metric-value">'+t.weekly.percent+'%</div>'+progressLine(t.weekly.percent)+'<span class="metric-foot">18 კვირიანი პროგრამა</span></div></div>'+
 '<div class="stat-cluster"><div class="kpi"><strong>'+DATA.daily.length+'</strong><span>დღიური გეგმა</span></div><div class="kpi"><strong>'+DATA.weekly.length+'</strong><span>შემდგომი კვირა</span></div><div class="kpi"><strong>'+DATA.courses.length+'</strong><span>კურსი კატალოგში</span></div></div>'+
 '<div class="progress-cols" style="margin-top:16px"><section class="panel chart-panel"><h2 class="section-head" style="margin-top:0">ეტაპების შესრულება</h2>'+progressRows()+'<p class="muted" style="font-size:12px;margin-top:24px">პროგრესი ითვლება დასრულებული სასწავლო მოდულებისა და პრაქტიკული დავალებების საფუძველზე. თითოეულს თანაბარი წონა აქვს.</p></section><section class="panel"><h2 style="font-size:17px;margin-top:0">მომდევნო დაუხურული დღეები</h2>'+nextRows+'</section></div>';
}
function renderCourseList(){
 var q=search.trim().toLowerCase(),list=DATA.courses.filter(function(c){return (c.title+" "+c.provider).toLowerCase().includes(q)});
 return '<div class="course-grid">'+list.map(function(c){
 return '<article class="course-card"><span class="course-provider">'+tb(c.provider)+'</span><h3>'+tb(c.title)+'</h3><div class="course-meta"><span>'+tb(c.modules)+' მოდული</span><span>·</span><span>'+tb(c.duration)+'</span><span>·</span><span>'+tb(c.stage)+'</span></div><a target="_blank" rel="noopener noreferrer" href="'+escapeHtml(cleanUrl(c.url))+'">კურსის გახსნა ↗</a></article>';
 }).join("")+(list.length?"":'<p class="empty">ასეთი კურსი ვერ მოიძებნა.</p>')+"</div>";
}
function renderCourses(){return '<div class="page-intro"><div><span class="eyebrow">COURSE LIBRARY</span><h1>კურსების ბიბლიოთეკა</h1><p class="sub">ყველა Coursera პროგრამა ერთ სივრცეში, პირდაპირი ბმულებით.</p></div></div><input class="search" id="courseSearch" type="search" placeholder="მოძებნე კურსი ან უნივერსიტეტი..." value="'+tb(search)+'"><div id="courseList">'+renderCourseList()+'</div>'}
function renderRoadmap(){
 var groups=[{label:"INTENSIVE PHASE",name:"პირველი ორი თვე",range:"14.11.2026 — 13.01.2027",desc:"ყოველდღიური სწავლა: Claude, GitHub, Google AI, ChatGPT, მონაცემები და Python",time:"94 სთ"},{label:"SPECIALIZATION PHASE",name:"შემდეგი ოთხი თვე",range:"14.01.2027 — 14.05.2027",desc:"AI აგენტები, RAG, სამართლებრივი კვლევა, უსაფრთხოება და OS-ების პირველი სპეციფიკაციები",time:"5–7 სთ/კვ."}];
 return '<div class="page-intro"><div><span class="eyebrow">6 MONTH ROADMAP</span><h1>განვითარების მარშრუტი</h1><p class="sub">პირველი ორი თვე ინტენსიური, მომდევნო ოთხი — ეტაპობრივი.</p></div></div>'+
 '<div class="tasks" style="margin-bottom:27px">'+groups.map(function(g){return '<div class="panel"><span class="eyebrow">'+g.label+'</span><h2 style="font-family:Georgia,serif;font-weight:500;font-size:24px;margin:10px 0">'+g.name+'</h2><p class="muted" style="font-size:12px">'+g.range+' · '+g.time+'</p><p>'+g.desc+'</p></div>'}).join("")+'</div>'+
 '<div class="section-head"><h2>კვირეული პროგრამა</h2><small>14 იანვრიდან</small></div><div class="weekly-grid">'+DATA.weekly.map(function(w,i){
 var x=percentFor("w",w.start);return '<article class="weekly-card"><div class="weekly-meta"><span class="eyebrow">WEEK '+String(i+1).padStart(2,"0")+'</span><span class="badge">'+tb(dateKa(w.start,{day:"numeric",month:"short"}))+' – '+tb(dateKa(w.end,{day:"numeric",month:"short"}))+'</span><span class="badge accent">'+x+'%</span></div><h3>'+tb(w.track)+'</h3><p><strong>მოდულები: </strong>'+tb(w.module)+'</p><p><strong>შედეგი: </strong>'+tb(w.practice)+'</p><div class="links">'+weekLinks(w)+'</div><div class="weekly-checks">'+iconCheck("w",w.start,"learn","მოდული დასრულებულია")+iconCheck("w",w.start,"practice","პრაქტიკა დასრულებულია")+'<button class="btn small" data-date="'+w.start+'" data-open-day="1">კვირის გახსნა ↗</button></div></article>';
 }).join("")+"</div>";
}
function renderSettings(){
 return '<div class="page-intro"><div><span class="eyebrow">YOUR DATA</span><h1>მონაცემები და შენახვა</h1><p class="sub">შენი წინსვლა ეკუთვნის შენ, არა GitHub-ის საჯარო გვერდს.</p></div></div><div class="settings-grid">'+
 '<section class="settings-section"><span class="eyebrow">BACKUP</span><h3>სარეზერვო ასლის ჩამოტვირთვა</h3><p>გადმოიწერე მონიშნული მოდულები, პრაქტიკული დავალებები და ჩანაწერები JSON ფაილად. შეგიძლია სხვა მოწყობილობაშიც აღადგინო.</p><div class="actions"><button class="btn primary" id="exportProgress">↓ ექსპორტი (JSON)</button></div></section>'+
 '<section class="settings-section"><span class="eyebrow">RESTORE</span><h3>პროგრესის აღდგენა</h3><p>თუ ახალ ბრაუზერზე ან ტელეფონზე გადახვალ, აირჩიე ადრე შენახული JSON ფაილი. არსებული ნიშნები ჩანაცვლდება.</p><div class="actions"><button class="btn" id="importProgress">↑ იმპორტი</button><input type="file" id="importFile" accept="application/json,.json" hidden></div></section>'+
 '<section class="settings-section"><span class="eyebrow">PRIVACY</span><h3>სად ინახება მონაცემები?</h3><p>მონიშვნები და სამუშაო ჩანაწერები ინახება ამ ბრაუზერის localStorage-ში. GitHub-ზე ქვეყნდება მხოლოდ სასწავლო გეგმა, არა შენი პროგრესი. სხვა მოწყობილობასთან სინქრონიზაცია ამ ვერსიაში არ არის.</p><p>ბრაუზერის მონაცემების წაშლისას შენახული პროგრესიც შეიძლება წაიშალოს, ამიტომ პერიოდულად შექმენი სარეზერვო ასლი.</p></section>'+
 '<section class="settings-section"><span class="eyebrow">RESET</span><h3>პროგრესის გასუფთავება</h3><p>ეს მოქმედება გააუქმებს ყველა მონიშვნასა და ჩანაწერს მხოლოდ ამ მოწყობილობაზე. სასწავლო გეგმა არ შეიცვლება.</p><div class="actions"><button class="btn danger" id="clearProgress">ყველა ნიშნის წაშლა</button></div></section></div>';
}
function updateNav(){document.querySelectorAll("[data-view]").forEach(function(el){el.classList.toggle("active",el.dataset.view===view)})}
function render(){if(view==="today")root.innerHTML=renderToday();else if(view==="overview")root.innerHTML=renderOverview();else if(view==="courses")root.innerHTML=renderCourses();else if(view==="roadmap")root.innerHTML=renderRoadmap();else root.innerHTML=renderSettings();updateNav()}
function go(v){view=v;render();window.scrollTo(0,0)}
function jumpDate(dt){selected=clampDate(dt);view="today";render();window.scrollTo(0,0)}
var toastTimer;
function showToast(s){toastEl.textContent=s;toastEl.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(function(){toastEl.classList.remove("show")},2600)}
document.addEventListener("click",function(e){
 var b=e.target.closest("[data-view]");if(b){go(b.dataset.view);return}
 var shift=e.target.closest("[data-shift]");if(shift){jumpDate(moveDate(selected,Number(shift.dataset.shift)));return}
 var day=e.target.closest("[data-date]");if(day){jumpDate(day.dataset.date);return}
 if(e.target.closest("[data-jump]")){jumpDate(tbilisiToday());return}
 if(e.target.closest("#exportProgress")){var payload={schema_version:1,exported_at:new Date().toISOString(),done:state.done,notes:state.notes};var blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download="learning-os-backup-"+tbilisiToday()+".json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},5000);showToast("სარეზერვო ასლი ჩამოტვირთულია");return}
 if(e.target.closest("#importProgress")){var inp=document.getElementById("importFile");if(inp)inp.click();return}
 if(e.target.closest("#clearProgress")){if(confirm("დარწმუნებული ხარ? ყველა მონიშვნა და ჩანაწერი წაიშლება ამ ბრაუზერიდან.")){state={done:{},notes:{}};save();render();showToast("პროგრესი გასუფთავებულია")}return}
});
document.addEventListener("change",function(e){
 var input=e.target;
 if(input.matches('input[data-action]')){var id=itemId(input.dataset.kind,input.dataset.key,input.dataset.action);state.done[id]=input.checked;save();var y=window.scrollY;render();window.scrollTo(0,y);showToast(input.checked?"მონიშნულია ✓":"მონიშვნა გაუქმებულია");return}
 if(input.id==="chooseDate"&&input.value){jumpDate(input.value);return}
 if(input.id==="importFile"&&input.files&&input.files[0]){
   var reader=new FileReader();
   reader.onload=function(){try{var parsed=JSON.parse(String(reader.result));if(!parsed||parsed.schema_version!==1||typeof parsed.done!=="object"||typeof parsed.notes!=="object")throw Error("Invalid backup");if(!confirm("ამ ფაილის იმპორტი ჩაანაცვლებს ბრაუზერში არსებულ პროგრესს. გავაგრძელოთ?"))return;state={done:parsed.done,notes:parsed.notes};save();render();showToast("პროგრესი აღდგენილია")}catch(err){alert("ფაილი არასწორია ან დაზიანებულია.")}};
   reader.readAsText(input.files[0]);input.value="";
 }
});
document.addEventListener("input",function(e){if(e.target.id==="courseSearch"){search=e.target.value;var list=document.getElementById("courseList");if(list)list.innerHTML=renderCourseList()}else if(e.target.matches("textarea[data-notes]")){state.notes[e.target.dataset.notes]=e.target.value;save()}});
document.getElementById("themeToggle").addEventListener("click",function(){var next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;try{localStorage.setItem(THEME,next)}catch(e){}});
if("serviceWorker" in navigator&&location.protocol==="https:"){navigator.serviceWorker.register("./sw.js").catch(function(){})}
render();
})();