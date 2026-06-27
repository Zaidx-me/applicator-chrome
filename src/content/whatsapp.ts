(() => {
  function extractJobsFromMessages(): string {
    const messages = document.querySelectorAll('.message-in, .message-out, [data-testid="conversation-panel-messages"] .selectable-text');
    const jobKeywords = ['hiring', 'job', 'vacancy', 'position', 'opening', 'urgent', 'we are looking', 'we need', 'required'];
    const texts: string[] = [];
    messages.forEach(msg => {
      const text = (msg as HTMLElement).innerText?.trim();
      if (!text) return;
      const lower = text.toLowerCase();
      if (jobKeywords.some(k => lower.includes(k))) {
        texts.push(text);
      }
    });
    const unique = [...new Set(texts)];
    return unique.length > 0
      ? unique.join('\n\n===NEXT MESSAGE===\n\n')
      : 'No job-related messages found. Open a chat with job postings and try again.';
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'EXTRACT_ALL_JOBS') {
      sendResponse({text: extractJobsFromMessages()});
    }
  });
})();
