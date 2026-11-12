(function () {
  'use strict';
  const match = location.pathname.split('/').pop().match(/^9618-([1-4])([1-3])-(mj|on)-(202[1-6])\.html$/);
  const page = document.getElementById('paper-detail');
  if (!match) { page.textContent = 'Paper not found.'; return; }
  const [, paper, variant, series, year] = match;
  const session = series === 'mj' ? 'May/June' : 'October/November';
  const code = (series === 'mj' ? 's' : 'w') + year.slice(-2);
  const ids = (window.PAPER_FILES[code] || [])[(Number(paper)-1)*3 + Number(variant)-1] || [];
  const url = id => 'https://drive.google.com/file/d/' + encodeURIComponent(id) + '/view';
  const box = (colour,title,caption,href) => href
    ? `<a class="paper-action ${colour}" href="${href}" target="_blank" rel="noopener noreferrer"><strong>${title}</strong><span>${caption} ↗</span></a>`
    : `<div class="paper-action ${colour} unavailable" aria-disabled="true"><strong>${title}</strong><span>${caption}</span></div>`;
  const number = paper + variant;
  document.title = `9618/${number} ${session} ${year} · CS9618`;
  page.innerHTML = `<div class="papers-breadcrumb"><a href="../index.html">Home</a> › <a href="../past-papers.html?paper=${paper}">Paper ${paper}</a> › ${session} ${year}</div>
    <p class="papers-kicker">Cambridge International · Computer Science</p><h1>9618/${number} ${session} ${year}</h1>
    <p class="papers-alias">Also known as: 9618/${number}/${series === 'mj' ? 'M/J' : 'O/N'}/${year.slice(-2)} · 9618 ${code} ${number}</p>
    <p class="papers-intro">Explore the question paper and official mark scheme for this Computer Science exam. Online exam mode and worked answers will be added after they have been prepared and checked.</p>
    <div class="paper-actions">${box('yellow','Take Exam','Online exam not yet available',null)}${box('red','Mark Scheme',ids[1] ? 'Open official PDF in Drive' : 'Not indexed yet',ids[1] && url(ids[1]))}${box('green','Question Paper',ids[0] ? 'Open official PDF in Drive' : 'Not indexed yet',ids[0] && url(ids[0]))}${box('blue','Worked Paper','Not uploaded yet',null)}</div>
    <div class="papers-notice"><strong>About these resources.</strong> Question papers and mark schemes link to your existing Google Drive files. Google sign-in and the file’s existing permissions apply. No worked answers have been uploaded. This independent resource is not affiliated with Cambridge.</div>`;
})();
