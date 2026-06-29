/* ════════════════════════════════════════════════════════════════
   Обробка форми «Замовити дзвінок» → надсилання в Telegram-бот.
   Той самий бот і отримувачі, що і у формі заявки (zayavka.js).
   Щоб додати отримувача — додайте chat_id у TELEGRAM_CHAT_IDS.
   ════════════════════════════════════════════════════════════════ */
(function(){
  const TELEGRAM_BOT_TOKEN = '8813411604:AAHtvN1w1Qlhc6tPhQM8uCMjiMoWlSs2lGs';
  const TELEGRAM_CHAT_IDS  = ['364203419', '8914887030'];

  const form = document.getElementById('callForm');
  if(!form) return;
  const modal = document.getElementById('callModal');
  const esc = s => String(s||'').replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
  const pageName = (document.title || location.pathname).trim();

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    if(!form.checkValidity()){ form.reportValidity(); return; }

    const g = n => { const el = form.querySelector('[name="'+n+'"]'); return el ? el.value.trim() : ''; };
    const name = g('name'), phone = g('phone'), email = g('email'), message = g('message');

    const submitBtn = form.querySelector('button[type="submit"]');
    const prev = submitBtn ? submitBtn.innerHTML : '';
    if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = 'Надсилаємо…'; }

    const text =
      '📞 <b>Замовлення дзвінка</b>\n\n' +
      '👤 <b>Ім\'я:</b> ' + esc(name) + '\n' +
      '📱 <b>Телефон:</b> ' + esc(phone) + '\n' +
      (email ? '✉️ <b>Email:</b> ' + esc(email) + '\n' : '') +
      (message ? '💬 <b>Повідомлення:</b> ' + esc(message) + '\n' : '') +
      '\n🌐 <b>Сторінка:</b> ' + esc(pageName) + '\n' + esc(location.href);

    let ok = false;
    const base = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN;
    for(const cid of TELEGRAM_CHAT_IDS){
      try{
        const fd = new FormData();
        fd.append('chat_id', cid);
        fd.append('text', text);
        fd.append('parse_mode', 'HTML');
        fd.append('disable_web_page_preview', 'true');
        const r = await fetch(base + '/sendMessage', { method:'POST', body: fd });
        if((await r.json()).ok === true) ok = true;
      }catch(_){}
    }

    if(submitBtn){ submitBtn.disabled = false; submitBtn.innerHTML = prev; }

    if(ok){
      const box = form.closest('.modal-form') || form;
      box.innerHTML =
        '<div style="text-align:center;padding:24px 6px">' +
        '<div style="font-size:34px;margin-bottom:10px">✅</div>' +
        '<div style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:19px;margin-bottom:6px">Дякуємо!</div>' +
        '<div style="color:var(--mut);font-size:14px;line-height:1.5">Ми зателефонуємо вам найближчим часом.</div></div>';
      if(modal) setTimeout(() => { modal.classList.remove('show'); document.body.style.overflow = ''; }, 2400);
    } else {
      alert('Не вдалося надіслати запит. Зателефонуйте, будь ласка: +38 067-561-76-79');
    }
  });
})();
