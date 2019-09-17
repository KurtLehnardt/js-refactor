'use strict';

const fs = require('fs');
const container = require('../../../container');
const testUtils = require('../../test-utils/test-utils');
const motherContainer = require('../../test-utils/mother-container');

require('../../test-utils/approvalsConfig');

describe('parser', function () {

    let parser;
    let activeEditor;

    beforeEach(function () {
        const subcontainer = container.new();

        const loggerFake = {
            error: () => {}
        };

        activeEditor = motherContainer.buildData('activeTextEditor');

        const vsCodeHelperFactoryFake = function () {
            return {
                getActiveEditor: () => activeEditor
            }
        };

        subcontainer.register(() => vsCodeHelperFactoryFake, 'vsCodeHelperFactory');
        subcontainer.register(() => loggerFake, 'logger');

        parser = subcontainer.build('parser');
    });

    describe('parse', function () {

        it('should parse ECMA standard Javascript source', function () {
            const sourceText = `'use strict';
            
            const myFn = () => 'foo';
            console.log(myFn());`;

            const ast = parser.parse(sourceText);

            this.verify(testUtils.prettyJson(ast));
        });

        it('should parse JSX source', function () {

            activeEditor._documentData._languageId = 'javascriptreact';

            const jsxSourceText = `var ipsumText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.';
            
            ReactDOM.render(
              <div>
                <a className="button">Button</a>
                <div>{ipsumText}</div>
              </div>,
              document.getElementById('impl')
            );`;

            const ast = parser.parse(jsxSourceText);

            this.verify(testUtils.prettyJson(ast));
        });


        it('should parse a complex JSX file', function () {
            activeEditor._documentData._languageId = 'javascriptreact';

            const jsxSource = fs.readFileSync('./test/fixtures/example-files/test.jsx', { encoding: 'utf8' });

            const ast = parser.parse(jsxSource);

            this.verify(testUtils.prettyJson(ast));
        });


    });

    describe('parseSourceLines', function () {

        it('should parse new-line split JS source code', function () {
            const sourceText = `'use strict';
            
            const myFn = () => 'foo';
            console.log(myFn());`;

            const ast = parser.parseSourceLines(sourceText.split('\n'));

            this.verify(testUtils.prettyJson(ast));
        });

        it('should parse new-line split JSX source code', function () {
            activeEditor._documentData._languageId = 'javascriptreact';

            const jsxSourceText = `var ipsumText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.';
            
            ReactDOM.render(
              <div>
                <a className="button">Button</a>
                <div>{ipsumText}</div>
              </div>,
              document.getElementById('impl')
            );`;

            const ast = parser.parseSourceLines(jsxSourceText.split('\n'));

            this.verify(testUtils.prettyJson(ast));
        });

    });

});