(function(){
  const raceDate = new Date('2026-09-03T08:00:00-04:00');
  const countdown = document.querySelector('[data-countdown]');
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

  const form = document.querySelector('[data-report-form]');
  if (form) {
    const note = document.querySelector('[data-form-note]');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      try {
        const drafts = JSON.parse(localStorage.getItem('moonshotReportDrafts') || '[]');
        drafts.unshift({ ...payload, savedAt: new Date().toISOString() });
        localStorage.setItem('moonshotReportDrafts', JSON.stringify(drafts.slice(0, 12)));
        if (note) note.textContent = 'Mock saved locally in this browser. No backend, no login, no upload service.';
      } catch (error) {
        if (note) note.textContent = 'Local mock save unavailable in this browser. Copy the report manually.';
      }
    });
  }
})();
