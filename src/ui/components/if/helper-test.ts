import if from './helper';

const { module, test } = QUnit;

module('Helper: if', function(hooks) {
  test('it computes', function(assert) {
    assert.equal(if([]), undefined);
  });
});
