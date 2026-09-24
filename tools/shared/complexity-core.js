(function (root) {
    'use strict';
    const functions = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);
    const decisions = new Set(['IfStatement', 'WhileStatement', 'DoWhileStatement', 'ForStatement', 'ForInStatement', 'ForOfStatement', 'CatchClause', 'ConditionalExpression']);
    const blocks = new Set([...decisions, 'SwitchStatement']);
    function children(node) {
        return Object.values(node).flat().filter(value => value && typeof value === 'object' && typeof value.type === 'string');
    }
    function increment(node) {
        return decisions.has(node.type) || (node.type === 'SwitchCase' && node.test !== null) || (node.type === 'LogicalExpression' && ['&&', '||', '??'].includes(node.operator)) ? 1 : 0;
    }
    function complexity(body) {
        if (!body || functions.has(body.type)) return 0;
        return increment(body) + children(body).reduce((sum, child) => sum + complexity(child), 0);
    }
    function analyze(ast) {
        const details = [];
        let maxNesting = 0;
        function visit(node, depth = 0) {
            if (functions.has(node.type)) {
                details.push({ name: node.id?.name || '(anonymous)', line: node.loc?.start?.line || 1, complexity: 1 + complexity(node.body) });
                depth = 0;
            }
            const nested = depth + (blocks.has(node.type) ? 1 : 0);
            maxNesting = Math.max(maxNesting, nested);
            children(node).forEach(child => visit(child, nested));
        }
        visit(ast);
        return { details, functionCount: details.length, maxNesting, maxComplexity: Math.max(1, ...details.map(item => item.complexity)) };
    }
    const api = Object.freeze({ analyze });
    root.ComplexityCore = api;
    if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
