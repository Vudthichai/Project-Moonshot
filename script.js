(function(){
  const raceDate = new Date('2026-09-03T08:00:00-04:00');
  const countdown = document.querySelector('[data-countdown]');
  const REPORT_STORAGE_KEY = 'moonshotWeeklyReports';
  const LEGACY_DRAFT_KEY = 'moonshotReportDrafts';
  const DEFAULT_SUMMARY = 'This week built running accumulation, maintained strength, and identified station efficiency as the next limiter.';

  if (countdown) {
    const fields = {
      days: countdown.querySelector('[data-days]'),
      hours: countdown.querySelector('[data-hours]'),
      minutes: countdown.querySelector('[data-minutes]'),
      seconds: countdown.querySelector('[data-seconds]')
    };
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

  const readReports = () => {
    const savedReports = safeParseReports(localStorage.getItem(REPORT_STORAGE_KEY));
    return savedReports
      .filter((report) => report && typeof report === 'object')
      .sort((a, b) => String(b.savedAt || '').localeCompare(String(a.savedAt || '')));
  };

  const fallbackReports = [
    {
      week: 'Week 1',
      status: 'Logged',
      headline: 'Baseline established',
      decisionCheckpoint: 'Keep 30+ mile hill week with HYROX station practice',
      nextOrders: 'Increase station benchmarks.'
    }
  ];

  const normalizeStatus = (status) => status || 'Draft';
  const isPendingStatus = (status) => /pending|draft|needs|red flag/i.test(status);
  const displayText = (value, fallback = 'TBD') => String(value || '').trim() || fallback;

  const includesAny = (text, terms) => terms.some((term) => text.includes(term));

  const generateReportSummary = (data) => {
    const summarySource = ['week', 'headline', 'teamScoreboard', 'whatGotDone', 'decisionCheckpoint', 'nextOrders']
      .map((key) => data?.[key] || '')
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

  const renderArchive = () => {
    const archive = document.querySelector('[data-report-archive]');
    if (!archive) return;

    const reports = readReports();
    const rows = reports.length ? reports : fallbackReports;
    archive.innerHTML = '';

    rows.forEach((report) => {
      const row = document.createElement('tr');
      const week = document.createElement('td');
      const statusCell = document.createElement('td');
      const status = document.createElement('span');
      const headline = document.createElement('td');
      const decision = document.createElement('td');
      const orders = document.createElement('td');
      const statusText = normalizeStatus(report.status);
      const summaryText = displayText(report.generatedSummary, '');

      appendTextWithBreaks(week, report.week);
      status.className = `report-status${isPendingStatus(statusText) ? ' pending' : ''}`;
      status.textContent = statusText;
      statusCell.appendChild(status);
      headline.textContent = displayText(report.headline, 'No headline entered.');
      if (summaryText) {
        const summary = document.createElement('div');
        summary.className = 'generated-summary archive-summary';
        summary.innerHTML = '<span>Generated Summary</span>';
        summary.appendChild(document.createTextNode(summaryText));
        headline.appendChild(summary);
      }
      decision.textContent = displayText(report.decisionCheckpoint);
      orders.textContent = displayText(report.nextOrders);

      row.append(week, statusCell, headline, decision, orders);
      archive.appendChild(row);
    });
  };

  const form = document.querySelector('[data-report-form]');
  if (form) {
    const note = document.querySelector('[data-form-note]');
    const summaryPreview = document.querySelector('[data-summary-preview]');
    const updateSummaryPreview = () => {
      const payload = Object.fromEntries(new FormData(form).entries());
      if (summaryPreview) summaryPreview.textContent = generateReportSummary(payload);
    };
    form.addEventListener('input', updateSummaryPreview);
    form.addEventListener('change', updateSummaryPreview);
    updateSummaryPreview();
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      const report = { ...payload, generatedSummary: generateReportSummary(payload), savedAt: new Date().toISOString() };
      try {
        const reports = safeParseReports(localStorage.getItem(REPORT_STORAGE_KEY));
        reports.unshift(report);
        localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(reports.slice(0, 24)));
        if (note) note.textContent = 'Saved locally. Open the report archive to see this browser-only entry.';
      } catch (error) {
        if (note) note.textContent = 'Local save unavailable in this browser. No backend was contacted.';
      }
    });
  }

  const clearReports = document.querySelector('[data-clear-reports]');
  if (clearReports) {
    const note = document.querySelector('[data-archive-note]');
    clearReports.addEventListener('click', () => {
      try {
        localStorage.removeItem(REPORT_STORAGE_KEY);
        localStorage.removeItem(LEGACY_DRAFT_KEY);
        renderArchive();
        if (note) note.textContent = 'Local reports cleared. One clean fallback row is showing again.';
      } catch (error) {
        if (note) note.textContent = 'Unable to clear local reports in this browser.';
      }
    });
  }

  renderArchive();
})();
