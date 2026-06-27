chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true}).catch(() => {});
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'EXTRACT_JOBS') {
    (async () => {
      try {
        const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${message.apiKey}`,
          },
          body: JSON.stringify({
            model: message.model || 'meta/llama-3.1-8b-instruct',
            messages: [
              {
                role: 'system',
                content: `Extract all job postings from the text. Return a JSON array of {company, role_type, location, extracted_email}. Only the array.`,
              },
              {role: 'user', content: message.text},
            ],
            temperature: 0.1,
            max_tokens: 2048,
          }),
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const json = await res.json();
        sendResponse({ok: true, data: json.choices?.[0]?.message?.content || ''});
      } catch (e: any) {
        sendResponse({ok: false, error: e.message});
      }
    })();
    return true;
  }
});
