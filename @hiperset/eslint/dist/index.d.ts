import { TSESLint } from "@typescript-eslint/utils";
type ErrorsName = "tempError" | "InvalidReglueSyntaxe" | "InvalidReglueLabel" | "ImpossibleInferValue" | "DuplicatedKey";
type RuleModule = TSESLint.RuleModule<ErrorsName, []>;
type RuleCtx = TSESLint.RuleContext<ErrorsName, []>;
type RuleListener = TSESLint.RuleListener;
type RuleMeta = TSESLint.RuleMetaData<ErrorsName>;
export declare class Hiperset implements RuleModule {
    #private;
    /**
     * Definição do ESLint Plugin
     */
    static readonly plugin: {
        hiperset: {
            rules: {
                plugin: Hiperset;
            };
        };
    };
    /**
     * Meta dados da regra
     */
    readonly meta: RuleMeta;
    /**
     *
     */
    create(context: RuleCtx): RuleListener;
}
export default Hiperset;
//# sourceMappingURL=index.d.ts.map