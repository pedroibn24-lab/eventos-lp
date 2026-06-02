/* ============================================================
   ENVIO PARA A PLANILHA
   ------------------------------------------------------------
   Cole abaixo a URL do seu Web App do Google Apps Script
   (ou de outro serviço que receba os dados). Enquanto estiver
   vazio, o formulário apenas mostra a mensagem de sucesso.

   Como gerar a URL (Google Sheets):
   1. Na sua planilha: Extensões > Apps Script
   2. Cole um script doPost(e) que grava e.parameter na planilha
   3. Implantar > Nova implantação > App da Web
      - Executar como: Eu
      - Quem tem acesso: Qualquer pessoa
   4. Copie a URL gerada e cole entre as aspas abaixo.
   ============================================================ */
const SHEET_ENDPOINT = "";

(function(){
  const form = document.getElementById('leadForm');
  const card = document.getElementById('formCard');
  const btn  = document.getElementById('submitBtn');

  // Sanitiza texto: remove caracteres que causam injeção em planilhas e XSS
  function sanitize(val){
    return String(val).trim()
      .replace(/[<>"'`]/g, '')          // XSS básico
      .replace(/^[=+\-@\t\r]/g, '');    // injeção de fórmula em planilha
  }

  // Rate limiting: impede reenvio em menos de 30 s
  let lastSubmit = 0;
  const RATE_MS = 30000;

  // WhatsApp mask
  const wpp = document.getElementById('whatsapp');
  wpp.addEventListener('input', function(){
    let v = this.value.replace(/\D/g,'').slice(0,11);
    if(v.length > 6) this.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else if(v.length > 2) this.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
    else if(v.length > 0) this.value = `(${v}`;
    else this.value = '';
  });

  function validate(){
    let ok = true;
    form.querySelectorAll('[required]').forEach(el=>{
      const field = el.closest('.field');
      let valid = el.value.trim() !== '';
      if(el.type==='email') valid = valid && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
      if(el.id==='whatsapp') valid = valid && el.value.replace(/\D/g,'').length >= 10;
      if(el.id==='idade') valid = valid && Number(el.value) >= 14 && Number(el.value) <= 100;
      field.classList.toggle('invalid', !valid);
      if(!valid) ok = false;
    });
    return ok;
  }

  form.addEventListener('input', e=>{
    const field = e.target.closest('.field');
    if(field && field.classList.contains('invalid')) validate();
  });

  form.addEventListener('submit', async function(e){
    e.preventDefault();

    // Honeypot: se preenchido, é bot
    if(document.getElementById('hp_website')?.value) return;

    // Rate limiting
    const now = Date.now();
    if(now - lastSubmit < RATE_MS) return;

    if(!validate()){
      form.querySelector('.field.invalid input,.field.invalid select')?.focus();
      return;
    }

    const raw = Object.fromEntries(new FormData(form).entries());

    // Sanitiza cada campo antes de enviar
    const data = {};
    for(const key of Object.keys(raw)){
      if(key === 'website') continue; // descarta honeypot
      data[key] = sanitize(raw[key]);
    }
    data.dataHora = new Date().toLocaleString('pt-BR');
    data.origem   = 'Landing Evento';

    btn.disabled = true;
    lastSubmit = Date.now();
    const original = btn.textContent;
    btn.textContent = 'Enviando...';

    try{
      if(SHEET_ENDPOINT){
        await fetch(SHEET_ENDPOINT, {
          method:'POST',
          mode:'no-cors',
          headers:{'Content-Type':'application/x-www-form-urlencoded'},
          body:new URLSearchParams(data).toString()
        });
      }
    }catch(err){
      console.warn('Falha ao enviar para a planilha:', err);
    }finally{
      card.classList.add('done');
      btn.disabled = false;
      btn.textContent = original;
    }
  });

  // reveal on scroll
  const io = new IntersectionObserver(entries=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  },{threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
})();
