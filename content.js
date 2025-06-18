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
        // Remove previous IFs
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

        // Fuzzy fallback: match on prefix if direct match fails
        if (ifVal === undefined && cleaned.length > 5) {
            const matchKey = Object.keys(journalIF).find(key => cleaned.startsWith(key));
            if (matchKey) {
                ifVal = journalIF[matchKey];
            }
        }

        // Show IF for any valid journal in CSV
        if (typeof ifVal === "number" && !isNaN(ifVal) && isLikelyJournal(cleaned)) {
            const span = document.createElement('span');
            span.textContent = ` | IF: ${ifVal.toFixed(2)}`;
            span.style.color = 'green';
            span.style.fontWeight = 'bold';
            span.setAttribute('data-if-extension', 'true');
            el.appendChild(span);
        }
    });
}

// Remove previous and insert new Total IF (only once!)
function insertTotalIF() {
    // Remove any previous Total Author IF blocks
    document.querySelectorAll('.gscholar-total-if-block').forEach(el => el.remove());

    const elements = document.querySelectorAll(
        '.gsc_a_t .gs_gray:not(.gs_oph), .gsc_a_t .gs_gray.badged'
    );

    const matched = [];
    elements.forEach(el => {
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
        let matchKey = cleaned;

        // Fuzzy fallback: match on prefix if direct match fails
        if (ifVal === undefined && cleaned.length > 5) {
            matchKey = Object.keys(journalIF).find(key => cleaned.startsWith(key));
            if (matchKey) {
                ifVal = journalIF[matchKey];
            }
        }

        // Only add if valid and not already counted
        if (typeof ifVal === "number" && !isNaN(ifVal) && isLikelyJournal(matchKey) && !matched.includes(matchKey)) {
            matched.push(matchKey);
        }
    });

    const totalIF = matched.reduce((acc, key) => acc + journalIF[key], 0);

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
    note.textContent = 'Note: The Impact Factor values used are based on a manually compiled dataset of publicly observed journal metrics. These scores are approximate and for informational use only.';
    note.style.color = '#999999';
    note.style.fontSize = '12px';
    note.style.marginTop = '4px';
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

// Allow almost all actual journals, block only clear non-journal lines
function isLikelyJournal(str) {
    return str.length > 6;
}

// Normalize journal names
function cleanString(str) {
    return str
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[-–—]/g, ' ')  // Replace hyphens with space
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}]/gu, '')
        .replace(/[^a-z0-9\s]/g, '')  // remove punctuation except space
        .replace(/\s+/g, ' ')
        .trim();
}
function extractJournalName(sourceText) {
    let cleaned = cleanString(
        sourceText
            .replace(/\([^)]*\)/g, '')     // remove (3), (suppl_1), etc.
            .replace(/[0-9]{1,4}/g, '')    // remove digits
            .replace(/[,]/g, '')           // remove commas
            .trim()
    );

    // Remove trailing single-letter word (like 'b', 'a')
    const parts = cleaned.split(' ');
    if (parts.length > 1 && parts[parts.length - 1].length === 1) {
        parts.pop();
        cleaned = parts.join(' ');
    }
    return cleaned;
}
