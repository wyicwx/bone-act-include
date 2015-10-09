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

dist.src('../include/include_minify.js')
	.act(include);

dist.src('../include/include_minify_escape.js')
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

	it('include minify', function(done) {
		bone.fs.readFile('dist/include_minify.js', function(err, buffer) {
			if(err) {
				return done(false);
			}

			var ctxs = buffer.toString().split(/[\r\n]/);
			var result_html = '<div class="a"><div class="b"><a href=\'javascript:void(0)\' class="c"><span class="d"></span></a></div></div>';
			var result_js = 'console.log("123");alert(111);prompt(\'test\');';
			var result_css = '*{margin:0;padding:0}ul,li{list-style:none}a{text-decoration:none}';
			var result_none = 'noextname';

			if(ctxs[0] == result_html && ctxs[1] == result_js && ctxs[2] == result_css && ctxs[3] == result_none) {
				done();
			} else {
				done(false);
			}
		});
	});
	it('include minify escape', function(done) {
		bone.fs.readFile('dist/include_minify_escape.js', function(err, buffer) {
			if(err) {
				return done(false);
			}

			var ctx = buffer.toString();
			var result_html = '<div class=\\\"a\\\"><div class=\\\"b\\\"><a href=\\\'javascript:void(0)\\\' class=\\\"c\\\"><span class=\\\"d\\\"></span></a></div></div>';

			if(ctx == result_html) {
				done();
			} else {
				done(false);
			}
		});
	});
});