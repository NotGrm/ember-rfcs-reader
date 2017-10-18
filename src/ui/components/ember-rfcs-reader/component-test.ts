import { setupRenderingTest } from '@glimmer/test-helpers';
import hbs from '@glimmer/inline-precompile';

const { module, test } = QUnit;

module('Component: ember-rfcs-reader', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await this.render(hbs`<ember-rfcs-reader />`);
    assert.equal(this.containerElement.textContent, 'Welcome to Glimmer!\n');
  });
});
