# Superbatu - A Custom URL Shortener

Supebatu helps you build your own URL shortener. The idea is to create your own URL shortening database and host it over `expressjs` app.

## Setup
### Install
```bash
npm install --save superbatu
```
### Add variables in the ‘.env’ file in the root dir of your service
Superbatu needs a mongo connection, which can be defined with the below configs in `.env`
```bash
SUPERBATU_MONGO_USER="your-mongo-user"
SUPERBATU_MONGO_PASSWORD="your-mongo-pass"
SUPERBATU_MONGO_HOST="your-mongo-host"
SUPERBATU_MONGO_PORT="your-mongo-port"
SUPERBATU_MONGO_DATABASE="your-db-name"
SUPERBATU_MONGO_COLLECTION="your-collection-name"
```

### How to use
#### create a short url
```javascript
import { createShortUrl } from 'superbatu';
const result = createShortUrl('https://www.yoursuperlong.url')
```
 the result will have `uid`(a unique identifier for url)  and `url` original URL.

#### Serve short URL with expressjs
```javascript
import { shortUrlHandler } from 'superbatu';

const router = express();
router.use('/surl/:uid', shortUrlHandler)
```
It will redirect to the original long URL.