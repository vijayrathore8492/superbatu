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

  static mongoCollection = (async () => {
    try {
      if (UrlRepository.mongoURI === 'mongodb://') throw new Error('Superbatu: incorrect mongo configs');

      const connection = await MongoClient.connect(UrlRepository.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      return await connection.db(process.env.SUPERBATU_MONGO_DATABASE)
        .collection(process.env.SUPERBATU_MONGO_COLLECTION);
    } catch (e) {
      console.error('Superbatu failed to connect to mongo', e);
      return false;
    }
  })();

  public static async createShortUrl(url: string) {
    const mongoCollection = await UrlRepository.mongoCollection;
    if (!mongoCollection) {
      throw new Error('SuperBatu: no mongo provided');
    }

    const result = await this.getUidFromUrl(url);
    if (result) return result;

    const shortUrlMapping = {
      uid: nanoid(11),
      url,
    };
    await mongoCollection.insertOne(shortUrlMapping);
    return shortUrlMapping;
  }

  public static async getUrlFromUid(uid: string) {
    const mongoCollection = await UrlRepository.mongoCollection;
    if (!mongoCollection) return false;

    return (await mongoCollection.find({ uid }).toArray())[0];
  }

  public static async getUidFromUrl(url: string) {
    const mongoCollection = await UrlRepository.mongoCollection;
    if (!mongoCollection) return false;

    return (await mongoCollection.find({ url }).toArray())[0];
  }
}
