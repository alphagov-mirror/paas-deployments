import Router from '@koa/router';
import Koa from 'koa';
import BodyParser from 'koa-bodyparser';
import helmet from 'koa-helmet';

import * as controllers from './controllers';
import { captureErrors, handle, handleErrors, logger, postgres } from './lib';

const app = new Koa();
const router = new Router();

router.get('healthcheck', '/healthcheck', handle(controllers.getHealthcheck));

router.get('deployment.list', '/deployments', handle(controllers.listDeployments));
router.post('deployment.create', '/deployments', handle(controllers.postDeployment));
router.get('deployment.obtain', '/deployments/:deploymentGUID', handle(controllers.getDeployment));
router.put('deployment.update', '/deployments/:deploymentGUID', handle(controllers.putDeployment));
router.delete('deployment.delete', '/deployments/:deploymentGUID', handle(controllers.deleteDeployment));

app.use(captureErrors);
app.use(logger);
app.use(postgres);
app.use(helmet());
app.use(BodyParser({enableTypes: ['json']}));

app.use(router.routes());
app.use(router.allowedMethods());

app.on('error', handleErrors);

app.listen(process.env.PORT || 3000);
