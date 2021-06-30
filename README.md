# RecipeTileEntity 3.0
RecipeTileEntity - a library that simplifies the creation of workbenches and furnaces.


**en** | [ru](https://github.com/Wolf-Team/RecipeTileEntity/blob/main/README.RU.md)

# To begin
Before starting work, you need to import the library.
```ts
IMPORT("RecipeTileEntity", "*"); // Import all modules
```

# Crafting a workbench
The Workbench and TimerWorkbench classes are used to create workbenches.
```ts
/* new RecipeTE.Workbench(info: WorkbenchInfo, data?: any); */
const MyWorkbench = new RecipeTE.Workbench({
    columns: 4,
    rows: 4 // Optional parameter, default = 1
});
/* new RecipeTE.Workbench(info: TimerWorkbenchInfo, data: RecipeDataTimer); */
const MyFurnace = new RecipeTE.TimerWorkbench({
    columns: 1,
    timer: 5 * 20
}, { multiply: 1 })
```

# Registering recipes
The workbench.addRecipe and workbench.addShapeRecipe methods are used to register recipes.
```ts
MyWorkbench.addShapeRecipe({id: 280, count: 1}, [
    "aa",
    "aa"
], {a: {id: 5}});
MyWorkbench.addRecipe({id: 2}, [{id: 5, count: 3}]);
```

# Register TileEntity
To register TileEntity, a class inherited from WorkbenchTileEntity or TimerWorkbenchTileEntity is used
```ts
class MyWorkbenchTileEntity extends RecipeTE.WorkbenchTileEntity {
    //Methods of TileEntity
    public getScreenName() {return "main"; }
    public getScreenByName() {return Workbench_Grid; }
    
    /* List of input slot names.
    *
    * If not an array is specified, the name of slots is constructed using the formula string + i
    * where i is the index of slots with 0
    */
    public getInputSlots(): string {return "inputSlot"; }
    
    //The name of the output slot.
    public getOutputSlot(): string {return "outputSlot"; }
}

TileEntity.registerPrototype (BlockID ["Workbench_Grid"], new MyWorkbenchTileEntity(MyWorkbench));
```

## Older versions
* [RecipeTileEntityLib 2.1](https://github.com/Wolf-Team/Libraries/blob/master/RecipeTileEntityLib.js)
* [RecipeTileEntityLib 2.0](https://github.com/Wolf-Team/Libraries/blob/e88db1ef28352867ed661e4ae3589e2a5c952aca/RecipeTileEntityLib.js)
* [RecipeTileEntityLib 1.2](https://github.com/Wolf-Team/Libraries/blob/d95d572b0692c3fa0aa770dc354f5d374999b8cf/RecipeTileEntityLib.js)
* [RecipeTileEntityLib 1.1](https://github.com/Wolf-Team/Libraries/blob/d3667ec852a31bbcb0a456c46dbaf06cf83bcc35/RecipeTileEntityLib.js)
* [RecipeTileEntityLib 1.0](https://github.com/Wolf-Team/Libraries/blob/cabfc1f465699e87ef1081defa21ef662456d8d5/RecipeTileEntityLib.js)