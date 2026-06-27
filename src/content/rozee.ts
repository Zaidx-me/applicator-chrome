(() => {
  function extractAllJobs(): string {
    const cards = document.querySelectorAll('.job-listing, .job-card, .job-row, [class*="job"]');
    const jobs: string[] = [];
    cards.forEach(card => {
      const titleEl = card.querySelector('h2, h3, .job-title, .job_name, a[title]');
      const companyEl = card.querySelector('.company-name, .company, .job-company, [class*="company"]');
      const locationEl = card.querySelector('.location, .job-location, .city, [class*="location"]');
      const title = (titleEl as HTMLElement)?.innerText?.trim() || '';
      const company = (companyEl as HTMLElement)?.innerText?.trim() || '';
      const location = (locationEl as HTMLElement)?.innerText?.trim() || '';
      if (title) jobs.push(`Company: ${company}\nRole: ${title}\nLocation: ${location}\n---`);
    });
    return jobs.length > 0
      ? jobs.join('\n')
      : 'No job listings found on this Rozee page. Try navigating to a search results page.';
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'EXTRACT_ALL_JOBS') {
      sendResponse({text: extractAllJobs()});
    }
  });
})();
