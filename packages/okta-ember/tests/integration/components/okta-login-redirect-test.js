import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { initAuthService } from '../../helpers/stub-auth-service';

module('Integration | Component | okta-login-redirect', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    initAuthService();

    await render(hbs`{{okta-login-redirect}}`);

    assert.equal(this.element.textContent.trim(), '');

    // Template block usage:
    await render(hbs`
      {{#okta-login-redirect}}
        template block text
      {{/okta-login-redirect}}
    `);

    assert.equal(this.element.textContent.trim(), 'template block text');
  });
});
