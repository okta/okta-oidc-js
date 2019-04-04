import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | with-auth', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:with-auth');
    assert.ok(route);
  });
});
