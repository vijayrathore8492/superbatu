import * as _ from 'lodash';
import { Request, Response } from 'express';
import UrlRepository from './urlRepository';

export const createShortUrl = async (u: string): Promise<string> => UrlRepository.createShortUrl(u);

export const shortUrlHandler = async (req: Request, res: Response) => {
  const uid = _.get(req, 'params.uid');
  if (!uid) res.status(404).send('Not Found!');

  const { url } = await UrlRepository.getUrlFromUid(uid);
  if (!url) res.status(404).send('Not Found!');

  res.redirect(url);
};
