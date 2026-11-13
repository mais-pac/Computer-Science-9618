(function () {
  'use strict';
  const match = location.pathname.split('/').pop().match(/^9618-([1-4])([1-3])-(mj|on)-(202[1-6])(?:\.html)?$/);
  const page = document.getElementById('paper-detail');
  if (!match) { page.textContent = 'Paper not found.'; return; }
  const [, paper, variant, series, year] = match;
  const session = series === 'mj' ? 'May/June' : 'October/November';
  const code = (series === 'mj' ? 's' : 'w') + year.slice(-2);
  const ids = (window.PAPER_FILES[code] || [])[(Number(paper)-1)*3 + Number(variant)-1] || [];
  const url = id => 'https://drive.google.com/file/d/' + encodeURIComponent(id) + '/view';
  const action = (kind, title, status, href) => href
    ? `<a class="paper-action ${kind}" href="${href}" target="_blank" rel="noopener noreferrer">${title} ↗</a>`
    : `<span class="paper-action ${kind} unavailable" aria-disabled="true" aria-label="${title}: ${status}" title="${status}">${title} <small>${status}</small></span>`;
  const number = paper + variant;
  document.title = `9618/${number} ${session} ${year} · CS9618`;
  page.innerHTML = `<div class="papers-breadcrumb"><a href="../index.html">Home</a> › <a href="../past-papers.html?paper=${paper}">Paper ${paper}</a> › ${session} ${year}</div>
    <div class="paper-heading"><div class="paper-heading-copy"><p class="papers-kicker">Cambridge International · Computer Science</p><h1>9618/${number} ${session} ${year}</h1>
    <p class="papers-alias">Also known as: 9618/${number}/${series === 'mj' ? 'M/J' : 'O/N'}/${year.slice(-2)} · 9618 ${code} ${number}</p>
    <p class="papers-intro">Explore this Computer Science paper and its official mark scheme.</p></div>
    <nav class="paper-actions" aria-label="Paper resources">${action('exam','Take Exam','Online exam not yet available',null)}${action('mark-scheme','Mark Scheme','Not indexed yet',ids[1] && url(ids[1]))}${action('question-paper','Question Paper','Not indexed yet',ids[0] && url(ids[0]))}${action('worked','Worked Paper','Not uploaded yet',null)}</nav></div>
    <section class="paper-content" aria-labelledby="questions-heading"><h2 id="questions-heading">Questions and worked solutions</h2><p>Question-by-question content and worked solutions are not available yet. Use the question paper and official mark scheme above in the meantime.</p></section>
    <div class="papers-notice"><strong>About these resources.</strong> Question papers and mark schemes link to your existing Google Drive files. Google sign-in and the file’s existing permissions apply. No worked answers have been uploaded. This independent resource is not affiliated with Cambridge.</div>`;
})();
