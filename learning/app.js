(function(){
"use strict";
var DATA=window.PLAN_DATA||{daily:[],weekly:[],courses:[]};
var KEY="learning-os-state-v1",THEME="learning-os-theme-v1";
var FIRST="2026-11-14",LAST="2027-05-14",LAST_DAILY="2027-01-13";
var state={done:{},notes:{}},view="program",selected=tbilisiToday(),search="",programWeekIndex=0,flexTab="modules",flexModule="foundation";
var root=document.getElementById("content"),toastEl=document.getElementById("toast");
try{var stored=JSON.parse(localStorage.getItem(KEY)||"null");if(stored&&typeof stored==="object"){state.done=stored.done||{};state.notes=stored.notes||{}}}catch(e){}
if(state.notes&&typeof state.notes["flex:lastModule"]==="string")flexModule=state.notes["flex:lastModule"];
if(selected<FIRST)selected=FIRST;if(selected>LAST)selected=LAST;
if(window.ACTIVE_PROGRAM&&window.ACTIVE_PROGRAM.weeks){
 var todayForWeek=tbilisiToday();
 var wkMatch=window.ACTIVE_PROGRAM.weeks.findIndex(function(w){return w.start<=todayForWeek&&todayForWeek<=w.end});
 programWeekIndex=wkMatch>=0?wkMatch:(todayForWeek>window.ACTIVE_PROGRAM.end?window.ACTIVE_PROGRAM.weeks.length-1:0);
}
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
function modulesFor(d){
 var options={
  "2026-11-14":[["Claude Code 101","M1: What is Claude Code","https://www.coursera.org/learn/claude-code-101"],["Google AI Essentials: Introduction to AI","M1: Welcome to the exciting world of AI","https://www.coursera.org/learn/google-introduction-to-ai"]],
  "2026-11-15":[["Claude Code 101","M2: Your first prompt","https://www.coursera.org/learn/claude-code-101"],["Google AI Essentials: Introduction to AI","M2–M4: Discover how AI works / AI for professionals / Review","https://www.coursera.org/learn/google-introduction-to-ai"]],
  "2026-11-19":[["Google AI Essentials: Maximize Productivity","M4–M5","https://www.coursera.org/learn/google-maximize-productivity-with-ai-tools"],["Google AI Essentials: Discover the Art of Prompting","M1","https://www.coursera.org/learn/google-discover-the-art-of-prompting"]],
  "2026-11-20":[["Google AI Essentials: Discover the Art of Prompting","M2–M4","https://www.coursera.org/learn/google-discover-the-art-of-prompting"],["Google AI Essentials: Use AI Responsibly","M1–M3","https://www.coursera.org/learn/google-use-ai-responsibly"]],
  "2026-12-11":[["Prompt Engineering for ChatGPT","M4: Few-Shot Examples — ვიდეოები (ნაწილი 1)","https://www.coursera.org/learn/prompt-engineering"],["Gemini Notebook / NotebookLM","15-წუთიანი საცდელი კვლევა","https://notebooklm.google.com/"]],
  "2026-12-20":[["Research Data Management and Sharing","M2: Data Management Planning — დარჩენილი ნაწილი","https://www.coursera.org/learn/data-management"],["Introduction to GitHub Actions","GitHub Actions-ის მიმოხილვა","https://www.coursera.org/projects/introduction-to-github-actions"]]
 };
 var found=options[d.date];var existing=found?found.map(function(a){return {course:a[0],module:a[1],url:a[2]}}):[{course:d.course,module:d.module,url:d.url}];return existing.concat((d.extras||[]).map(function(x){return {course:x.course,module:x.module,url:x.url,exercise:x.exercise}}));
}
function itemCount(t,s){if(t==="w")return 2;var d=getDay(s);return d?modulesFor(d).length+1:2}
function doneCount(t,s){var sum=Number(complete(t,s,"practice"));if(t==="w")return sum+Number(complete(t,s,"learn"));var d=getDay(s);if(!d)return sum+Number(complete(t,s,"learn"));modulesFor(d).forEach(function(m,i){sum+=Number(complete(t,s,i===0?"learn":"learn"+(i+1)))});return sum}
function percentFor(t,s){return pct(doneCount(t,s),itemCount(t,s))}
function totals(list,t){var total=0,done=0;list.forEach(function(x){var k=t==="d"?x.date:x.start;total+=itemCount(t,k);done+=doneCount(t,k)});return {done:done,total:total,percent:pct(done,total)}}
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
function renderDailyTaskCards(d){
 var mods=modulesFor(d),out='<div class="tasks">';
 mods.forEach(function(m,i){
   var code=i===0?"learn":"learn"+(i+1),n=String(i+1).padStart(2,"0");
   out+='<article class="task-card '+(complete("d",d.date,code)?"done":"")+'"><div class="task-card-head"><span class="eyebrow">'+n+' / LEARN</span><span class="badge accent">სასწავლო მოდული</span></div><h3>'+tb(m.course)+'</h3><p class="module-name">'+tb(m.module)+'</p>'+(m.exercise?'<p class="practice-quote" style="font-size:12px">მინი-პრაქტიკა: '+tb(m.exercise)+'</p>':'')+'<div class="links">'+(mods.length>1?link("კურსის გახსნა",m.url):courseLinks(d))+'</div><div class="task-footer">'+iconCheck("d",d.date,code,"მოდული შესრულებულია")+'<span class="badge">'+String(d.hours).replace(".",",")+" სთ / დღეში"+'</span></div></article>';
 });
 var num=String(mods.length+1).padStart(2,"0");
 out+='<article class="task-card '+(mods.length>1?"full-line ":"")+(complete("d",d.date,"practice")?"done":"")+'"><div class="task-card-head"><span class="eyebrow">'+num+' / APPLY</span><span class="badge">პრაქტიკული სამუშაო</span></div><h3>ცოდნა პრაქტიკაში</h3><p class="practice-quote">'+tb(d.practice)+'</p>'+(d.note?'<p class="muted" style="font-size:11px">'+tb(d.note)+'</p>':"")+'<div class="task-footer">'+iconCheck("d",d.date,"practice","პრაქტიკული დავალება შესრულებულია")+'<span class="badge">PROJECT LAB</span></div></article></div>';
 return out;
}
function dailyMain(d){
 var value=percentFor("d",d.date),tot=allTotals(),hr=String(d.hours).replace(".",",");
 return '<div class="page-intro"><div><span class="eyebrow">YOUR DAILY ROUTINE</span><h1>დღის სასწავლო გეგმა</h1><p class="sub">კურსი, მოდული და პრაქტიკა ერთ სამუშაო სივრცეში.</p></div><button class="btn" data-jump="today">დღევანდელი დღე ↗</button></div>'+
 '<div class="grid-head">'+hero(dateKa(d.date,{weekday:"long"}),dateKa(d.date,{day:"numeric",month:"long"}),d.track+" · "+hr+" სთ",value)+
 '<div class="metric-card"><span class="metric-label">დღის შესრულება</span><div class="metric-value">'+value+'%</div>'+progressLine(value)+'<span class="metric-foot">'+doneCount("d",d.date)+'/'+itemCount("d",d.date)+' ამოცანა</span></div>'+
 '<div class="metric-card"><span class="metric-label">მთლიანი პროგრამა</span><div class="metric-value">'+tot.percent+'%</div>'+progressLine(tot.percent)+'<span class="metric-foot">'+tot.done+' / '+tot.total+' დავალება</span></div></div>'+
 '<div class="date-panel"><button class="btn small nav-arrow" data-shift="-1" aria-label="წინა დღე">‹</button><input type="date" id="chooseDate" class="date-picker" min="'+FIRST+'" max="'+LAST+'" value="'+selected+'" aria-label="აირჩიე თარიღი"><button class="btn small nav-arrow" data-shift="1" aria-label="შემდეგი დღე">›</button><span class="date-summary">ინტენსიური ეტაპი · 61 დღე</span>'+dailyStrip()+'</div>'+
 '<div class="section-head"><h2>დღის ამოცანები</h2><small>მოდულები და პრაქტიკა ცალ-ცალკე</small></div>'+renderDailyTaskCards(d)+
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
function renderCourses(){return '<div class="page-intro"><div><span class="eyebrow">COURSE LIBRARY</span><h1>კურსების ბიბლიოთეკა</h1><p class="sub">ცხრავე კურსში ჩარიცხული ხარ Udemy Personal Plan-ის ფარგლებში.</p></div></div>'+renderActiveCourses()+'<div class="section-head"><h2>წინა გეგმის კურსები · არქივი</h2></div><input class="search" id="courseSearch" type="search" placeholder="მოძებნე კურსი ან უნივერსიტეტი..." value="'+tb(search)+'"><div id="courseList">'+renderCourseList()+'</div>'}
function renderRoadmap(){
 var groups=[{label:"INTENSIVE PHASE",name:"პირველი ორი თვე",range:"14.11.2026 — 13.01.2027",desc:"ყოველდღიური სწავლა: Claude, GitHub, Google AI, ChatGPT, მონაცემები და Python",time:"94 სთ"},{label:"SPECIALIZATION PHASE",name:"შემდეგი ოთხი თვე",range:"14.01.2027 — 14.05.2027",desc:"AI აგენტები, RAG, სამართლებრივი კვლევა, უსაფრთხოება და OS-ების პირველი სპეციფიკაციები",time:"5–7 სთ/კვ."}];
 return '<div class="page-intro"><div><span class="eyebrow">6 MONTH ROADMAP</span><h1>განვითარების მარშრუტი</h1><p class="sub">პირველი ორი თვე ინტენსიური, მომდევნო ოთხი — ეტაპობრივი.</p></div></div>'+
 '<div class="tasks" style="margin-bottom:27px">'+groups.map(function(g){return '<div class="panel"><span class="eyebrow">'+g.label+'</span><h2 style="font-family:Georgia,serif;font-weight:500;font-size:24px;margin:10px 0">'+g.name+'</h2><p class="muted" style="font-size:12px">'+g.range+' · '+g.time+'</p><p>'+g.desc+'</p></div>'}).join("")+'</div>'+
 '<div class="section-head"><h2>კვირეული პროგრამა</h2><small>14 იანვრიდან</small></div><div class="weekly-grid">'+DATA.weekly.map(function(w,i){
 var x=percentFor("w",w.start);return '<article class="weekly-card"><div class="weekly-meta"><span class="eyebrow">WEEK '+String(i+1).padStart(2,"0")+'</span><span class="badge">'+tb(dateKa(w.start,{day:"numeric",month:"short"}))+' – '+tb(dateKa(w.end,{day:"numeric",month:"short"}))+'</span><span class="badge accent">'+x+'%</span></div><h3>'+tb(w.track)+'</h3><p><strong>მოდულები: </strong>'+tb(w.module)+'</p><p><strong>შედეგი: </strong>'+tb(w.practice)+'</p><div class="links">'+weekLinks(w)+'</div><div class="weekly-checks">'+iconCheck("w",w.start,"learn","მოდული დასრულებულია")+iconCheck("w",w.start,"practice","პრაქტიკა დასრულებულია")+'<button class="btn small" data-date="'+w.start+'" data-open-day="1">კვირის გახსნა ↗</button></div></article>';
 }).join("")+"</div>";
}
function renderLab(){
 var lab=window.BUILD_LAB;
 if(!lab)return '<div class="panel"><h2>ლაბორატორია ვერ ჩაიტვირთა</h2><p>განაახლე გვერდი ან გახსენი Research OS-ის მაგალითი GitHub Pages-ზე.</p></div>';
 var completed=lab.steps.filter(function(step,i){return complete("lab",lab.id,"step"+i)}).length;
 var progress=pct(completed,lab.steps.length);
 var tools=lab.what.map(function(x){
  return '<div class="panel" style="padding:15px"><strong>'+tb(x[0])+'</strong><p class="muted" style="font-size:12px;margin-bottom:0">'+tb(x[1])+'</p></div>'
 }).join("");
 var steps=lab.steps.map(function(step,i){
  return '<article class="weekly-card"><div class="weekly-meta"><span class="eyebrow">STEP '+String(i+1).padStart(2,"0")+'</span><span class="badge accent">'+(complete("lab",lab.id,"step"+i)?"✓ შესრულებულია":"გასაკეთებელია")+'</span></div><h3>'+tb(step.title)+'</h3><p style="color:var(--ink)">'+tb(step.body)+'</p><p class="muted" style="font-size:12px"><strong>ტესტი:</strong> '+tb(step.test)+'</p><div class="weekly-checks">'+iconCheck("lab",lab.id,"step"+i,"შევასრულე ეს ნაბიჯი")+'</div></article>';
 }).join("");
 return '<div class="page-intro"><div><span class="eyebrow">RESEARCH OS · HANDS-ON LESSON</span><h1>პრაქტიკული ლაბორატორია</h1><p class="sub">'+tb(lab.subtitle)+'</p></div></div>'+
 '<div class="grid-head">'+hero("SOURCE → DOCUMENT","დოკუმენტის რეალური წაკითხვა",lab.goal,progress)+
 '<div class="metric-card"><span class="metric-label">გაკვეთილის პროგრესი</span><div class="metric-value">'+progress+'%</div>'+progressLine(progress)+'<span class="metric-foot">'+completed+' / '+lab.steps.length+' ნაბიჯი</span></div>'+
 '<div class="metric-card"><span class="metric-label">შესაძლო შედეგი</span><div style="font-size:16px;font-weight:600">PDF-დან ამოღებული ფრაგმენტები</div><span class="metric-foot">ჯერ არ არის AI ბრიფინგი</span></div></div>'+
 '<div class="panel"><div class="eyebrow">FIRST, OPEN THE EXAMPLE</div><h2>გაიგე წყაროების კავშირი ვიზუალურად</h2><p>'+tb(lab.goal)+'</p><div class="links">'+link("Research OS-ის მაგალითი",lab.demo)+link("GitHub-ის ტესტის გაშვება",lab.workflow)+link("სრული გზამკვლევი",lab.guide)+'</div></div>'+
 '<div class="section-head"><h2>რა ფუნქცია აქვს თითოეულ ინსტრუმენტს?</h2></div><div class="course-grid">'+tools+'</div>'+
 '<div class="section-head"><h2>ეტაპობრივი გაკვეთილი</h2><small>თითოეული ნაბიჯი ცალკე მონიშნე</small></div><div class="weekly-grid">'+steps+'</div>';
}

function ap(){return window.ACTIVE_PROGRAM||{courses:[],weeks:[]}}
function apPercent(week){
 var done=0,tot=0;
 week.tasks.forEach(function(t){tot+=2;done+=Number(complete("p",t.id,"learn"))+Number(complete("p",t.id,"practice"))});
 return {done:done,total:tot,percent:pct(done,tot)};
}
function apTotal(){
 var done=0,tot=0;
 ap().weeks.forEach(function(w){var x=apPercent(w);done+=x.done;tot+=x.total});
 return {done:done,total:tot,percent:pct(done,tot)};
}
function apCourse(id){return ap().courses.find(function(c){return c.id===id})}
function renderActiveCourses(){
 return '<div class="active-courses">'+ap().courses.map(function(c){
  var kind=c.role==="primary"?"მთავარი კურსი":c.role==="reference"?"დამატებითი": "ახლად შერჩეული";
  var access=c.enrolled?"ჩარიცხული":"ჩარიცხვა გადაამოწმე";
  return '<div class="course-card"><span class="course-provider">'+tb(c.track)+'</span><h3>'+tb(c.name)+'</h3><div class="course-meta"><span>'+tb(kind)+'</span><span>·</span><span>'+tb(access)+'</span></div><p class="muted" style="font-size:12px">'+tb(c.note)+'</p><a target="_blank" rel="noopener noreferrer" href="'+tb(c.url)+'">Udemy-ზე გახსნა ↗</a></div>';
 }).join("")+'</div>';
}
function renderProgram(){
 var data=ap(),weeks=data.weeks,total=apTotal(),w=weeks[programWeekIndex]||weeks[0];
 if(!w)return '<div class="panel">პროგრამის ფაილი ვერ ჩაიტვირთა. განაახლე გვერდი.</div>';
 var current=apPercent(w);
 var weekButtons=weeks.map(function(v,i){
  var q=apPercent(v);
  return '<button type="button" class="program-week '+(i===programWeekIndex?"selected":"")+'" data-program-week="'+i+'"><small>კვირა '+(i+1)+'</small><strong>'+tb(v.name)+'</strong><span>'+tb(dateKa(v.start,{day:"numeric",month:"short"}))+' – '+tb(dateKa(v.end,{day:"numeric",month:"short"}))+'</span><em>'+q.percent+'%</em></button>';
 }).join("");
 var tasks=w.tasks.map(function(t,i){
  var c=apCourse(t.course),code=c?c.id:"practice",linkUrl=c?c.url:"https://khrekhviashvili-11.github.io/georgia-democracy-catalogue/research-lab/";
  var done=complete("p",t.id,"learn")&&complete("p",t.id,"practice");
  return '<article class="program-task '+(done?"finished":"")+'"><div class="program-task-top"><span class="eyebrow">'+tb(dateKa(t.date,{day:"numeric",month:"long"}))+' · '+(i+1)+'</span><span class="badge">'+(t.minutes||0)+' წთ</span></div>'+
  '<h3>'+tb(t.module)+'</h3><p class="program-course"><strong>'+tb(c?c.track:"პროექტის პრაქტიკა")+'</strong> · '+tb(c?c.name:"Research OS")+'</p>'+
  '<div class="program-actions"><div><span class="program-action-label">რისი გაკეთება უნდა შეძლო</span><p>'+tb(t.practice)+'</p></div><div><span class="program-action-label">როგორ შეამოწმებ</span><p>'+tb(t.test)+'</p></div></div>'+
  '<div class="program-footer"><div class="program-checks">'+iconCheck("p",t.id,"learn",c?"მოდული გავიარე":"ინსტრუქცია გავიარე")+iconCheck("p",t.id,"practice","პრაქტიკა შევასრულე")+'</div><a href="'+tb(linkUrl)+'" target="_blank" rel="noopener noreferrer">გახსნა ↗</a></div></article>';
 }).join("");
 return '<div class="page-intro"><div><span class="eyebrow">ACTIVE CURRICULUM · RESEARCH OS</span><h1>ჩემი ახალი პროგრამა</h1><p class="sub">18 ნოემბერი, 2026 — 12 იანვარი, 2027 · 8 კვირა · რეალური პროექტები</p></div><button class="btn" data-view="today">ძველი გეგმა ↗</button></div>'+
 '<div class="grid-head">'+hero("PROJECT-FIRST LEARNING","Research OS",data.guiding,total.percent)+
 '<div class="metric-card"><span class="metric-label">მთლიანი შესრულება</span><div class="metric-value">'+total.percent+'%</div>'+progressLine(total.percent)+'<span class="metric-foot">'+total.done+' / '+total.total+' მონიშვნა</span></div>'+
 '<div class="metric-card"><span class="metric-label">ამ კვირის შესრულება</span><div class="metric-value">'+current.percent+'%</div>'+progressLine(current.percent)+'<span class="metric-foot">'+current.done+' / '+current.total+' მონიშვნა</span></div></div>'+
 '<div class="panel"><span class="eyebrow">პირველ რიგში</span><h2 style="margin:7px 0 8px">არ გვჭირდება ცხრავე კურსის თავიდან ბოლომდე გავლა</h2><p class="muted">ორ Claude Code და ორ GitHub Actions კურსს შორის გადაფარვაა. თითოეულ საკითხს ვსწავლობთ იმ მომენტში, როცა Research OS-ის კონკრეტულ ამოცანაში დაგვჭირდება. ცხრავე კურსში ჩარიცხული ხარ, მათ შორის Python-ის ახალ კურსში.</p></div>'+
 '<div class="section-head"><h2>აირჩიე კვირა</h2><small>შესრულების % დამოუკიდებელია</small></div><div class="program-week-grid">'+weekButtons+'</div>'+
 '<div class="panel program-mission"><span class="eyebrow">WEEK '+(programWeekIndex+1)+' · '+tb(w.start)+' — '+tb(w.end)+'</span><h2>'+tb(w.name)+'</h2><p><strong>რას გაიგებ:</strong> '+tb(w.goal)+'</p><p><strong>კვირის ხელშესახები შედეგი:</strong> '+tb(w.deliverable)+'</p>'+progressLine(current.percent)+'</div>'+
 '<div class="section-head"><h2>სასწავლო მოდულები და პრაქტიკული ტესტები</h2><small>'+w.tasks.length+' დავალება</small></div><div class="program-tasks">'+tasks+'</div>'+
 '<div class="panel notes-panel"><h3>✎ ამ კვირის სამუშაო ჩანაწერი</h3><textarea data-notes="program:'+w.id+'" placeholder="რა გავიგე? რა შეცდომა მივიღე? როგორ გამოვასწორე?">'+tb(state.notes["program:"+w.id]||"")+'</textarea><p class="hint">მხოლოდ ამ მოწყობილობაზე ინახება. სარეზერვო ასლი: „მონაცემები“ → ექსპორტი.</p></div>'+
 '<div class="section-head"><h2>კურსების ბიბლიოთეკა (9 ჩარიცხული)</h2></div>'+renderActiveCourses();
}


/* Learning OS v3 · flexible systematic curriculum. Earlier calendars remain archival. */
function flexData(){return window.FLEX_PROGRAM||{modules:[],capabilities:[],intro:""}}
function flexModuleById(id){return flexData().modules.find(function(m){return m.id===id})}
function flexScore(module){
 var learned=0,practiced=0,deepened=0;
 module.topics.forEach(function(t){
  if(complete("f",t.id,"learn"))learned++;
  if(complete("f",t.id,"practice"))practiced++;
  if(complete("f",t.id,"depth"))deepened++;
 });
 return {learned:learned,total:module.topics.length,practiced:practiced,deepened:deepened,
  pct:pct(learned,module.topics.length)};
}
function flexTotal(){
 var learned=0,total=0,practiced=0,deepened=0;
 flexData().modules.forEach(function(m){var x=flexScore(m);learned+=x.learned;total+=x.total;practiced+=x.practiced;deepened+=x.deepened});
 return {learned:learned,total:total,practiced:practiced,deepened:deepened,pct:pct(learned,total)};
}
function flexCourseLinks(topic){
 var data=ap(),links=[],seen={};
 (topic.resourceIds||[]).forEach(function(id){
  var c=data.courses.find(function(v){return v.id===id});
  if(!c||seen[id])return;
  seen[id]=true;
  links.push('<a href="'+escapeHtml(cleanUrl(c.url))+'" target="_blank" rel="noopener noreferrer" class="flex-course-link">'+tb(c.name)+' ↗</a>');
 });
 (topic.extraLinks||[]).forEach(function(item){
  if(!item.url||seen[item.url])return;
  seen[item.url]=true;
  links.push('<a href="'+escapeHtml(cleanUrl(item.url))+'" target="_blank" rel="noopener noreferrer" class="flex-course-link">'+tb(item.label)+' ↗</a>');
 });
 return links.join("");
}
function renderFlexModules(){
 var data=flexData();
 if(!data.modules.length)return '<div class="panel"><h2>სასწავლო გეგმა ვერ ჩაიტვირთა</h2><p>განაახლე ვებგვერდი.</p></div>';
 var selectedModule=flexModuleById(flexModule)||data.modules[0];
 var selection=data.modules.map(function(m){
  var st=flexScore(m);
  return '<button type="button" class="flex-module-button '+(selectedModule.id===m.id?"selected":"")+'" data-flex-module="'+tb(m.id)+'">'+
    '<span class="flex-module-num">'+tb(m.number)+'</span><span class="flex-module-info"><strong>'+tb(m.title)+'</strong><small>'+tb(m.short)+'</small></span>'+
    '<span class="flex-module-counter">'+st.learned+' / '+st.total+'</span></button>';
 }).join("");
 var count=flexScore(selectedModule);
 var topics=selectedModule.topics.map(function(topic,index){
  var learned=complete("f",topic.id,"learn"),practiced=complete("f",topic.id,"practice"),depth=complete("f",topic.id,"depth");
  return '<article class="flex-lesson '+(learned?"read":"")+'"><div class="flex-lesson-top">'+
  '<span class="eyebrow">THEME '+String(index+1).padStart(2,"0")+'</span><span class="flex-lesson-status">'+(learned?"გაცნობილი მაქვს":"როცა მოგინდება")+'</span></div>'+
  '<h3>'+tb(topic.title)+'</h3><p class="flex-concept">'+tb(topic.concept)+'</p>'+
  '<div class="flex-why"><span class="program-action-label">რატომ არის მნიშვნელოვანი?</span><p>'+tb(topic.why)+'</p></div>'+
  '<div class="flex-resource"><span class="program-action-label">სასწავლო რესურსი</span><p>'+tb(topic.study)+'</p><div class="flex-resource-links">'+flexCourseLinks(topic)+'</div></div>'+
  '<div class="flex-checks"><div class="flex-check-line"><div><strong>საფუძველი</strong><p>გავეცანი თემას და მესმის ძირითადი იდეა.</p></div>'+
  iconCheck("f",topic.id,"learn","გავეცანი")+'</div>'+
  '<div class="flex-check-line"><div><strong>არჩევითი პრაქტიკა</strong><p>'+tb(topic.tryIt)+'</p></div>'+iconCheck("f",topic.id,"practice","გამოვცადე")+'</div>'+
  '<div class="flex-check-line"><div><strong>სურვილისამებრ გაღრმავება</strong><p>'+tb(topic.deepen)+'</p></div>'+iconCheck("f",topic.id,"depth","გავეცანი ღრმად")+'</div></div></article>';
 }).join("");
 var moduleCourses=(selectedModule.courseIds||[]).map(function(id){
  var course=apCourse(id);return course?link(course.name,course.url):"";
 }).filter(Boolean).join("");
 return '<div class="flex-intro"><span class="eyebrow">FLEXIBLE LEARNING PATH</span><h1>ტექნოლოგიების სისტემური შესწავლა</h1><p>'+tb(data.intro)+'</p></div>'+
  '<div class="flex-steps-summary"><div><strong>'+data.modules.length+'</strong><small>ლოგიკური მოდული</small></div><div><strong>'+data.modules.reduce(function(n,m){return n+m.topics.length},0)+'</strong><small>მოკლე თემა</small></div><div><strong>'+ap().courses.length+'</strong><small>შერჩეული კურსი</small></div></div>'+
  '<div class="panel flex-guide"><strong>როგორ გამოიყენო</strong><p>'+tb(data.howToUse)+'</p><p class="muted">პროგრესის ნიშანი ნიშნავს მხოლოდ იმას, რომ თემას გაეცანი. არჩევითი პრაქტიკა და გაღრმავება საერთო პროცენტს არ ამცირებს.</p></div>'+
  '<div class="flex-heading"><h2>აირჩიე მოდული</h2><small>სურვილისამებრ ნებისმიერი თემიდან დაიწყე</small></div>'+
  '<div class="flex-module-grid">'+selection+'</div>'+
  '<section class="flex-module-detail"><div class="flex-module-heading"><span class="eyebrow">MODULE '+tb(selectedModule.number)+'</span><h2>'+tb(selectedModule.title)+'</h2><p>'+tb(selectedModule.description)+'</p>'+
  '<div class="flex-module-progress"><strong>'+count.learned+' / '+count.total+' თემა გაცნობილი</strong><span>'+count.pct+'%</span></div>'+progressLine(count.pct)+
  '<p class="muted"><strong>მიზანი:</strong> '+tb(selectedModule.outcome)+'</p><div class="links">'+moduleCourses+'</div></div>'+
  '<div class="flex-lesson-grid">'+topics+'</div></section>'+
  '<div class="panel notes-panel"><h3>ჩემი ჩანაწერები · '+tb(selectedModule.title)+'</h3><textarea data-notes="flex:'+tb(selectedModule.id)+'" placeholder="რა შესაძლებლობა აღმოვაჩინე? სად შემიძლია გამოვიყენო?">'+tb(state.notes["flex:"+selectedModule.id]||"")+'</textarea><p class="hint">შენახვა ამ ბრაუზერში ხდება. პერსონალური ან კონფიდენციალური შემთხვევების დეტალები არ ჩაწერო.</p></div>';
}
function renderFlexCapabilities(){
 var data=flexData();
 var caps=data.capabilities.map(function(c){
  var m=flexModuleById(c.module);
  return '<article class="flex-capability"><div class="eyebrow">CAPABILITY</div><h3>'+tb(c.name)+'</h3><p>'+tb(c.summary)+'</p><div class="flex-capability-meta"><strong>შესაძლო ინსტრუმენტები</strong><span>'+tb(c.tech)+'</span></div>'+
   '<div class="flex-capability-meta"><strong>სად გამოგადგება?</strong><span>'+tb(c.example)+'</span></div>'+
   '<button type="button" class="btn small" data-flex-module="'+tb(c.module)+'">გაიგე მეტი · '+tb(m?m.number:"")+' ↗</button></article>';
 }).join("");
 return '<div class="flex-intro"><span class="eyebrow">CAPABILITY LIBRARY</span><h1>რა შეიძლება შევქმნა?</h1><p>იდეის გაჩენისას ამ ბიბლიოთეკაში მოძებნე შესაბამისი ტექნიკური შესაძლებლობა და გაიგე, რა გზებით შეიძლება მისი განხორციელება.</p></div>'+
 '<div class="flex-capabilities">'+caps+'</div>';
}
function renderFlexible(){
 var t=flexTotal();
 return '<div class="page-intro"><div><span class="eyebrow">LEARNING OS · VERSION 4</span><h1>ჩემი სასწავლო სივრცე</h1><p class="sub">ცოდნა თანმიმდევრულად, ტემპი თავისუფლად. არანაირი სავალდებულო ტესტი ან ვადა.</p></div></div>'+
 '<div class="flex-topline"><div><span class="eyebrow">გაცნობილი თემები</span><strong>'+t.learned+' / '+t.total+'</strong><small>შეფასება არ არის · შეგიძლია ნებისმიერ დროს გაჩერდე</small></div>'+
 '<div><span class="eyebrow">არჩევითი პრაქტიკა</span><strong>'+t.practiced+'</strong><small>შენ თვითონ წყვეტ, რომელი გამოსცადო</small></div><div><span class="eyebrow">გაღრმავება</span><strong>'+t.deepened+'</strong><small>საჭიროების მიხედვით</small></div></div>'+
 '<div class="flex-tabs"><button type="button" data-flex-tab="modules" class="'+(flexTab==="modules"?"active":"")+'">სასწავლო მოდულები</button><button type="button" data-flex-tab="capabilities" class="'+(flexTab==="capabilities"?"active":"")+'">შესაძლებლობების ბიბლიოთეკა</button></div>'+
 (flexTab==="capabilities"?renderFlexCapabilities():renderFlexModules())+
 '<div class="flex-bottom-links"><button class="btn" type="button" data-view="courses">კურსების ბიბლიოთეკა ('+ap().courses.length+') ↗</button>'+
 '<button class="btn" type="button" data-view="archive-weekly">წინა 8-კვირიანი გეგმა ↗</button>'+
 '<button class="btn" type="button" data-view="today">პირველი დღიური გეგმა ↗</button></div>';
}
function renderFlexibleOverview(){
 var data=flexData(),t=flexTotal();
 return '<div class="page-intro"><div><span class="eyebrow">SELF-PACED LEARNING</span><h1>გაცნობილი შესაძლებლობები</h1><p class="sub">ეს არის შენი გზის ჩანაწერი და არა შესრულების ვალდებულება.</p></div></div>'+
 '<div class="flex-topline"><div><span class="eyebrow">საფუძვლები</span><strong>'+t.learned+' / '+t.total+'</strong><small>გაცნობილი თემები</small></div><div><span class="eyebrow">არჩევითი პრაქტიკა</span><strong>'+t.practiced+'</strong><small>გამოცდილი მაგალითები</small></div><div><span class="eyebrow">გაღრმავება</span><strong>'+t.deepened+'</strong><small>დამატებით ნასწავლი</small></div></div>'+
 '<div class="flex-module-grid">'+data.modules.map(function(m){var q=flexScore(m);return '<button class="flex-module-button" data-flex-module="'+tb(m.id)+'"><span class="flex-module-num">'+tb(m.number)+'</span><span class="flex-module-info"><strong>'+tb(m.title)+'</strong><small>'+tb(m.short)+'</small></span><span class="flex-module-counter">'+q.learned+' / '+q.total+'</span></button>'}).join("")+'</div>'+
 '<div class="panel"><h3>ძველი პროგრამების შენახული პროგრესი</h3><p>წინა რვაკვირიანი და Coursera-ს გეგმები არ წაშლილა. მათი მონიშვნები და ჩანაწერები ამავე ბრაუზერშია შენახული.</p><div class="links"><button class="btn small" data-view="archive-weekly">8-კვირიანი გეგმა</button><button class="btn small" data-view="today">ძველი დღიური გეგმა</button></div></div>';
}

function renderSettings(){
 return '<div class="page-intro"><div><span class="eyebrow">YOUR DATA</span><h1>მონაცემები და შენახვა</h1><p class="sub">შენი წინსვლა ეკუთვნის შენ, არა GitHub-ის საჯარო გვერდს.</p></div></div><div class="settings-grid">'+
 '<section class="settings-section"><span class="eyebrow">BACKUP</span><h3>სარეზერვო ასლის ჩამოტვირთვა</h3><p>გადმოიწერე მონიშნული მოდულები, პრაქტიკული დავალებები და ჩანაწერები JSON ფაილად. შეგიძლია სხვა მოწყობილობაშიც აღადგინო.</p><div class="actions"><button class="btn primary" id="exportProgress">↓ ექსპორტი (JSON)</button></div></section>'+
 '<section class="settings-section"><span class="eyebrow">RESTORE</span><h3>პროგრესის აღდგენა</h3><p>თუ ახალ ბრაუზერზე ან ტელეფონზე გადახვალ, აირჩიე ადრე შენახული JSON ფაილი. არსებული ნიშნები ჩანაცვლდება.</p><div class="actions"><button class="btn" id="importProgress">↑ იმპორტი</button><input type="file" id="importFile" accept="application/json,.json" hidden></div></section>'+
 '<section class="settings-section"><span class="eyebrow">PRIVACY</span><h3>სად ინახება მონაცემები?</h3><p>მონიშვნები და სამუშაო ჩანაწერები ინახება ამ ბრაუზერის localStorage-ში. GitHub-ზე ქვეყნდება მხოლოდ სასწავლო გეგმა, არა შენი პროგრესი. სხვა მოწყობილობასთან სინქრონიზაცია ამ ვერსიაში არ არის.</p><p>ბრაუზერის მონაცემების წაშლისას შენახული პროგრესიც შეიძლება წაიშალოს, ამიტომ პერიოდულად შექმენი სარეზერვო ასლი.</p></section>'+
 '<section class="settings-section"><span class="eyebrow">RESET</span><h3>პროგრესის გასუფთავება</h3><p>ეს მოქმედება გააუქმებს ყველა მონიშვნასა და ჩანაწერს მხოლოდ ამ მოწყობილობაზე. სასწავლო გეგმა არ შეიცვლება.</p><div class="actions"><button class="btn danger" id="clearProgress">ყველა ნიშნის წაშლა</button></div></section></div>';
}
function updateNav(){document.querySelectorAll("[data-view]").forEach(function(el){el.classList.toggle("active",el.dataset.view===view)})}
function render(){if(view==="program")root.innerHTML=renderFlexible();else if(view==="archive-weekly")root.innerHTML=renderProgram();else if(view==="today")root.innerHTML=renderToday();else if(view==="overview")root.innerHTML=renderFlexibleOverview();else if(view==="courses")root.innerHTML=renderCourses();else if(view==="roadmap")root.innerHTML=renderRoadmap();else if(view==="lab")root.innerHTML=renderLab();else root.innerHTML=renderSettings();updateNav()}
function go(v){view=v;render();window.scrollTo(0,0)}
function jumpDate(dt){selected=clampDate(dt);view="today";render();window.scrollTo(0,0)}
var toastTimer;
function showToast(s){toastEl.textContent=s;toastEl.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(function(){toastEl.classList.remove("show")},2600)}
document.addEventListener("click",function(e){
 var fm=e.target.closest("[data-flex-module]");
 if(fm){if(flexModuleById(fm.dataset.flexModule)){flexModule=fm.dataset.flexModule;flexTab="modules";state.notes["flex:lastModule"]=flexModule;save();go("program")}return}
 var ft=e.target.closest("[data-flex-tab]");
 if(ft){flexTab=ft.dataset.flexTab==="capabilities"?"capabilities":"modules";render();return}
 var wk=e.target.closest("[data-program-week]");if(wk){programWeekIndex=Number(wk.dataset.programWeek);render();return}
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