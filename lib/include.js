'use strict';
var path = require('path');
var bone = require('bone');
var akostream = bone.utils.stream;

module.exports = bone.wrapper(function(buffer, encoding, callback) {
	var ext = path.extname(this.source);
	var dir = path.dirname(this.source);
	var toRender = buffer.toString();

	var includeReg = [
		/<include\s+file=['"]([^\'\"]+)['"]\s*\/?>/g, // html tag 
		/\/\*\*?\s*?include\(['"](.*?)["']?\)\;?\s*?\*?\*\//g, // annotable
		/\/\/\s*?include\(['"](.*?)["']?\)\;?\s*?/g // annotable
	];

	var count = 0;
	var randomStr = function() {
		var string16 = Math.random().toString(36).substring(2).toUpperCase()+count++;

		return ['__BONE_', string16, string16.split('').reverse().join(''), '_BONE__'].join('');
	};

	var replaceFile = [];
	includeReg.forEach(function(regexp) {
		toRender = toRender.replace(regexp, function(match, filename) {
			var key = randomStr();
			var filepath = bone.fs.pathResolve(filename, dir);

			if(!bone.fs.existFile(filepath)) {
				console.log('not exist: '+filepath);
				return match;
			}
			replaceFile.push({
				holder: key,
				file: filepath
			});
			return key;
		});
	});

	if(!replaceFile.length) {
		return callback(null, buffer);
	}

	var readStream = [];
	replaceFile.forEach(function(info) {
		var stream = akostream.aggre(bone.fs.createReadStream(info.file));
		stream.on('data', function(chunk) {
			info.content = chunk.toString();
		});
		readStream.push(stream);
	});

	akostream.when(readStream, function() {
		replaceFile.forEach(function(info) {
			// replace use function to return string
			// prevent the $ symbol to be replaced
			toRender = toRender.replace(info.holder, function() {
				return info.content;
			});
		});
		callback(null, toRender);
	});
});