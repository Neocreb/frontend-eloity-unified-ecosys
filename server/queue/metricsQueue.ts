import startMetricsSync from '../tasks/metricsSync.js';

const REDIS_URL = process.env.REDIS_URL || '';

let queue: any = null;
let worker: any = null;
let scheduler: any = null;

export async function startMetricsQueue(db: any) {
  if (!REDIS_URL) {
    console.log('REDIS_URL not set; metrics queue not started. Using simple setInterval-based sync.');
    return null;
  }

  // Dynamically import bullmq so the dev server doesn't crash when the package is missing
  let Bullmq: any;
  try {
    Bullmq = await import('bullmq');
  } catch (err) {
    console.warn('bullmq not installed; metrics queue disabled. Install bullmq for Redis-backed queueing.');
    return null;
  }

  const { Queue, Worker, QueueScheduler } = Bullmq;

  queue = new Queue('metrics-sync', { connection: REDIS_URL });
  scheduler = new QueueScheduler('metrics-sync', { connection: REDIS_URL });

  // Add a repeatable job every 5 minutes
  queue.add('aggregate', { ts: Date.now() }, { repeat: { every: 5 * 60 * 1000 } }).catch((err: any) => console.error('Queue add failed', err));

  worker = new Worker('metrics-sync', async (job: any) => {
    console.log('Worker: running metrics aggregation job', job.id);
    try {
      await startMetricsSync(db, 5 * 60 * 1000); // run one aggregation then return
    } catch (e) {
      console.error('Worker aggregation error', e);
      throw e;
    }
  }, { connection: REDIS_URL });

  worker.on('failed', (job: any, err: any) => console.error('Metrics worker failed', job?.id, err));
  worker.on('completed', (job: any) => console.log('Metrics worker completed', job.id));

  console.log('Metrics queue started with Redis at', REDIS_URL);
  return { queue, worker, scheduler };
}

export async function stopMetricsQueue() {
  try {
    if (worker) await worker.close();
    if (scheduler) await scheduler.close();
    if (queue) await queue.close();
  } catch (e) {
    console.warn('Error stopping metrics queue', e);
  }
}
