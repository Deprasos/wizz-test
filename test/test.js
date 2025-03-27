const request = require('supertest');
var assert = require('assert');
const app = require('../index');

/**
 * Testing create game endpoint
 */
describe('POST /api/games', function () {
    let data = {
        publisherId: "1234567890",
        name: "Test App",
        platform: "ios",
        storeId: "1234",
        bundleId: "test.bundle.id",
        appVersion: "1.0.0",
        isPublished: true
    }
    it('respond with 200 and an object that matches what we created', function (done) {
        request(app)
            .post('/api/games')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, result) => {
                if (err) return done(err);
                assert.strictEqual(result.body.publisherId, '1234567890');
                assert.strictEqual(result.body.name, 'Test App');
                assert.strictEqual(result.body.platform, 'ios');
                assert.strictEqual(result.body.storeId, '1234');
                assert.strictEqual(result.body.bundleId, 'test.bundle.id');
                assert.strictEqual(result.body.appVersion, '1.0.0');
                assert.strictEqual(result.body.isPublished, true);
                done();
            });
    });
});

/**
 * Testing get all games endpoint
 */
describe('GET /api/games', function () {
    it('respond with json containing a list that includes the game we just created', function (done) {
        request(app)
            .get('/api/games')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, result) => {
                if (err) return done(err);
                assert.strictEqual(result.body[0].publisherId, '1234567890');
                assert.strictEqual(result.body[0].name, 'Test App');
                assert.strictEqual(result.body[0].platform, 'ios');
                assert.strictEqual(result.body[0].storeId, '1234');
                assert.strictEqual(result.body[0].bundleId, 'test.bundle.id');
                assert.strictEqual(result.body[0].appVersion, '1.0.0');
                assert.strictEqual(result.body[0].isPublished, true);
                done();
            });
    });
});


/**
 * Testing update game endpoint
 */
describe('PUT /api/games/1', function () {
    let data = {
        id : 1,
        publisherId: "999000999",
        name: "Test App Updated",
        platform: "android",
        storeId: "5678",
        bundleId: "test.newBundle.id",
        appVersion: "1.0.1",
        isPublished: false
    }
    it('respond with 200 and an updated object', function (done) {
        request(app)
            .put('/api/games/1')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, result) => {
                if (err) return done(err);
                assert.strictEqual(result.body.publisherId, '999000999');
                assert.strictEqual(result.body.name, 'Test App Updated');
                assert.strictEqual(result.body.platform, 'android');
                assert.strictEqual(result.body.storeId, '5678');
                assert.strictEqual(result.body.bundleId, 'test.newBundle.id');
                assert.strictEqual(result.body.appVersion, '1.0.1');
                assert.strictEqual(result.body.isPublished, false);
                done();
            });
    });
});

/**
 * Testing update game endpoint
 */
describe('DELETE /api/games/1', function () {
    it('respond with 200', function (done) {
        request(app)
            .delete('/api/games/1')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err) => {
                if (err) return done(err);
                done();
            });
    });
});

/**
 * Testing get all games endpoint
 */
describe('GET /api/games', function () {
    it('respond with json containing no games', function (done) {
        request(app)
            .get('/api/games')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, result) => {
                if (err) return done(err);
                assert.strictEqual(result.body.length, 0);
                done();
            });
    });
});


/**
 * Testing search games endpoint validation
 */
describe('POST /api/games/search - Validation Tests', function () {
    it('should respond with 400 when name field is missing', async function () {
        const data = {
            platform: 'ios'
        };
        
        const result = await request(app)
            .post('/api/games/search')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
            
        assert.strictEqual(result.body.error, 'name field is required');
    });

    it('should respond with 400 when name has invalid type', async function () {
        const data = {
            name: 123,
            platform: 'ios'
        };
        
        const result = await request(app)
            .post('/api/games/search')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
            
        assert.strictEqual(result.body.error, 'name field must be a string');
    });

    it('should respond with 400 when platform has invalid value', async function () {
        const data = {
            name: 'Test App',
            platform: 'windows'
        };
        
        const result = await request(app)
            .post('/api/games/search')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
            
        assert.strictEqual(result.body.error, `Invalid enum value. Expected '' | 'ios' | 'android', received 'windows'`);
    });
});

/**
 * Testing search games functionality
 */
describe('POST /api/games/search - Search Functionality', function () {
    before(async function() {
        const iosGame = {
            publisherId: "1234567890",
            name: "Test Search App",
            platform: "ios",
            storeId: "1234",
            bundleId: "test.bundle.id",
            appVersion: "1.0.0",
            isPublished: true
        };

        const iosGame2 = {
            publisherId: "1234567890",
            name: "Test App",
            platform: "ios",
            storeId: "1234",
            bundleId: "test.bundle.id",
            appVersion: "1.0.0",
            isPublished: true
        };

        const androidGame = {
            publisherId: "1234567890",
            name: "Test App",
            platform: "android",
            storeId: "1234",
            bundleId: "test.bundle.id",
            appVersion: "1.0.0",
            isPublished: true
        };
        
        // I would even recommend to create data in db directly, not using the endpoint
        await request(app)
            .post('/api/games')
            .send(iosGame);
        
        await request(app)
            .post('/api/games')
            .send(iosGame2);
        
        await request(app)
            .post('/api/games')
            .send(androidGame);
    });
    
    // Clean up after tests
    after(async function() {
        const result = await request(app).get('/api/games');
        
        // Delete any games that were created
        if (result.body.length > 0) {
            const deletePromises = result.body.map(game => 
                request(app).delete(`/api/games/${game.id}`)
            );
            
            await Promise.all(deletePromises);
        }
    });

    it('should search by name only', async function () {
        const searchData = {
            name: 'Search',
            platform: ''
        };
        
        const result = await request(app)
            .post('/api/games/search')
            .send(searchData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);
            
        assert.strictEqual(result.body.length === 1, true);
        assert.strictEqual(result.body[0].name.includes('Search'), true);
    });

    it('should search by platform only', async function () {
        const searchData = {
            name: '',
            platform: 'ios'
        };
        
        const result = await request(app)
            .post('/api/games/search')
            .send(searchData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);
            
        assert.strictEqual(result.body.length === 2, true);
        result.body.forEach(game => {
            assert.strictEqual(game.platform, 'ios');
        });
    });

    it('should search by both name and platform', async function () {
        const searchData = {
            name: 'Search',
            platform: 'ios'
        };
        
        const result = await request(app)
            .post('/api/games/search')
            .send(searchData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);
            
        assert.strictEqual(result.body.length === 1, true);
        assert.strictEqual(result.body[0].name.includes('Search'), true);
        assert.strictEqual(result.body[0].platform === 'ios', true);
    });

    it('should return no results for non-matching search', async function () {
        const searchData = {
            name: 'NonExistentGameName',
            platform: 'ios'
        };
        
        const result = await request(app)
            .post('/api/games/search')
            .send(searchData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);
            
        assert.strictEqual(result.body.length, 0);
    });
});
