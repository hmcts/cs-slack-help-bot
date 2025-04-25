const {getCaseTypes, searchDlq, getIndexCount, DLQ_INDEX} = require("../modules/elastic");

async function getDlqStats() {
    const caseTypes = await getCaseTypes();
    const results = new Map();

    for (const caseType of caseTypes) {
        if (caseType === DLQ_INDEX) {
            continue;
        }

        const dlqSearch = await searchDlq(caseType);
        if (dlqSearch.hits.total.value > 0) {
            results.set(caseType, dlqSearch.hits.total.value);
        }
    }

    return results;
}

module.exports = { getDlqStats };
