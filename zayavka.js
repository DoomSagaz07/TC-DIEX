/* ════════════════════════════════════════════════════════════════
   НАЛАШТУВАННЯ ДОСТАВКИ ЗАЯВОК
   Заповніть значення нижче. Можна заповнити обидва канали або один.

   1) EMAIL — через безкоштовний сервіс Web3Forms (https://web3forms.com):
      • Введіть свій email на сайті → отримаєте Access Key на пошту.
      • Вставте його в WEB3FORMS_ACCESS_KEY. Заявки приходитимуть на цю пошту.

   2) TELEGRAM — через бота:
      • Створіть бота у @BotFather → отримаєте токен → вставте в TELEGRAM_BOT_TOKEN.
      • Дізнайтеся свій chat_id (напишіть боту @userinfobot) → додайте у масив TELEGRAM_CHAT_IDS.
        Для групи/каналу — додайте бота туди й вкажіть id групи (починається з -100…).
   ════════════════════════════════════════════════════════════════ */
console.log('%c✅ zayavka.html — НОВА ВЕРСІЯ завантажена (build 2026-06-25)','color:#36c98e;font-weight:bold');
const WEB3FORMS_ACCESS_KEY = 'da723e47-ae6c-4a8e-a6eb-3ccf7a3e2013';
const TELEGRAM_BOT_TOKEN   = '8813411604:AAHtvN1w1Qlhc6tPhQM8uCMjiMoWlSs2lGs';
// Кому надсилати заявки в Telegram (chat_id). Щоб додати ще одну людину —
// вона має написати боту, дізнатися свій id через @userinfobot, і додати сюди.
const TELEGRAM_CHAT_IDS    = ['364203419', '8914887030'];

/* ── theme toggle ── */
const root=document.documentElement,tbtn=document.getElementById('themeBtn'),tlbl=document.getElementById('themeLbl');
const saved=localStorage.getItem('diex-theme');
if(saved)root.setAttribute('data-theme',saved);
syncTheme();
tbtn.addEventListener('click',()=>{
  const next=root.getAttribute('data-theme')==='dark'?'light':'dark';
  root.setAttribute('data-theme',next);localStorage.setItem('diex-theme',next);syncTheme();
});
function syncTheme(){tlbl.textContent=root.getAttribute('data-theme')==='dark'?'LIGHT':'DARK';}

/* ── file list UI ── */
const fileInput=document.getElementById('files'),fileList=document.getElementById('fileList');
let chosen=[];
fileInput.addEventListener('change',()=>{chosen=Array.from(fileInput.files);renderFiles();});
function renderFiles(){
  fileList.innerHTML='';
  chosen.forEach((f,i)=>{
    const row=document.createElement('div');row.className='file-item';
    row.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>${esc(f.name)} · ${(f.size/1024/1024).toFixed(2)} МБ</span>`;
    const rm=document.createElement('button');rm.type='button';rm.textContent='×';rm.title='Прибрати';
    rm.onclick=()=>{chosen.splice(i,1);syncInput();renderFiles();};
    row.appendChild(rm);fileList.appendChild(row);
  });
}
function syncInput(){const dt=new DataTransfer();chosen.forEach(f=>dt.items.add(f));fileInput.files=dt.files;}
function esc(s){return String(s).replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));}

/* ── генерація заповненого Word-файлу (офіційний бланк ЗАЯВКИ) ── */
function buildDoc(d){
  const today=new Date().toLocaleDateString('uk-UA');
  const aero=/аероз/i.test(d.service);
  const body=aero?aeroBody(d,today):genericBody(d,today);
  const html='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">'+
    '<head><meta charset="utf-8"><title>Заявка</title>'+
    '<style>@page{size:A4;margin:2cm 1.8cm}'+
    'body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.3;color:#000}'+
    'p{margin:4pt 0}.r{text-align:right}.c{text-align:center}.b,.b *{font-weight:bold}'+
    '.title{font-weight:bold;font-size:14pt;margin:14pt 0 2pt}.small{font-size:9pt}'+
    '.mt{margin-top:10pt}.mt2{margin-top:20pt}'+
    'table{border-collapse:collapse;width:100%;margin:6pt 0}'+
    'td{border:1px solid #000;padding:4pt 7pt;vertical-align:top;font-size:11pt}'+
    'td.k{width:44%;background:#f2f2f2}'+
    '.flds td{font-size:12pt}'+
    '.sub{font-size:8.5pt;color:#444;text-align:center;margin-top:2pt}'+
    '.sign,.sign td{border:none}u{text-decoration:underline}</style></head>'+
    '<body>'+body+'</body></html>';
  return new Blob([String.fromCharCode(0xFEFF)+html],{type:'application/msword'});
}

function uval(v){return '<u>'+(esc(v)||'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')+'</u>';}

/* офіційний бланк — Заявка на аерозолі (поля {} з шаблону) */
function aeroBody(d,today){
  const sub=t=>'<div class="sub">'+t+'</div>';
  const addrEdrpou=[d.address,(d.edrpou?'код ЄДРПОУ '+d.edrpou:'')].filter(Boolean).join(', ');
  const product=(d.product||'').replace(/\n/g,'; ');
  return ''+
    '<table class="top"><tr>'+
      '<td>Вих. №&nbsp;____ від ___________202__ р.<br>Вх.&nbsp;&nbsp; №&nbsp;____ від ___________202__ р.</td>'+
      '<td></td>'+
      '<td>Директору НВП «ТЦ Діекс»<br>Сазонова Н.М.</td>'+
    '</tr></table>'+
    '<p class="c title">ЗАЯВКА № ____ від ______ 20 ___ р.</p>'+
    '<p class="c b">Проведення схвалення</p>'+
    '<table class="flds">'+
      '<tr><td>'+uval(d.client)+sub('найменування підприємства-заявника або його уповноваженого представника чи постачальника')+'</td></tr>'+
      '<tr><td>'+uval(addrEdrpou)+sub('адреса, код ЄДРПОУ')+'</td></tr>'+
      '<tr><td>в особі '+uval(d.director)+sub('прізвище, ім’я та по-батькові, посада керівника')+'</td></tr>'+
      '<tr><td>заявляє, що '+uval(product)+sub('найменування продукції, тип, кількість')+'</td></tr>'+
      '<tr><td>виробник '+uval(d.manufacturer)+'</td></tr>'+
      '<tr><td>адреса виробника '+uval(d.manufAddress)+'</td></tr>'+
    '</table>'+
    '<p class="b mt">просить провести</p>'+
    '<p>&#9744;&nbsp; проміжний аудит схваленого методу</p>'+
    '<p>&#9744;&nbsp; проведення схвалення методики альтернативного методу кінцевої перевірки аерозольних розпилювачів</p>'+
    '<p class="b mt">Замовник зобов’язується:</p>'+
    '<p>- виконувати всі умови проведення процедури схвалення;<br>'+
    '- надавати будь-яку інформацію, необхідну для проведення схвалення;<br>'+
    '- сплатити всі витрати за проведення процедури схвалення у відповідності до укладеного договору незалежно від результатів оцінювання.</p>'+
    '<p class="b">Заявник гарантує, що продукція не заявлялась на оцінку відповідності іншим органам з оцінки відповідності та надані копії і/або скан-копії документів для оцінки відповідності, ідентичні оригіналам.</p>'+
    '<table class="sign mt2"><tr>'+
      '<td>Керівник підприємства</td><td class="c">_______________<br><span class="small">підпис</span></td>'+
      '<td class="c">'+uval(d.director||d.contact)+'<br><span class="small">ПІБ</span></td></tr></table>'+
    '<p>м.п.</p>'+
    '<p class="mt"><b>Контактна особа (П.І.Б.):</b> '+uval(d.contact)+'<br>'+
    '<b>Телефон/Факс:</b> '+uval(d.phone)+'<br>'+
    '<b>E-mail:</b> '+uval(d.email)+'</p>';
}

/* загальний бланк — інші послуги */
function genericBody(d,today){
  const fill=s=>s?'<u>&nbsp;'+esc(s)+'&nbsp;</u>':'<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>';
  return ''+
    '<p class="r">Генеральному директору<br>ТОВ СП «ТОВАРИСТВО ТЕХНІЧНОГО НАГЛЯДУ ДІЕКС»<br>Гудошнику В.А.</p>'+
    '<p class="r small">На офіційному бланку (за наявності)</p>'+
    '<p class="c title">ЗАЯВКА №&nbsp;_______&nbsp; від '+esc(today)+'</p>'+
    '<p class="c">на проведення оцінки відповідності рухомого обладнання, що працює під тиском, згідно Технічного регламенту</p>'+
    '<p class="b mt">Дані про замовника:</p>'+
    '<table>'+
      '<tr><td class="k">Найменування підприємства / заявника</td><td>'+esc(d.client)+'</td></tr>'+
      '<tr><td class="k">Код ЄДРПОУ / ІПН</td><td>'+esc(d.edrpou)+'</td></tr>'+
      '<tr><td class="k">Адреса (юридична / фактична)</td><td>'+esc(d.address)+'</td></tr>'+
      '<tr><td class="k">Керівник (посада, ПІБ)</td><td>'+esc(d.director)+'</td></tr>'+
      '<tr><td class="k">Контактна особа</td><td>'+esc(d.contact)+'</td></tr>'+
      '<tr><td class="k">Телефон / Факс</td><td>'+esc(d.phone)+'</td></tr>'+
      '<tr><td class="k">E-mail</td><td>'+esc(d.email)+'</td></tr>'+
    '</table>'+
    '<p class="b mt">Найменування продукції / обладнання (тип, модель, серійний номер, кількість):</p>'+
    '<p>'+(d.product?esc(d.product).replace(/\n/g,'<br>'):'&nbsp;')+(d.manufacturer?'<br>Виробник: '+esc(d.manufacturer):'')+(d.manufAddress?'<br>Адреса виробника: '+esc(d.manufAddress):'')+'</p>'+
    '<p class="b mt">Просить провести:</p>'+
    '<p>'+esc(d.service)+'.</p>'+
    '<p class="mt">Замовник зобов’язується виконувати всі умови проведення процедури оцінки відповідності, надавати будь-яку інформацію, необхідну для оцінювання, та сплатити всі витрати за проведення процедури незалежно від результатів. Заявник гарантує, що вищезазначена продукція не заявлялась іншим органам та надані копії і/або скан-копії документів ідентичні оригіналам.</p>'+
    '<table class="sign mt2"><tr>'+
      '<td>Керівник підприємства</td><td class="c">_______________<br><span class="small">підпис</span></td>'+
      '<td class="c">'+fill(d.director||d.client)+'<br><span class="small">ПІБ</span></td></tr></table>'+
    '<p>М.П.</p>'+
    '<p class="mt"><b>Контактна особа (П.І.Б.):</b> '+esc(d.contact)+'<br>'+
      '<b>Телефон/Факс:</b> '+esc(d.phone)+'<br>'+
      '<b>E-mail:</b> '+esc(d.email)+'</p>'+
    '<p class="small mt2" style="color:#555">Сформовано автоматично через онлайн-форму сайту diex.pro · '+esc(today)+'</p>';
}

/* ── submit ── */
const form=document.getElementById('appForm'),btn=document.getElementById('submitBtn'),
      statusEl=document.getElementById('status'),done=document.getElementById('done');

form.addEventListener('submit',async(e)=>{
  e.preventDefault();
  if(!form.checkValidity()){form.reportValidity();return;}

  const emailOn=!!WEB3FORMS_ACCESS_KEY;
  const tgOn=!!(TELEGRAM_BOT_TOKEN&&TELEGRAM_CHAT_IDS&&TELEGRAM_CHAT_IDS.length);
  if(!emailOn&&!tgOn){
    showStatus('err','Форму ще не налаштовано: вкажіть Web3Forms Access Key та/або Telegram токен у коді сторінки (блок НАЛАШТУВАННЯ).');
    return;
  }

  btn.disabled=true;const prev=btn.innerHTML;btn.textContent='Надсилаємо…';
  hideStatus();

  const v=id=>{const el=document.getElementById(id);return el?el.value.trim():'';};
  const data={
    service:v('service'),client:v('client'),edrpou:v('edrpou'),director:v('director'),
    address:v('address'),contact:v('contact'),phone:v('phone'),email:v('email'),product:v('product'),
    manufacturer:v('manufacturer'),manufAddress:v('manuf_address')
  };

  // згенерувати заповнений Word-файл заявки
  const docBlob=buildDoc(data);
  const stamp=new Date().toISOString().slice(0,10);
  const safe=(data.client||data.contact||'zayavka').replace(/[^\p{L}\p{N}]+/gu,'_').replace(/^_+|_+$/g,'').slice(0,40)||'zayavka';
  const docName='Zayavka_'+safe+'_'+stamp+'.doc';

  const text=
    '🆕 <b>Нова заявка з сайту DIEX</b>\n\n'+
    '🔧 <b>Послуга:</b> '+esc(data.service)+'\n'+
    '🏢 <b>Заявник:</b> '+esc(data.client)+'\n'+
    (data.edrpou?'№ <b>ЄДРПОУ:</b> '+esc(data.edrpou)+'\n':'')+
    '👤 <b>Контакт:</b> '+esc(data.contact)+'\n'+
    '📞 <b>Телефон:</b> '+esc(data.phone)+'\n'+
    (data.email?'✉️ <b>Email:</b> '+esc(data.email)+'\n':'')+
    (data.product?'📦 <b>Об\'єкт:</b> '+esc(data.product)+'\n':'')+
    '\n📄 Заповнену заявку додано Word-файлом нижче.';

  let okEmail=false,okTg=false;

  // EMAIL — Web3Forms (+ заповнений .doc + файли користувача)
  if(emailOn){
    try{
      const fd=new FormData();
      fd.append('access_key',WEB3FORMS_ACCESS_KEY);
      fd.append('subject','Нова заявка: '+data.service+' — '+(data.client||data.contact));
      fd.append('from_name','Сайт DIEX');
      Object.entries(data).forEach(([k,val])=>fd.append(k,val||'—'));
      fd.append('attachment',docBlob,docName);
      chosen.forEach(f=>fd.append('attachment',f,f.name));
      const r=await fetch('https://api.web3forms.com/submit',{method:'POST',body:fd});
      okEmail=(await r.json()).success===true;
    }catch(_){}
  }

  // TELEGRAM — Bot API (повідомлення + заповнений .doc + файли) — кожному отримувачу
  if(tgOn){
    const base='https://api.telegram.org/bot'+TELEGRAM_BOT_TOKEN;
    for(const cid of TELEGRAM_CHAT_IDS){
      try{
        const mf=new FormData();
        mf.append('chat_id',cid);mf.append('text',text);mf.append('parse_mode','HTML');mf.append('disable_web_page_preview','true');
        const r=await fetch(base+'/sendMessage',{method:'POST',body:mf});
        if((await r.json()).ok===true) okTg=true;
        const df=new FormData();df.append('chat_id',cid);df.append('document',docBlob,docName);
        df.append('caption','Заповнена заявка: '+data.service);
        await fetch(base+'/sendDocument',{method:'POST',body:df});
        for(const f of chosen){
          const tf=new FormData();tf.append('chat_id',cid);tf.append('document',f,f.name);
          await fetch(base+'/sendDocument',{method:'POST',body:tf});
        }
      }catch(_){}
    }
  }

  btn.disabled=false;btn.innerHTML=prev;

  if(okEmail||okTg){
    form.style.display='none';done.classList.add('show');
    window.scrollTo({top:0,behavior:'smooth'});
  }else{
    showStatus('err','Не вдалося надіслати заявку. Перевірте з\'єднання або зателефонуйте: +38 067-561-76-79.');
  }
});

function showStatus(type,msg){statusEl.className='status show '+type;statusEl.textContent=msg;}
function hideStatus(){statusEl.className='status';}