var expect = require('chai').expect;
var PatternDocParser = require('./PatternDocParser.js');

describe('PatternDocParser', function () {

	describe('parse()', function () {
		var content = ''
			+ '/**\n'
			+ ' * @pattern PatternA\n'
			+ ' * @description A description for PatternA\n'
			+ ' * @param {Number} paramA - Required parameter for PatternA\n'
			+ ' * @param {Object} [paramB] - Optional parameter for PatternA\n'
			+ ' * @param {String} [paramC=some default] - Optional parameter for PatternA with a default value\n'
			+ ' * @example Example usage of PatternA\n'
			+ '```\n'
			+ '<pattern-a\n'
			+ '\tparam-a="123"\n'
			+ '\tparam-b="{ foo: true }"\n'
			+ '\tparam-c="some value"\n'
			+ '</pattern-a>\n'
			+ '```\n'
			+ ' */\n';
		var parser = new PatternDocParser();
		var patterns = parser.parse(content);

		it('should return the correct number of patterns', function () {
			expect( patterns.length ).to.equal(1);
		});

		describe('1st pattern', function () {
			var pattern = patterns[0];

			it('should have the correct pattern name', function () {
				expect( pattern.getName() ).to.equal('PatternA');
			});
			it('should have the correct pattern description', function () {
				expect( pattern.getDescription() ).to.equal('A description for PatternA');
			});
			it('should have the correct number of pattern parameters', function () {
				expect( pattern.getParameters().length ).to.equal(3);
			});

			describe('1st parameter', function () {
				var parameter = pattern.getParameters()[0];

				it('should have the correct parameter name', function () {
					expect( parameter.getName() ).to.equal('paramA');
				});
				it('should have the correct parameter type', function () {
					expect( parameter.getType() ).to.equal('Number');
				});
				it('should have the correct parameter description', function () {
					expect( parameter.getDescription() ).to.equal('Required parameter for PatternA');
				});
				it('should have the correct parameter default value', function () {
					expect( parameter.getDefaultValue() ).to.be.undefined;
				});
			});

			describe('2nd parameter', function () {
				var parameter = pattern.getParameters()[1];

				it('should have the correct parameter name', function () {
					expect( parameter.getName() ).to.equal('paramB');
				});
				it('should have the correct parameter type', function () {
					expect( parameter.getType() ).to.equal('Object');
				});
				it('should have the correct parameter description', function () {
					expect( parameter.getDescription() ).to.equal('Optional parameter for PatternA');
				});
				it('should have the correct parameter default value', function () {
					expect( parameter.getDefaultValue() ).to.be.undefined;
				});
			});

			describe('3rd parameter', function () {
				var parameter = pattern.getParameters()[2];

				it('should have the correct parameter name', function () {
					expect( parameter.getName() ).to.equal('paramC');
				});
				it('should have the correct parameter type', function () {
					expect( parameter.getType() ).to.equal('String');
				});
				it('should have the correct parameter description', function () {
					expect( parameter.getDescription() ).to.equal('Optional parameter for PatternA with a default value');
				});
				it('should have the correct parameter default value', function () {
					expect( parameter.getDefaultValue() ).to.equal('some default');
				});
			});

			it('should have the correct number of pattern examples', function () {
				expect( pattern.getExamples().length ).to.equal(1);
			});

			describe('1st example', function () {
				var example = pattern.getExamples()[0];

				it('should have the correct description', function () {
					expect( example.description ).to.equal('Example usage of PatternA');
				});
				it('should have the correct example', function () {
					expect( example.example ).to.equal('```\n<pattern-a\n\tparam-a="123"\n\tparam-b="{ foo: true }"\n\tparam-c="some value"\n</pattern-a>\n```\n');
				});
			});
		});
	});

});
