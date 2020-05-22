import assert from 'assert';
import RedisHelperConnection from '../..';
import RedisHelper from '../../RedisHelper';

const wait = (test: any, t: number) => {
  const to = t * 1000;
  test.timeout(to + 2000);
  return new Promise((resolve) => setTimeout(resolve, to));
};

type TObj = {
  k: string;
  v: number;
  x: boolean;
};

export default (connection: RedisHelperConnection) => {
  let redisHelper: RedisHelper;

  const obj: TObj = { k: 'foo', v: 123, x: true };

  it('create', () => {
    redisHelper = connection.create('test', 5);
  });

  it('del first', async () => {
    const d = await redisHelper.del('a');
    assert.strictEqual(d, 0);
  });

  it('tryGet', async () => {
    const a = await redisHelper.tryGet('a', 123);
    assert.strictEqual(123, a);
  });

  it('tryGet previous value', async () => {
    const a = await redisHelper.tryGet('a', 321);
    assert.strictEqual(123, a);
  });

  it('tryGet with expire', async function () {
    // @ts-ignore
    await wait(this, 6);
    const a = await redisHelper.tryGet('a', 333);
    assert.strictEqual(333, a);
  });

  it('del invalid key', async () => {
    const d = await redisHelper.del('a');
    assert.strictEqual(d, 1);
  });

  it('get null', async () => {
    const a = await redisHelper.get('a');
    assert.strictEqual(null, a);
  });

  it('del and incr', async () => {
    await redisHelper.del('i');
    const a = await redisHelper.incr('i');
    assert.strictEqual(a, 1);
  });

  it('incr', async () => {
    const i = await redisHelper.incr('i');
    assert.strictEqual(i, 2);
  });

  it('prev incr get', async () => {
    const a = await redisHelper.get('i');
    assert.strictEqual(a, 2);
  });

  it('set obj', async () => {
    const bb = await redisHelper.set<TObj>('b', obj);
    assert.deepEqual(bb, obj);
  });

  it('get obj', async () => {
    const bc = await redisHelper.get<TObj>('b');
    assert.deepEqual(bc, obj);
  });

  it('find all', async () => {
    const t = await redisHelper.find({ keyPattern: '*' });
    assert.strictEqual(true, t.length > 1);
  });

  it('find obj by key', async () => {
    const ba = await redisHelper.find<TObj>({ keyPattern: 'b*' });
    assert.strictEqual(ba.length, 1);
    assert.deepEqual(ba[0].key, 'test:b');
    assert.deepEqual(ba[0].value, obj);
  });

  it('find obj by value', async () => {
    const ba = await redisHelper.find<TObj>({ filter: (k) => k === 'test:b' });
    assert.strictEqual(ba.length, 1);
    assert.deepEqual(ba[0].key, 'test:b');
    assert.deepEqual(ba[0].value, obj);
  });

  it('del b by delMany', async () => {
    const dc = await redisHelper.delMany({ filter: (k) => k === 'test:b' });
    assert.strictEqual(dc, 1);
  });

  it('get deleted obj', async () => {
    const a = await redisHelper.get('b');
    assert.strictEqual(a, null);
  });

  it('find deleted obj', async () => {
    const ba = await redisHelper.find({ filter: (k) => k === 'test:b' });
    assert.strictEqual(ba.length, 0);
  });

  it('close', async () => {
    await connection.close();
  });
};
