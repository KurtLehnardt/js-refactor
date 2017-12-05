'use strict';

function astHelper(estraverse, typeHelper) {

    function noOp() { }

    function coordsInNode(selectionCoords, astNode) {
        const nodeStart = astNode.loc.start;
        const nodeEnd = astNode.loc.end;

        const afterStartLine = selectionCoords.start.line > nodeStart.line;
        const afterStartCharacter = selectionCoords.start.line === nodeStart.line
            && selectionCoords.start.column >= nodeStart.column;

        const beforeEndLine = selectionCoords.end.line < nodeEnd.line;
        const beforeEndCharacter = selectionCoords.end.line === nodeEnd.line
            && selectionCoords.end.column <= nodeEnd.column;

        return (afterStartLine || afterStartCharacter) && (beforeEndLine || beforeEndCharacter);
    }

    function nodeInCoords(selectionCoords, astNode) {
        const nodeStart = astNode.loc.start;
        const nodeEnd = astNode.loc.end;

        const afterStartLine = selectionCoords.start.line < nodeStart.line;
        const afterStartCharacter = selectionCoords.start.line === nodeStart.line
            && selectionCoords.start.column <= nodeStart.column;

        const beforeEndLine = selectionCoords.end.line > nodeEnd.line;
        const beforeEndCharacter = selectionCoords.end.line === nodeEnd.line
            && selectionCoords.end.column >= nodeEnd.column;

        return (afterStartLine || afterStartCharacter) && (beforeEndLine || beforeEndCharacter);
    }

    function nodeMatchesCoords(selectionCoords, astNode) {
        const isNodeMatch = selectionCoords.start.line === astNode.loc.start.line
            && selectionCoords.start.column === astNode.loc.start.column
            && selectionCoords.end.line === astNode.loc.end.line
            && selectionCoords.end.column === astNode.loc.end.column;

        return isNodeMatch;
    }

    function onMatch(nodeMatchCheck, nodeAction) {
        return function (astNode) {
            if (nodeMatchCheck(astNode)) {
                nodeAction(astNode);
            }
        }
    }

    function isNodeType(nodeTypes) {
        return function (astNode) {
            return nodeTypes.indexOf(astNode.type) > -1;
        };
    }

    function functionOrDefault(userFunction) {
        return typeof userFunction === 'function' ? userFunction : noOp;
    }

    function traverse(ast, traversalOptions) {
        const traversal = {
            enter: functionOrDefault(traversalOptions.enter),
            leave: functionOrDefault(traversalOptions.leave)
        }

        estraverse.traverse(ast, traversal);
    }

    return {
        coordsInNode: typeHelper.enforce(
            'selectionCoords, astNode => boolean',
            coordsInNode),

        nodeInCoords: typeHelper.enforce(
            'selectionCoords, astNode => boolean',
            nodeInCoords),

        nodeMatchesCoords: typeHelper.enforce(
            'selectionCoords, astNode => boolean',
            nodeMatchesCoords),

        isNodeType: typeHelper.enforce(
            'nodeTypes => astNode => boolean',
            isNodeType),

        onMatch: typeHelper.enforce(
            `nodeMatchCheck:function, nodeAction:function 
            => astNode
            => undefined`,
            onMatch),

        traverse: typeHelper.enforce(
            'ast, traversalOptions => undefined',
            traverse)
    };

}

module.exports = astHelper;