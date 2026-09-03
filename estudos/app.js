const AREAS = ['Natureza', 'Humanas', 'Linguagens', 'Matemática'];
const METHODS = ['Aula/Videoaula', 'Leitura', 'Resolução de questões', 'Outro'];
const TODAY = '2026-09-02';
const CURRENT_STUDENT = { id: 'stu-001', name: 'Mauricio', className: '3ª Série A' };

const STUDENTS = [
  { id: 'stu-001', name: 'Mauricio', className: '3ª Série A' },
  { id: 'stu-002', name: 'Ana Beatriz', className: '3ª Série A' },
  { id: 'stu-003', name: 'João Pedro', className: '3ª Série A' },
  { id: 'stu-004', name: 'Maria Clara', className: '3ª Série B' },
  { id: 'stu-005', name: 'Lucas Henrique', className: '3ª Série B' },
];

const CABIN_SESSIONS = [
  { studentId:'stu-001', studentName:'Mauricio', className:'3ª Série A', date:TODAY, enteredAt:'14:05', exitedAt:'15:47', effectiveMinutes:102 },
  { studentId:'stu-002', studentName:'Ana Beatriz', className:'3ª Série A', date:TODAY, enteredAt:'14:10', exitedAt:'15:05', effectiveMinutes:55 },
  { studentId:'stu-003', studentName:'João Pedro', className:'3ª Série A', date:TODAY, enteredAt:'13:55', exitedAt:'15:13', effectiveMinutes:78 },
  { studentId:'stu-004', studentName:'Maria Clara', className:'3ª Série B', date:TODAY, enteredAt:'14:20', exitedAt:'15:48', effectiveMinutes:88 },
];

const MOCK_RECORDS = [
  {
    id:'rec-ana-0902', studentId:'stu-002', studentName:'Ana Beatriz', className:'3ª Série A', date:TODAY,
    studies:[
      { id:'a1', area:'Natureza', discipline:'Biologia', subject:'Genética' },
      { id:'a2', area:'Matemática', discipline:'Matemática', subject:'Função exponencial' }
    ],
    methods:['Leitura','Resolução de questões'], otherMethod:'',
    questions:[
      { id:'aq1', discipline:'Matemática', questions:20, correct:14 },
      { id:'aq2', discipline:'Biologia', questions:15, correct:12 }
    ],
    notes:'Revisar função exponencial. Parei na questão 26.', savedAt:'2026-09-02T15:00:00-03:00'
  },
  {
    id:'rec-maria-0902', studentId:'stu-004', studentName:'Maria Clara', className:'3ª Série B', date:TODAY,
    studies:[{ id:'m1', area:'Linguagens', discipline:'Português', subject:'Interpretação de texto' }],
    methods:['Aula/Videoaula','Resolução de questões'], otherMethod:'',
    questions:[{ id:'mq1', discipline:'Português', questions:20, correct:16 }],
    notes:'', savedAt:'2026-09-02T15:40:00-03:00'
  },
  {
    id:'rec-ana-0901', studentId:'stu-002', studentName:'Ana Beatriz', className:'3ª Série A', date:'2026-09-01',
    studies:[{ id:'a3', area:'Humanas', discipline:'História', subject:'República Velha' }],
    methods:['Leitura'], otherMethod:'', questions:[], notes:'Continuar capítulo 4 amanhã.', savedAt:'2026-09-01T16:00:00-03:00'
  }
];

const STORAGE_KEY = 'evolucao-study-records-v1';
let view = 'student';
let managementTab = 'Hoje';
let studentState = {
  studies: [{ id: crypto.randomUUID(), area:'Natureza', discipline:'Biologia', subject:'Genética' }],
  methods: ['Leitura','Resolução de questões'],
  otherMethod: '',
  questions: [
    { id: crypto.randomUUID(), discipline:'Matemática', questions:20, correct:14 },
    { id: crypto.randomUUID(), discipline:'Biologia', questions:15, correct:12 },
  ],
  notes: ''
};

function loadRecords() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_RECORDS));
    return structuredClone(MOCK_RECORDS);
  }
  try { return JSON.parse(raw); } catch { return structuredClone(MOCK_RECORDS); }
}
function saveRecords(records) { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }
function percent(q, c) { return q > 0 ? Math.round((c / q) * 100) : 0; }
function minutesLabel(m) { const h = Math.floor(m/60), r=m%60; return h ? (r ? `${h}h${String(r).padStart(2,'0')}` : `${h}h`) : `${r}min`; }
function displayDate(iso) { const [y,m,d] = iso.split('-').map(Number); return new Intl.DateTimeFormat('pt-BR').format(new Date(y,m-1,d)); }
function esc(value='') { return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }

function render() {
  document.getElementById('studentViewBtn').classList.toggle('selected', view === 'student');
  document.getElementById('managementViewBtn').classList.toggle('selected', view === 'management');
  document.getElementById('app').innerHTML = view === 'student' ? studentTemplate() : managementTemplate();
  bindCurrentView();
}

document.getElementById('studentViewBtn').addEventListener('click', () => { view='student'; render(); });
document.getElementById('managementViewBtn').addEventListener('click', () => { view='management'; render(); });

function studentTemplate() {
  const session = CABIN_SESSIONS.find(s => s.studentId === CURRENT_STUDENT.id && s.date === TODAY);
  const records = loadRecords();
  const summary = records.find(r => r.studentId === CURRENT_STUDENT.id && r.date === TODAY);
  const questionEnabled = studentState.methods.includes('Resolução de questões');
  return `
    <div class="page-wrap student-page">
      <header class="hero-card">
        <div><div class="eyebrow">ESPAÇO EVOLUIR</div><h1>Painel de Estudos</h1><p>Ensino Médio — 3ª Série</p></div>
        <div class="hero-date">${displayDate(TODAY)}</div>
        <div class="student-strip">
          <div class="avatar">M</div>
          <div><strong>${CURRENT_STUDENT.name}</strong><span>${CURRENT_STUDENT.className}</span></div>
          <div class="session-pill"><small>Tempo efetivo hoje</small><b>${session ? minutesLabel(session.effectiveMinutes) : '—'}</b></div>
        </div>
        <div class="top-tabs"><button class="active">Registrar</button><button>Semana</button><button>Evolução</button><button>Orientações</button></div>
      </header>

      <section class="card form-card">
        <div class="section-heading"><span class="accent-line"></span><h2>Meu Estudo Hoje</h2></div>

        <div class="form-section">
          <h3>1. O que você estudou?</h3>
          <div id="studyBlocks">${studentState.studies.map((s,i)=>studyBlockTemplate(s,i)).join('')}</div>
          <button id="addStudy" class="link-action" ${studentState.studies.length>=3?'disabled':''}>+ Adicionar outro estudo${studentState.studies.length>=3?' (máximo 3)':''}</button>
        </div>

        <div class="form-section">
          <h3>2. Como você estudou?</h3>
          <div class="method-pills">${METHODS.map(m=>`<button class="pill method-pill ${studentState.methods.includes(m)?'selected':''}" data-method="${m}">${m}</button>`).join('')}</div>
          ${studentState.methods.includes('Outro') ? `<input id="otherMethod" class="full-input" placeholder="Escreva aqui..." value="${esc(studentState.otherMethod)}" />` : ''}
        </div>

        ${questionEnabled ? `
          <div class="form-section question-section">
            <div class="section-row"><h3>3. Questões resolvidas hoje</h3><span>Você pode registrar mais de uma disciplina</span></div>
            <div class="question-table desktop-question-head"><span>Disciplina</span><span>Questões</span><span>Acertos</span><span>Desempenho</span><span></span></div>
            <div id="questionRows">${studentState.questions.map(questionRowTemplate).join('')}</div>
            <button id="addQuestion" class="link-action">+ Adicionar outra disciplina</button>
          </div>` : ''}

        <div class="form-section">
          <h3>${questionEnabled?'4.':'3.'} Minhas Anotações</h3>
          <label class="notes-label">O que preciso revisar? / Onde parei? / Observação para o próximo estudo
            <textarea id="notes" rows="4" placeholder="Digite aqui...">${esc(studentState.notes)}</textarea>
          </label>
        </div>

        <button id="saveStudy" class="primary-btn">Salvar meu estudo</button>
        <div id="saveFeedback"></div>
      </section>

      <section class="card summary-card">
        <div class="section-heading"><span class="summary-icon">▣</span><div><h2>Resumo de hoje</h2><p>Hoje · 02/09</p></div></div>
        ${summary ? summaryTemplate(summary) : '<p class="muted">Seu resumo aparecerá aqui após salvar.</p>'}
      </section>
    </div>`;
}

function studyBlockTemplate(study, index) {
  return `<div class="study-block" data-study-id="${study.id}">
    ${studentState.studies.length>1 ? `<div class="mini-label">Estudo ${index+1}</div>` : ''}
    <div class="area-pills">${AREAS.map(a=>`<button class="pill area-pill ${study.area===a?'selected':''}" data-area="${a}" data-study-id="${study.id}">${a}</button>`).join('')}</div>
    <div class="two-col">
      <label>Disciplina<input class="study-discipline" data-study-id="${study.id}" placeholder="Digite a disciplina" value="${esc(study.discipline)}" /></label>
      <label>Assunto<input class="study-subject" data-study-id="${study.id}" placeholder="Digite o assunto" value="${esc(study.subject)}" /></label>
    </div>
    ${studentState.studies.length>1 ? `<button class="text-danger remove-study" data-study-id="${study.id}">Remover</button>` : ''}
  </div>`;
}

function questionRowTemplate(q) {
  return `<div class="question-table question-row" data-question-id="${q.id}">
    <input class="q-discipline" data-question-id="${q.id}" aria-label="Disciplina" value="${esc(q.discipline)}" placeholder="Disciplina" />
    <input class="q-total" data-question-id="${q.id}" aria-label="Questões" type="number" min="0" value="${q.questions||''}" />
    <input class="q-correct" data-question-id="${q.id}" aria-label="Acertos" type="number" min="0" max="${q.questions||0}" value="${q.correct||''}" />
    <b class="score-badge">${percent(q.questions,q.correct)}%</b>
    <button class="icon-btn remove-question" data-question-id="${q.id}">×</button>
  </div>`;
}

function summaryTemplate(record) {
  return `<div class="summary-list">
    ${record.studies.map(s=>`<div><b>${esc(s.area)} · ${esc(s.discipline)} · ${esc(s.subject)}</b></div>`).join('')}
    <div>${record.methods.map(esc).join(' + ')}</div>
    ${record.questions.map(q=>`<div><b>${esc(q.discipline)}:</b> ${q.questions} questões · ${q.correct} acertos · <strong>${percent(q.questions,q.correct)}%</strong></div>`).join('')}
    ${record.notes ? '<div>📝 1 anotação registrada</div>' : ''}
  </div>`;
}

function bindStudent() {
  document.querySelectorAll('.area-pill').forEach(btn => btn.addEventListener('click', () => {
    const study = studentState.studies.find(s => s.id === btn.dataset.studyId); if (study) study.area = btn.dataset.area; render();
  }));
  document.querySelectorAll('.study-discipline').forEach(input => input.addEventListener('input', () => {
    const study = studentState.studies.find(s => s.id === input.dataset.studyId); if (study) study.discipline = input.value;
  }));
  document.querySelectorAll('.study-subject').forEach(input => input.addEventListener('input', () => {
    const study = studentState.studies.find(s => s.id === input.dataset.studyId); if (study) study.subject = input.value;
  }));
  document.querySelectorAll('.remove-study').forEach(btn => btn.addEventListener('click', () => { studentState.studies = studentState.studies.filter(s=>s.id!==btn.dataset.studyId); render(); }));
  document.getElementById('addStudy')?.addEventListener('click', () => { if(studentState.studies.length<3){ studentState.studies.push({id:crypto.randomUUID(),area:'Natureza',discipline:'',subject:''}); render(); } });
  document.querySelectorAll('.method-pill').forEach(btn => btn.addEventListener('click', () => {
    const m = btn.dataset.method; studentState.methods = studentState.methods.includes(m) ? studentState.methods.filter(x=>x!==m) : [...studentState.methods,m]; render();
  }));
  document.getElementById('otherMethod')?.addEventListener('input', e => studentState.otherMethod = e.target.value);
  document.querySelectorAll('.q-discipline').forEach(input => input.addEventListener('input', () => { const q=studentState.questions.find(x=>x.id===input.dataset.questionId); if(q)q.discipline=input.value; }));
  document.querySelectorAll('.q-total').forEach(input => input.addEventListener('change', () => { const q=studentState.questions.find(x=>x.id===input.dataset.questionId); if(q){q.questions=Math.max(0,Number(input.value)||0);q.correct=Math.min(q.correct,q.questions);} render(); }));
  document.querySelectorAll('.q-correct').forEach(input => input.addEventListener('change', () => { const q=studentState.questions.find(x=>x.id===input.dataset.questionId); if(q){q.correct=Math.max(0,Math.min(Number(input.value)||0,q.questions));} render(); }));
  document.querySelectorAll('.remove-question').forEach(btn => btn.addEventListener('click', () => { studentState.questions=studentState.questions.filter(q=>q.id!==btn.dataset.questionId); render(); }));
  document.getElementById('addQuestion')?.addEventListener('click', () => { studentState.questions.push({id:crypto.randomUUID(),discipline:'',questions:0,correct:0}); render(); });
  document.getElementById('notes')?.addEventListener('input', e => studentState.notes=e.target.value);
  document.getElementById('saveStudy')?.addEventListener('click', saveStudentRecord);
}

function saveStudentRecord() {
  const studies = studentState.studies.filter(s => s.discipline.trim() || s.subject.trim());
  const questions = studentState.methods.includes('Resolução de questões') ? studentState.questions.filter(q => q.discipline.trim() && q.questions>0) : [];
  const records = loadRecords();
  const existing = records.find(r => r.studentId===CURRENT_STUDENT.id && r.date===TODAY);
  const record = {
    id: existing?.id || crypto.randomUUID(), studentId:CURRENT_STUDENT.id, studentName:CURRENT_STUDENT.name, className:CURRENT_STUDENT.className, date:TODAY,
    studies, methods:[...studentState.methods], otherMethod:studentState.methods.includes('Outro')?studentState.otherMethod.trim():'', questions, notes:studentState.notes.trim(), savedAt:new Date().toISOString()
  };
  saveRecords([record, ...records.filter(r => r.id!==record.id)]);
  render();
  const feedback=document.getElementById('saveFeedback'); if(feedback){ feedback.innerHTML='<div class="success-toast">✓ Estudo registrado</div>'; }
}

function buildRows(records) {
  return STUDENTS.map(student => {
    const session=CABIN_SESSIONS.find(s=>s.studentId===student.id&&s.date===TODAY);
    const record=records.find(r=>r.studentId===student.id&&r.date===TODAY);
    return {
      studentId:student.id, studentName:student.name, className:student.className, accessed:!!session, registered:!!record,
      effectiveMinutes:session?.effectiveMinutes||0, areas:[...new Set(record?.studies.map(s=>s.area)||[])],
      questions:record?.questions.reduce((sum,q)=>sum+q.questions,0)||0, hasNotes:!!record?.notes?.trim()
    };
  });
}

function managementTemplate() {
  const records=loadRecords();
  const rows=buildRows(records);
  const accessed=rows.filter(r=>r.accessed).length;
  const registered=rows.filter(r=>r.registered).length;
  const without=rows.filter(r=>r.accessed&&!r.registered).length;
  const adherence=accessed?Math.round(rows.filter(r=>r.accessed&&r.registered).length/accessed*100):0;

  return `<div class="page-wrap management-page">
    <header class="management-header">
      <div><div class="eyebrow">GESTÃO · ESPAÇO EVOLUIR</div><h1>Acompanhamento de Estudos</h1><p>Controle diário do acesso, registro e evidências de estudo.</p></div>
      <div class="management-actions no-print"><span class="date-chip">${displayDate(TODAY)}</span><button class="pdf-btn generate-pdf">▣ Gerar PDF</button></div>
    </header>
    <div class="management-tabs no-print">${['Hoje','Semana','Histórico'].map(t=>`<button class="management-tab ${managementTab===t?'active':''}" data-tab="${t}">${t}</button>`).join('')}</div>
    ${managementTab==='Hoje' ? dailyManagementTemplate(rows,accessed,registered,without,adherence) : managementTab==='Semana' ? weeklyTemplate(records) : historyTemplate(records)}
    <div id="studentDetailHost"></div>
  </div>`;
}

function dailyManagementTemplate(rows,accessed,registered,without,adherence) {
  return `<section class="kpi-grid">
      <div class="kpi"><span>Acessaram hoje</span><strong>${accessed}</strong><small>entrada registrada no Espaço Evoluir</small></div>
      <div class="kpi"><span>Registraram estudo</span><strong>${registered}</strong><small>registro preenchido no dia</small></div>
      <div class="kpi warning"><span>Acessaram sem registrar</span><strong>${without}</strong><small>alunos que precisam de acompanhamento</small></div>
      <div class="kpi"><span>Adesão</span><strong>${adherence}%</strong><small>entre os alunos que acessaram</small></div>
    </section>
    <section class="card filters-card no-print">
      <label>Data<input id="filterDate" type="date" value="${TODAY}" readonly /></label>
      <label>Turma<select id="filterClass"><option>Todas</option><option>3ª Série A</option><option>3ª Série B</option></select></label>
      <label>Status<select id="filterStatus"><option>Todos</option><option>Com registro</option><option>Sem registro</option><option>Acessou sem registrar</option></select></label>
      <label>Área<select id="filterArea"><option>Todas</option>${AREAS.map(a=>`<option>${a}</option>`).join('')}</select></label>
      <label class="search-field">Aluno<input id="filterSearch" placeholder="Buscar aluno" /></label>
    </section>
    <section class="card report-card">
      <div class="report-title-row"><div><h2>Registro diário</h2><p id="rowCount">${rows.length} alunos exibidos</p></div><button class="pdf-btn secondary no-print generate-pdf">Gerar PDF</button></div>
      <div class="management-table-wrap"><table class="management-table"><thead><tr><th>Aluno</th><th>Turma</th><th>Presença</th><th>Registrou?</th><th>Tempo efetivo</th><th>Áreas registradas</th><th>Questões</th><th>Anotação</th></tr></thead><tbody id="dailyRows">${rows.map(rowTemplate).join('')}</tbody></table></div>
    </section>
    <section class="card alert-card"><div><span class="alert-icon">!</span><div><h3>Alunos que acessaram o Espaço Evoluir, mas não registraram o estudo</h3><p>Use esta lista como alerta diário para acompanhamento.</p></div></div><div class="alert-names">${rows.filter(r=>r.accessed&&!r.registered).map(r=>`<span>${esc(r.studentName)}</span>`).join('')}</div></section>`;
}

function rowTemplate(r) {
  return `<tr data-student-id="${r.studentId}" class="student-row ${r.accessed&&!r.registered?'attention-row':''}">
    <td><button class="student-link no-print">${esc(r.studentName)}</button><span class="print-only">${esc(r.studentName)}</span></td><td>${esc(r.className)}</td>
    <td><span class="status ${r.accessed?'yes':''}">${r.accessed?'✓ Acessou':'—'}</span></td>
    <td><span class="status ${r.registered?'yes':'no'}">${r.registered?'✓ Sim':'✕ Não'}</span></td>
    <td>${r.effectiveMinutes?minutesLabel(r.effectiveMinutes):'—'}</td><td>${r.areas.join(', ')||'—'}</td><td>${r.questions||'—'}</td><td>${r.hasNotes?'✓':'—'}</td>
  </tr>`;
}

function weeklyTemplate(records) {
  const days=[['2026-08-31','Seg'],['2026-09-01','Ter'],['2026-09-02','Qua'],['2026-09-03','Qui'],['2026-09-04','Sex']];
  return `<section class="card report-card"><div class="report-title-row"><div><h2>Acompanhamento semanal</h2><p>Constância de registros de estudo</p></div><button class="pdf-btn secondary no-print generate-pdf">Gerar PDF</button></div><div class="management-table-wrap"><table class="management-table"><thead><tr><th>Aluno</th>${days.map(d=>`<th>${d[1]}</th>`).join('')}<th>Dias registrados</th><th>Questões</th></tr></thead><tbody>${STUDENTS.map(s=>{
    const rs=records.filter(r=>r.studentId===s.id&&days.some(d=>d[0]===r.date));
    const total=rs.reduce((sum,r)=>sum+r.questions.reduce((a,q)=>a+q.questions,0),0);
    return `<tr><td>${esc(s.name)}</td>${days.map(d=>`<td class="center-cell">${rs.some(r=>r.date===d[0])?'✓':'—'}</td>`).join('')}<td>${rs.length}/5</td><td>${total||'—'}</td></tr>`;
  }).join('')}</tbody></table></div></section>`;
}

function historyTemplate(records) {
  return `<section class="card report-card"><div class="report-title-row"><div><h2>Histórico de registros</h2><p>Registros salvos no sistema</p></div><button class="pdf-btn secondary no-print generate-pdf">Gerar PDF</button></div><div class="management-table-wrap"><table class="management-table"><thead><tr><th>Data</th><th>Aluno</th><th>Turma</th><th>Estudos</th><th>Questões</th><th>Anotação</th></tr></thead><tbody>${records.map(r=>`<tr><td>${displayDate(r.date)}</td><td>${esc(r.studentName)}</td><td>${esc(r.className)}</td><td>${r.studies.map(s=>`${esc(s.discipline)} — ${esc(s.subject)}`).join('; ')}</td><td>${r.questions.reduce((sum,q)=>sum+q.questions,0)||'—'}</td><td>${esc(r.notes||'—')}</td></tr>`).join('')}</tbody></table></div></section>`;
}

function bindManagement() {
  document.querySelectorAll('.generate-pdf').forEach(btn=>btn.addEventListener('click',()=>window.print()));
  document.querySelectorAll('.management-tab').forEach(btn=>btn.addEventListener('click',()=>{managementTab=btn.dataset.tab;render();}));
  document.querySelectorAll('.student-row').forEach(row=>row.addEventListener('click',()=>showStudentDetail(row.dataset.studentId)));
  ['filterClass','filterStatus','filterArea','filterSearch'].forEach(id=>document.getElementById(id)?.addEventListener(id==='filterSearch'?'input':'change', applyFilters));
}

function applyFilters() {
  const rows=buildRows(loadRecords());
  const classF=document.getElementById('filterClass')?.value||'Todas';
  const statusF=document.getElementById('filterStatus')?.value||'Todos';
  const areaF=document.getElementById('filterArea')?.value||'Todas';
  const search=(document.getElementById('filterSearch')?.value||'').toLowerCase();
  const filtered=rows.filter(r=>{
    if(classF!=='Todas'&&r.className!==classF)return false;
    if(statusF==='Com registro'&&!r.registered)return false;
    if(statusF==='Sem registro'&&r.registered)return false;
    if(statusF==='Acessou sem registrar'&&!(r.accessed&&!r.registered))return false;
    if(areaF!=='Todas'&&!r.areas.includes(areaF))return false;
    if(search&&!r.studentName.toLowerCase().includes(search))return false;
    return true;
  });
  document.getElementById('dailyRows').innerHTML=filtered.map(rowTemplate).join('');
  document.getElementById('rowCount').textContent=`${filtered.length} alunos exibidos`;
  document.querySelectorAll('.student-row').forEach(row=>row.addEventListener('click',()=>showStudentDetail(row.dataset.studentId)));
}

function showStudentDetail(studentId) {
  const student=STUDENTS.find(s=>s.id===studentId);
  const record=loadRecords().find(r=>r.studentId===studentId&&r.date===TODAY);
  const session=CABIN_SESSIONS.find(s=>s.studentId===studentId&&s.date===TODAY);
  const host=document.getElementById('studentDetailHost'); if(!host||!student)return;
  host.innerHTML=`<div class="modal-backdrop" id="modalBackdrop"><div class="student-modal" id="studentModal">
    <div class="modal-header"><div><div class="eyebrow">DETALHAMENTO DO DIA</div><h2>${esc(student.name)}</h2><p>${esc(student.className)} · ${displayDate(TODAY)}</p></div><button id="closeModal">×</button></div>
    <div class="detail-kpis"><div><span>Tempo efetivo</span><strong>${session?minutesLabel(session.effectiveMinutes):'—'}</strong></div><div><span>Registro</span><strong>${record?'Realizado':'Não realizado'}</strong></div></div>
    ${record?`<div class="student-detail-content"><h3>Estudos registrados</h3>${record.studies.map(s=>`<p><b>${esc(s.area)}</b> · ${esc(s.discipline)} · ${esc(s.subject)}</p>`).join('')}<h3>Como estudou</h3><p>${record.methods.map(esc).join(' · ')}${record.otherMethod?` · ${esc(record.otherMethod)}`:''}</p>${record.questions.length?`<h3>Questões</h3>${record.questions.map(q=>`<p>${esc(q.discipline)}: ${q.questions} questões · ${q.correct} acertos · <b>${percent(q.questions,q.correct)}%</b></p>`).join('')}`:''}<h3>Minhas Anotações</h3><div class="notes-box">${esc(record.notes||'Sem anotação.')}</div></div>`:`<div class="empty-state">O aluno ainda não registrou o estudo deste dia.</div>`}
    <button class="pdf-btn" id="modalPdf">Gerar PDF</button>
  </div></div>`;
  document.getElementById('closeModal').addEventListener('click',()=>host.innerHTML='');
  document.getElementById('modalBackdrop').addEventListener('click',()=>host.innerHTML='');
  document.getElementById('studentModal').addEventListener('click',e=>e.stopPropagation());
  document.getElementById('modalPdf').addEventListener('click',()=>window.print());
}

function bindCurrentView() { view === 'student' ? bindStudent() : bindManagement(); }
render();
