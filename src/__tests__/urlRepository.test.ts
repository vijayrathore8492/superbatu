import sinon from 'sinon';
import UrlRepository from '../urlRepository';

const { MongoClient } = require('mongodb');

describe('UrlRepository', () => {
  let connection;
  let db;
  const url = 'https://www.iamaverylonglongurl.xyz/thisisindeedalongurl';

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db();
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('createShortUrl', () => {
    describe('when no mongo', () => {
      it('throws error', async () => {
        try {
          await UrlRepository.createShortUrl(url);
        } catch (e) {
          expect(e.message).toEqual('SuperBatu: no mongo provided');
        }
      });
    });

    describe('when short url does not exist', () => {
      const mongoFindSpy = jest.fn((o) => o);

      beforeAll(() => {
        UrlRepository.mongoCollection = db.collection('short_url');
      });

      afterAll(() => {
        sinon.restore();
      });

      it('creates short url', async () => {
        const result = await UrlRepository.createShortUrl(url);
        expect(result).toEqual(await UrlRepository.getUidFromUrl(url));
      });
    });
  });
});
