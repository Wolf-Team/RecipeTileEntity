/// <reference path="../Workbench/Workbench.ts" />
/// <reference path="TimerWorkbenchInfo.ts" />

namespace RecipeTE {
    export interface RecipeDataTimer {
        multiply: number;
    };

    export class TimerWorkbench<T extends RecipeDataTimer> extends Workbench<T>{
        public readonly timer: number;

        constructor(info: TimerWorkbenсhInfo, defaultRecipeData:T) {
            super(info, defaultRecipeData);
            this.timer = info.timer;
        }

    }
}
