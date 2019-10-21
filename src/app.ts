import Router from '@koa/router';
import Koa from 'koa';
import BodyParser from 'koa-bodyparser';
import helmet from 'koa-helmet';

import * as deployment from './components/deployment';
import * as controllers from './controllers';
import { captureErrors, handle, handleErrors, logger, postgres } from './lib';

const app = new Koa();
const router = new Router();

router.get('healthcheck', '/healthcheck', handle(controllers.getHealthcheck));

app.use(captureErrors);
app.use(logger);
app.use(postgres);
app.use(helmet());
app.use(BodyParser({enableTypes: ['json']}));

app.use(router.routes());
app.use(router.allowedMethods());

app.on('error', handleErrors);

app.listen(process.env.PORT || 3000);
