var _ = require('lodash');
var Pattern = require('patternly-pattern').Pattern;
var PatternParameter = require('patternly-pattern').PatternParameter;

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
PatternDocParser.prototype.parse = function(content) {
	var commentBlocks = getCommentBlocks(content);
	var patterns = _.map(commentBlocks, parseCommentBlock);
	patterns = _.flatten(patterns);

	return patterns;
};

/* ---------------------------------------------------------------------
 * Private
 * --------------------------------------------------------------------- */

function configureFields() {
	var parser = this;

	this.fields = [];

	this.fields.push({
		name: 'name',
		isMatch: function(line) {
			return isMatch(line, '@pattern');
		},
		parse: function(lines, pattern) {
			var name = getSingleLineValue(lines, '@pattern');
			pattern.setName(name);
		}
	});

	this.fields.push({
		name: 'description',
		isMatch: function(line) {
			return isMatch(line, '@description');
		},
		parse: function(lines, pattern) {
			var description = getMultiLineValue(lines, '@description', parser);

			description = description
				.replace(/\s*(-{3,})\s*/gm, '\n$1\n')  // Moves a series of 3 or more dashes to its own line
				.replace(/\n([^\n]+)\n(-{3,})\n/g, '\n\n$1\n$2\n');  // Adds an extra newline before the section header

			pattern.setDescription(description);
		}
	});

	this.fields.push({
		name: 'parameter',
		isMatch: function(line) {
			return isMatch(line, '@param');
		},
		parse: function(lines, pattern) {
			var paramStr = getSingleLineValue(lines, '@param');
			var paramRegex = /^\s*\{(.*)\}\s*(\[[^\]]+\]|\S+)\s*(?:-)?\s*(.*)$/;
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
		isMatch: function(line) {
			return isMatch(line, '@example');
		},
		parse: function(lines, pattern) {
			var description = getSingleLineValue(lines, '@example', parser);
			var content = getMultiLineValue(lines, '', parser, { preserveWhitespace: true });
			var blocks = content.match(/```(.*\n)+?```/gm);
			var codeBlocks = _.map(blocks, function(block) {
				var syntaxMatches = block.match(/```(\S+)/);
				var code = block
					.replace(/```\S*\n/m, '')  // Removes leading ```[syntax]
					.replace(/\n```.*/m, '');  // Removes trailing ```

				code = removeCommonIndent(code);

				return {
					syntax: syntaxMatches ? syntaxMatches[1] : null,
					code: code,
				};
			});
			pattern.addExample(description, codeBlocks);
		}
	});

	this.fields.push({
		name: 'meta',
		isMatch: function(line) {
			return isMatch(line, '@meta');
		},
		parse: function(lines, pattern) {
			var meta = getSingleLineKeyValue(lines, '@meta');
			pattern.addMeta(meta.key, meta.value);
		}
	});
}

function getCommentBlocks(content) {
	var commentBlockRegex = /\/\*([\s\S]+?)\*\//g;
	var commentBlocks = content.match(commentBlockRegex);

	commentBlocks = _.map(commentBlocks, function(commentBlock) {
		// Removes comment block start/end dividers such as ----
		return /\/\*[\s-=\*]*([\s\S]+?)\n?[\s-=\*]*\*\//g.exec(commentBlock)[1];
	});

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
	var field = _.find(parser.fields, function(field) {
		return field.isMatch(line);
	});
	return field;
}

function isMatch(line, fieldName) {
	var regex = new RegExp(fieldName + '\\b');
	return regex.test(line);
}

function getSingleLineValue(lines, fieldName) {
	var regex = new RegExp('[\\s\\*]*' + fieldName + '\\s*(.*)');
	var fieldValue = lines.shift().replace(regex, '$1').trim();
	return fieldValue;
}

function getSingleLineKeyValue(lines, fieldName) {
	var value = getSingleLineValue(lines, fieldName);
	var keyValue = value.match(/^\s*(\S+)\s+(?:-\s*)?(.*?)\s*$/);  // Extracts '{key} - {value}' (dash is optional)
	return {
		key: keyValue ? keyValue[1] : null,
		value: keyValue ? keyValue[2] : null,
	};
}

function getMultiLineValue(lines, fieldName, parser, options) {
	options = options || {};

	var line;
	var fieldValueLine;
	var fieldValue = '';

	do {
		line = lines.shift();

		if (fieldValue && getMatchingField(line, parser)) {
			// Start of a different field
			lines.unshift(line);
			break;
		}

		fieldValueLine = line
			.replace(/^\s*\*\s*/, '')  // Removes leading comment borders
			.replace(/\s*$/, '');  // Removes trailing whitespace

		if (!fieldValueLine) {
			// Empty lines are treated as newlines
			fieldValue += '\n';
		}
		else if (options.preserveWhitespace) {
			// Whitespace is preserved verbatim
			fieldValue += fieldValueLine + '\n';
		}
		else {
			// Newlines are converted to spaces
			fieldValue += fieldValueLine + ' ';
		}
	} while (lines.length);

	// Removes the leading field name
	fieldValue = fieldValue.replace(new RegExp('^' + fieldName + '\\s*'), '');

	// Removes whitespace
	fieldValue = fieldValue.replace(/\s+\n/g, '\n');
	fieldValue = options.preserveWhitespace ? fieldValue : fieldValue.trim();
	fieldValue = removeCommonIndent(fieldValue);

	return fieldValue;
}

function removeCommonIndent(text) {
	var lines = text.split('\n');
	var indents = _.map(lines, function(line) {
		var indentMatch = line.match(/^\s+/);
		var indent = indentMatch ? indentMatch[0] : '';
		return indent;
	});
	var commonIndent = getLongestCommonSubstring(indents);

	lines = _.map(lines, function(line) {
		return line.replace(new RegExp('^' + commonIndent), '');
	});
	return lines.join('\n');
}

/**
 * Credit: http://stackoverflow.com/a/1917041
 *
 * @param {Array.<String>} strings
 * @return {String}
 */
function getLongestCommonSubstring(strings) {
	strings = strings.concat().sort();

	var first = _.first(strings);
	var last = _.last(strings);
	var index = 0;

	while (index < first.length && first.charAt(index) === last.charAt(index))
		index++;

	return first.substring(0, index);
}

module.exports = PatternDocParser;
