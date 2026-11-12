(function () {
  'use strict';
  const papers = {
    1: {title:'Theory Fundamentals', duration:'1 hour 30 minutes', sections:'Sections 1–8', level:'AS Level'},
    2: {title:'Fundamental Problem-solving and Programming Skills', duration:'2 hours', sections:'Sections 9–12', level:'AS Level'},
    3: {title:'Advanced Theory', duration:'1 hour 30 minutes', sections:'Sections 13–20', level:'A Level'},
    4: {title:'Practical', duration:'2 hours 30 minutes', sections:'Sections 19–20 (with exclusions)', level:'A Level'}
  };
  const sessions = [
    {year:2026,name:'May/June',code:'mj'},
    ...[2025,2024,2023,2022,2021].flatMap(year=>[{year,name:'May/June',code:'mj'},{year,name:'October/November',code:'on'}])
  ];
  const syllabus='https://www.cambridgeinternational.org/Images/721397-2027-2029-syllabus.pdf';
  const page=document.getElementById('papers-content');
  const number=new URLSearchParams(location.search).get('paper');
  const paper=Object.prototype.hasOwnProperty.call(papers,number) ? papers[number] : null;
  const arrow='<span class="papers-arrow" aria-hidden="true">→</span>';
  if (!paper) {
    page.innerHTML=`<div class="papers-breadcrumb"><a href="index.html">Home</a> › Past papers</div><p class="papers-kicker">Cambridge International · 9618</p><h1>Computer Science past papers</h1><p class="papers-intro">Choose a paper to browse past examination sessions from 2021 to 2026. Build your confidence with real questions and mark schemes.</p><section class="papers-section"><div class="papers-grid">${Object.entries(papers).map(([n,p])=>`<a class="papers-card" href="past-papers.html?paper=${n}"><span><strong>${p.title}</strong><small>Paper ${n} · ${p.level}</small></span>${arrow}</a>`).join('')}</div></section><div class="papers-notice"><strong>Before you begin.</strong> Paper pages link to your Drive copies where indexed. Drive sign-in and permission may be required. Interactive tests are still being prepared. <a href="${syllabus}">View the Cambridge 2027–2029 syllabus ↗</a></div>`;
  } else {
    document.title=`Paper ${number} ${paper.title} · 9618 Past Papers`;
    page.innerHTML=`<div class="papers-breadcrumb"><a href="index.html">Home</a> › <a href="past-papers.html">Past papers</a> › Paper ${number}</div><p class="papers-kicker">Cambridge International · 9618</p><h1>Paper ${number}: ${paper.title}</h1><p class="papers-intro">Choose a paper to see its question paper, mark scheme, and practice options.</p><div class="papers-notice"><strong>${paper.level} · 75 marks · ${paper.duration}</strong><br>${paper.sections}, as described in the <a href="${syllabus}">2027–2029 syllabus ↗</a>. Older papers may differ from your syllabus; check its requirements. Availability differs between papers; older exam papers may have different content or timings.</div><nav class="year-nav" aria-label="Jump to year">${[2026,2025,2024,2023,2022,2021].map(y=>`<a href="#year-${y}">${y}</a>`).join('')}</nav>${[2026,2025,2024,2023,2022,2021].map(year=>`<section class="papers-section papers-year" id="year-${year}"><h2>${year}</h2><div class="papers-grid">${sessions.filter(s=>s.year===year).map(s => `<div class="papers-series">${(s.year === 2021 && s.name === "October/November" && Number(number) >= 3 ? [1,2] : [1,2,3]).map(variant => `<a class="papers-card" href="papers/9618-${number}${variant}-${s.code}-${year}.html"><strong>9618/${number}${variant} · ${s.name} ${year}</strong>${arrow}</a>`).join('')}</div>`).join('')}</div>${year===2026?'<p class="papers-notice">October/November 2026 is not indexed here yet.</p>':''}</section>`).join('')}<p class="papers-section"><a href="past-papers.html">← All four papers</a> &nbsp; · &nbsp; <a href="exams.html">Site practice papers →</a></p>`;
  }
})();
