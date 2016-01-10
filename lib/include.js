'use strict';
var path = require('path');
var cssmin = require('cssmin');
var jsmin = require('jsmin2');

function htmlminify(str, options) {
	options || (options = {});

	str = str
		.replace(/(\n|\r)/g, "") //del \n
		.replace(/>([\x20\t]+)</g, "><") //del blank & tab
		.replace(/<!--.+?-->/g, "") // del comment
		.replace(/^\s+|\s+$/g, "") // trim blank

	if(options.escapeQuote) {
	str = str
		.replace(/\'/g, "\\'")
		.replace(/\"/g, '\\"')
	}

	return str.trim();	
}

function cssminify(str) {
	return cssmin(str).trim();
}

function jsminify(str) {
	return jsmin(str).code.trim();
}

module.exports.act = function(buffer, encoding, callback) {
	var ext = path.extname(this.source);
	var dir = path.dirname(this.source);
	var toRender = buffer.toString();
	var bone = this.bone;
	var akostream = bone.utils.stream;
	var fs = this.fs;
	// set cacheable flag
	this.cacheable();

	var includeReg = [
		[
			/<include\s+file=['"]([^\'\"]+)['"]\s*\/?>/gi, 'html'
		],
		[
			/\/\*\s*?include\(['"](.*?)["'](.*?)\)\;?\s*?\*\//gi, 'mutil'
		],
		[
			/\/\*\*\s*?include\(['"](.*?)["'](.*?)\)\;?\s*?\*\//gi, 'mutil'
		],
		[
			/\/\/\s*?include\(['"](.*?)["'](.*?)\)\;?\s*?/gi, 'js'
		]
	];

	var count = 0;
	var randomStr = function() {
		var string16 = Math.random().toString(36).substring(2).toUpperCase()+count++;

		return ['__BONE_', string16, string16.split('').reverse().join(''), '_BONE__'].join('');
	};

	var replaceFile = [];
	includeReg.forEach(function(regexpArr) {
		var regexp = regexpArr[0];
		var regexpType = regexpArr[1];

		toRender = toRender.replace(regexp, function(match, filename) {
			var option;

			try {
				if(regexpType == 'mutil') {
					match = match.replace(/;/g, '');
					var tpl = bone.utils.template(match, {
						interpolate: /\/\*\*?([\s\S]+?)\*?\*\//g
					});
					tpl({
						include: function(file, opt) {
							if(typeof file === 'string') {
								filename = file;
								option = opt;
							}
						}
					});
				}
			} catch(e) {

			}
			var key = randomStr();
			var filepath = fs.pathResolve(filename, dir);

			if(!fs.existFile(filepath)) {
				bone.log.warn('bone-act-include','not exist '+filepath);
				return match;
			}

			replaceFile.push({
				holder: key,
				file: filepath,
				option: option || {},
				extname: path.extname(filepath)
			});
			return key;
		});
	});

	if(!replaceFile.length) {
		return callback(null, buffer);
	}

	var readStream = [];
	replaceFile.forEach(function(info) {
		var stream = akostream.aggre(fs.createReadStream(info.file));
		stream.on('data', function(chunk) {
			var ctn = chunk.toString();
			if(info.option.minify) {
				switch(info.extname) {
					case '.js': 
						info.content = jsminify(ctn);
					break;
					case '.css':
						info.content = cssminify(ctn);
					break;
					case '.html':
					case '.htm':
						info.content = htmlminify(ctn, {
							escapeQuote: info.option.escape
						});
					break;
					default: 
						info.content = ctn;
				}
			} else {
				info.content = ctn;
			}
		});
		readStream.push(stream);
	});

	akostream.when(readStream, function() {
		replaceFile.forEach(function(info) {
			// replace use function to return string
			// prevent the $ symbol to be replaced
			toRender = toRender.replace(info.holder, function() {
				return info.content || '';
			});
		});
		callback(null, toRender);
	});
};