(() => {
  function extractAllJobs(): string {
    const cards = document.querySelectorAll('.job_seen_beacon, .cardOutline, .jobCard');
    const jobs: string[] = [];
    cards.forEach(card => {
      const title = (card.querySelector('.jobTitle, .jobCard-title, a[data-jk]') as HTMLElement)?.innerText || '';
      const company = (card.querySelector('.companyName, .jobCard-company, [data-testid="company-name"]') as HTMLElement)?.innerText || '';
      const location = (card.querySelector('.companyLocation, .jobCard-location') as HTMLElement)?.innerText || '';
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
