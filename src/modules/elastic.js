const { Client } = require('@elastic/elasticsearch')
const config = require('config')

const DLQ_INDEX = '.logstash_dead_letter';

const client = new Client({
    node: config.get('elastic.url')
})

async function getCaseTypes() {
    const { body } = await client.cat.indices({ format: 'json' })
    console.log(body);
    return body.map(index => index.index.replace('_cases-000001', ''));
}

async function searchDlq(index) {
    const { body } = await client.search({
        index: DLQ_INDEX,
        size: 0,
        body: {
          query: {
            match_phrase: {
                reason: `"case_type_id":"${index}"`
            }
          }
        }
      });
    return body;
}

async function getIndexCount(index) {
    const { body } = await client.count({ index: index });
    return body.count;
}

module.exports = { getCaseTypes, searchDlq, getIndexCount, DLQ_INDEX };
