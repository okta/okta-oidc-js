import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { initAuthService } from '../../helpers/stub-auth-service';

module('Unit | Route | WithAuth', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    initAuthService();

    let route = this.owner.lookup('route:with-auth');

    assert.ok(route);
  });
});
