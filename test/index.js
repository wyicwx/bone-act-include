var bone = require('bone');
var include = require('../lib/include.js');

var dist = bone.dest('dist');

dist.src('../include/htmlstyle.html')
	.act(include);

dist.src('../include/jsstyle.js')
	.act(include);

dist.src('../include/cssstyle.css')
	.act(include);

dist.src('../include/mix')
	.act(include);

dist.src('../include/empty.js')
	.act(include);

dist.src('../include/notExist.js')
	.act(include);



bone.setup('./test');


describe('bone-act-include', function() {
	it('include html style', function(done) {
		bone.fs.readFile('dist/htmlstyle.html', function(err, buffer) {
			if(err) {
				return done(false);
			}

			var ctx = buffer.toString();

			if(ctx == 'html') {
				done();
			} else {
				done(false);
			}
		});
	});

	it('include js style', function(done) {
		bone.fs.readFile('dist/jsstyle.js', function(err, buffer) {
			if(err) {
				return done(false);
			}

			var ctx = buffer.toString();

			if(ctx == 'js') {
				done();
			} else {
				done(false);
			}
		});
	});

	it('include css style', function(done) {
		bone.fs.readFile('dist/cssstyle.css', function(err, buffer) {
			if(err) {
				return done(false);
			}

			var ctx = buffer.toString();

			if(ctx == 'css') {
				done();
			} else {
				done(false);
			}
		});
	});

	it('mix include style', function(done) {
		bone.fs.readFile('dist/mix', function(err, buffer) {
			if(err) {
				return done(false);
			}

			var ctx = buffer.toString();

			if(ctx === 'html\njs\ncss') {
				done();
			} else {
				done(false);
			}
		});
	});

	it('empty include style', function(done) {
		bone.fs.readFile('dist/empty.js', function(err, buffer) {
			if(err) {
				return done(false);
			}

			var ctx = buffer.toString();

			if(ctx === 'empty') {
				done();
			} else {
				done(false);
			}
		});
	});


	it('empty include style', function(done) {
		bone.fs.readFile('dist/notExist.js', function(err, buffer) {
			if(err) {
				return done(false);
			}

			var ctx = buffer.toString();

			if(ctx == "//include('../raw/notExist.js');") {
				done();
			} else {
				done(false);
			}
		});
	});
});