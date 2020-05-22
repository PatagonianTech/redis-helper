import assert from 'assert';
import RedisHelperConnection from '../..';

const wait = (t: number) =>
  new Promise((resolve) => setTimeout(resolve, t * 1000));

type TObj = {
  k: string;
  v: number;
  x: boolean;
};

export default async (connection: RedisHelperConnection) => {
  try {
    console.info('crete');
    const redisHelper = connection.create('test', 5);

    let a: any;

    console.info('del first');
    let d = await redisHelper.del('a');
    assert.strictEqual(d, 0, 'del fail');

    console.info('tryGet');
    a = await redisHelper.tryGet('a', 123);
    assert.strictEqual(123, a, 'tryGet fail');

    console.info('tryGet previous value');
    a = await redisHelper.tryGet('a', 321);
    assert.strictEqual(123, a, 'tryGet fail');

    console.info('tryGet with expire');
    await wait(6);
    a = await redisHelper.tryGet('a', 333);
    assert.strictEqual(333, a, 'tryGet fail');

    console.info('del invalid key');
    d = await redisHelper.del('a');
    assert.strictEqual(d, 1, 'del fail');

    console.info('get null');
    a = await redisHelper.get('a');
    assert.strictEqual(null, a, 'get fail');

    console.info('del and incr');
    d = await redisHelper.del('i');
    a = await redisHelper.incr('i');
    assert.strictEqual(a, 1, 'incr fail');

    console.info('incr and get');
    let i = await redisHelper.incr('i');
    assert.strictEqual(a, 1, 'incr fail');
    a = await redisHelper.get('i');
    assert.strictEqual(a, 2, 'get fail');

    let b: TObj = { k: 'foo', v: 123, x: true };

    console.info('set obj');
    let bb = await redisHelper.set<TObj>('b', b);
    assert.deepEqual(bb, b, 'set fail');

    console.info('get obj');
    let bc = await redisHelper.get<TObj>('b');
    assert.deepEqual(bc, b, 'get fail');

    console.info('find all');
    let t = await redisHelper.find({ keyPattern: '*' });
    assert.strictEqual(true, t.length > 1, 'result fail');

    console.info('find obj by key');
    let ba = await redisHelper.find<TObj>({ keyPattern: 'b*' });
    assert.strictEqual(ba.length, 1, 'total fail');
    assert.deepEqual(ba[0].key, 'test:b', 'result key fail');
    assert.deepEqual(ba[0].value, b, 'result fail');

    console.info('find obj by value');
    ba = await redisHelper.find<TObj>({ filter: (k) => k === 'test:b' });
    assert.strictEqual(ba.length, 1, 'total fail');
    assert.deepEqual(ba[0].key, 'test:b', 'result key fail');
    assert.deepEqual(ba[0].value, b, 'result fail');

    console.info('del b by delMany');
    let dc = await redisHelper.delMany({ filter: (k) => k === 'test:b' });
    assert.strictEqual(dc, 1, 'delMany fail');

    console.info('get deleted obj');
    a = await redisHelper.get('b');
    assert.strictEqual(a, null, 'get fail');

    console.info('find deleted obj');
    ba = await redisHelper.find({ filter: (k) => k === 'test:b' });
    assert.strictEqual(ba.length, 0, 'find fail');

    console.info('close');
    await connection.close();

    console.info('Ok');
  } catch (err) {
    console.error('Error!', err);
  }
};
