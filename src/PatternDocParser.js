var _ = require('lodash');
var Pattern = require('pattern').Pattern;
var PatternParameter = require('pattern').PatternParameter;

/**
 * @constructs
 */
function PatternDocParser() {
	configureFields();
}

/* ---------------------------------------------------------------------
 * Public
 * --------------------------------------------------------------------- */

/**
 * Parses patterns from source content.
 *
 * @param {String} source
 * @return {Array.<Pattern>}
 */
PatternDocParser.prototype.parse = parse;

/* ---------------------------------------------------------------------
 * Private
 * --------------------------------------------------------------------- */

function configureFields() {
	var parser = this;

	this.fields = [];

	this.fields.push({
		name: 'name',
		isMatch: function (line) {
			return isMatch(line, '@pattern');
		},
		parse: function (lines, pattern) {
			var name = getSingleLineValue(lines, '@pattern');
			pattern.setName(name);
		}
	});

	this.fields.push({
		name: 'description',
		isMatch: function (line) {
			return isMatch(line, '@description');
		},
		parse: function (lines, pattern) {
			var description = getMultiLineValue(lines, '@description', parser);
			pattern.setDescription(description);
		}
	});

	this.fields.push({
		name: 'parameter',
		isMatch: function (line) {
			return isMatch(line, '@param');
		},
		parse: function (lines, pattern) {
			var paramStr = getSingleLineValue(lines, '@param');
			var paramRegex = /^\s*\{(.*)\}\s*(\S+)\s*(?:-)?\s*(.*)$/;
			var paramMatches = paramStr.match(paramRegex);
			var type = paramMatches[1].trim();
			var description = paramMatches[3].trim();

			var nameStr = paramMatches[2].trim();
			var nameRegex = /^(?:\[)?([^=\]]+)(?:=([^=\]]+))?(?:\])?$/;
			var nameMatches = nameStr.match(nameRegex);
			var name = nameMatches[1];
			var defaultValue = nameMatches[2];

			var parameter = new PatternParameter();
			parameter.setName(name);
			parameter.setDescription(description);
			parameter.setType(type);
			parameter.setDefaultValue(defaultValue);

			pattern.addParameter(parameter);
		}
	});

	this.fields.push({
		name: 'example',
		isMatch: function (line) {
			return isMatch(line, '@example');
		},
		parse: function (lines, pattern) {
			var description = getSingleLineValue(lines, '@example', parser);
			var example = getMultiLineValue(lines, '', parser);
			pattern.addExample(example, description);
		}
	});
}

function parse(content) {
	var commentBlocks = getCommentBlocks(content);
	var patterns = _.map(commentBlocks, parseCommentBlock);
	patterns = _.flatten(patterns);

	return patterns;
}

function getCommentBlocks(content) {
	var commentBlockRegex = /\/\*([\s\S]+?)\*\//g;
	var commentBlocks = content.match(commentBlockRegex);
	return commentBlocks;
}

function parseCommentBlock(commentBlock) {
	var patterns = [];
	var pattern;
	var lines = commentBlock.split('\n');

	while (lines.length) {
		var field = getMatchingField(lines[0], this);

		if (field && field.name === 'name') {
			pattern = new Pattern();
			patterns.push(pattern);
		}

		if (field && pattern) {
			field.parse(lines, pattern);
		}
		else {
			lines.shift();
		}
	}

	patterns = Pattern.merge(patterns);
	return patterns;
}

function getMatchingField(line, parser) {
	var field = _.find(parser.fields, function (field) {
		return field.isMatch(line);
	});
	return field;
}

function isMatch(line, fieldName) {
	var regex = new RegExp(fieldName + '\\b');
	return regex.test(line);
}

function getSingleLineValue(lines, fieldName) {
	var regex = new RegExp('[\\s\\*]*' + fieldName + '\\s+(.*)');
	var fieldValue = lines.shift().replace(regex, '$1').trim();
	return fieldValue;
}

function getMultiLineValue(lines, fieldName, parser) {
	var fieldValue;
	var line;
	var parts = [];
	var part;
	var ignoreRegex = new RegExp('^[\\s\\*-]*(?:' + fieldName + '\\s+)?[/]*');

	do {
		line = lines.shift();

		if (parts.length && getMatchingField(line, parser)) {
			// Start of a different field
			lines.unshift(line);
			break;
		}

		part = line.replace(ignoreRegex, '').trim();
		parts.push(part);
	} while (part && lines.length);

	fieldValue = parts.join(' ').trim();
	return fieldValue;
}

module.exports = PatternDocParser;
