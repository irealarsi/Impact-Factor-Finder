// Only run on Scholar profile listing pages (not article/citation pages)
function isOnProfilePage() {
    return !!document.querySelector('#gsc_a_t');
}

let journalIF = {};

(async function () {
    if (!isOnProfilePage()) {
        // Remove any IF block if leaking into this page
        document.querySelectorAll('.gscholar-total-if-block').forEach(el => el.remove());
        return;
    }

    const response = await fetch(chrome.runtime.getURL('data/journal_impact_2024.csv'));
    const csvText = await response.text();

    const lines = csvText.split('\n');
    for (let i = 1; i < lines.length; i++) {
        const [name, ifVal] = lines[i].split(',');
        if (name && ifVal) {
            const cleaned = cleanString(name);
            journalIF[cleaned] = parseFloat(ifVal.trim());
        }
    }

    setTimeout(() => {
        observeScholarTable();
        rerunIFs();
    }, 1200);
})();

// Re-annotate on new articles loaded
function rerunIFs() {
    annotateIF();
    insertTotalIF();
}

// MutationObserver for dynamic scholar loading
function observeScholarTable() {
    const container = document.querySelector('#gsc_a_t');
    if (!container) return;
    const observer = new MutationObserver(() => {
        setTimeout(rerunIFs, 250);
    });
    observer.observe(container, {childList: true, subtree: true});
}

// Annotate IF beside each journal
function annotateIF() {
    const elements = document.querySelectorAll(
        '.gsc_a_t .gs_gray:not(.gs_oph), .gsc_a_t .gs_gray.badged'
    );

    elements.forEach(el => {
        const spans = el.querySelectorAll('span');
        spans.forEach(span => {
            if (span.textContent.includes('IF:')) {
                span.remove();
            }
        });

        let journalText = '';
        if (el.classList.contains('badged')) {
            el.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    journalText += node.textContent.trim() + ' ';
                }
            });
        } else {
            journalText = el.textContent.trim();
        }

        const cleaned = extractJournalName(journalText);
        let ifVal = journalIF[cleaned];

       
        if (typeof ifVal === "number" && !isNaN(ifVal) && isLikelyJournal(cleaned)) {
            const span = document.createElement('span');
            span.textContent = ` | IF: ${ifVal.toFixed(2)}`;
            span.style.color = 'green';
            span.style.fontWeight = 'bold';
            span.setAttribute('data-if-extension', 'true');
            el.appendChild(span);

            // Mark for Total IF use
            el.setAttribute('data-if-used', 'true');
            el.setAttribute('data-if-value', ifVal.toFixed(2));
            el.setAttribute('data-if-cleaned-name', cleaned);
        } else {
            el.removeAttribute('data-if-used');
            el.removeAttribute('data-if-value');
            el.removeAttribute('data-if-cleaned-name');
        }
    });
}

// Total IF calculation using only visible/annotated journals
function insertTotalIF() {
    document.querySelectorAll('.gscholar-total-if-block').forEach(el => el.remove());

    const elements = document.querySelectorAll(
        '.gsc_a_t .gs_gray[data-if-used="true"]'
    );

    const ifValues = [];
    const journalNamesForDebug = [];
    elements.forEach(el => {
        const cleanedName = el.getAttribute('data-if-cleaned-name');
        const ifValue = parseFloat(el.getAttribute('data-if-value'));

        if (cleanedName && !isNaN(ifValue)) {
            ifValues.push(ifValue);
            journalNamesForDebug.push(cleanedName);
        }
    });

  
    const totalIF = ifValues.reduce((acc, value) => acc + value, 0);

    const wrapper = document.createElement('div');
    wrapper.className = 'gscholar-total-if-block';
    wrapper.style.marginTop = '10px';

    const totalDiv = document.createElement('div');
    totalDiv.textContent = `📊 Total Author IF: ${totalIF.toFixed(2)}`;
    totalDiv.style.color = '#336699';
    totalDiv.style.fontWeight = 'bold';
    totalDiv.style.fontSize = '16px';
    wrapper.appendChild(totalDiv);

    const note = document.createElement('div');
    note.textContent = 'Note: The Impact Factor values used are based on a manually compiled dataset of publicly observed journal metrics (WoS JCR 2025). These scores are approximate, for informational use only, and may not reflect official Clarivate JCR data.';
    note.style.color = '#ff9900';
    note.style.fontSize = '12px';
    note.style.marginTop = '4px';
    note.style.fontWeight = 'bold';
    wrapper.appendChild(note);

    const target1 = document.querySelector('.gsc_rsb_st');
    if (target1) {
        target1.parentNode.insertBefore(wrapper, target1.nextSibling);
    } else {
        const fallback = document.querySelector('.gsc_prf_il');
        if (fallback) {
            fallback.parentNode.insertBefore(wrapper, fallback.nextSibling);
        } else {
            document.body.prepend(wrapper);
        }
    }
}

// Filter non-journal entries
function isLikelyJournal(str) {
    const nonJournalKeywords = [
        'conference',
        'proceedings',
        'workshop',
        'symposium',
        'book',
        'chapter',
        'thesis',
        'poster',
        'patent'
    ];
    return !nonJournalKeywords.some(k => str.includes(k));
}

// Normalize text for matching
function cleanString(str) {
    return str
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[-–—]/g, ' ')
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}]/gu, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Extract and clean journal names from text
function extractJournalName(sourceText) {
    let cleaned = cleanString(
        sourceText
            .replace(/\([^)]*\)/g, '')
            .replace(/[0-9]{1,4}/g, '')
            .replace(/[,]/g, '')
            .trim()
    );

    const parts = cleaned.split(' ');
    if (parts.length > 1 && parts[parts.length - 1].length === 1) {
        parts.pop();
        cleaned = parts.join(' ');
    }
    return cleaned;
}
