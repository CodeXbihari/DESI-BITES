import test from 'node:test';
import assert from 'node:assert/strict';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { seedStage1 } from '../native/seedStage1.mjs';
import { environment, webClient } from './helpers.mjs';
import { item } from './fixtures.mjs';

test('guarded native fixtures create synthetic Auth identities and only the owner membership grants access', async () => {
  const env = await environment(); let client;
  try {
    await env.withSecurityRulesDisabled(async ctx => {
      await setDoc(doc(ctx.firestore(), 'shops/shop-a/menuItems/fixture-item'), { ...item, revision: 17, pricePaise: 11100 });
    });
    const original = globalThis.fetch;
    globalThis.fetch = async (url, options) => {
      if (url.endsWith('accounts:lookup') && JSON.parse(options.body).localId?.[0] === 'stage1-owner') throw new Error('Injected partial Auth failure');
      return original(url, options);
    };
    try { await assert.rejects(() => seedStage1(), /Injected partial Auth failure/); }
    finally { globalThis.fetch = original; }
    await env.withSecurityRulesDisabled(async ctx => {
      assert.equal((await getDoc(doc(ctx.firestore(), 'shops/shop-a/menuItems/fixture-item'))).data().revision, 17);
    });
    // Retry reuses the first created synthetic account, without deleting it.
    await seedStage1();
    await seedStage1();
    client = await webClient();
    const signIn = role => signInWithEmailAndPassword(client.auth, `stage1-${role}@example.invalid`, 'Stage1_synthetic_only_123!');
    await signIn('owner');
    assert.equal(client.auth.currentUser.uid, 'stage1-owner');
    assert.equal((await client.repositories.menu.ownerList('shop-a')).length, 2);
    await client.repositories.menu.updateExisting('shop-a', 'fixture-item', { available: false }, 1);
    await seedStage1(); // Deliberately reset the known fixture namespace atomically.
    assert.equal((await getDoc(doc(client.db, 'shops/shop-a/menuItems/fixture-item'))).data().revision, 1);
    await signIn('customer');
    assert.equal((await client.repositories.profile.get()).id, 'stage1-customer');
    await assert.rejects(() => client.repositories.menu.ownerList('shop-a'), /owner/);
    await assert.rejects(() => client.repositories.menu.updateExisting('shop-a', 'fixture-item', { pricePaise: 1 }, 2), /owner/);
    await signIn('unprivileged');
    assert.equal(await client.repositories.membership.get('shop-a'), null);
    await assert.rejects(() => client.repositories.menu.ownerList('shop-a'), /owner/);
  } finally {
    await client?.close(); await env.cleanup();
  }
});
