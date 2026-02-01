"use strict";
module.exports = function init(modules) {
    function create(info) {
        const service = info.languageService;
        const ts = modules.ts;
        const original = service.getSemanticDiagnostics.bind(service);
        service.getSemanticDiagnostics = function (fileName) {
            const diags = original(fileName);
            if (fileName.endsWith('.ts') && !fileName.includes('node_modules')) {
                const sourceFile = service.getProgram()?.getSourceFile(fileName);
                if (sourceFile) {
                    diags.push({
                        category: ts.DiagnosticCategory.Suggestion,
                        code: 900001,
                        messageText: '✅ @hiperset/tsserver plugin está ativo',
                        file: sourceFile,
                        start: 0,
                        length: 1,
                    });
                }
            }
            return diags;
        };
        return service;
    }
    return { create };
};
//# sourceMappingURL=index.js.map