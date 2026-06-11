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

  const OPERATOR_MISSION_KEYS = {
    kenny: 'projectMoonshotOperatorMissionKenny',
    vudi: 'projectMoonshotOperatorMissionVudi'
  };
  const OPERATOR_ENTRIES_KEY = 'projectMoonshotOperatorEntriesKenny';
  const OPERATOR_RECORDS_KEY = 'projectMoonshotOperatorRecords';
  const defaultOperatorMissions = {
    kenny: {
      missionName: '50 Mile Ultra',
      raceDate: 'July 4, 2026',
      status: 'Active',
      terrain: 'Ultra endurance / long-duration effort',
      successCriteria: 'Finish under own power',
      constraint: 'Stay patient, stay fueled, keep moving',
      biggerArc: 'HYROX → 70.3 → Full Ironman → Moab',
      whyStarted: 'I started because the 50-mile distance demands a version of me that cannot be faked.',
      proveToMyself: 'That I can stay composed when the effort outlasts motivation.',
      wantToRemember: 'The decisions, evidence, and moments that show who I became before and after the race.',
      afraidOf: 'Going out too fast, underfueling, letting pain become panic, or quitting on a solvable problem.',
      finishingMeaning: 'Proof that patience, preparation, discomfort, and belief can hold for the full mission.',
      why: 'This is not just about finishing fifty miles. The mission is to find out what happens when preparation, patience, discomfort, and belief all have to hold for longer than motivation can last.',
      targetOutcome: 'Finish controlled, solve problems without panic, and leave with a clear post-race debrief.',
      currentRisk: 'Heat, fueling discipline, feet, pacing pride, and recovery debt.',
      nextCheck: 'Confirm long-run durability, nutrition tolerance, and recovery signal after the next key weekend.',
      longRunBuild: 'Placeholder: build the long run patiently, then prove time-on-feet confidence without racing training days.',
      weeklyMileage: 'Placeholder: keep weekly volume honest, sustainable, and backed by recovery evidence.',
      elevationTerrain: 'Placeholder: expose legs and feet to terrain stress without turning every run into a test.',
      fuelingPractice: 'Placeholder: rehearse calories, fluids, salt, and stomach tolerance before race day.',
      recoveryDiscipline: 'Placeholder: protect sleep, mobility, easy days, and the humility to absorb the work.',
      mentalCheckpoints: 'Placeholder: pre-plan the thoughts, commands, and reset cues for when the mission gets quiet and hard.',
      preparationPlan: 'Long-run build, weekly mileage, terrain exposure, fueling practice, recovery discipline, and mental checkpoints stay editable as the mission evolves.',
      checkpoint01Date: 'TBD',
      checkpoint01Evidence: 'Baseline fitness, current long run, current weekly rhythm, known risks.',
      checkpoint01Lesson: 'Record the starting point without ego.',
      checkpoint01NextOrder: 'Set the next controlled build week.',
      checkpoint02Date: 'TBD',
      checkpoint02Evidence: 'Longest durable run and how the body responded afterward.',
      checkpoint02Lesson: 'Confidence comes from repeatable control, not one heroic day.',
      checkpoint02NextOrder: 'Extend only what can be recovered from.',
      checkpoint03Date: 'TBD',
      checkpoint03Evidence: 'Fueling test notes: calories, fluids, salt, gut response, energy swings.',
      checkpoint03Lesson: 'Nutrition is part of the mission, not an accessory.',
      checkpoint03NextOrder: 'Lock the simplest fueling plan that works under fatigue.',
      checkpoint04Date: 'TBD',
      checkpoint04Evidence: 'Final taper signal: legs, sleep, gear, route, heat, confidence.',
      checkpoint04Lesson: 'Arrive sharp, not anxious.',
      checkpoint04NextOrder: 'Reduce noise and protect the start line.',
      checkpoint05Date: 'Post-race',
      checkpoint05Evidence: 'Race result, key moments, problems solved, screenshots, and post-race notes.',
      checkpoint05Lesson: 'Convert the finish into the next version of the operator.',
      checkpoint05NextOrder: 'Debrief honestly before choosing the next mission.',
      checkpoints: 'Baseline; Long Run Confidence; Fueling Test; Final Taper; Race Reflection.',
      keyRuns: 'Placeholder: list the runs that changed confidence, exposed risk, or proved readiness.',
      longestRun: 'Placeholder: longest run and what it revealed.',
      weeklyVolume: 'Placeholder: weekly mileage / time-on-feet trend that matters.',
      terrainNotes: 'Placeholder: heat, surface, climb, descent, technical footing, and foot-care signals.',
      recoveryNotes: 'Placeholder: sleep, soreness, mood, HR/RPE, mobility, and recovery debt.',
      linksScreenshots: 'Placeholder: Strava links, screenshots, route files, photos, or receipts of the work.',
      redFlags: 'Placeholder: anything that could compromise the mission if ignored.',
      evidenceNotes: 'This does not replace Strava. This summarizes what mattered: key runs, volume, terrain, recovery, links, screenshots, and red flags.',
      lessonBody: 'Placeholder: what the body is teaching me.',
      lessonMind: 'Placeholder: what my mind does when the effort gets long.',
      lessonPacing: 'Placeholder: how patience shows up in pace and effort.',
      lessonFueling: 'Placeholder: what works, what fails, and what must be simpler.',
      lessonFear: 'Placeholder: what fear is pointing at and how I respond.',
      lessonConfidence: 'Placeholder: the evidence that I can trust when doubt gets loud.',
      lessonsLearned: 'Lessons stay organized across body, mind, pacing, fueling, fear, and confidence.'
    },
    vudi: {
      missionName: 'ULTRA 1',
      subtitle: '30 Mile Mountain Run',
      status: 'In Progress',
      route: '5x Cove Run Loop + Emerging Extension',
      elevation: '4,000+ ft gain',
      why: 'Complete a self-supported 30-mile mountain effort.',
      targetOutcome: 'Finish under own power. No pace requirement. No time requirement.',
      currentRisk: 'Route management, mountain footing, fueling discipline, and keeping the effort self-supported.',
      nextCheck: 'Confirm Cove Run Loop repetition count, Emerging Extension access, and water/fuel carry plan before the next long effort.',
      preparationPlan: 'Validate loops, water carries, mountain footing, fueling, and self-supported decision points before extending the effort.',
      checkpoints: 'Route confirmation; water and fuel carry check; loop-repeat confidence; mountain footing signal; finish-under-own-power review.',
      evidenceNotes: 'Keep notes on route conditions, elevation, fueling, fatigue, and proof that the mission is becoming more controllable.',
      lessonsLearned: 'The mountain effort is won by patience, route clarity, and the refusal to turn discomfort into confusion.'
    }
  };
  const safeParseOperatorEntries = (value) => {
    try {
      const parsed = JSON.parse(value || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const normalizeOperatorId = (operatorId) => OPERATOR_MISSION_KEYS[operatorId] ? operatorId : 'kenny';

  const readOperatorMission = (operatorId = 'kenny') => {
    const normalizedOperatorId = normalizeOperatorId(operatorId);
    const defaultMission = defaultOperatorMissions[normalizedOperatorId];
    try {
      const parsed = JSON.parse(localStorage.getItem(OPERATOR_MISSION_KEYS[normalizedOperatorId]) || '{}');
      return { ...defaultMission, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
    } catch (error) {
      return { ...defaultMission };
    }
  };

  const safeParseOperatorRecords = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(OPERATOR_RECORDS_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  };

  const writeOperatorMission = (operatorId = 'kenny', mission) => {
    const normalizedOperatorId = normalizeOperatorId(operatorId);
    const nextMission = { ...defaultOperatorMissions[normalizedOperatorId], ...mission };
    localStorage.setItem(OPERATOR_MISSION_KEYS[normalizedOperatorId], JSON.stringify(nextMission));
    const records = safeParseOperatorRecords();
    records[normalizedOperatorId] = {
      operatorId: normalizedOperatorId,
      profile: normalizedOperatorId === 'vudi' ? 'Vudi' : 'Kenny Schrader',
      mission: nextMission,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(OPERATOR_RECORDS_KEY, JSON.stringify(records));
  };

  const normalizeOperatorEntry = (entry = {}) => ({
    id: entry.id || `operator-entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: entry.savedAt || new Date().toISOString(),
    weekDate: String(entry.weekDate || '').trim(),
    mileage: String(entry.mileage || '').trim(),
    longRun: String(entry.longRun || '').trim(),
    elevation: String(entry.elevation || '').trim(),
    keyWorkout: String(entry.keyWorkout || '').trim(),
    recoverySignal: String(entry.recoverySignal || '').trim(),
    lessonLearned: String(entry.lessonLearned || '').trim(),
    notes: String(entry.notes || '').trim()
  });

  const readOperatorEntries = () => safeParseOperatorEntries(localStorage.getItem(OPERATOR_ENTRIES_KEY))
    .filter((entry) => entry && typeof entry === 'object')
    .map(normalizeOperatorEntry)
    .sort((a, b) => String(b.savedAt || '').localeCompare(String(a.savedAt || '')));

  const writeOperatorEntries = (entries) => {
    const normalizedEntries = entries.map(normalizeOperatorEntry);
    localStorage.setItem(OPERATOR_ENTRIES_KEY, JSON.stringify(normalizedEntries));
    const records = safeParseOperatorRecords();
    records.kenny = {
      operatorId: 'kenny',
      profile: 'Kenny Schrader',
      mission: readOperatorMission('kenny'),
      evidenceEntries: normalizedEntries,
      updatedAt: new Date().toISOString()
    };
    records.vudi = records.vudi || {
      operatorId: 'vudi',
      profile: 'Vudi',
      mission: readOperatorMission('vudi'),
      evidenceEntries: [],
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(OPERATOR_RECORDS_KEY, JSON.stringify(records));
  };

  const parseOperatorNumber = (value) => {
    const match = String(value || '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : 0;
  };

  const formatOperatorNumber = (value) => {
    if (!Number.isFinite(value)) return '0';
    return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
  };

  const fillOperatorMissionForm = (form, mission) => {
    Object.entries(mission).forEach(([key, value]) => {
      if (form.elements[key]) form.elements[key].value = value;
    });
  };

  const fillOperatorEntryForm = (form, entry) => {
    ['entryId', 'weekDate', 'mileage', 'longRun', 'elevation', 'keyWorkout', 'recoverySignal', 'lessonLearned', 'notes'].forEach((key) => {
      if (!form.elements[key]) return;
      const sourceKey = key === 'entryId' ? 'id' : key;
      form.elements[key].value = entry ? entry[sourceKey] || '' : '';
    });
    const button = document.querySelector('[data-operator-save-entry]');
    if (button) button.textContent = entry ? 'Update Entry' : 'Save Entry';
  };

  const renderOperatorSummary = () => {
    const summary = document.querySelector('[data-operator-summary]');
    if (!summary) return;
    const mission = readOperatorMission('kenny');
    const entries = readOperatorEntries();
    const totalMiles = entries.reduce((sum, entry) => sum + parseOperatorNumber(entry.mileage), 0);
    const peak = entries.reduce((best, entry) => parseOperatorNumber(entry.mileage) > parseOperatorNumber(best.mileage) ? entry : best, { mileage: 0, weekDate: '' });
    const longest = entries.reduce((best, entry) => Math.max(best, parseOperatorNumber(entry.longRun)), 0);
    const recentLesson = entries.find((entry) => entry.lessonLearned)?.lessonLearned || 'No lessons logged yet.';

    const setText = (selector, value) => {
      const element = summary.querySelector(selector);
      if (element) element.textContent = value;
    };
    setText('[data-summary-total-miles]', formatOperatorNumber(totalMiles));
    setText('[data-summary-peak-week]', peak.weekDate ? `${peak.weekDate} — ${formatOperatorNumber(parseOperatorNumber(peak.mileage))} mi` : 'None logged');
    setText('[data-summary-longest-run]', `${formatOperatorNumber(longest)} mi`);
    setText('[data-summary-recent-lesson]', recentLesson);
    setText('[data-summary-current-status]', mission.status || 'Active');
  };

  const renderOperatorEntries = () => {
    const list = document.querySelector('[data-operator-entry-list]');
    if (!list) return;
    const entries = readOperatorEntries();
    list.innerHTML = '';
    if (!entries.length) {
      const empty = document.createElement('div');
      empty.className = 'archive-card operator-entry-card';
      empty.textContent = 'No operator evidence logged yet. Save the first entry to begin the dossier.';
      list.appendChild(empty);
      renderOperatorSummary();
      return;
    }

    entries.forEach((entry) => {
      const card = document.createElement('article');
      card.className = 'archive-card operator-entry-card';
      const header = document.createElement('div');
      header.className = 'archive-card-header';
      const titleBlock = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = entry.weekDate || 'Untitled evidence entry';
      const saved = document.createElement('p');
      saved.className = 'light-note';
      saved.textContent = entry.savedAt ? `Saved ${new Date(entry.savedAt).toLocaleString()}` : 'Saved locally';
      titleBlock.append(title, saved);
      const status = document.createElement('span');
      status.className = 'report-status';
      status.textContent = `${displayText(entry.mileage, '0')} mi`;
      header.append(titleBlock, status);

      const body = document.createElement('div');
      body.className = 'archive-card-body';
      [
        ['Long run', entry.longRun],
        ['Elevation', entry.elevation],
        ['Key workout', entry.keyWorkout],
        ['Recovery signal', entry.recoverySignal],
        ['Lesson learned', entry.lessonLearned],
        ['Notes', entry.notes]
      ].forEach(([label, value]) => {
        const field = document.createElement('div');
        field.className = 'operator-entry-field';
        const fieldLabel = document.createElement('span');
        const fieldValue = document.createElement('p');
        fieldLabel.textContent = label;
        fieldValue.textContent = displayText(value);
        field.append(fieldLabel, fieldValue);
        body.appendChild(field);
      });

      const actions = document.createElement('div');
      actions.className = 'archive-card-actions';
      const edit = document.createElement('button');
      edit.className = 'button secondary';
      edit.type = 'button';
      edit.textContent = 'Edit Entry';
      edit.addEventListener('click', () => {
        const form = document.querySelector('[data-operator-entry-form]');
        if (form) {
          fillOperatorEntryForm(form, entry);
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      const remove = document.createElement('button');
      remove.className = 'button danger';
      remove.type = 'button';
      remove.textContent = 'Delete Entry';
      remove.addEventListener('click', () => {
        writeOperatorEntries(readOperatorEntries().filter((item) => item.id !== entry.id));
        renderOperatorEntries();
        renderOperatorJournalRecords();
      });
      actions.append(edit, remove);
      card.append(header, body, actions);
      list.appendChild(card);
    });
    renderOperatorSummary();
  };

  const operatorDisplayName = (operatorId) => operatorId === 'vudi' ? 'Vudi' : 'Kenny Schrader';

  const latestOperatorLesson = (operatorId, entries) => {
    if (operatorId !== 'kenny') return '';
    return entries.find((entry) => entry.lessonLearned)?.lessonLearned || '';
  };

  const checkpointRows = (mission) => [
    ['Checkpoint 01: Baseline', mission.checkpoint01Date, mission.checkpoint01Evidence, mission.checkpoint01Lesson, mission.checkpoint01NextOrder],
    ['Checkpoint 02: Long Run Confidence', mission.checkpoint02Date, mission.checkpoint02Evidence, mission.checkpoint02Lesson, mission.checkpoint02NextOrder],
    ['Checkpoint 03: Fueling Test', mission.checkpoint03Date, mission.checkpoint03Evidence, mission.checkpoint03Lesson, mission.checkpoint03NextOrder],
    ['Checkpoint 04: Final Taper', mission.checkpoint04Date, mission.checkpoint04Evidence, mission.checkpoint04Lesson, mission.checkpoint04NextOrder],
    ['Checkpoint 05: Race Reflection', mission.checkpoint05Date, mission.checkpoint05Evidence, mission.checkpoint05Lesson, mission.checkpoint05NextOrder]
  ];

  const checkpointSummary = (mission) => checkpointRows(mission)
    .map(([title, date, evidence, lesson, nextOrder]) => `${title}\nDate: ${displayText(date)}\nEvidence: ${displayText(evidence)}\nLesson: ${displayText(lesson)}\nNext Order: ${displayText(nextOrder)}`)
    .join('\n\n');

  const operatorJournalFields = (operatorId, mission, entries = []) => {
    if (operatorId !== 'kenny') {
      const currentMission = [mission.missionName, mission.subtitle, mission.raceDate, mission.route, mission.elevation]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .join(' // ');
      const lessons = [mission.lessonsLearned, latestOperatorLesson(operatorId, entries)]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .join('\n\n');
      const evidence = [mission.evidenceNotes, ...entries.slice(0, 3).map((entry) => [entry.weekDate, entry.keyWorkout, entry.notes].filter(Boolean).join(' — '))]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .join('\n\n');
      return [
        ['Why This Mission', mission.why],
        ['Current Mission', currentMission || mission.targetOutcome],
        ['Preparation Plan', mission.preparationPlan],
        ['Checkpoints', mission.checkpoints || mission.nextCheck],
        ['Evidence Notes', evidence],
        ['Lessons Learned', lessons]
      ];
    }

    return [
      ['Hero Info', `Operator: Kenny Schrader\nMission: ${displayText(mission.missionName)}\nTarget Date: ${displayText(mission.raceDate)}\nStatus: ${displayText(mission.status)}\nFuture Missions: ${displayText(mission.biggerArc)}`],
      ['Why This Mission', mission.why],
      ['Why I Started', mission.whyStarted],
      ['What I’m Trying To Prove To Myself', mission.proveToMyself],
      ['What I Want To Remember', mission.wantToRemember],
      ['What I’m Afraid Of', mission.afraidOf],
      ['What Finishing Would Mean', mission.finishingMeaning],
      ['Mission Brief', `Challenge: ${displayText(mission.missionName)}\nDate: ${displayText(mission.raceDate)}\nTerrain: ${displayText(mission.terrain)}\nSuccess Criteria: ${displayText(mission.successCriteria)}\nConstraint: ${displayText(mission.constraint)}\nBigger Arc: ${displayText(mission.biggerArc)}`],
      ['Preparation Plan', `Long Run Build: ${displayText(mission.longRunBuild)}\n\nWeekly Mileage: ${displayText(mission.weeklyMileage)}\n\nElevation / Terrain: ${displayText(mission.elevationTerrain)}\n\nFueling Practice: ${displayText(mission.fuelingPractice)}\n\nRecovery Discipline: ${displayText(mission.recoveryDiscipline)}\n\nMental Checkpoints: ${displayText(mission.mentalCheckpoints)}`],
      ['Checkpoints', checkpointSummary(mission)],
      ['Evidence Log', `Key runs: ${displayText(mission.keyRuns)}\n\nLongest run: ${displayText(mission.longestRun)}\n\nWeekly volume: ${displayText(mission.weeklyVolume)}\n\nTerrain notes: ${displayText(mission.terrainNotes)}\n\nRecovery notes: ${displayText(mission.recoveryNotes)}\n\nLinks / screenshots: ${displayText(mission.linksScreenshots)}\n\nRed flags: ${displayText(mission.redFlags)}`],
      ['Lessons Learned', `Body: ${displayText(mission.lessonBody)}\n\nMind: ${displayText(mission.lessonMind)}\n\nPacing: ${displayText(mission.lessonPacing)}\n\nFueling: ${displayText(mission.lessonFueling)}\n\nFear: ${displayText(mission.lessonFear)}\n\nConfidence: ${displayText(mission.lessonConfidence)}`]
    ];
  };

  const exportOperatorRecord = (operatorId) => {
    const mission = readOperatorMission(operatorId);
    const entries = operatorId === 'kenny' ? readOperatorEntries() : [];
    const fields = operatorJournalFields(operatorId, mission, entries);
    const fieldHtml = fields.map(([label, value]) => `<div class="field${['Hero Info', 'Why This Mission', 'Mission Brief', 'Preparation Plan', 'Checkpoints', 'Evidence Log', 'Evidence Notes', 'Lessons Learned'].includes(label) ? ' wide' : ''}"><div class="label">${escapeHtml(label)}</div><div class="value">${escapeHtml(value)}</div></div>`).join('');
    const evidenceSummary = entries.length
      ? `${entries.length} evidence entr${entries.length === 1 ? 'y' : 'ies'} stored locally. Latest: ${entries[0].weekDate || 'date TBD'}.`
      : 'No separate evidence entries stored for this operator yet.';
    openPrintableRecord(
      `Project Moonshot Operator Record - ${operatorDisplayName(operatorId)}`,
      'operator-record-print',
      `<main class="record">
        <header class="record-top"><div><div class="eyebrow">Project Moonshot // Operator Journal Record</div><h1>${escapeHtml(operatorDisplayName(operatorId))}</h1></div><div class="mission-seal">Mission: ${escapeHtml(mission.missionName)}<br>Status: ${escapeHtml(mission.status || 'Active')}<br>Generated ${escapeHtml(printDate())}</div></header>
        <section class="record-body">
          <div class="grid">${fieldHtml}</div>
          <div class="mission-seal">Current Status: ${escapeHtml(mission.status || 'Active')} // ${escapeHtml(evidenceSummary)}</div>
        </section>
      </main>`
    );
  };

  const renderOperatorJournalRecords = () => {
    const grid = document.querySelector('[data-operator-journal-records]');
    if (!grid) return;
    const entries = readOperatorEntries();
    grid.innerHTML = '';
    ['kenny', 'vudi'].forEach((operatorId) => {
      const mission = readOperatorMission(operatorId);
      const card = document.createElement('article');
      card.className = 'operator-journal-card archive-card';
      const header = document.createElement('div');
      header.className = 'archive-card-header';
      const titleBlock = document.createElement('div');
      const eyebrow = document.createElement('div');
      eyebrow.className = 'eyebrow';
      eyebrow.textContent = 'Journal Record // Local';
      const title = document.createElement('h3');
      title.textContent = operatorDisplayName(operatorId);
      titleBlock.append(eyebrow, title);
      const exportButton = document.createElement('button');
      exportButton.className = 'button export-button';
      exportButton.type = 'button';
      exportButton.textContent = operatorId === 'kenny' ? 'Export Kenny Record' : 'Export Operator Record';
      exportButton.addEventListener('click', () => exportOperatorRecord(operatorId));
      header.append(titleBlock, exportButton);

      const body = document.createElement('div');
      body.className = 'archive-card-body operator-journal-body';
      operatorJournalFields(operatorId, mission, operatorId === 'kenny' ? entries : []).forEach(([label, value]) => {
        const field = document.createElement('div');
        field.className = `operator-entry-field${label === 'Evidence Notes' || label === 'Lessons Learned' ? ' wide' : ''}`;
        const fieldLabel = document.createElement('span');
        const fieldValue = document.createElement('p');
        fieldLabel.textContent = label;
        fieldValue.textContent = displayText(value);
        field.append(fieldLabel, fieldValue);
        body.appendChild(field);
      });
      card.append(header, body);
      grid.appendChild(card);
    });
  };

  const initializeOperatorPage = () => {
    const missionForms = document.querySelectorAll('[data-operator-mission-form]');
    const entryForm = document.querySelector('[data-operator-entry-form]');
    if (!missionForms.length && !entryForm) return;

    missionForms.forEach((missionForm) => {
      const operatorId = normalizeOperatorId(missionForm.dataset.operatorId);
      fillOperatorMissionForm(missionForm, readOperatorMission(operatorId));
      missionForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const mission = Object.fromEntries(new FormData(missionForm).entries());
        writeOperatorMission(operatorId, mission);
        renderOperatorSummary();
        renderOperatorJournalRecords();
        const note = missionForm.querySelector('[data-operator-mission-note]');
        if (note) note.textContent = `${operatorId === 'vudi' ? 'Vudi' : 'Kenny'} mission card saved locally.`;
      });
    });

    if (entryForm) {
      entryForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(entryForm).entries());
        const entries = readOperatorEntries();
        const existingId = data.entryId;
        const savedEntry = normalizeOperatorEntry({ ...data, id: existingId || undefined, savedAt: new Date().toISOString() });
        const nextEntries = existingId
          ? entries.map((entry) => entry.id === existingId ? savedEntry : entry)
          : [savedEntry, ...entries];
        writeOperatorEntries(nextEntries);
        fillOperatorEntryForm(entryForm, null);
        renderOperatorEntries();
        renderOperatorJournalRecords();
        const note = document.querySelector('[data-operator-entry-note]');
        if (note) note.textContent = existingId ? 'Entry updated locally.' : 'Entry saved locally.';
      });
    }

    const resetEntry = document.querySelector('[data-operator-reset-entry]');
    if (resetEntry && entryForm) {
      resetEntry.addEventListener('click', () => fillOperatorEntryForm(entryForm, null));
    }

    document.querySelectorAll('[data-operator-export]').forEach((exportButton) => {
      exportButton.addEventListener('click', () => {
        const operatorId = normalizeOperatorId(exportButton.dataset.operatorExport);
        const missionForm = exportButton.closest('[data-operator-mission-form]');
        if (missionForm) {
          writeOperatorMission(operatorId, Object.fromEntries(new FormData(missionForm).entries()));
          const note = missionForm.querySelector('[data-operator-mission-note]');
          if (note) note.textContent = 'Kenny record saved locally and opened for export.';
        }
        exportOperatorRecord(operatorId);
      });
    });

    const clear = document.querySelector('[data-operator-clear]');
    if (clear) {
      clear.addEventListener('click', () => {
        Object.values(OPERATOR_MISSION_KEYS).forEach((key) => localStorage.removeItem(key));
        localStorage.removeItem(OPERATOR_ENTRIES_KEY);
        localStorage.removeItem(OPERATOR_RECORDS_KEY);
        missionForms.forEach((missionForm) => {
          const operatorId = normalizeOperatorId(missionForm.dataset.operatorId);
          fillOperatorMissionForm(missionForm, readOperatorMission(operatorId));
        });
        if (entryForm) fillOperatorEntryForm(entryForm, null);
        renderOperatorEntries();
        renderOperatorJournalRecords();
        const note = document.querySelector('[data-operator-entry-note]');
        if (note) note.textContent = 'Local operator data cleared. Defaults restored.';
      });
    }

    renderOperatorEntries();
    renderOperatorJournalRecords();
  };

  initializeOperatorPage();

})();
