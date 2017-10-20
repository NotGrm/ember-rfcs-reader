import timeago from './helper';

const { module, test } = QUnit;

module('Helper: timeago', function(hooks) {
  test('it computes', function(assert) {
    assert.equal(timeago([]), undefined);
  });
});
