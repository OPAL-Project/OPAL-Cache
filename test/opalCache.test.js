const request = require('supertest');
const each = require('jest-each');
const ObjectID = require('mongodb').ObjectID;

const { Constants, DataModels } =  require('eae-utils');
const CacheTestServer = require('./cacheTestServer');

let cacheTestServer = new CacheTestServer();

beforeEach(() => {
    return cacheTestServer.setup();
});

afterAll(function ()  {
    return cacheTestServer.shutdown();
});

describe('POST /query', () => {
    test('Cache response is 400 when request does not contain query', async () => {
        expect.assertions(1);

        return request(cacheTestServer.opalCache.app)
            .post('/query')
            .send({})
            .expect(400)
            .expect(function (res) {
                expect(res.body.error).toEqual('Request does not contain a job in its body');
            })
    });
    test('Cache response contains a not null result and waiting set to false when query has been submitted before and is completed', async () => {
        expect.assertions(2);

        let query = {
            params: {
                startDate: new Date('2013-01-01T00:00:00Z'),
                endDate: new Date('2015-12-31T23:59:59Z'),
                algorithmName: 'density',
                resolution: 'A',
                keySelector: ['B'],
            },
            status: [Constants.EAE_JOB_STATUS_COMPLETED, Constants.EAE_JOB_STATUS_RUNNING],
            output: [125],
        };

        let fullQuery = getFullQuery(query);

        await cacheTestServer.insertJob(fullQuery);
        return request(cacheTestServer.opalCache.app)
            .post('/query')
            .send({job: fullQuery})
            .expect(200)
            .expect(function (res) {
                expect(res.body.result).toEqual(query.output);
                expect(res.body.waiting).toBe(false);
            })
    });

    test('Cache response contains null result and waiting set to false when query has not been submitted before', async () => {
        expect.assertions(2);

        let submittedQuery = {
            params: {
                startDate: new Date('2013-01-01T00:00:00Z'),
                endDate: new Date('2015-12-31T23:59:59Z'),
                algorithmName: 'migration',
                resolution: 'C',
                keySelector: ['C'],
            },
            status: [],
            output: [3213],
        };

        let fullSubmittedQuery = getFullQuery(submittedQuery);

        let query = {
            params: {
                startDate: new Date('2013-01-01T00:00:00Z'),
                endDate: new Date('2015-12-31T23:59:59Z'),
                algorithmName: 'density',
                resolution: 'A',
                keySelector: ['B'],
            },
            status: [],
            output: [125],
        };

        let fullQuery = getFullQuery(query);

        await cacheTestServer.insertJob(fullSubmittedQuery);
        return request(cacheTestServer.opalCache.app)
            .post('/query')
            .send({job: fullQuery})
            .expect(200)
            .expect(function (res) {
                expect(res.body.result).toBeNull();
                expect(res.body.waiting).toBe(false);
            })
    });

    each([
        [Constants.EAE_JOB_STATUS_CREATED],
        [Constants.EAE_JOB_STATUS_QUEUED],
        [Constants.EAE_JOB_STATUS_SCHEDULED],
        [Constants.EAE_JOB_STATUS_TRANSFERRING_DATA],
        [Constants.EAE_JOB_STATUS_RUNNING],
    ]).test('Cache response contains null result and waiting set to true when query has been submitted already but job is in status %s', async (status) => {
        expect.assertions(3);

        let query = {
            params: {
                startDate: new Date('2013-01-01T00:00:00Z'),
                endDate: new Date('2015-12-31T23:59:59Z'),
                algorithmName: 'density',
                resolution: 'A',
                keySelector: ['C'],
            },
            status: [status],
            output: [125],
        };

        let fullQuery = getFullQuery(query);

        await cacheTestServer.insertJob(fullQuery);
        return request(cacheTestServer.opalCache.app)
            .post('/query')
            .send({job: fullQuery})
            .expect(200)
            .expect(function (res) {
                expect(res.body.result).toBeNull();
                expect(res.body.waiting).toBe(true);
                expect(res.body.status).toBe(status);
            })
    });
});

function getFullQuery(query) {
    let eaeJobModel = JSON.parse(JSON.stringify(DataModels.EAE_JOB_MODEL));
    return Object.assign({}, eaeJobModel, query, {_id: new ObjectID(), type: Constants.EAE_JOB_TYPE_PYTHON2});
}
