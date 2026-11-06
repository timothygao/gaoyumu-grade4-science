/* 四上《空气》单元1—8课 · 三轮学习；历史科学卷使用独立存储和 quiz_id */
(()=>{
"use strict";
const questions=window.AIR_UNIT_QUESTIONS||[];
const lessons=window.AIR_UNIT_LESSONS||[];
const QUIZ_ID="gaoyumu-grade4-science-air-8lesson-v1";
const STUDENT="高语牧";
const SB_URL="https://iqlnwzxmtjjgzisufljd.supabase.co";
const SB_PUBLIC_KEY="sb_publishable_jnY3xbWPgPFBd6naW35bXQ_tzZcNOTE";
const BASE_KEY="gao-science-air-v1:";
const $=x=>document.getElementById(x);
const escape=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const short=x=>String(x||"").trim();
const modeLabel={memory:"基础填空",scene:"生活情境"};
let mode="memory",semester="2026秋",state,client=null,userId=null,unlocked=false,syncing=false;
const initial=()=>({v:1,modes:{memory:{current:1,rounds:{}},scene:{current:1,rounds:{}}},queue:[]});
function storageKey(){return BASE_KEY+semester}
function load(){try{const d=JSON.parse(localStorage.getItem(storageKey())||"null");
  if(d&&d.v===1&&d.modes&&d.queue){for(const m of ["memory","scene"])if(!d.modes[m])d.modes[m]={current:1,rounds:{}};return d;}
}catch(e){}return initial();}
function save(){try{localStorage.setItem(storageKey(),JSON.stringify(state));$("save-status").textContent="✓ 已保存到本机";return true}
 catch(e){$("save-status").textContent="⚠ 本机保存失败，请检查浏览器存储权限";return false;}}
function course(m){return questions.filter(q=>q.mode===m)}
function md(m=mode){return state.modes[m]}
function rd(m=mode,r=md(m).current){const d=md(m).rounds;if(!d[r])d[r]={answers:{},ticks:{},skipped:{},graded:false,done:false};return d[r]}
function prior(q,m,r){for(let prev=1;prev<r;prev++){const d=rd(m,prev);if(d.done&&d.ticks[q.id])return prev;}return 0}
function required(m=mode,r=md(m).current){return course(m).filter(q=>!prior(q,m,r))}
function isReady(q,d){return !!short(d.answers[q.id])||!!d.skipped[q.id]}
function label(q,m,r,d){const prev=prior(q,m,r);if(prev)return "第"+prev+"轮已掌握 · 本轮免做";
 if(d.done&&d.ticks[q.id])return "第"+r+"轮已掌握";
 if(d.graded&&!d.ticks[q.id])return "待巩固";
 if(d.ticks[q.id])return "已勾选掌握 · 待核对";
 if(d.skipped[q.id])return "暂时不会 · 待巩固";
 return "待练习";}
function statusType(q,m,r,d){const prev=prior(q,m,r);
 return prev||d.ticks[q.id]?"good":d.skipped[q.id]||d.graded?"bad":"neutral";}
function totals(m=mode,r=md(m).current){const list=course(m),want=required(m,r),d=rd(m,r);
 const ready=want.filter(q=>isReady(q,d)).length;
 const mastered=list.filter(q=>{for(let k=1;k<=3;k++){const z=rd(m,k);if(z.done&&z.ticks[q.id])return true;}return false}).length;
 return {all:list.length,want:want.length,ready,mastered,done:d.done,graded:d.graded};}
function friendlyNext(){const x=totals();
 if(x.want===0)return "此前的题目已全部掌握。这一轮无需重做，可直接核对完成。";
 if(x.done)return "本轮已保存。如需再次核对，点击下方“补批改·查看全部参考答案”；原答案和云端记录不会被清空。";
 if(x.graded)return "参考答案已显示；检查完后点击“本轮核对完毕”，记录这一次学习。";
 return "本轮只需完成 "+x.want+" 道题；不会的可以点“暂时不会”，不必猜答案。";}
function render(){
 const selected=md().current,d=rd(),ts=totals();
 document.querySelectorAll("[data-mode-switch]").forEach(b=>{b.classList.toggle("active",b.dataset.modeSwitch===mode);b.setAttribute("aria-pressed",String(b.dataset.modeSwitch===mode))});
 document.querySelectorAll("[data-round-switch]").forEach(b=>{
  const r=Number(b.dataset.roundSwitch);
  b.classList.toggle("active",selected===r);
  b.disabled=r>1&&!rd(mode,r-1).done;
 });
 $("current-label").textContent=modeLabel[mode]+" · 第"+selected+"轮";
 $("headline-count").textContent=ts.want;
 $("headline-total").textContent="/ "+ts.all+"题";
 $("headline-note").textContent=ts.want===ts.all?"第1轮完整练习":(ts.all-ts.want)+"题此前已掌握，本轮无需再做";
 $("now-action").textContent=friendlyNext();
 $("round-progress").style.width=(ts.all?ts.mastered/ts.all*100:0)+"%";
 $("progress-copy").textContent="累计掌握 "+ts.mastered+" / "+ts.all+"题";
 const sw=$("review-only");sw.checked=!!state.reviewOnly?.[mode];
 // 默认首轮显示全部；第二、三轮默认只显示待巩固题
 if(!state.reviewOnly)state.reviewOnly={memory:false,scene:false};
 const panel=$("question-groups");panel.innerHTML="";
 let visible=0;
 for(let lesson=1;lesson<=8;lesson++){
  const current=course(mode).filter(q=>q.lesson===lesson);
  const items=current.filter(q=>!(state.reviewOnly[mode]&&prior(q,mode,selected)));
  if(!items.length)continue;
  const section=document.createElement("section");section.className="lesson";
  const id="lesson-"+mode+"-"+lesson;
  section.innerHTML='<div class="lesson-heading"><h3>第'+lesson+'课 · '+escape(lessons[lesson-1])+'</h3><span>'+items.length+'题</span></div><div class="lesson-items" id="'+id+'"></div>';
  panel.appendChild(section);const host=section.querySelector(".lesson-items");
  for(const q of items){
   const previous=prior(q,mode,selected),text=d.answers[q.id]||"",skipped=!!d.skipped[q.id];
   const blocked=!!previous||d.graded||d.done;
   const status=label(q,mode,selected,d),kind=statusType(q,mode,selected,d);
   const c=document.createElement("article");c.className="question";
   c.dataset.questionId=q.id;
   c.innerHTML='<div class="question-top"><span class="qnum">'+escape(q.id)+'</span><span class="mark '+kind+'">'+escape(status)+'</span></div>'+
     '<div class="prompt">'+escape(q.q)+'</div>'+
     '<label class="answer-label" for="ans-'+q.id+'">我的回答</label>'+
     (mode==="scene"?'<textarea class="qanswer" id="ans-'+q.id+'" data-answer="'+q.id+'" rows="3" placeholder="先判断，再写出理由和证据" '+(blocked||skipped?"disabled":"")+'>'+escape(text)+'</textarea>':
       '<input class="qanswer" id="ans-'+q.id+'" data-answer="'+q.id+'" autocomplete="off" placeholder="不确定可以选择“暂时不会”" value="'+escape(text)+'" '+(blocked||skipped?"disabled":"")+'>')+
     '<div class="mark-controls"><label class="tick-label"><input type="checkbox" data-tick="'+q.id+'" '+(d.ticks[q.id]?"checked ":"")+(!!previous||skipped||!short(text)?"disabled":"")+'><b>这题我独立答对了</b></label>'+
     '<button type="button" class="skip" data-skip="'+q.id+'" '+(blocked?"disabled":"")+'>'+ (skipped?"撤销“暂时不会”":"暂时不会")+'</button></div>'+
     '<div class="round-marks"><span>三轮记录（有作答才可勾选）</span>'+[1,2,3].map(r=>{
       const v=rd(mode,r),oldMastered=!!prior(q,mode,r);
       const checked=!!v.ticks[q.id];
       const allowed=checked||(!oldMastered&&!v.skipped[q.id]&&!!short(v.answers[q.id]));
       const hint=allowed?'修改第'+r+'轮掌握记录':'请先到第'+r+'轮独立作答，再勾选掌握';
       return '<label title="'+hint+'"><input type="checkbox" data-round-tick="'+q.id+'" data-round-no="'+r+'" '+(checked?"checked ":"")+(allowed?"":"disabled ")+
         '><span>第'+r+'轮</span></label>';
     }).join("")+'</div>'+
     (!previous&&d.graded&&(d.reviewAllAnswers||!d.ticks[q.id])?'<div class="answer-reveal"><b>参考答案：</b>'+escape(q.a)+'<p>'+escape(q.why)+'</p></div>':'')+
     (previous?'<div class="exempt-note">已在第'+previous+'轮独立掌握，不属于本轮必须作答内容。</div>':'');
   host.appendChild(c);visible++;
  }
 }
 if(!visible)panel.innerHTML='<div class="empty">全部题目已在前面轮次掌握，本轮不用重复做。完成本轮核对即可。</div>';
 $("grade").textContent=d.reviewAllAnswers?"✓ 已显示全部参考答案（可再次查看）":d.done?"补批改 · 查看全部参考答案":d.graded?"查看全部参考答案":ts.want===0?"确认本轮无需重做":"批改并显示参考答案";
 $("grade").disabled=ts.ready<ts.want;
 $("finish").disabled=d.done||(!d.graded&&ts.want>0);
 $("finish").textContent=d.done?"✓ 本轮已核对并保存":"本轮全部核对完毕";
 $("next").disabled=!d.done||selected>=3;
 $("next").textContent=selected===3?"三轮已完成":"进入第"+(selected+1)+"轮 · 只练不会的";
 const result=$("result");
 result.hidden=!d.graded;
 if(d.graded){
  const a=required(mode,selected);
  const n=a.filter(q=>d.ticks[q.id]).length;
  result.innerHTML='<b>第'+selected+'轮已批改：'+n+'/'+a.length+'题标记为独立掌握</b><p>'+(d.reviewAllAnswers?'已开启本轮全部参考答案，原作答、掌握勾选、完成状态和历史云端成绩均未改变。可在每题下方再次核对。':'本轮还有 '+(a.length-n)+' 道待巩固。未掌握题已显示参考答案。核对后可点击“本轮全部核对完毕”。')+'</p>';
 }
 save();updateCloudNote();
}
function updateCloudNote(){
 const pending=state.queue.filter(x=>!x.synced).length;
 const extra=pending? "本机待同步 "+pending+" 次":"本机没有待同步记录";
 if(!client){$("cloud-status").textContent="云端组件尚未加载。已完成记录仍可保存在本机；"+extra;return;}
 if(!unlocked){$("cloud-status").textContent="未解锁家庭档案 · "+extra;return;}
 $("cloud-status").textContent="✓ 家庭档案已解锁 · "+extra;
}
function switchMode(m){
 mode=m;render();
}
function switchRound(r){
 if(r>1&&!rd(mode,r-1).done){alert("请先完成上一轮核对。");return;}
 md().current=r;
 if(!state.reviewOnly)state.reviewOnly={memory:false,scene:false};
 state.reviewOnly[mode]=r>1;
 render();window.scrollTo({top:0,behavior:"smooth"});
}
function grade(){
 const t=totals(),d=rd();
 if(t.ready<t.want){alert("本轮还有 "+(t.want-t.ready)+" 道题未作答。不会的请点击“暂时不会”。");return;}
 // Reopening a graded/completed round only reveals the reference answers.
 // Never reset answers, ticks, skipped flags, done status, or existing cloud queue.
 if(d.done||d.graded)d.reviewAllAnswers=true;
 d.graded=true;
 save();render();
 $("result").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function newUUID(){return crypto.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{const x=Math.floor(Math.random()*16);return (c==="x"?x:(x&3|8)).toString(16)})}
function finishRound(){
 const r=md().current,d=rd(),list=required(mode,r);
 if(d.done)return;
 if(list.length&&!d.graded){alert("请先点击“批改并显示参考答案”，再完成核对。");return;}
 if(list.some(q=>!isReady(q,d))){alert("本轮还有题未完成。");return;}
 const right=list.filter(q=>!!d.ticks[q.id]).length;
 d.done=true;d.finishedAt=new Date().toISOString();
 if(list.length){
  const attemptId=newUUID();
  d.attemptId=attemptId;
  const phase="空气单元·"+modeLabel[mode];
  state.queue.push({
    synced:false,attempt:{
      id:attemptId,created_by:null,child_name:STUDENT,quiz_id:QUIZ_ID,
      semester,phase,round_no:r,total_questions:list.length,
      correct_questions:right,score:Math.round(right/list.length*10000)/100,
      completed_at:d.finishedAt
    },
    items:list.map(q=>({
      correct_char:q.id,expected_word:q.a,question_type:modeLabel[mode],
      given_answer:JSON.stringify({question:q.q,answer:d.answers[q.id]||"",lesson:q.lesson,skipped:!!d.skipped[q.id]}),
      is_correct:!!d.ticks[q.id],answered_at:d.finishedAt
    }))
  });
 }
 save();render();
 if(unlocked)syncPending();
}
function changeAnswer(id,v){const d=rd();if(d.graded||d.done)return;d.answers[id]=v;if(short(v))d.skipped[id]=false;if(!short(v))d.ticks[id]=false;save();const checkbox=document.querySelector('[data-tick="'+id+'"]');if(checkbox){checkbox.disabled=!short(v);checkbox.checked=!!d.ticks[id];}updateActionButtons();}
function updateActionButtons(){const t=totals();$("grade").disabled=t.ready<t.want;$("headline-count").textContent=t.want;$("now-action").textContent=friendlyNext();}
// A completed round is never deleted when a parent corrects a mastery checkbox.
// For a previously synced round, save a newer revision as a new attempt; the
// cloud restore routine already prefers the newest attempt per mode and round.
function updateCompletedRoundRecord(m,r){
 const d=rd(m,r);if(!d.done)return;
 const list=required(m,r);
 const right=list.filter(q=>!!d.ticks[q.id]).length;
 const existing=state.queue.find(e=>e.attempt&&e.attempt.id===d.attemptId&&!e.synced);
 const recordedAt=new Date().toISOString();
 const attemptId=existing?d.attemptId:newUUID();
 const payload={
   id:attemptId,created_by:null,child_name:STUDENT,quiz_id:QUIZ_ID,semester,
   phase:"空气单元·"+modeLabel[m],round_no:r,total_questions:list.length,
   correct_questions:right,score:list.length?Math.round(right/list.length*10000)/100:100,
   completed_at:recordedAt
 };
 const items=list.map(q=>({
   correct_char:q.id,expected_word:q.a,question_type:modeLabel[m],
   given_answer:JSON.stringify({question:q.q,answer:d.answers[q.id]||"",lesson:q.lesson,skipped:!!d.skipped[q.id]}),
   is_correct:!!d.ticks[q.id],answered_at:recordedAt
 }));
 if(existing){
   existing.attempt=payload;existing.items=items;
 }else{
   state.queue.push({synced:false,attempt:payload,items});
 }
 d.attemptId=attemptId;d.finishedAt=recordedAt;
}
function changeRoundTick(id,r,on){
 const q=course(mode).find(x=>x.id===id);
 if(!q)return;
 const d=rd(mode,r);
 // A previous mastered round exempts this question from later rounds.
 if(on&&prior(q,mode,r)){
   alert("这题已在前面的轮次掌握，本轮无需重复勾选。");render();return;
 }
 if(on&&(d.skipped[id]||!short(d.answers[id]))){
   alert("请先在第"+r+"轮独立填写这道题，再勾选掌握。");render();return;
 }
 if(!!d.ticks[id]===!!on)return;
 d.ticks[id]=!!on;
 if(d.done)updateCompletedRoundRecord(mode,r);
 save();render();
 if(unlocked&&d.done)syncPending();
}
function changeTick(id,on){changeRoundTick(id,md().current,on);}
function toggleSkip(id){const d=rd();if(d.graded||d.done)return;d.skipped[id]=!d.skipped[id];if(d.skipped[id]){d.answers[id]="";d.ticks[id]=false;}save();render();}
async function ensureIdentity(){
 if(!client)throw Error("网络连接不可用");
 let r=await client.auth.getSession();if(r.error)throw r.error;
 if(!r.data.session){r=await client.auth.signInAnonymously();if(r.error)throw r.error;}
 r=await client.auth.getUser();if(r.error||!r.data.user)throw r.error||Error("获取学习身份失败");
 userId=r.data.user.id;
}
async function checkUnlock(){
 await ensureIdentity();
 const r=await client.from("family_access").select("user_id").eq("user_id",userId).maybeSingle();
 if(r.error)throw r.error;
 unlocked=!!r.data;updateCloudNote();
 return unlocked;
}
async function unlockFamily(){
 const pass=$("passphrase").value.trim();if(!pass){$("cloud-status").textContent="请先输入家庭暗号。";return;}
 const btn=$("unlock");btn.disabled=true;
 try{
  await ensureIdentity();
  const result=await client.functions.invoke("unlock-family",{body:{passphrase:pass}});
  if(result.error)throw result.error;
  if(!result.data||result.data.ok!==true)throw Error(result.data?.error||"家庭暗号验证失败");
  $("passphrase").value="";
  await checkUnlock();
  $("cloud-status").textContent="✓ 家庭档案解锁成功；正在同步本机记录。";
  await syncPending();
 }catch(e){$("cloud-status").textContent="解锁失败："+(e.message||e)}
 finally{btn.disabled=false;}
}
async function syncPending(){
 if(syncing)return;
 syncing=true;$("sync").disabled=true;
 try{
  if(!unlocked){if(!(await checkUnlock())){ $("cloud-status").textContent="请先解锁家庭档案。";return;}}
  let good=0;
  for(const entry of state.queue){
   if(entry.synced)continue;
   const a=entry.attempt;
   const exists=await client.from("quiz_attempts_secure").select("id").eq("id",a.id).maybeSingle();
   if(exists.error)throw exists.error;
   if(!exists.data){
     const payload={...a,created_by:userId};
     const inserted=await client.from("quiz_attempts_secure").insert(payload);
     if(inserted.error)throw inserted.error;
   }
   const found=await client.from("quiz_item_results_secure").select("correct_char").eq("attempt_id",a.id).limit(500);
   if(found.error)throw found.error;
   const present=new Set((found.data||[]).map(x=>x.correct_char));
   const missing=entry.items.filter(x=>!present.has(x.correct_char));
   if(missing.length){
     const rows=missing.map(x=>({...x,attempt_id:a.id,created_by:userId,child_name:STUDENT,semester:a.semester}));
     const pushed=await client.from("quiz_item_results_secure").insert(rows);
     if(pushed.error)throw pushed.error;
   }
   entry.synced=true;save();good++;
  }
  $("cloud-status").textContent="✓ 云端同步成功 · 本次上传 "+good+" 轮 · 以前的科学记录未改变";
 }catch(e){$("cloud-status").textContent="⚠ 云端同步失败，本机记录已保留，可点击重试："+(e.message||e)}
 finally{syncing=false;$("sync").disabled=false;}
}
async function restoreCloud(){
 if(!unlocked){$("cloud-status").textContent="请先解锁家庭档案。";return;}
 $("restore").disabled=true;
 try{
  const a=await client.from("quiz_attempts_secure")
    .select("id,phase,round_no,completed_at")
    .eq("quiz_id",QUIZ_ID).eq("child_name",STUDENT).eq("semester",semester)
    .order("completed_at",{ascending:false}).limit(70);
  if(a.error)throw a.error;
  const attempts=(a.data||[]).filter(x=>x.round_no>=1&&x.round_no<=3);
  if(!attempts.length){$("cloud-status").textContent="云端尚无本试卷的完成记录。";return;}
  const b=await client.from("quiz_item_results_secure")
    .select("attempt_id,correct_char,given_answer,is_correct")
    .in("attempt_id",attempts.map(x=>x.id)).limit(5000);
  if(b.error)throw b.error;
  const byId=new Map();
  for(const item of b.data||[]){if(!byId.has(item.attempt_id))byId.set(item.attempt_id,[]);byId.get(item.attempt_id).push(item);}
  let restored=0;const seen=new Set();
  for(const a of attempts){
   const m=a.phase==="空气单元·基础填空"?"memory":a.phase==="空气单元·生活情境"?"scene":null;
   if(!m)continue;
   const k=m+"-"+a.round_no;if(seen.has(k))continue;seen.add(k);
   if(rd(m,a.round_no).done)continue; // 永远不覆盖本机已经完成的记录
   const d=rd(m,a.round_no);
   d.done=true;d.graded=true;d.finishedAt=a.completed_at;d.attemptId=a.id;
   for(const item of byId.get(a.id)||[]){
     d.ticks[item.correct_char]=!!item.is_correct;
     try{const v=JSON.parse(item.given_answer||"{}");d.answers[item.correct_char]=v.answer||"";d.skipped[item.correct_char]=!!v.skipped;}catch(e){}
   }
   restored++;
  }
  save();render();
  $("cloud-status").textContent="✓ 已从云端补回 "+restored+" 个轮次；未覆盖本机已有记录。";
 }catch(e){$("cloud-status").textContent="恢复失败："+(e.message||e)}
 finally{$("restore").disabled=false;}
}
function initEvents(){
 document.querySelectorAll("[data-mode-switch]").forEach(b=>b.addEventListener("click",()=>switchMode(b.dataset.modeSwitch)));
 document.querySelectorAll("[data-round-switch]").forEach(b=>b.addEventListener("click",()=>switchRound(Number(b.dataset.roundSwitch))));
 $("review-only").addEventListener("change",e=>{if(!state.reviewOnly)state.reviewOnly={memory:false,scene:false};state.reviewOnly[mode]=e.target.checked;render()});
 $("question-groups").addEventListener("input",e=>{if(e.target.matches("[data-answer]"))changeAnswer(e.target.dataset.answer,e.target.value)});
 $("question-groups").addEventListener("change",e=>{
   if(e.target.matches("[data-round-tick]"))changeRoundTick(e.target.dataset.roundTick,Number(e.target.dataset.roundNo),e.target.checked);
   else if(e.target.matches("[data-tick]"))changeTick(e.target.dataset.tick,e.target.checked);
 });
 $("question-groups").addEventListener("click",e=>{const b=e.target.closest("[data-skip]");if(b)toggleSkip(b.dataset.skip)});
 $("grade").addEventListener("click",grade);
 $("finish").addEventListener("click",finishRound);
 $("next").addEventListener("click",()=>switchRound(Math.min(3,md().current+1)));
 $("semester").addEventListener("change",e=>{
  const term=short(e.target.value);if(!/^20\d{2}(春|秋)$/.test(term)){alert("学期请填写如 2026秋");e.target.value=semester;return;}
  if(term===semester)return;
  semester=term;state=load();render();
 });
 $("unlock").addEventListener("click",unlockFamily);
 $("sync").addEventListener("click",syncPending);
 $("restore").addEventListener("click",restoreCloud);
 $("passphrase").addEventListener("keydown",e=>{if(e.key==="Enter")unlockFamily()});
}
async function initCloud(){
 try{
  if(!window.supabase)throw Error("连接库加载失败");
  client=window.supabase.createClient(SB_URL,SB_PUBLIC_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
  await checkUnlock();
  if(unlocked&&state.queue.some(q=>!q.synced))await syncPending();
 }catch(e){$("cloud-status").textContent="云端暂不可用，但本机作答可以保存："+(e.message||e);}
}
if(!questions.length){$("question-groups").textContent="试卷题库加载失败，请刷新网页。";return;}
state=load();$("semester").value=semester;
initEvents();render();initCloud();
})();