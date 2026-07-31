const { kv } = require('@vercel/kv');
(async () => {
  try {
    const l = await kv.lrange('feedbacks:v1', 0, -1);
    console.log('lrange OK len=', l.length);
    if (l.length > 0) console.log('first raw:', JSON.stringify(l[0]).slice(0, 120));
  } catch (e) {
    console.log('lrange ERR', e.message);
  }
  try {
    const n = await kv.llen('feedbacks:v1');
    console.log('llen', n);
  } catch (e) {
    console.log('llen ERR', e.message);
  }
  try {
    await kv.lpush('feedbacks:v1', JSON.stringify({ id: 9999, message: 'client-test', timestamp: new Date().toISOString() }));
    console.log('lpush OK');
  } catch (e) {
    console.log('lpush ERR', e.message);
  }
  try {
    const l2 = await kv.lrange('feedbacks:v1', 0, 2);
    console.log('lrange2 len=', l2.length, 'head=', JSON.stringify(l2[0]).slice(0, 120));
  } catch (e) {
    console.log('lrange2 ERR', e.message);
  }
})();
