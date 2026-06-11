(function(){
  const raceDate = new Date('2026-09-03T08:00:00-04:00');
  const countdown = document.querySelector('[data-countdown]');
  const REPORT_STORAGE_KEY = 'moonshotWeeklyReports';
  const LEGACY_DRAFT_KEY = 'moonshotReportDrafts';
  const DEFAULT_SUMMARY = 'This week built running accumulation, maintained strength, and identified station efficiency as the next limiter.';
  const mobileNavToggle = document.querySelector('[data-mobile-nav-toggle]');
  const mobileNavMenu = document.querySelector('[data-mobile-menu]');

  if (mobileNavToggle && mobileNavMenu) {
    const siteNav = mobileNavToggle.closest('.site-nav');
    const setMobileNavOpen = (isOpen) => {
      mobileNavToggle.setAttribute('aria-expanded', String(isOpen));
      mobileNavToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      siteNav?.classList.toggle('nav-open', isOpen);
    };

    mobileNavToggle.addEventListener('click', () => {
      setMobileNavOpen(mobileNavToggle.getAttribute('aria-expanded') !== 'true');
    });

    mobileNavMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMobileNavOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMobileNavOpen(false);
    });

    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 851px)').matches) setMobileNavOpen(false);
    });
  }


  const dailyQuotes = [
    'If you pray to win a marathon, expect shoes, not a medal.',
    'The runners win. The strong survive.',
    'No wasted motion.',
    'You do not rise to the race. You fall to your preparation.',
    'The clock is not pressure. It is information.',
    'Earn the calm before the start line.',
    'Discipline is speed before speed shows up.',
    'The split tells the truth without emotion.',
    'Train until panic has nowhere to stand.',
    'Every clean rep removes a future excuse.',
    'Make the hard pace familiar.',
    'Strong legs are useless without repeatability.',
    'The station ends when the run is protected.',
    'Control the breath. Control the room.',
    'A clean transition is free speed.',
    'Fitness compounds in silence.',
    'The body follows the standard it sees every day.',
    'Do the simple work with violent consistency.',
    'Fatigue reveals the plan.',
    'Calm is a trained response.',
    'The first kilometer cannot spend the eighth.',
    'Keep moving. Make decisions later.',
    'Nothing heroic before halfway.',
    'Precision beats noise.',
    'Your legs should know the answer.',
    'The work is the warning shot.',
    'Never negotiate with the last rep.',
    'Pace is a weapon when respected.',
    'Let the scoreboard stay quiet until race day.',
    'Preparation is aggression with patience.',
    'Breathe lower. Move cleaner.',
    'The floor does not care how tired you are.',
    'Make effort look organized.',
    'Do not borrow speed you cannot repay.',
    'The best teams waste nothing between stations.',
    'Hold form when comfort leaves.',
    'A target is not a wish. It is a demand.',
    'Every meter counts twice under fatigue.',
    'The plan is built to survive bad minutes.',
    'Do not chase pain. Chase output.',
    'Quiet training makes loud results.',
    'Fast is clean before it is fast.',
    'The next step is the only argument.',
    'Weak pacing taxes everything.',
    'Build the engine. Guard the chassis.',
    'Practice removes drama.',
    'Race day exposes habits, not intentions.',
    'A steady team is hard to break.',
    'The mission rewards boring excellence.',
    'Make the standard automatic.',
    'Hard work needs direction or it leaks.',
    'The clock only reports what you built.',
    'Enter the station under control. Leave dangerous.',
    'Every shortcut arrives at the wall balls.',
    'Run economy is earned, not found.',
    'Strength matters most when it stays efficient.',
    'No rep is neutral.',
    'The race is paid for in advance.',
    'Move like the minute matters.',
    'Training should make chaos feel scheduled.',
    'Do not admire fatigue. Manage it.',
    'The partner standard is the team standard.',
    'Recover like the work depends on it.',
    'Small leaks sink fast teams.',
    'Own the pace before you test it.',
    'The lungs complain. The system decides.',
    'Start patient. Finish hostile.',
    'Details become minutes under load.',
    'The sled respects angle, pressure, and nerve.',
    'The row punishes ego quietly.',
    'The SkiErg rewards rhythm over rage.',
    'Carry the bells like nothing is happening.',
    'Lunge with discipline or pay interest.',
    'Wall balls end teams that trained vague.',
    'Run after the station, not away from it.',
    'Protect the redline until it is useful.',
    'The cleanest team owns the back half.',
    'Comfort is not part of the strategy.',
    'The standard travels with you.',
    'You cannot fake repeatable power.',
    'The race finds every loose screw.',
    'Today is for deposits, not speeches.',
    'Execution is the only motivation that counts.',
    'Let the work make the decision obvious.',
    'Sub-60 starts with another controlled session.'
  ];


  if (countdown) {
    const fields = {
      days: countdown.querySelector('[data-days]'),
      hours: countdown.querySelector('[data-hours]'),
      minutes: countdown.querySelector('[data-minutes]'),
      seconds: countdown.querySelector('[data-seconds]')
    };
    const dailyQuote = countdown.querySelector('[data-daily-quote]');
    const tick = () => {
      const remaining = Math.max(0, raceDate.getTime() - Date.now());
      const days = Math.floor(remaining / 86400000);
      const hours = Math.floor((remaining % 86400000) / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      fields.days.textContent = String(days);
      fields.hours.textContent = String(hours).padStart(2,'0');
      fields.minutes.textContent = String(minutes).padStart(2,'0');
      fields.seconds.textContent = String(seconds).padStart(2,'0');

      if (dailyQuote) dailyQuote.textContent = dailyQuotes[days % dailyQuotes.length];
    };
    tick();
    setInterval(tick, 1000);
  }

  const safeParseReports = (value) => {
    try {
      const parsed = JSON.parse(value || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const legacyCompletedWork = (legacyFields) => [legacyFields.teamScoreboard, legacyFields.whatGotDone]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join('\n\n');

  const createReportId = () => `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const stableReportId = (report) => {
    const seed = [report.week, report.status, report.headline, report.completedWork, report.decisionCheckpoint, report.nextOrders]
      .map((value) => String(value || '').trim().toLowerCase())
      .join('|');
    let hash = 0;
    for (let index = 0; index < seed.length; index += 1) {
      hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
    }
    return `report-${Math.abs(hash).toString(36)}`;
  };

  const normalizeReport = (report = {}) => {
    const { teamScoreboard, whatGotDone, ...currentReport } = report;
    const completedWork = String(currentReport.completedWork || '').trim() || legacyCompletedWork({ teamScoreboard, whatGotDone });
    const normalized = { ...currentReport, completedWork };
    return {
      ...normalized,
      id: currentReport.id || stableReportId(normalized)
    };
  };

  const reportKey = (report) => [
    report.week,
    report.status,
    report.headline,
    report.completedWork,
    report.decisionCheckpoint,
    report.nextOrders
  ].map((value) => String(value || '').trim().toLowerCase()).join('|');

  const dedupeReports = (reports) => {
    const seen = new Set();
    return reports.filter((report) => {
      const key = reportKey(report);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const readReports = () => {
    try {
      const savedReports = safeParseReports(localStorage.getItem(REPORT_STORAGE_KEY));
      return dedupeReports(savedReports
        .filter((report) => report && typeof report === 'object')
        .map(normalizeReport)
        .sort((a, b) => String(b.savedAt || '').localeCompare(String(a.savedAt || ''))));
    } catch (error) {
      return [];
    }
  };

  const fallbackReports = [
    {
      week: 'Week 1 - June 1 to June 7, 2026',
      status: 'Ready for archive',
      headline: 'Starting is more than others ever do',
      completedWork: 'Mileage/elevation: Vudi logged 33.9 mi and 5,047 ft climbed across the week. Long run: sunset hill run. Strength work: bench 225 x 11 / 10 / 10; later 225 x 6 x 6. Squat 225 x 5 x 5. Pull-ups completed. Station work: sled work, SkiErg exposure, first rowing lesson, early row/ski benchmarks. Recovery notes and Ryan updates TBD.',
      decisionCheckpoint: 'Keep the 30+ mile hill week while adding HYROX station practice. Prioritize running accumulation because HYROX rewards athletes who keep running after stations.',
      nextOrders: 'Increase station benchmarks. Protect sleep and strength. Stop random junk volume. Next target: cleaner run-station-run session and Ryan weekly mileage check-in.',
      generatedSummary: DEFAULT_SUMMARY
    }
  ];

  const normalizeStatus = (status) => status || 'Draft';
  const isPendingStatus = (status) => /pending|draft|needs|red flag/i.test(status);
  const displayText = (value, fallback = 'TBD') => String(value || '').trim() || fallback;
  const escapeHtml = (value, fallback = 'TBD') => String(displayText(value, fallback))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
  const printDate = () => new Date().toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const includesAny = (text, terms) => terms.some((term) => text.includes(term));

  const generateReportSummary = (data) => {
    const normalizedData = normalizeReport(data || {});
    const summarySource = ['completedWork', 'decisionCheckpoint', 'nextOrders']
      .map((key) => normalizedData[key] || '')
      .join(' ');
    if (!summarySource.trim()) return DEFAULT_SUMMARY;
    const combined = summarySource.toLowerCase();
    const built = includesAny(combined, ['run', 'mile', 'mileage', 'hill', 'long run', 'accumulation'])
      ? 'built running accumulation'
      : 'kept the weekly training signal moving';
    const strength = includesAny(combined, ['strength', 'lift', 'bench', 'squat', 'deadlift', 'pull-up', 'carry'])
      ? 'maintained strength'
      : 'protected the strength floor';
    const limiter = includesAny(combined, ['station', 'ski', 'row', 'sled', 'wall ball', 'burpee', 'lunge', 'transition'])
      ? 'station efficiency'
      : includesAny(combined, ['sleep', 'recovery', 'sore', 'pain', 'fatigue', 'hrv', 'rhr'])
        ? 'recovery discipline'
        : 'next-week execution';

    return `This week ${built}, ${strength}, and identified ${limiter} as the next limiter.`;
  };

  const appendTextWithBreaks = (cell, text) => {
    displayText(text).split('\n').forEach((line, index) => {
      if (index > 0) cell.appendChild(document.createElement('br'));
      cell.appendChild(document.createTextNode(line));
    });
  };

  const addReportRow = (tableBody, category, entry, signal, className = '') => {
    const row = document.createElement('tr');
    if (className) row.className = className;
    const categoryCell = document.createElement('td');
    const entryCell = document.createElement('td');
    const signalCell = document.createElement('td');

    categoryCell.textContent = category;
    appendTextWithBreaks(entryCell, entry);
    signalCell.textContent = signal;
    row.append(categoryCell, entryCell, signalCell);
    tableBody.appendChild(row);
  };

  const renderLatestReport = () => {
    const latestReport = document.querySelector('[data-latest-report]');
    if (!latestReport) return;

    const reports = readReports();
    const report = reports[0] || fallbackReports[0];
    const isFallback = reports.length === 0;
    const tag = document.querySelector('[data-latest-report-tag]');
    const note = document.querySelector('[data-latest-report-note]');
    latestReport.innerHTML = '';

    if (tag) tag.textContent = isFallback ? 'Week 1 baseline' : 'Latest saved report';
    if (note) {
      note.textContent = isFallback
        ? 'No saved local reports found. Showing the single Week 1 baseline example.'
        : 'Showing the most recent saved local command report from this browser.';
    }

    addReportRow(latestReport, 'Week / Dates', report.week, 'Creates the timeline.');
    addReportRow(latestReport, 'Status', normalizeStatus(report.status), 'Archive readiness.');
    addReportRow(latestReport, 'Headline', displayText(report.headline, 'No headline entered.'), 'Fast archive context.', 'is-headline');
    addReportRow(latestReport, 'Completed Work', report.completedWork, 'Facts and evidence block.');
    addReportRow(latestReport, 'Decision Checkpoint', report.decisionCheckpoint, 'Strategic choice layer.');
    addReportRow(latestReport, 'Next Orders', report.nextOrders, 'Action loop.');
    addReportRow(latestReport, 'Generated Summary', report.generatedSummary || generateReportSummary(report), 'One-line command readout.', 'is-summary');
  };

  const makeArchiveField = (label, value, className = '') => {
    const field = document.createElement('div');
    const toneClass = label === 'Headline' ? 'is-headline' : label === 'Generated Summary' ? 'is-summary' : '';
    field.className = `archive-field${className ? ` ${className}` : ''}${toneClass ? ` ${toneClass}` : ''}`;
    const labelEl = document.createElement('div');
    labelEl.className = 'label';
    labelEl.textContent = label;
    const valueEl = document.createElement('div');
    valueEl.className = 'archive-field-value';
    appendTextWithBreaks(valueEl, value);
    field.append(labelEl, valueEl);
    return field;
  };

  const makeReportButton = (label, className, onClick) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
  };

  const writeReports = (reports) => {
    localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(dedupeReports(reports).slice(0, 24)));
  };

  const renderArchive = () => {
    const archive = document.querySelector('[data-report-archive]');
    if (!archive) return;

    const reports = readReports();
    const rows = reports.length ? reports : fallbackReports;
    archive.innerHTML = '';

    rows.forEach((report) => {
      const card = document.createElement('article');
      card.className = 'archive-card';
      const statusText = normalizeStatus(report.status);
      const summaryText = displayText(report.generatedSummary || generateReportSummary(report));
      const header = document.createElement('div');
      header.className = 'archive-card-header';
      const weekWrap = document.createElement('div');
      weekWrap.appendChild(makeArchiveField('Week / Dates', report.week));
      const exportButton = makeReportButton('EXPORT', 'button export-button', () => exportWeeklyReport(report));
      exportButton.setAttribute('aria-label', `Export scorecard for ${displayText(report.week, 'this weekly report')}`);
      header.append(weekWrap, exportButton);

      const body = document.createElement('div');
      body.className = 'archive-card-body';
      body.append(
        makeArchiveField('Status', statusText),
        makeArchiveField('Headline', displayText(report.headline, 'No headline entered.')),
        makeArchiveField('Completed Work', report.completedWork, 'wide'),
        makeArchiveField('Decision Checkpoint', report.decisionCheckpoint),
        makeArchiveField('Next Orders', report.nextOrders),
        makeArchiveField('Generated Summary', summaryText, 'wide generated-summary archive-summary')
      );

      card.append(header, body);

      if (reports.length) {
        const actions = document.createElement('div');
        actions.className = 'archive-card-actions';
        actions.append(
          makeReportButton('Edit', 'button secondary', () => {
            window.location.href = `upload.html?edit=${encodeURIComponent(report.id)}`;
          }),
          makeReportButton('Delete', 'button secondary danger', () => {
            const remaining = readReports().filter((savedReport) => savedReport.id !== report.id);
            try {
              writeReports(remaining);
              renderLatestReport();
              renderArchive();
              renderMissionProgress();
              const note = document.querySelector('[data-archive-note]');
              if (note) note.textContent = 'Report deleted from localStorage on this device.';
            } catch (error) {
              const note = document.querySelector('[data-archive-note]');
              if (note) note.textContent = 'Unable to delete this report in this browser.';
            }
          })
        );
        card.appendChild(actions);
      }

      archive.appendChild(card);
    });
  };

  const openPrintableRecord = (title, bodyClass, contentHtml) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
  :root{color-scheme:dark;--red:#e11937;--amber:#ffb000;--ink:#f3f4f7;--panel:rgba(255,255,255,.075);--line:rgba(255,255,255,.18)}
  *{box-sizing:border-box} body{margin:0;padding:32px;background:radial-gradient(circle at 82% 0%,rgba(225,25,55,.28),transparent 34%),linear-gradient(135deg,#050505,#111318 62%,#050505);color:var(--ink);font:14px/1.55 Inter,Arial,sans-serif}
  .record{max-width:980px;margin:0 auto;border:1px solid var(--line);border-radius:28px;background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.035));box-shadow:0 26px 80px rgba(0,0,0,.38);overflow:hidden}
  .record-top{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;padding:24px 26px;border-bottom:1px solid var(--line);background:linear-gradient(90deg,rgba(225,25,55,.20),rgba(255,176,0,.09))}
  .eyebrow{color:var(--amber);font-size:11px;text-transform:uppercase;letter-spacing:.18em;font-weight:900}.record h1{margin:6px 0 0;font-size:38px;line-height:.95;text-transform:uppercase;letter-spacing:-.05em}.record h2{margin:0 0 10px;font-size:15px;text-transform:uppercase;letter-spacing:.14em;color:var(--amber)}
  .print-actions{position:sticky;top:0;z-index:5;display:flex;justify-content:center;padding:12px;background:rgba(5,5,5,.82);backdrop-filter:blur(14px)}button{border:1px solid rgba(225,25,55,.62);border-radius:999px;background:var(--red);color:white;padding:11px 16px;font-weight:950;text-transform:uppercase;letter-spacing:.1em;cursor:pointer}
  .record-body{display:grid;gap:16px;padding:22px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.field,.metric,.progress-card{border:1px solid var(--line);border-radius:18px;background:var(--panel);padding:15px}.field.wide{grid-column:1/-1}.field .label,.metric span{display:block;margin-bottom:6px;color:#aeb4bf;font-size:10px;text-transform:uppercase;letter-spacing:.14em;font-weight:900}.field .value{font-size:14px;color:#f7f8fa}.metric strong{display:block;color:#fff;font-size:24px;line-height:1}.mission-seal{border:1px solid rgba(255,176,0,.32);border-radius:18px;padding:14px;color:#f7d681;background:rgba(255,176,0,.07);font-weight:800}.progress-row{margin:10px 0}.progress-head{display:flex;justify-content:space-between;font-weight:900}.bar{height:9px;border-radius:999px;background:rgba(255,255,255,.13);overflow:hidden}.bar span{display:block;height:100%;background:linear-gradient(90deg,var(--red),var(--amber))}
  @media (max-width:720px){body{padding:14px}.record-top,.grid{display:block}.field,.metric{margin-bottom:12px}.record h1{font-size:30px}}
  @page{size:Letter;margin:.35in}
  @media print{
    :root{color-scheme:light;--red:#e11d48;--amber:#d99000;--ink:#111;--panel:#fff;--line:#d7d7d7}
    html,body{width:100%;min-height:auto;background:#fff!important;color:#111!important;padding:0!important;margin:0!important;font:9pt/1.25 Inter,Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible!important}
    body::before,body::after,.print-actions,button,.background-layer{display:none!important}
    body.scorecard-print{display:block;background:#fff!important;color:#111!important}
    *{box-shadow:none!important;text-shadow:none!important;overflow:visible!important}
    .record{display:block;width:100%!important;max-width:none!important;margin:0!important;padding:.18in!important;border:1px solid #ddd!important;border-radius:8px;background:#fff!important;color:#111!important;box-shadow:none!important;transform:none!important;overflow:visible!important;page-break-inside:avoid;break-inside:avoid}
    .record *{color:#111!important;box-shadow:none!important}
    .record-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;padding:0 0 8px;margin:0 0 8px;border-bottom:2px solid var(--red);background:#fff!important;page-break-inside:avoid;break-inside:avoid}
    .eyebrow{color:var(--amber)!important;font-size:7.5pt;letter-spacing:.13em}.record h1{color:var(--red)!important;font-size:21pt;line-height:1;margin:3px 0 0}.record h2{color:var(--red)!important;font-size:9.5pt;line-height:1.1;margin:0 0 5px;letter-spacing:.12em}.detected-signals h2{color:var(--amber)!important}
    .mission-seal{border:1px solid var(--amber);border-radius:8px;padding:6px;color:#111!important;background:#fff8e5!important;font-size:7.7pt;line-height:1.2;font-weight:900;page-break-inside:avoid;break-inside:avoid}
    .record-body{display:grid;gap:7px;padding:0;background:#fff!important;page-break-inside:avoid;break-inside:avoid}
    .scorecard-section,.record-body>.grid,.grid,.detected-grid,.progress-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important;page-break-inside:avoid;break-inside:avoid}
    .scorecard-section,.detected-signals,.progress-card{page-break-inside:avoid;break-inside:avoid;background:#fff!important;border:1px solid #d7d7d7!important;border-radius:8px!important;padding:7px!important;margin:0!important}
    .field,.metric,.progress-row{page-break-inside:avoid;break-inside:avoid;background:#fff!important;border:1px solid #d7d7d7!important;color:#111!important;border-radius:7px!important;padding:6px!important;margin:0!important}
    .field.wide{grid-column:1/-1}.field .label,.metric span,.progress-head span:first-child{display:block;color:#4b5563!important;font-size:7pt!important;line-height:1.1!important;margin-bottom:2px;text-transform:uppercase;letter-spacing:.11em;font-weight:950}.field .value{color:#111!important;font-size:8.4pt!important;line-height:1.22!important}.metric strong{display:block;color:#111!important;font-size:13pt!important;line-height:1.05;font-weight:950}.progress-card{border-color:var(--amber)!important;background:#fffdf7!important}.progress-card h2{grid-column:1/-1;color:var(--red)!important}.progress-row{border-color:#ead8a8!important;background:#fff!important}.progress-head{display:flex;justify-content:space-between;gap:8px;color:#111!important;font-size:7.7pt!important;line-height:1.1!important;font-weight:950}.progress-head span:last-child{color:#111!important;font-weight:950;white-space:nowrap}.bar{height:5px;margin-top:4px;border:1px solid #b9b9b9;background:#fff!important;border-radius:999px;overflow:hidden!important}.bar span{background:linear-gradient(90deg,var(--red),var(--amber))!important}
  }
</style>
</head>
<body class="${bodyClass}">
<div class="print-actions"><button onclick="window.print()">Print / Save as PDF</button></div>
${contentHtml}
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
  };

  const progressRowsHtml = (parsed) => Object.entries(progressTargets).map(([key, target]) => {
    const parsedValue = Number.isFinite(parsed[key]) && parsed[key] > 0 ? parsed[key] : manualMeterValues[key];
    const percent = Math.min(100, Math.max(0, (parsedValue / target) * 100));
    const labels = { miles: 'Miles', elevation: 'Elevation', stations: 'HYROX Stations', simulations: 'Simulations' };
    return `<div class="progress-row"><div class="progress-head"><span>${labels[key]}</span><span>${formatProgressValue(key, parsedValue)}</span></div><div class="bar"><span style="width:${percent}%"></span></div></div>`;
  }).join('');

  const exportWeeklyReport = (report) => {
    const normalized = normalizeReport(report);
    const parsed = extractReportProgress(normalized);
    const summaryText = normalized.generatedSummary || generateReportSummary(normalized);
    const stations = parsed.stationLabels?.length ? `${formatLogValue('stations', parsed.stations)} (${parsed.stationLabels.join(', ')})` : formatLogValue('stations', parsed.stations);
    openPrintableRecord(
      `Project Moonshot Scorecard - ${displayText(normalized.week, 'Weekly Report')}`,
      'scorecard-print',
      `<main class="record">
        <header class="record-top"><div><div class="eyebrow">Project Moonshot // Official Mission Record</div><h1>Weekly Scorecard</h1></div><div class="mission-seal">Generated ${escapeHtml(printDate())}<br>Status: ${escapeHtml(normalizeStatus(normalized.status))}</div></header>
        <section class="record-body">
          <div class="grid scorecard-section">
            <div class="field"><div class="label">Week / Dates</div><div class="value">${escapeHtml(normalized.week)}</div></div>
            <div class="field"><div class="label">Headline</div><div class="value">${escapeHtml(normalized.headline, 'No headline entered.')}</div></div>
            <div class="field wide"><div class="label">Completed Work</div><div class="value">${escapeHtml(normalized.completedWork)}</div></div>
            <div class="field"><div class="label">Decision Checkpoint</div><div class="value">${escapeHtml(normalized.decisionCheckpoint)}</div></div>
            <div class="field"><div class="label">Next Orders</div><div class="value">${escapeHtml(normalized.nextOrders)}</div></div>
            <div class="field wide"><div class="label">Generated Summary</div><div class="value">${escapeHtml(summaryText)}</div></div>
          </div>
          <div class="detected-signals"><h2>Detected Signals</h2><div class="grid detected-grid"><div class="metric"><span>Detected Miles</span><strong>${escapeHtml(formatLogValue('miles', parsed.miles))}</strong></div><div class="metric"><span>Detected Elevation</span><strong>${escapeHtml(formatLogValue('elevation', parsed.elevation))}</strong></div><div class="metric"><span>Detected HYROX Stations</span><strong>${escapeHtml(stations)}</strong></div><div class="metric"><span>Detected Simulations</span><strong>${escapeHtml(formatLogValue('simulations', parsed.simulations))}</strong></div></div></div>
          <div class="progress-card progress-grid"><h2>Progress Toward Goals</h2>${progressRowsHtml(parsed)}</div>
        </section>
      </main>`
    );
  };

  const form = document.querySelector('[data-report-form]');
  if (form) {
    const note = document.querySelector('[data-form-note]');
    const summaryPreview = document.querySelector('[data-summary-preview]');
    const params = new URLSearchParams(window.location.search);
    let editingReportId = params.get('edit');

    const setFormValue = (name, value) => {
      const field = form.elements[name];
      if (field) field.value = value || '';
    };

    const updateSummaryPreview = () => {
      const payload = normalizeReport(Object.fromEntries(new FormData(form).entries()));
      if (summaryPreview) summaryPreview.textContent = generateReportSummary(payload);
    };

    if (editingReportId) {
      const reportToEdit = readReports().find((report) => report.id === editingReportId);
      if (reportToEdit) {
        setFormValue('week', reportToEdit.week);
        setFormValue('headline', reportToEdit.headline);
        setFormValue('status', normalizeStatus(reportToEdit.status));
        setFormValue('completedWork', reportToEdit.completedWork);
        setFormValue('decisionCheckpoint', reportToEdit.decisionCheckpoint);
        setFormValue('nextOrders', reportToEdit.nextOrders);
        const submitButton = form.querySelector('[type="submit"]');
        if (submitButton) submitButton.textContent = 'Overwrite Report';
        if (note) note.textContent = 'Editing a saved local report. Saving will overwrite this report in localStorage.';
      } else {
        editingReportId = '';
        if (note) note.textContent = 'Saved report not found in this browser. New saves will create a fresh local report.';
      }
    }

    form.addEventListener('input', updateSummaryPreview);
    form.addEventListener('change', updateSummaryPreview);
    updateSummaryPreview();
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const payload = normalizeReport(Object.fromEntries(new FormData(form).entries()));
      const report = {
        ...payload,
        id: editingReportId || payload.id || createReportId(),
        generatedSummary: generateReportSummary(payload),
        savedAt: new Date().toISOString()
      };
      try {
        const reports = safeParseReports(localStorage.getItem(REPORT_STORAGE_KEY))
          .filter((savedReport) => savedReport && typeof savedReport === 'object')
          .map(normalizeReport);
        const existingIndex = reports.findIndex((savedReport) => savedReport.id === report.id);
        if (existingIndex >= 0) {
          reports[existingIndex] = report;
        } else {
          reports.unshift(report);
        }
        writeReports(reports);
        editingReportId = report.id;
        if (note) note.textContent = existingIndex >= 0
          ? 'Report overwritten locally. Open the archive to review the updated card.'
          : 'Saved locally. Open the report archive to see this browser-only entry.';
      } catch (error) {
        if (note) note.textContent = 'Local save unavailable in this browser. No backend was contacted.';
      }
    });
  }


  const manualMeterValues = {
    miles: 33.9,
    elevation: 5047,
    stations: 4,
    simulations: 0
  };

  const progressTargets = {
    miles: 500,
    elevation: 50000,
    stations: 80,
    simulations: 8
  };

  const textNumber = (value) => Number(String(value).replace(/,/g, ''));

  const numericPattern = String.raw`(\d+(?:,\d{3})*(?:\.\d+)?)`;
  const unitJoinerPattern = String.raw`(?:\s*(?:of|total|for|in|across|during|this|the|team|weekly|week|logged|covered|completed|climbed|gain)?\s*){0,5}`;
  const mileUnitPattern = String.raw`(?:miles?|mi\b)`;
  const elevationUnitPattern = String.raw`(?:ft|feet)`;

  const makeRegex = (pattern, flags = 'gi') => new RegExp(pattern, flags);

  const structuredProgressFields = {
    miles: ['miles', 'mile', 'mi', 'mileage', 'runningMileage', 'weeklyMileage', 'teamMiles'],
    elevation: ['elevation', 'vert', 'vertical', 'feet', 'ft', 'gain', 'elevationGain'],
    stations: ['stations', 'stationSessions', 'hyroxStations'],
    simulations: ['simulations', 'simulation']
  };

  const stationDetectors = [
    { key: 'skiErg', label: 'SkiErg', pattern: /\b(?:ski\s*erg|skierg|erg)\b/i },
    { key: 'sledPush', label: 'Sled Push', pattern: /\b(?:sled\s+push(?:es)?|push\s+sled)\b/i },
    { key: 'sledPull', label: 'Sled Pull', pattern: /\b(?:sled\s+pull(?:s)?|pull\s+sled)\b/i },
    { key: 'burpeeBroadJumps', label: 'Burpee Broad Jumps', pattern: /\b(?:burpee\s+broad\s+jumps?|burpees?)\b/i },
    { key: 'row', label: 'Row', pattern: /\b(?:row(?:ing|er)?|rowed)\b/i },
    { key: 'farmersCarry', label: 'Farmers Carry', pattern: /\b(?:(?:farmer'?s?|farmers)\s+carr(?:y|ies)|carries)\b/i },
    { key: 'sandbagLunges', label: 'Sandbag Lunges', pattern: /\b(?:sandbag\s+lunges?|lunges?|sandbag)\b/i },
    { key: 'wallBalls', label: 'Wall Balls', pattern: /\b(?:wall\s*balls?|wallballs?)\b/i }
  ];

  const genericSledPattern = /\bsled\b/i;

  const missionTextFields = ['week', 'status', 'headline', 'completedWork', 'decisionCheckpoint', 'nextOrders', 'generatedSummary'];

  const sumPatternSet = (text, patterns) => {
    const matches = [];
    patterns.forEach((pattern) => {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(text)) !== null) {
        const value = textNumber(match[1]);
        if (Number.isFinite(value)) {
          matches.push({ index: match.index, end: match.index + match[0].length, value });
        }
      }
    });
    if (!matches.length) return null;

    return matches
      .sort((a, b) => a.index - b.index || (b.end - b.index) - (a.end - a.index))
      .reduce((state, match) => {
        const overlaps = state.ranges.some(([start, end]) => match.index < end && match.end > start);
        if (!overlaps) {
          state.total += match.value;
          state.ranges.push([match.index, match.end]);
        }
        return state;
      }, { total: 0, ranges: [] }).total;
  };

  const firstStructuredNumber = (report, keys) => {
    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(report, key)) continue;
      const value = textNumber(report[key]);
      if (Number.isFinite(value)) return value;
    }
    return null;
  };

  const reportSearchText = (report) => missionTextFields
    .map((value) => String(report[value] || ''))
    .join(' ');

  const buildPatterns = (templates) => templates.map((template) => makeRegex(template));

  const mileageAggregatePatterns = buildPatterns([
    String.raw`\b(?:running\s+)?(?:mileage|weekly\s+mileage|team\s+miles|total\s+(?:runs?|miles?|mileage))\b\s*[:=\-]\s*${numericPattern}(?!\s*(?:x|/))`,
    String.raw`\b(?:running\s+)?(?:mileage|weekly\s+mileage|team\s+miles|total\s+(?:runs?|miles?|mileage))\b${unitJoinerPattern}[:=\-]?\s*${numericPattern}\s*${mileUnitPattern}`,
    String.raw`\b(?:logged|covered|completed)\b${unitJoinerPattern}${numericPattern}\s*${mileUnitPattern}\b(?:${unitJoinerPattern}(?:week|weekly|total|across\s+the\s+week))?`,
    String.raw`${numericPattern}\s*${mileUnitPattern}\b${unitJoinerPattern}\b(?:total|weekly|mileage|across\s+the\s+week|this\s+week)\b`
  ]);

  const mileageNaturalPatterns = buildPatterns([
    String.raw`\b(?:ran|run|long\s+run|runs?|mileage|miles?|mi)\b${unitJoinerPattern}[:=\-]?\s*${numericPattern}\s*${mileUnitPattern}`,
    String.raw`${numericPattern}\s*${mileUnitPattern}\b${unitJoinerPattern}\b(?:run|runs?|running|long\s+run|mileage)\b`,
    String.raw`\b(?:ran|run)\s+${numericPattern}\s*${mileUnitPattern}`
  ]);

  const elevationAggregatePatterns = buildPatterns([
    String.raw`\b(?:elevation|vert(?:ical)?|gain|elevation\s+gain)\b\s*[:=\-]\s*${numericPattern}(?!\s*(?:x|/))`,
    String.raw`\b(?:elevation|vert(?:ical)?|gain|elevation\s+gain)\b${unitJoinerPattern}[:=\-]?\s*${numericPattern}\s*${elevationUnitPattern}`,
    String.raw`${numericPattern}\s*${elevationUnitPattern}\b${unitJoinerPattern}\b(?:elevation|vert(?:ical)?|gain|climbed|across\s+the\s+week)\b`,
    String.raw`\b(?:logged|covered|completed|climbed)\b${unitJoinerPattern}${numericPattern}\s*${elevationUnitPattern}\b${unitJoinerPattern}\b(?:elevation|vert(?:ical)?|gain|climbed|across\s+the\s+week)?\b`
  ]);

  const elevationNaturalPatterns = buildPatterns([
    String.raw`\b(?:elevation|vert(?:ical)?|gain)\b${unitJoinerPattern}[:=\-]?\s*${numericPattern}\s*${elevationUnitPattern}`,
    String.raw`${numericPattern}\s*${elevationUnitPattern}\b${unitJoinerPattern}\b(?:elevation|vert(?:ical)?|gain|feet\s+of\s+gain|climbed)\b`
  ]);

  const stationCountPatterns = buildPatterns([
    String.raw`\b(?:hyrox\s*)?(?:station|stations|station-specific)\s*(?:sessions?|workouts?|work)?\s*[:=\-]?\s*${numericPattern}`,
    String.raw`${numericPattern}\s*(?:hyrox\s*)?(?:station|stations|station-specific)\s*(?:sessions?|workouts?)\b`
  ]);

  const simulationCountPatterns = buildPatterns([
    String.raw`\b(?:hyrox\s*)?(?:simulations?|sims?)\s*[:=\-]?\s*${numericPattern}`,
    String.raw`${numericPattern}\s*(?:hyrox\s*)?(?:simulations?|sims?)\b`
  ]);

  const detectStationLabels = (text) => {
    const detected = stationDetectors.filter(({ pattern }) => pattern.test(text));
    const hasSpecificSled = detected.some(({ key }) => key === 'sledPush' || key === 'sledPull');
    if (!hasSpecificSled && genericSledPattern.test(text)) {
      detected.push({ key: 'sledGeneric', label: 'Sled Work' });
    }
    return [...new Map(detected.map((station) => [station.key, station.label])).values()];
  };

  const simulationMentionPattern = /\b(?:hyrox\s+simulation|simulation|simulations?|sims?|compromised\s+run|race\s+rehearsal|full\s+hyrox|partial\s+hyrox)\b/i;
  const hasSimulationMention = (text) => simulationMentionPattern.test(text);

  const detectedTotal = (text, aggregatePatterns, naturalPatterns) => {
    const aggregate = sumPatternSet(text, aggregatePatterns);
    return aggregate ?? sumPatternSet(text, naturalPatterns);
  };

  const extractReportProgress = (report) => {
    const text = reportSearchText(report).replace(/\s+/g, ' ');
    const structuredMiles = firstStructuredNumber(report, structuredProgressFields.miles);
    const structuredElevation = firstStructuredNumber(report, structuredProgressFields.elevation);
    const structuredStations = firstStructuredNumber(report, structuredProgressFields.stations);
    const structuredSimulations = firstStructuredNumber(report, structuredProgressFields.simulations);
    const stationLabels = detectStationLabels(text);
    const explicitStationCount = structuredStations ?? sumPatternSet(text, stationCountPatterns);
    const explicitSimulationCount = structuredSimulations ?? sumPatternSet(text, simulationCountPatterns);
    const simulationMentioned = hasSimulationMention(text);
    const miles = structuredMiles ?? detectedTotal(text, mileageAggregatePatterns, mileageNaturalPatterns);
    const elevation = structuredElevation ?? detectedTotal(text, elevationAggregatePatterns, elevationNaturalPatterns);
    const stations = explicitStationCount ?? (stationLabels.length ? stationLabels.length : null);
    const simulations = explicitSimulationCount ?? (simulationMentioned ? 1 : null);

    return { report, miles, elevation, stations, simulations, stationLabels, simulationMentioned };
  };

  const extractMissionProgress = (reports) => reports.reduce((totals, report) => {
    const parsed = extractReportProgress(report);
    ['miles', 'elevation', 'stations', 'simulations'].forEach((key) => {
      if (Number.isFinite(parsed[key])) totals[key] = (totals[key] || 0) + parsed[key];
    });
    return totals;
  }, {});

  const formatProgressValue = (key, value) => {
    const rounded = key === 'miles' ? Math.round(value * 10) / 10 : Math.round(value);
    const formatted = rounded.toLocaleString(undefined, { maximumFractionDigits: key === 'miles' ? 1 : 0 });
    const target = progressTargets[key].toLocaleString();
    if (key === 'miles') return `${formatted} / ${target} mi`;
    if (key === 'elevation') return `${formatted} / ${target} ft`;
    return `${formatted} / ${target}`;
  };

  const formatLogValue = (key, value) => {
    if (!Number.isFinite(value)) return 'not detected';
    if (key === 'miles') return `${(Math.round(value * 10) / 10).toLocaleString(undefined, { maximumFractionDigits: 1 })} mi`;
    if (key === 'elevation') return `${Math.round(value).toLocaleString()} ft`;
    return String(Math.round(value));
  };

  const renderProgressSourceLog = (reports) => {
    const log = document.querySelector('[data-progress-source-log]');
    if (!log) return;
    log.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'source-log-title';
    title.textContent = 'Progress Source Log';
    log.appendChild(title);

    if (!reports.length) {
      const empty = document.createElement('div');
      empty.className = 'source-log-empty';
      empty.textContent = `No saved reports parsed. Manual placeholders: ${formatLogValue('miles', manualMeterValues.miles)}, ${formatLogValue('elevation', manualMeterValues.elevation)}, ${formatLogValue('stations', manualMeterValues.stations)} station sessions, ${manualMeterValues.simulations} simulations.`;
      log.appendChild(empty);
      return;
    }

    reports.map(extractReportProgress).forEach((parsed) => {
      const card = document.createElement('div');
      card.className = 'source-log-card';
      const week = document.createElement('div');
      week.className = 'source-log-week';
      week.textContent = displayText(parsed.report.week, 'Report date TBD');
      const list = document.createElement('dl');
      [
        ['Miles detected', formatLogValue('miles', parsed.miles)],
        ['Elevation detected', formatLogValue('elevation', parsed.elevation)],
        ['Stations detected', parsed.stationLabels?.length ? `${formatLogValue('stations', parsed.stations)} (${parsed.stationLabels.join(', ')})` : formatLogValue('stations', parsed.stations)],
        ['Simulations detected', formatLogValue('simulations', parsed.simulations)]
      ].forEach(([label, value]) => {
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = label;
        dd.textContent = value;
        list.append(dt, dd);
      });
      card.append(week, list);
      log.appendChild(card);
    });
  };

  const renderMissionProgress = () => {
    const meter = document.querySelector('[data-mission-progress]');
    if (!meter) return;

    const reports = readReports();
    const parsed = extractMissionProgress(reports);
    let parsedCount = 0;
    const percentages = [];

    Object.entries(progressTargets).forEach(([key, target]) => {
      const row = meter.querySelector(`[data-progress-row][data-goal="${key}"]`);
      if (!row) return;
      const parsedValue = parsed[key];
      const hasParsedValue = Number.isFinite(parsedValue) && parsedValue > 0;
      const value = hasParsedValue ? parsedValue : manualMeterValues[key];
      if (hasParsedValue) parsedCount += 1;
      const percent = Math.min(100, Math.max(0, (value / target) * 100));
      percentages.push(percent);

      const valueEl = row.querySelector('[data-progress-value]');
      const bar = row.querySelector('[data-progress-bar]');
      const track = row.querySelector('.progress-track');
      const note = row.querySelector('.meter-note');
      if (valueEl) valueEl.textContent = formatProgressValue(key, value);
      if (bar) bar.style.width = `${percent}%`;
      if (track) {
        track.setAttribute('aria-valuenow', String(Math.round(value)));
        track.setAttribute('aria-valuemax', String(target));
      }
      if (note) {
        note.dataset.originalText = note.dataset.originalText || note.textContent.replace(' · manual placeholder', '');
        note.classList.toggle('placeholder', !hasParsedValue);
        note.textContent = hasParsedValue ? note.dataset.originalText : `${note.dataset.originalText} · manual placeholder`;
      }
    });

    const total = document.querySelector('[data-meter-total]');
    if (total && percentages.length) {
      total.textContent = String(Math.round(percentages.reduce((sum, value) => sum + value, 0) / percentages.length));
    }

    const source = document.querySelector('[data-meter-source]');
    if (source) {
      source.textContent = parsedCount > 0 ? `${parsedCount}/4 lanes parsed` : 'Manual placeholders';
    }
    renderProgressSourceLog(reports);
  };

  const clearReports = document.querySelector('[data-clear-reports]');
  if (clearReports) {
    const note = document.querySelector('[data-archive-note]');
    clearReports.addEventListener('click', () => {
      try {
        localStorage.removeItem(REPORT_STORAGE_KEY);
        localStorage.removeItem(LEGACY_DRAFT_KEY);
        renderLatestReport();
        renderArchive();
        renderMissionProgress();
        if (note) note.textContent = 'Local reports cleared. One clean fallback card is showing again.';
      } catch (error) {
        if (note) note.textContent = 'Unable to clear local reports in this browser.';
      }
    });
  }

  renderLatestReport();
  renderArchive();
  renderMissionProgress();

  const OPERATOR_CURRENT_KEY = 'projectMoonshotCurrentOperator';
  const OPERATOR_PROFILE_PREFIX = 'projectMoonshotOperatorProfile:';
  const OPERATOR_LOG_PREFIX = 'projectMoonshotMissionLog:';
  const OPERATOR_INSIGHT_PREFIX = 'projectMoonshotOperatorInsights:';
  const OPERATOR_DECISION_PREFIX = 'projectMoonshotDecisions:';

  const operatorProfiles = {
    kenny: {
      id: 'kenny',
      name: 'Kenny Schrader',
      missionName: '50 Mile Ultra',
      raceDate: 'July 4, 2026',
      status: 'Active',
      currentChallenge: 'Week 5 complete. Building toward peak fatigue and race-specific durability.',
      futureMissions: 'HYROX / 70.3 / Full Ironman / Moab',
      progressPercent: 52,
      currentWeek: 5,
      totalWeeks: 9,
      currentMiles: 31,
      targetMiles: 60,
      longestRun: '18 miles',
      heroSubtitle: ' A private mission record for Kenny’s first 50-mile ultra and the bigger endurance arc beyond it.',
      trainingBlocks: [
        { week: 'Week 1', title: 'Recovery Week', miles: '~22 miles', state: 'completed' },
        { week: 'Week 2', title: 'Base Rebuild', miles: '~31 miles', state: 'completed' },
        { week: 'Week 3', title: 'Volume Step-Up', miles: '~37 miles', state: 'completed' },
        { week: 'Week 4', title: 'Big Volume Test', miles: '~51 miles', state: 'completed' },
        { week: 'Week 5', title: 'Durability Proof', miles: '~56 miles', state: 'completed' },
        { week: 'Week 6', title: 'Peak Fatigue', miles: '~60 miles planned', state: 'active' },
        { week: 'Week 7', title: 'Peak Long Run', miles: '~58–60 miles planned', state: 'upcoming' },
        { week: 'Week 8', title: 'Taper Begins', miles: '~40 miles planned', state: 'upcoming' },
        { week: 'Week 9', title: 'Race Week', miles: '50 Mile Ultra', state: 'upcoming' }
      ],
      futureArc: ['50 Mile Ultra', 'HYROX', '70.3', 'Full Ironman', 'Moab']
    },
    vudi: {
      id: 'vudi',
      name: 'Vudi Phothisuk',
      missionName: 'HYROX Build',
      raceDate: 'TBD',
      status: 'Active',
      currentChallenge: 'Build run durability while keeping station power repeatable.',
      futureMissions: 'HYROX / Endurance Base / Strength Standard',
      progressPercent: 18,
      currentWeek: 1,
      totalWeeks: 8,
      currentMiles: 34,
      targetMiles: 45,
      longestRun: 'TBD',
      heroSubtitle: ' A private operator record for converting training evidence into sharper race decisions.',
      trainingBlocks: [
        { week: 'Week 1', title: 'Baseline Capture', miles: 'Run + station evidence', state: 'active' },
        { week: 'Week 2', title: 'Run-Station Rhythm', miles: 'Planned', state: 'upcoming' },
        { week: 'Week 3', title: 'Compromised Running', miles: 'Planned', state: 'upcoming' },
        { week: 'Week 4', title: 'Benchmark Week', miles: 'Planned', state: 'upcoming' }
      ],
      futureArc: ['HYROX', 'Run Base', 'Station Power', 'Race Simulation']
    },
    ryan: {
      id: 'ryan',
      name: 'Ryan Smith',
      missionName: 'Operator Build',
      raceDate: 'TBD',
      status: 'Planning',
      currentChallenge: 'Define the first measurable mission and weekly rhythm.',
      futureMissions: 'Base / Strength / Endurance Event',
      progressPercent: 8,
      currentWeek: 0,
      totalWeeks: 6,
      currentMiles: 0,
      targetMiles: 30,
      longestRun: 'TBD',
      heroSubtitle: ' A private operator record for turning intent into visible progress and decisions.',
      trainingBlocks: [
        { week: 'Week 1', title: 'Mission Definition', miles: 'Planning', state: 'active' },
        { week: 'Week 2', title: 'Baseline Week', miles: 'Upcoming', state: 'upcoming' },
        { week: 'Week 3', title: 'First Build', miles: 'Upcoming', state: 'upcoming' }
      ],
      futureArc: ['Define Mission', 'Build Base', 'Test Standard']
    },
    new: {
      id: 'new',
      name: 'New Operator',
      missionName: 'New Mission',
      raceDate: 'TBD',
      status: 'Draft',
      currentChallenge: 'Define the mission that deserves a private record.',
      futureMissions: 'TBD',
      progressPercent: 0,
      currentWeek: 0,
      totalWeeks: 1,
      currentMiles: 0,
      targetMiles: 0,
      longestRun: 'TBD',
      heroSubtitle: ' Start a new private mission dossier with only the decisions and reflections that matter.',
      trainingBlocks: [
        { week: 'Week 1', title: 'Define Mission', miles: 'Draft', state: 'active' }
      ],
      futureArc: ['New Mission']
    }
  };

  const operatorIds = Object.keys(operatorProfiles);
  const normalizeOperator = (operatorId) => operatorIds.includes(operatorId) ? operatorId : 'kenny';
  const profileKey = (operatorId) => `${OPERATOR_PROFILE_PREFIX}${operatorId}`;
  const listKey = (prefix, operatorId) => `${prefix}${operatorId}`;
  const clampPercent = (value) => Math.max(0, Math.min(100, Number(value) || 0));
  const formatOperatorName = (name) => String(name || 'New Operator').trim();
  const safeJsonArray = (value) => {
    try {
      const parsed = JSON.parse(value || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };
  const createLocalRecordId = () => `operator-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const shortDate = (iso) => {
    const date = iso ? new Date(iso) : new Date();
    if (Number.isNaN(date.getTime())) return 'Saved locally';
    return date.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };
  const readOperatorProfile = (operatorId) => {
    const id = normalizeOperator(operatorId);
    const fallback = operatorProfiles[id];
    try {
      const saved = JSON.parse(localStorage.getItem(profileKey(id)) || '{}');
      return { ...fallback, ...saved, id, trainingBlocks: fallback.trainingBlocks, futureArc: fallback.futureArc };
    } catch (error) {
      return fallback;
    }
  };
  const writeOperatorProfile = (operatorId, profile) => {
    const id = normalizeOperator(operatorId);
    const keep = (({ missionName, raceDate, status, currentChallenge, futureMissions, progressPercent, currentWeek, totalWeeks, currentMiles, targetMiles, longestRun }) => ({ missionName, raceDate, status, currentChallenge, futureMissions, progressPercent, currentWeek, totalWeeks, currentMiles, targetMiles, longestRun }))(profile);
    localStorage.setItem(profileKey(id), JSON.stringify(keep));
  };
  const readOperatorList = (prefix, operatorId) => safeJsonArray(localStorage.getItem(listKey(prefix, operatorId)));
  const writeOperatorList = (prefix, operatorId, records) => localStorage.setItem(listKey(prefix, operatorId), JSON.stringify(records));

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };
  const fillNamedFields = (form, values) => {
    if (!form) return;
    Array.from(form.elements).forEach((field) => {
      if (!field.name) return;
      field.value = values[field.name] ?? '';
    });
  };
  const collectForm = (form) => Object.fromEntries(new FormData(form).entries());
  const clearForm = (form) => {
    if (form) form.reset();
  };

  const renderTimeline = (profile) => {
    const timeline = document.querySelector('[data-training-timeline]');
    if (!timeline) return;
    timeline.innerHTML = '';
    profile.trainingBlocks.forEach((block) => {
      const card = document.createElement('article');
      card.className = `training-block ${block.state}`;
      const indicator = block.state === 'completed' ? '✓' : block.state === 'active' ? '●' : '○';
      const status = block.state === 'completed' ? 'Completed' : block.state === 'active' ? 'Active' : 'Upcoming';
      card.innerHTML = `<div class="training-indicator">${indicator}</div><span>${escapeHtml(block.week)}</span><strong>${escapeHtml(block.title)}</strong><p>${escapeHtml(block.miles)}</p><em>${status}</em>`;
      timeline.appendChild(card);
    });
  };

  const renderFutureArc = (profile) => {
    const arc = document.querySelector('[data-future-timeline]');
    if (!arc) return;
    arc.innerHTML = '';
    profile.futureArc.forEach((mission, index) => {
      const node = document.createElement('div');
      node.className = `timeline-node ${index === 0 ? 'active' : index === profile.futureArc.length - 1 ? 'moonshot' : 'support'}`;
      node.innerHTML = `<span>${escapeHtml(mission)}</span><strong>${index === 0 ? 'Active' : index === profile.futureArc.length - 1 ? 'Long-term moonshot' : 'Future mission'}</strong>`;
      arc.appendChild(node);
    });
  };

  const renderRecordList = (selector, records, fields, emptyText) => {
    const list = document.querySelector(selector);
    if (!list) return;
    list.innerHTML = '';
    if (!records.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-record-note';
      empty.textContent = emptyText;
      list.appendChild(empty);
      return;
    }
    records.forEach((record) => {
      const card = document.createElement('article');
      card.className = 'operator-record-card';
      const body = fields.map(([label, key]) => `<div class="operator-record-field"><span>${escapeHtml(label)}</span><p>${escapeHtml(record[key] || 'TBD')}</p></div>`).join('');
      card.innerHTML = `<div class="operator-record-date">${escapeHtml(shortDate(record.savedAt))}</div>${body}`;
      list.appendChild(card);
    });
  };

  const renderOperatorDashboard = (operatorId) => {
    const id = normalizeOperator(operatorId);
    const profile = readOperatorProfile(id);
    localStorage.setItem(OPERATOR_CURRENT_KEY, id);

    const selector = document.querySelector('[data-operator-selector]');
    if (selector) selector.value = id;

    setText('[data-hero-eyebrow]', `Operator File // ${profile.status || 'Active'}`);
    setText('[data-operator-name]', formatOperatorName(profile.name).toUpperCase());
    setText('[data-hero-mission]', profile.missionName || 'New Mission');
    setText('[data-hero-subtitle]', profile.heroSubtitle || ' A private mission dashboard.');
    setText('[data-hero-current-mission]', profile.missionName || 'New Mission');
    setText('[data-hero-current-challenge]', profile.currentChallenge || 'TBD');
    setText('[data-hero-target-date]', profile.raceDate || 'TBD');
    setText('[data-hero-status]', profile.status || 'Draft');
    setText('[data-hero-future]', profile.futureMissions || 'TBD');

    const percent = clampPercent(profile.progressPercent);
    setText('[data-progress-percent]', `${percent}%`);
    setText('[data-progress-week]', `Week ${profile.currentWeek} / ${profile.totalWeeks}`);
    setText('[data-progress-miles]', `${profile.currentMiles} of ${profile.targetMiles} target miles`);
    setText('[data-progress-longest]', profile.longestRun || 'TBD');
    setText('[data-progress-race]', profile.raceDate || 'TBD');
    const bar = document.querySelector('[data-progress-bar]');
    if (bar) bar.style.width = `${percent}%`;

    fillNamedFields(document.querySelector('[data-mission-brief-form]'), profile);
    renderTimeline(profile);
    renderFutureArc(profile);
    renderRecordList('[data-mission-log-list]', readOperatorList(OPERATOR_LOG_PREFIX, id), [['Mission Entry', 'entry']], 'No mission log entries yet. Record the next meaningful signal.');
    renderRecordList('[data-insight-list]', readOperatorList(OPERATOR_INSIGHT_PREFIX, id), [['What Happened?', 'whatHappened'], ['What Happened For Me?', 'whatHappenedForMe'], ['What Did I Learn?', 'whatLearned']], 'No insights yet. Capture what the work is turning into.');
    renderRecordList('[data-decision-list]', readOperatorList(OPERATOR_DECISION_PREFIX, id), [['Decision', 'decision'], ['Reason', 'reason'], ['Result', 'result']], 'No decisions logged yet. Save the first meaningful call.');
  };

  const initializeOperatorPage = () => {
    const app = document.querySelector('[data-operator-app]');
    if (!app) return;
    let currentOperator = normalizeOperator(localStorage.getItem(OPERATOR_CURRENT_KEY) || 'kenny');

    const selector = document.querySelector('[data-operator-selector]');
    if (selector) {
      selector.value = currentOperator;
      selector.addEventListener('change', () => {
        currentOperator = normalizeOperator(selector.value);
        renderOperatorDashboard(currentOperator);
      });
    }

    const missionBriefForm = document.querySelector('[data-mission-brief-form]');
    if (missionBriefForm) {
      missionBriefForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const existing = readOperatorProfile(currentOperator);
        writeOperatorProfile(currentOperator, { ...existing, ...collectForm(missionBriefForm) });
        renderOperatorDashboard(currentOperator);
        const note = document.querySelector('[data-mission-brief-note]');
        if (note) note.textContent = 'Mission brief saved locally.';
      });
    }

    const saveRecord = (formSelector, prefix, noteSelector, message) => {
      const form = document.querySelector(formSelector);
      if (!form) return;
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = collectForm(form);
        const hasValue = Object.values(data).some((value) => String(value || '').trim());
        if (!hasValue) return;
        const records = readOperatorList(prefix, currentOperator);
        writeOperatorList(prefix, currentOperator, [{ ...data, id: createLocalRecordId(), savedAt: new Date().toISOString() }, ...records]);
        clearForm(form);
        renderOperatorDashboard(currentOperator);
        const note = document.querySelector(noteSelector);
        if (note) note.textContent = message;
      });
    };

    saveRecord('[data-mission-log-form]', OPERATOR_LOG_PREFIX, '[data-mission-log-note]', 'Mission log entry saved locally.');
    saveRecord('[data-insight-form]', OPERATOR_INSIGHT_PREFIX, '[data-insight-note]', 'Operator insight saved locally.');
    saveRecord('[data-decision-form]', OPERATOR_DECISION_PREFIX, '[data-decision-note]', 'Decision saved locally.');

    renderOperatorDashboard(currentOperator);
  };

  initializeOperatorPage();

})();
