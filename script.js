(function(){
  const raceDate = new Date('2026-09-03T08:00:00-04:00');
  const countdown = document.querySelector('[data-countdown]');
  const REPORT_STORAGE_KEY = 'moonshotWeeklyReports';
  const LEGACY_DRAFT_KEY = 'moonshotReportDrafts';
  const DEFAULT_SUMMARY = 'This week built running accumulation, maintained strength, and identified station efficiency as the next limiter.';

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

  const renderCountdownQuotes = () => {
    const quoteList = document.querySelector('[data-countdown-quotes]');
    if (!quoteList) return;

    quoteList.innerHTML = '';
    dailyQuotes.forEach((quote) => {
      const item = document.createElement('li');
      item.textContent = quote;
      quoteList.appendChild(item);
    });
  };

  renderCountdownQuotes();

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

  const normalizeReport = (report = {}) => {
    const { teamScoreboard, whatGotDone, ...currentReport } = report;
    return {
      ...currentReport,
      completedWork: String(currentReport.completedWork || '').trim() || legacyCompletedWork({ teamScoreboard, whatGotDone })
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
      status: 'Logged',
      headline: 'Baseline established',
      completedWork: 'Mileage/elevation: Vudi logged 33.9 mi and 5,047 ft climbed across the week. Long run: sunset hill run. Strength work: bench 225 x 11 / 10 / 10; later 225 x 6 x 6. Squat 225 x 5 x 5. Pull-ups completed. Station work: sled work, SkiErg exposure, first rowing lesson, early row/ski benchmarks. Recovery notes and Ryan updates TBD.',
      decisionCheckpoint: 'Keep the 30+ mile hill week while adding HYROX station practice. Prioritize running accumulation because HYROX rewards athletes who keep running after stations.',
      nextOrders: 'Increase station benchmarks. Protect sleep and strength. Stop random junk volume. Next target: cleaner run-station-run session and Ryan weekly mileage check-in.',
      generatedSummary: DEFAULT_SUMMARY
    }
  ];

  const normalizeStatus = (status) => status || 'Draft';
  const isPendingStatus = (status) => /pending|draft|needs|red flag/i.test(status);
  const displayText = (value, fallback = 'TBD') => String(value || '').trim() || fallback;

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

  const addReportRow = (tableBody, category, entry, signal) => {
    const row = document.createElement('tr');
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
    addReportRow(latestReport, 'Status + Headline', `${normalizeStatus(report.status)} - ${displayText(report.headline, 'No headline entered.')}`, 'Fast archive context.');
    addReportRow(latestReport, 'Completed Work', report.completedWork, 'Facts and evidence block.');
    addReportRow(latestReport, 'Decision Checkpoint', report.decisionCheckpoint, 'Judgment layer.');
    addReportRow(latestReport, 'Next Orders', report.nextOrders, 'Action loop.');
    addReportRow(latestReport, 'Generated Summary', report.generatedSummary || generateReportSummary(report), 'One-line command readout.');
  };

  const renderArchive = () => {
    const archive = document.querySelector('[data-report-archive]');
    if (!archive) return;

    const reports = readReports();
    const rows = reports.length ? reports : fallbackReports;
    archive.innerHTML = '';

    rows.forEach((report) => {
      const row = document.createElement('tr');
      const week = document.createElement('td');
      const statusHeadline = document.createElement('td');
      const status = document.createElement('span');
      const headline = document.createElement('div');
      const completed = document.createElement('td');
      const decision = document.createElement('td');
      const orders = document.createElement('td');
      const statusText = normalizeStatus(report.status);
      const summaryText = displayText(report.generatedSummary, '');

      appendTextWithBreaks(week, report.week);
      status.className = `report-status${isPendingStatus(statusText) ? ' pending' : ''}`;
      status.textContent = statusText;
      statusHeadline.appendChild(status);
      headline.textContent = displayText(report.headline, 'No headline entered.');
      statusHeadline.appendChild(headline);
      appendTextWithBreaks(completed, report.completedWork);
      if (summaryText) {
        const summary = document.createElement('div');
        summary.className = 'generated-summary archive-summary';
        summary.innerHTML = '<span>Generated Summary</span>';
        summary.appendChild(document.createTextNode(summaryText));
        statusHeadline.appendChild(summary);
      }
      decision.textContent = displayText(report.decisionCheckpoint);
      orders.textContent = displayText(report.nextOrders);

      row.append(week, statusHeadline, completed, decision, orders);
      archive.appendChild(row);
    });
  };

  const form = document.querySelector('[data-report-form]');
  if (form) {
    const note = document.querySelector('[data-form-note]');
    const summaryPreview = document.querySelector('[data-summary-preview]');
    const updateSummaryPreview = () => {
      const payload = normalizeReport(Object.fromEntries(new FormData(form).entries()));
      if (summaryPreview) summaryPreview.textContent = generateReportSummary(payload);
    };
    form.addEventListener('input', updateSummaryPreview);
    form.addEventListener('change', updateSummaryPreview);
    updateSummaryPreview();
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const payload = normalizeReport(Object.fromEntries(new FormData(form).entries()));
      const report = { ...payload, generatedSummary: generateReportSummary(payload), savedAt: new Date().toISOString() };
      try {
        const reports = safeParseReports(localStorage.getItem(REPORT_STORAGE_KEY))
          .filter((savedReport) => savedReport && typeof savedReport === 'object')
          .map(normalizeReport);
        reports.unshift(report);
        localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(dedupeReports(reports).slice(0, 24)));
        if (note) note.textContent = 'Saved locally. Open the report archive to see this browser-only entry.';
      } catch (error) {
        if (note) note.textContent = 'Local save unavailable in this browser. No backend was contacted.';
      }
    });
  }


  const manualMeterValues = {
    miles: 33.9,
    elevation: 5047,
    stations: 4,
    simulations: 1
  };

  const progressTargets = {
    miles: 500,
    elevation: 100000,
    stations: 80,
    simulations: 8
  };

  const textNumber = (value) => Number(String(value).replace(/,/g, ''));

  const sumMatches = (text, pattern, unitMultiplier = 1) => {
    let total = 0;
    let matched = false;
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      const value = textNumber(match[1]);
      if (Number.isFinite(value)) {
        total += value * unitMultiplier;
        matched = true;
      }
    }
    return matched ? total : null;
  };

  const reportSearchText = (report) => [
    report.week,
    report.status,
    report.headline,
    report.completedWork,
    report.decisionCheckpoint,
    report.nextOrders,
    report.generatedSummary
  ].map((value) => String(value || '')).join(' ');

  const extractMissionProgress = (reports) => {
    const text = reports.map(reportSearchText).join(' ').replace(/\s+/g, ' ');
    if (!text.trim()) return {};

    const miles = sumMatches(text, /(?:mileage|miles?|mi)\s*(?:\/\s*elevation)?\s*[:=\-]?\s*(\d+(?:,\d{3})*(?:\.\d+)?)(?=\s*(?:team\s*)?(?:miles?|mi\b))/gi)
      ?? sumMatches(text, /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:team\s*)?(?:miles?|mi\b)/gi);
    const elevation = sumMatches(text, /(?:elevation|vert(?:ical)?|climb(?:ed|ing)?)\s*[:=\-]?\s*(\d+(?:,\d{3})*(?:\.\d+)?)(?=\s*(?:ft|feet|feet\s+climbed))/gi)
      ?? sumMatches(text, /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:ft|feet)\s*(?:climbed|elevation|vert(?:ical)?)?/gi);
    const stations = sumMatches(text, /(?:hyrox\s*)?(?:station|stations|station-specific)\s*(?:sessions?|workouts?|work)?\s*[:=\-]?\s*(\d+(?:,\d{3})*(?:\.\d+)?)/gi)
      ?? sumMatches(text, /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:hyrox\s*)?(?:station|stations|station-specific)\s*(?:sessions?|workouts?)/gi);
    const simulations = sumMatches(text, /(?:full|partial|race-flow|hyrox)?\s*(?:simulations?|sims?|rehearsals?)\s*[:=\-]?\s*(\d+(?:,\d{3})*(?:\.\d+)?)/gi)
      ?? sumMatches(text, /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:full|partial|race-flow|hyrox)?\s*(?:simulations?|sims?|rehearsals?)/gi);

    return { miles, elevation, stations, simulations };
  };

  const formatProgressValue = (key, value) => {
    const rounded = key === 'miles' ? Math.round(value * 10) / 10 : Math.round(value);
    const formatted = rounded.toLocaleString(undefined, { maximumFractionDigits: key === 'miles' ? 1 : 0 });
    const target = progressTargets[key].toLocaleString();
    if (key === 'miles') return `${formatted} / ${target} mi`;
    if (key === 'elevation') return `${formatted} / ${target} ft`;
    return `${formatted} / ${target}`;
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
      if (track) track.setAttribute('aria-valuenow', String(Math.round(value)));
      if (note) {
        note.classList.toggle('placeholder', !hasParsedValue);
        note.textContent = hasParsedValue ? note.dataset.originalText || note.textContent : `${note.dataset.originalText || note.textContent} · manual placeholder`;
        note.dataset.originalText = note.dataset.originalText || note.textContent.replace(' · manual placeholder', '');
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
        if (note) note.textContent = 'Local reports cleared. One clean fallback row is showing again.';
      } catch (error) {
        if (note) note.textContent = 'Unable to clear local reports in this browser.';
      }
    });
  }

  renderLatestReport();
  renderArchive();
  renderMissionProgress();
})();
