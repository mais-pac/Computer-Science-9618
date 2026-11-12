(function () {
  'use strict';
  const papers = {
    1: {title:'Theory Fundamentals', duration:'1 hour 30 minutes', sections:'Sections 1–8', level:'AS Level'},
    2: {title:'Fundamental Problem-solving and Programming Skills', duration:'2 hours', sections:'Sections 9–12', level:'AS Level'},
    3: {title:'Advanced Theory', duration:'1 hour 30 minutes', sections:'Sections 13–20', level:'A Level'},
    4: {title:'Practical', duration:'2 hours 30 minutes', sections:'Sections 19–20 (with exclusions)', level:'A Level'}
  };
  // Each URL is a session archive, not an individual question paper or a worked solution.
  const archive = 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level-computer-science-for-first-examination-in-2021-9618';
  const sessions = [
    {year:2026, name:'May/June', url:'https://www.papersdaddy.com/cambridge/a-level/computer-science-for-first-examination-in-2021-9618/2026-may-june'},
    {year:2025, name:'May/June', url:'https://www.papersdaddy.com/cambridge/a-level/computer-science-for-first-examination-in-2021-9618/2025-may-june'},
    {year:2025, name:'October/November', url:'https://www.papersdaddy.com/cambridge/a-level/computer-science-for-first-examination-in-2021-9618/2025-oct-nov'},
    {year:2024, name:'May/June', url:'https://www.papersdaddy.com/cambridge/a-level/computer-science-for-first-examination-in-2021-9618/2024-may-june'},
    {year:2024, name:'October/November', url:'https://www.papersdaddy.com/cambridge/a-level/computer-science-for-first-examination-in-2021-9618/2024-oct-nov'},
    {year:2023, name:'May/June', url:'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level-computer-science-for-first-examination-in-2021-9618-2023-may-june'},
    {year:2023, name:'October/November', url:'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level-computer-science-for-first-examination-in-2021-9618-2023-oct-nov'},
    {year:2022, name:'May/June', url:'https://epastpapers.com/cie/cie-a-level/computer-science-9618/9618-2022-may-june/'},
    {year:2022, name:'October/November', url:'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level-computer-science-for-first-examination-in-2021-9618-2022-oct-nov'},
    {year:2021, name:'May/June', url:'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level-computer-science-for-first-examination-in-2021-9618-2021-may-june'},
    {year:2021, name:'October/November', url:'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level-computer-science-for-first-examination-in-2021-9618-2021-oct-nov'}
  ];
  const syllabus='https://www.cambridgeinternational.org/Images/721397-2027-2029-syllabus.pdf';
  const page=document.getElementById('papers-content');
  const number=new URLSearchParams(location.search).get('paper');
  const paper=Object.prototype.hasOwnProperty.call(papers,number) ? papers[number] : null;
  const arrow='<span class="papers-arrow" aria-hidden="true">→</span>';
  if (!paper) {
    page.innerHTML=`<div class="papers-breadcrumb"><a href="index.html">Home</a> › Past papers</div><p class="papers-kicker">Cambridge International · 9618</p><h1>Computer Science past papers</h1><p class="papers-intro">Choose a paper to browse past examination sessions from 2021 to 2026. Build your confidence with real questions and mark schemes.</p><a class="papers-back" href="${archive}">Browse the complete external 9618 archive ↗</a><section class="papers-section"><div class="papers-grid">${Object.entries(papers).map(([n,p])=>`<a class="papers-card" href="past-papers.html?paper=${n}"><span><strong>${p.title}</strong><small>Paper ${n} · ${p.level}</small></span>${arrow}</a>`).join('')}</div></section><div class="papers-notice"><strong>Before you begin.</strong> Past-paper files are provided by third-party archives and need an internet connection. Availability can change. Practice tests on this site are reconstructions, not official papers. <a href="${syllabus}">View the Cambridge 2027–2029 syllabus ↗</a></div>`;
  } else {
    document.title=`Paper ${number} ${paper.title} · 9618 Past Papers`;
    page.innerHTML=`<div class="papers-breadcrumb"><a href="index.html">Home</a> › <a href="past-papers.html">Past papers</a> › Paper ${number}</div><p class="papers-kicker">Cambridge International · 9618</p><h1>Paper ${number}: ${paper.title}</h1><p class="papers-intro">Browse individual paper variants by year and series. Each card opens its external session archive; select the matching question paper and mark scheme there.</p><div class="papers-notice"><strong>${paper.level} · 75 marks · ${paper.duration}</strong><br>${paper.sections}, as described in the <a href="${syllabus}">2027–2029 syllabus ↗</a>. Older papers may differ from your syllabus; check its requirements. Cards open external session collections, not individual PDFs or worked solutions. Some variants may be unavailable in a particular archive.</div><nav class="year-nav" aria-label="Jump to year">${[2026,2025,2024,2023,2022,2021].map(y=>`<a href="#year-${y}">${y}</a>`).join('')}</nav>${[2026,2025,2024,2023,2022,2021].map(year=>`<section class="papers-section papers-year" id="year-${year}"><h2>${year}</h2><div class="papers-grid">${sessions.filter(s=>s.year===year).flatMap(s => (s.year === 2021 && s.name === "October/November" && Number(number) >= 3 ? [1,2] : [1,2,3]).map(variant => `<a class="papers-card" href="${s.url}"><span><strong>9618/${number}${variant} · ${s.name} ${year}</strong><small>Opens session archive · select variant ${number}${variant}</small></span>${arrow}</a>`)).join('')}</div>${year===2026?'<p class="papers-notice">October/November 2026 is not indexed here yet. Check the archive for updates.</p>':''}</section>`).join('')}<p class="papers-section"><a href="past-papers.html">← All four papers</a> &nbsp; · &nbsp; <a href="exams.html">Site practice papers →</a></p>`;
  }
})();
