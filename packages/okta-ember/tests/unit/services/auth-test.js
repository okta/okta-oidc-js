import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from 'ember-test-helpers';

module('Unit | Service | auth', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', async function(assert) {
    let service = this.owner.lookup('service:auth');
    await settled();
    assert.ok(service);
  });
});
