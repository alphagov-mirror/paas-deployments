import Router from '@koa/router';
import Koa from 'koa';
import BodyParser from 'koa-bodyparser';
import helmet from 'koa-helmet';

import * as deployment from './components/deployment';
import { getHealthcheck } from './components/healthcheck';
import { captureErrors, handle, handleErrors, logger, postgres } from './lib';

const app = new Koa();
const router = new Router();

app.use(captureErrors);
app.use(logger);
app.use(postgres);
app.use(helmet());
app.use(BodyParser({enableTypes: ['json']}));

app.use(router.routes());
app.use(router.allowedMethods());

app.on('error', handleErrors);

app.listen(process.env.PORT || 3000);
