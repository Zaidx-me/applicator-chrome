(() => {
  function injectButton(): void {
    const jobCardSelector = '.job-card-container, .jobs-search-results__list-item, .job-card-square';
    const existing = document.querySelector('[data-applicator-btn]');
    if (existing) return;

    const jobCards = document.querySelectorAll(jobCardSelector);
    jobCards.forEach(card => {
      const btn = document.createElement('button');
      btn.setAttribute('data-applicator-btn', 'true');
      btn.textContent = '📋 Extract';
      btn.style.cssText = 'position:absolute;top:8px;right:8px;z-index:999;padding:4px 8px;font-size:12px;background:#6366F1;color:white;border:none;border-radius:4px;cursor:pointer;';
      btn.onclick = (e) => {
        e.stopPropagation();
        const title = (card.querySelector('.job-card-list__title, .job-card-square__title, a[data-anonymize="job-title"]') as HTMLElement)?.innerText || '';
        const company = (card.querySelector('.job-card-container__company-name, .job-card-square__company-name, .artdeco-entity-lockup__subtitle') as HTMLElement)?.innerText || '';
        const location = (card.querySelector('.job-card-container__metadata-item, .job-card-square__metadata, .artdeco-entity-lockup__caption') as HTMLElement)?.innerText || '';
        chrome.runtime.sendMessage({
          type: 'JOB_EXTRACTED',
          data: {role_type: title, company, location, source: 'linkedin'},
        });
      };
      (card as HTMLElement).style.position = 'relative';
      card.appendChild(btn);
    });
  }

  const observer = new MutationObserver(() => injectButton());
  observer.observe(document.body, {childList: true, subtree: true});
  injectButton();
})();
