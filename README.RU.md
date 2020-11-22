# RecipeTileEntity 3.0
RecipeTileEntity - библиотека, упрощающая создание верстаков и печей.

[en](https://github.com/Wolf-Team/RecipeTileEntity/blob/main/README.md) | **ru**

# Начать
Перед началом работы, требуется импортировать библиотеку.
``` js
IMPORT("RecipeTileEntity", "*"); // Импортировать все модули
```

# Регистрация верстака
Для регистрации верстаков используется метод RecipeTE.registerWorkbench(sID, WorkbenchInfo);
```
WorkbenchInfo = {
    window:UI.IWindow, - Окно верстака
    columns: number, - Количество столбцов
    rows?:number = 1, - Количество строк
    input?:string[]|string = "inputSlot", - Имена входных слотов*
    output?:string = "outputSlot - Имя выходного слота
}
```
**\* Если строка, то имя фрормируется по формуле input+I, где I - порядковый номер от нуля**

```js
RecipeTE.registerWorkbench("customWorkbench", {
    window: Workbench_Grid,
    columns: 4,
    rows: 4
});
```

# Регистрация рецептов
Для регистрации рецептов используются методы RecipeTE.addRecipe и RecipeTE.addShapeRecipe
```js
RecipeTE.addShapeRecipe("Workbench_Grid", { id: 280, count: 1 }, [
    "aa",
    "aa"
], { a: { id: 5 } });
RecipeTE.addRecipe("Workbench_Grid", {id:2}, [{id:5,count:3}]);
```

# Регистрация TileEntity
Для регистрации TileEntity используется метод RecipeTE.registerTileEntity(BlockID, WorkbenchPrototype);
```js
RecipeTE.registerTileEntity(BlockID["Workbench_Grid"], new RecipeTE.WorkbenchTileEntity("customWorkbench"))
```

 
## Старые версии
* [RecipeTileEntityLib 2.1](https://github.com/Wolf-Team/Libraries/blob/master/RecipeTileEntityLib.js)
* [RecipeTileEntityLib 2.0](https://github.com/Wolf-Team/Libraries/blob/e88db1ef28352867ed661e4ae3589e2a5c952aca/RecipeTileEntityLib.js)
* [RecipeTileEntityLib 1.2](https://github.com/Wolf-Team/Libraries/blob/d95d572b0692c3fa0aa770dc354f5d374999b8cf/RecipeTileEntityLib.js)
* [RecipeTileEntityLib 1.1](https://github.com/Wolf-Team/Libraries/blob/d3667ec852a31bbcb0a456c46dbaf06cf83bcc35/RecipeTileEntityLib.js)
* [RecipeTileEntityLib 1.0](https://github.com/Wolf-Team/Libraries/blob/cabfc1f465699e87ef1081defa21ef662456d8d5/RecipeTileEntityLib.js)