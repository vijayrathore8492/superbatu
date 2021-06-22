import { MongoClient } from 'mongodb';
import { nanoid } from 'nanoid';

require('dotenv').config();

export default class UrlRepository {
  static mongoURI = (() => {
    let connString = 'mongodb://';
    connString += process.env.SUPERBATU_MONGO_USER ? `${process.env.SUPERBATU_MONGO_USER}:` : '';
    connString += process.env.SUPERBATU_MONGO_PASSWORD ? `${process.env.SUPERBATU_MONGO_PASSWORD}@` : '';
    connString += process.env.SUPERBATU_MONGO_HOST || '';
    connString += process.env.SUPERBATU_MONGO_PORT ? `:${process.env.SUPERBATU_MONGO_PORT}` : '';
    return connString;
  })();

  static mongoCollection;

  static connectMongo = async () => {
    try {
      if (UrlRepository.mongoCollection) return UrlRepository.mongoCollection;
      if (UrlRepository.mongoURI === 'mongodb://') throw new Error('Superbatu: incorrect mongo configs');

      const connection = await MongoClient.connect(UrlRepository.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      UrlRepository.mongoCollection = await connection.db(process.env.SUPERBATU_MONGO_DATABASE)
        .collection(process.env.SUPERBATU_MONGO_COLLECTION);
    } catch (e) {
      console.error('Superbatu failed to connect to mongo', e);
      UrlRepository.mongoCollection = false;
    }
  };

  public static async createShortUrl(url: string): Promise<{uid: string, url: string}> {
    await UrlRepository.connectMongo();
    if (!UrlRepository.mongoCollection) {
      throw new Error('Superbatu: no mongo provided');
    }

    const result = await this.getUidFromUrl(url);
    if (result) {
      return {
        uid: result.uid,
        url: result.url,
      };
    }

    const shortUrlMapping = {
      uid: nanoid(11),
      url,
    };
    await UrlRepository.mongoCollection.insertOne(shortUrlMapping);
    return shortUrlMapping;
  }

  public static async getUrlFromUid(uid: string) {
    await UrlRepository.connectMongo();
    if (!UrlRepository.mongoCollection) return false;

    return (await UrlRepository.mongoCollection.find({ uid }).toArray())[0];
  }

  public static async getUidFromUrl(url: string) {
    await UrlRepository.connectMongo();
    if (!UrlRepository.mongoCollection) return false;

    return (await UrlRepository.mongoCollection.find({ url }).toArray())[0];
  }
}
