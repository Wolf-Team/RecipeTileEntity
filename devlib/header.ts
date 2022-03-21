/*
     ____             _            _____ _ _       _____       _   _ _         
    |  _ \  ___   ___(_)_ __   ___|_   _(_) | ___ | ____|_ __ | |_(_) |_ _   _
    | |_) |/ _ \ / __| | '_ \ / _ \ | | | | |/ _ \|  _| | '_ \| __| | __| | | |
    |  _ <|  __/| (__| | |_) |  __/ | | | | |  __/| |___| | | | |_| | |_| |_| |
    |_| \_\\___| \___|_| .__/ \___| |_| |_|_|\___||_____|_| |_|\__|_|\__|\__, |
                       |_|                                               |___/                     
                                                                
    RecipeTileEntity v3.0 ©WolfTeam
    GitHub: https://github.com/Wolf-Team
            https://github.com/Wolf-Team/RecipeTileEntity
    VK: https://vk.com/wolf___team
*/
/*ChangeLog:
    v.3.0.1
        - Fixed calculation of the number of crafting results
    v.3.0
        - Rename
        - Rewrite in TypeScript
        - Support Multiplayer
        - Remove integration with RecipeViewer
    v.2.1
        - Fix errors
        - Shared
        - Integration with RecipeViewer
        - Fix recipe with mod's items
        - The setWorkbench method was added to the tileentity of the workbench
    v.2.0
        - The library has been rewritten
        - Added the ability to create shapeless recipes
    v.1.2
        - Fix change of craft with the same ingredients
        - Removed method registerTimerGridCraftTable
        - Removed method registerTimerCraftTable
        - Removed method getTickResipes
    v.1.1
        - Merge methods registerGridCraftTable and registerTimerGridCraftTable
        - Merge methods registerCraftTable and registerTimerCraftTable
        - Fixed method name from getTickResipes to getTickRecipes
        - Added the ability to use your item IDs.
        - For recipes, the time multiplier parameter has been added.
    v.1
        - release
*/

LIBRARY({
    name: "RecipeTileEntity",
    version: 301,
    api: "CoreEngine",
    shared: true
});

type Windows = UI.Window | UI.StandardWindow | UI.StandartWindow | UI.TabbedWindow;
type Dict<T = any> = { [key: string]: T } | {};

namespace RecipeTE {
    export const AIR_ITEM: RecipeItem = { id: 0, count: 0 };
}
