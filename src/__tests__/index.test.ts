import sinon from 'sinon';
import { createShortUrl, shortUrlHandler } from '../index';
import UrlRepository from '../urlRepository';

describe('index', () => {
  describe('createShortUrl', () => {
    const createShortUrlSpy = jest.fn((url) => '');
    beforeAll(() => {
      sinon.stub(UrlRepository, 'createShortUrl').callsFake(async (url) => createShortUrlSpy(url));
    });

    it('calls createShortUrl of repository', async () => {
      const url = 'http://www.abc.com';
      await createShortUrl(url);
      expect(createShortUrlSpy).toBeCalledWith(url);
    });
  });

  describe('shortUrlHandler', () => {
    const statusSpy = jest.fn((s) => s);
    const sendSpy = jest.fn((s) => s);
    const redirectSpy = jest.fn((s) => s);
    const res = {
      status(status) {
        statusSpy(status);
        return this;
      },
      send(response) {
        sendSpy(response);
        return this;
      },
      redirect(url) {
        redirectSpy(url);
        return this;
      },
    };

    describe('no uid provided', () => {
      it('returns 404', async () => {
        await shortUrlHandler({ params: {} }, res);
        expect(statusSpy).toBeCalledWith(404);
        expect(sendSpy).toBeCalledWith('Not Found!');
      });
    });

    describe('incorrect uid provided', () => {
      const getUrlFromUidSpy = jest.fn((s) => s);
      beforeAll(() => {
        sinon.stub(UrlRepository, 'getUrlFromUid').callsFake(async (uid) => {
          getUrlFromUidSpy(uid);
          return {};
        });
      });

      afterAll(() => {
        sinon.restore();
      });

      it('returns 404', async () => {
        await shortUrlHandler({ params: { uid: 1234 } }, res);
        expect(getUrlFromUidSpy).toBeCalledWith(1234);
        expect(statusSpy).toBeCalledWith(404);
        expect(sendSpy).toBeCalledWith('Not Found!');
      });
    });

    describe('correct uid provided', () => {
      const getUrlFromUidSpy = jest.fn((s) => s);
      beforeAll(() => {
        sinon.stub(UrlRepository, 'getUrlFromUid').callsFake(async (uid) => {
          getUrlFromUidSpy(uid);
          return { uid, url: 'http://www.redirect.url' };
        });
      });

      afterAll(() => {
        sinon.restore();
      });

      it('returns 404', async () => {
        await shortUrlHandler({ params: { uid: 1234 } }, res);
        expect(getUrlFromUidSpy).toBeCalledWith(1234);
        expect(redirectSpy).toBeCalledWith('http://www.redirect.url');
      });
    });
  });
});
