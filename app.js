// FreelanceDesk — free invoice & estimate generator. 100% client-side. No tracking, no server.
(function(){
  const $ = id => document.getElementById(id);
  const itemsBody = document.querySelector('#items tbody');
  const sym = () => ($('currency').value||'$ USD').charAt(0);
  const fmt = n => sym() + (Math.round(n*100)/100).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});

  function addItem(desc='', qty=1, rate=0){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input class="d" value="${desc}"></td>
      <td><input class="q" type="number" value="${qty}" min="0" step="any"></td>
      <td><input class="r" type="number" value="${rate}" min="0" step="any"></td>
      <td><button class="item-del" title="remove">✕</button></td>`;
    tr.querySelector('.item-del').onclick = () => { tr.remove(); render(); };
    itemsBody.appendChild(tr);
  }

  function items(){
    return [...itemsBody.children].map(tr => ({
      d: tr.querySelector('.d').value,
      q: parseFloat(tr.querySelector('.q').value)||0,
      r: parseFloat(tr.querySelector('.r').value)||0
    }));
  }

  function calc(){
    const rows = items();
    const subtotal = rows.reduce((s,x)=>s+x.q*x.r,0);
    const tax = subtotal * (parseFloat($('taxRate').value)||0)/100;
    return {rows, subtotal, tax, total: subtotal+tax};
  }

  function render(){
    const c = calc();
    const esc = s => (s||'').replace(/[&<>]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
    let rows = c.rows.map(x=>`<tr><td>${esc(x.d)||'—'}</td><td style="text-align:right">${x.q}</td><td style="text-align:right">${fmt(x.r)}</td><td style="text-align:right">${fmt(x.q*x.r)}</td></tr>`).join('');
    if(!rows) rows = `<tr><td colspan="4" style="color:#888">Add a line item →</td></tr>`;
    const type = $('docType').value;
    $('preview').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><h3>${esc($('fromName').value)}</h3>
          <div class="meta">${esc($('fromAddr').value).replace(/\n/g,'<br>')}<br>
          ${esc($('fromEmail').value)} · ${esc($('fromPhone').value)} ${$('fromTax').value?('· Tax: '+esc($('fromTax').value)):''}</div></div>
        <div style="text-align:right"><h3 style="color:#38bdf8">${type.toUpperCase()} ${esc($('docNum').value)}</h3>
          <div class="meta">Issued: ${esc($('issueDate').value)}<br>Due: ${esc($('dueDate').value)}</div></div>
      </div>
      <hr style="border:none;border-top:1px solid #ddd">
      <div class="meta"><strong>Bill To:</strong><br>${esc($('toName').value)}<br>${esc($('toAddr').value).replace(/\n/g,'<br>')}<br>${esc($('toEmail').value)}</div>
      <table style="margin-top:16px">
        <thead><tr><th>Description</th><th style="text-align:right">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="text-align:right;margin-top:14px">
        <div>Subtotal: <strong>${fmt(c.subtotal)}</strong></div>
        <div>Tax (${$('taxRate').value||0}%): <strong>${fmt(c.tax)}</strong></div>
        <div style="font-size:1.3rem;margin-top:6px"><strong>Total: ${fmt(c.total)}</strong></div>
      </div>
      <div class="meta" style="margin-top:24px;border-top:1px solid #eee;padding-top:10px">${esc($('notes').value).replace(/\n/g,'<br>')}</div>`;
  }

  // persistence
  function snapshot(){
    const o={}; ['fromName','fromEmail','fromAddr','fromPhone','fromTax','toName','toEmail','toAddr','docType','docNum','issueDate','dueDate','taxRate','currency','notes']
      .forEach(k=>o[k]=$(k).value);
    o.items = items();
    return o;
  }
  function restore(o){
    Object.keys(o).forEach(k=>{ if(k!=='items' && $(k)) $(k).value=o[k]; });
    itemsBody.innerHTML=''; (o.items||[]).forEach(i=>addItem(i.d,i.q,i.r));
    render();
  }
  $('saveLocal').onclick = ()=>{ localStorage.setItem('fd_draft', JSON.stringify(snapshot())); alert('Draft saved in this browser.'); };
  $('loadLocal').onclick = ()=>{ const d=localStorage.getItem('fd_draft'); if(d) restore(JSON.parse(d)); };

  // seed defaults
  const today = new Date().toISOString().slice(0,10);
  $('issueDate').value = today;
  $('dueDate').value = new Date(Date.now()+14*864e5).toISOString().slice(0,10);
  addItem('Website design', 1, 1200);
  addItem('Ongoing support (monthly)', 1, 250);

  // listeners
  document.querySelectorAll('input,select,textarea').forEach(el=>el.addEventListener('input',render));
  $('addItem').onclick = ()=>{ addItem(); render(); };
  render();
})();
