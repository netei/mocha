/**
 * Module dependencies.
 */

var Base = require('./base');
var errorStackParser = require('error-stack-parser');

/**
 * Expose `List`.
 */

exports = module.exports = List;

function getFormattedError(test, err, full) {
  test = clean(test);
  test.err = err;
  if (err instanceof Error) {
    test.err = {
      actual: err.actual,
      expected: err.expected,
      message: err.message,
    };
    Object.keys(err).forEach(function (key) {
      if (full) {
        test.err[key] = err[key];
      }
    });
    test.err.stack = errorStackParser.parse(err)
    if (err.at) {
      test.err.at = err.at.filename + ':' + err.at.line + ':' + err.at.column;
    }
  }
  return test;
}

/**
 * Initialize a new `List` test reporter.
 *
 * @api public
 * @param {Runner} runner
 */
function List(runner) {
  Base.call(this, runner);

  var self = this;
  var total = runner.total;

  runner.on('start', function() {
    console.log(JSON.stringify(['start', { total: total }]));
  });

  runner.on('pass', function(test) {
    console.log(JSON.stringify(['pass', clean(test)]));
  });

  runner.on('fail', function(test, err) {
    var errF = getFormattedError(test, err, true);
    try {
      console.log(JSON.stringify(['fail', errF]));
    } catch (e) {
      errF = getFormattedError(test, err, false);
      console.log( Object.keys(errF));
      console.log(JSON.stringify(['fail', errF]));
    }
  });

  runner.on('end', function() {
    console.log(JSON.stringify(['end', self.stats]));
  });
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @api private
 * @param {Object} test
 * @return {Object}
 */
function clean(test) {
  return {
    title: test.title,
    fullTitle: test.fullTitle(),
    duration: test.duration,
    sync: test.sync,
    async: test.async,
    timedOut: test.timedOut,
    pending: test.pending,
    file: test.file,
    parentTitle: test.parent.title,
    state: test.state,
    speed: test.speed
  };
}
