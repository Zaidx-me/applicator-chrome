(() => {
  function extractAllJobs(): string {
    const cards = document.querySelectorAll('.job-card-container, .jobs-search-results__list-item, .job-card-square');
    const jobs: string[] = [];
    cards.forEach(card => {
      const title = (card.querySelector('.job-card-list__title, .job-card-square__title, a[data-anonymize="job-title"]') as HTMLElement)?.innerText || '';
      const company = (card.querySelector('.job-card-container__company-name, .job-card-square__company-name, .artdeco-entity-lockup__subtitle') as HTMLElement)?.innerText || '';
      const location = (card.querySelector('.job-card-container__metadata-item, .job-card-square__metadata, .artdeco-entity-lockup__caption') as HTMLElement)?.innerText || '';
      if (title) jobs.push(`Company: ${company}\nRole: ${title}\nLocation: ${location}\n---`);
    });
    return jobs.join('\n');
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'EXTRACT_ALL_JOBS') {
      sendResponse({text: extractAllJobs()});
    }
  });
})();
