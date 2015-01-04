var expect = require('chai').expect;
var PatternDocParser = require('./PatternDocParser.js');

describe('PatternDocParser', function () {

	describe('parse()', function () {
		var content = ''
			+ '/* ----------------------------------------\n'
			+ ' * @pattern PatternA\n'
			+ ' * @description A description for PatternA\n'
			+ ' * @param {Number} paramA - Required parameter for PatternA\n'
			+ ' * @param {Object} [paramB] - Optional parameter for PatternA\n'
			+ ' * @param {String} [paramC=some default] - Optional parameter for PatternA with a default value\n'
			+ ' * '
			+ ' * @example Basic usage of PatternA\n'
			+ '```\n'
			+ '<pattern-a param-a="123"></pattern-a>\n'
			+ '```\n'
			+ ' * '
			+ ' * @example Advanced usage of PatternA\n'
			+ '```\n'
			+ '<pattern-a\n'
			+ '\tparam-a="123"\n'
			+ '\tparam-b="{ foo: true }"\n'
			+ '\tparam-c="some value"\n'
			+ '></pattern-a>\n'
			+ '```\n'
			+ ' * ---------------------------------------- */\n'
			+ '\n'
			+ 'Intermediate code\n'
			+ '@param NotAParam\n'
			+ '@pattern NotAPattern\n'
			+ '@param NotAnotherParam\n'
			+ '\n'
			+ '/* ----------------------------------------\n'
			+ ' * @pattern PatternB\n'
			+ ' * @description A description for PatternB\n'
			+ ' * @param {Number} paramA - Required parameter for PatternB\n'
			+ ' * @param {Object} [paramB] - Optional parameter for PatternB\n'
			+ ' * @param {String} [paramC=another default] - Optional parameter for PatternB with a default value\n'
			+ ' * '
			+ ' * @example Basic usage of PatternB\n'
			+ '```\n'
			+ '<pattern-b param-a="456"></pattern-b>\n'
			+ '```\n'
			+ ' * '
			+ ' * @example Advanced usage of PatternB\n'
			+ '```\n'
			+ '<pattern-b\n'
			+ '\tparam-a="456"\n'
			+ '\tparam-b="{ bar: false }"\n'
			+ '\tparam-c="another value"\n'
			+ '></pattern-b>\n'
			+ '```\n'
			+ ' * ---------------------------------------- */\n';
		var parser = new PatternDocParser();
		var patterns = parser.parse(content);

		it('should return the correct number of patterns', function () {
			expect( patterns.length ).to.equal(2);
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
				expect( pattern.getExamples().length ).to.equal(2);
			});

			describe('1st example', function () {
				var example = pattern.getExamples()[0];

				it('should have the correct description', function () {
					expect( example.description ).to.equal('Basic usage of PatternA');
				});
				it('should have the correct example', function () {
					expect( example.example ).to.equal('```\n<pattern-a param-a="123"></pattern-a>\n```');
				});
			});

			describe('2nd example', function () {
				var example = pattern.getExamples()[1];

				it('should have the correct description', function () {
					expect( example.description ).to.equal('Advanced usage of PatternA');
				});
				it('should have the correct example', function () {
					expect( example.example ).to.equal('```\n<pattern-a\n\tparam-a="123"\n\tparam-b="{ foo: true }"\n\tparam-c="some value"\n></pattern-a>\n```');
				});
			});
		});

		describe('2nd pattern', function () {
			var pattern = patterns[1];

			it('should have the correct pattern name', function () {
				expect( pattern.getName() ).to.equal('PatternB');
			});
			it('should have the correct pattern description', function () {
				expect( pattern.getDescription() ).to.equal('A description for PatternB');
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
					expect( parameter.getDescription() ).to.equal('Required parameter for PatternB');
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
					expect( parameter.getDescription() ).to.equal('Optional parameter for PatternB');
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
					expect( parameter.getDescription() ).to.equal('Optional parameter for PatternB with a default value');
				});
				it('should have the correct parameter default value', function () {
					expect( parameter.getDefaultValue() ).to.equal('another default');
				});
			});

			it('should have the correct number of pattern examples', function () {
				expect( pattern.getExamples().length ).to.equal(2);
			});

			describe('1st example', function () {
				var example = pattern.getExamples()[0];

				it('should have the correct description', function () {
					expect( example.description ).to.equal('Basic usage of PatternB');
				});
				it('should have the correct example', function () {
					expect( example.example ).to.equal('```\n<pattern-b param-a="456"></pattern-b>\n```');
				});
			});

			describe('2nd example', function () {
				var example = pattern.getExamples()[1];

				it('should have the correct description', function () {
					expect( example.description ).to.equal('Advanced usage of PatternB');
				});
				it('should have the correct example', function () {
					expect( example.example ).to.equal('```\n<pattern-b\n\tparam-a="456"\n\tparam-b="{ bar: false }"\n\tparam-c="another value"\n></pattern-b>\n```');
				});
			});
		});
	});

});
