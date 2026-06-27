(() => {
  function injectButton(): void {
    const jobCards = document.querySelectorAll('.job_seen_beacon, .cardOutline, .jobCard');
    jobCards.forEach(card => {
      if (card.querySelector('[data-applicator-btn]')) return;
      const btn = document.createElement('button');
      btn.setAttribute('data-applicator-btn', 'true');
      btn.textContent = '📋 Extract';
      btn.style.cssText = 'position:absolute;top:8px;right:8px;z-index:999;padding:4px 8px;font-size:12px;background:#6366F1;color:white;border:none;border-radius:4px;cursor:pointer;';
      btn.onclick = (e) => {
        e.stopPropagation();
        const title = (card.querySelector('.jobTitle, .jobCard-title, a[data-jk]') as HTMLElement)?.innerText || '';
        const company = (card.querySelector('.companyName, .jobCard-company, [data-testid="company-name"]') as HTMLElement)?.innerText || '';
        const location = (card.querySelector('.companyLocation, .jobCard-location') as HTMLElement)?.innerText || '';
        chrome.runtime.sendMessage({
          type: 'JOB_EXTRACTED',
          data: {role_type: title, company, location, source: 'indeed'},
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
