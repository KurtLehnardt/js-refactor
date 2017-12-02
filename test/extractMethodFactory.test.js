'use strict';

let mocker = require('./mocker');
let motherContainer = require('./test-utils/mother-container');

let testHelperFactory = require('./test-utils/testHelperFactory');

let readSource = require('./test-utils/read-source');
let prettyJson = require('./test-utils/test-utils').prettyJson;

let approvalsConfig = require('./test-utils/approvalsConfig');
require('approvals').configure(approvalsConfig).mocha('./test/approvals');

let sinon = require('sinon');

describe('Extract Method', function () {

    let applySetEditSpy;
    let subcontainer;
    let vsCodeProperties;
    let setupOptions;
    let quickPickSpy;

    beforeEach(function () {
        const testHelper = testHelperFactory();
        setupOptions = {
            selectedScopeIndex: 0
        };

        subcontainer = testHelper.subcontainer;
        applySetEditSpy = testHelper.applySetEditSpy;
        vsCodeProperties = testHelper.vsCodeProperties;

        applySetEditSpy = sinon.spy(function () {
            return {
                then: function (callback) {
                    callback()
                }
            };
        });

        mocker.getMock('editActionsFactory').api.applySetEdit = applySetEditSpy;

        quickPickSpy = sinon.spy(function(selectionItems, options, callback) {
            callback(selectionItems[setupOptions.selectedScopeIndex]);
        });

        mocker.getMock('logger').api.quickPick = quickPickSpy;
        mocker.getMock('logger').api.input = (options, callback) => callback('aNewFunction');
    });

    it('should log an error if selection is empty', function () {
        const sourceTokens = readSource('./test/fixtures/extractMethod/extractMethod.js');
        const activeTextEditorOptions = {
            optionsData: {
                lines: sourceTokens
            }
        };

        const activeTextEditor = motherContainer.buildData('activeTextEditor', activeTextEditorOptions);
        vsCodeProperties.activeTextEditor = activeTextEditor;

        const infoAction = mocker.getMock('logger').api.info;
        const extractMethodFactory = subcontainer.build('extractMethodFactory');

        const unusedObject = null;
        const callback = function () { };

        extractMethodFactory(unusedObject, callback)();

        this.verify(prettyJson(infoAction.args));
    });

    it('should provide scope options', function () {
        const sourceTokens = readSource('./test/fixtures/extractMethod/extractMethod.js');
        const activeTextEditorOptions = {
            optionsData: {
                lines: sourceTokens,
                selection: {
                    start: [5, 12],
                    end: [7, 13]
                }
            }
        };

        const activeTextEditor = motherContainer.buildData('activeTextEditor', activeTextEditorOptions);
        vsCodeProperties.activeTextEditor = activeTextEditor;

        const extractMethodFactory = subcontainer.build('extractMethodFactory');

        const unusedObject = null;
        const callback = function () { };

        extractMethodFactory(unusedObject, callback)();

        this.verify(prettyJson(quickPickSpy.args));
    });

    it('should extract selected lines to the local function scope as chosen by the user', function() {
        setupOptions.selectedScopeIndex = 2;

        const sourceTokens = readSource('./test/fixtures/extractMethod/extractMethod.js');
        const activeTextEditorOptions = {
            optionsData: {
                lines: sourceTokens,
                selection: {
                    start: [11, 8],
                    end: [13, 9]
                }
            }
        };

        const activeTextEditor = motherContainer.buildData('activeTextEditor', activeTextEditorOptions);
        vsCodeProperties.activeTextEditor = activeTextEditor;

        const extractMethodFactory = subcontainer.build('extractMethodFactory');

        const unusedObject = null;
        const callback = function () { };

        extractMethodFactory(unusedObject, callback)();

        this.verify(prettyJson(applySetEditSpy.args));
    });
});