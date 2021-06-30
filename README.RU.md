# RecipeTileEntity 3.0
RecipeTileEntity - библиотека, упрощающая создание верстаков и печей.

[en](https://github.com/Wolf-Team/RecipeTileEntity/blob/main/README.md) | **ru**

# Начать
Перед началом работы, требуется импортировать библиотеку.
``` ts
IMPORT("RecipeTileEntity", "*"); // Импортировать все модули
```

# Создание верстака
Для создания верстаков используются классы Workbench и TimerWorkbench.
```ts
/* new RecipeTE.Workbench(info:WorkbenchInfo, data?:any); */
const MyWorkbench = new RecipeTE.Workbench({
    columns: 4,
    rows: 4 //Не обязательный параметр, по умолчанию = 1
});
/* new RecipeTE.Workbench(info:TimerWorkbenchInfo, data:RecipeDataTimer); */
const MyFurnace = new RecipeTE.TimerWorkbench({
    columns: 1,
    timer: 5 * 20
}, { multiply: 1 })
```

# Регистрация рецептов
Для регистрации рецептов используются методы workbench.addRecipe и workbench.addShapeRecipe
```ts
MyWorkbench.addShapeRecipe({ id: 280, count: 1 }, [
    "aa",
    "aa"
], { a: { id: 5 } });
MyWorkbench.addRecipe({id:2}, [{id:5,count:3}]);
```

# Регистрация TileEntity
Для регистрации TileEntity используется класс наследуемый от WorkbenchTileEntity или TimerWorkbenchTileEntity
```ts
class MyWorkbenchTileEntity extends RecipeTE.WorkbenchTileEntity {
    // Методы TileEntity
    public getScreenName() { return "main"; }
    public getScreenByName() { return Workbench_Grid; }
    
    /* Список имен входных слотов.
    *
    * Если указан не массив, имя слотов строится по формуле строка + i
    * где i - индекс слотов с 0
    */
    public getInputSlots(): string { return "inputSlot"; } 
    
    // Имя выходного слота.
    public getOutputSlot(): string { return "outputSlot"; }
}

TileEntity.registerPrototype(BlockID["Workbench_Grid"], new MyWorkbenchTileEntity(MyWorkbench));
```

## Старые версии
* [RecipeTileEntityLib 2.1](https://github.com/Wolf-Team/Libraries/blob/master/RecipeTileEntityLib.js)
* [RecipeTileEntityLib 2.0](https://github.com/Wolf-Team/Libraries/blob/e88db1ef28352867ed661e4ae3589e2a5c952aca/RecipeTileEntityLib.js)
* [RecipeTileEntityLib 1.2](https://github.com/Wolf-Team/Libraries/blob/d95d572b0692c3fa0aa770dc354f5d374999b8cf/RecipeTileEntityLib.js)
* [RecipeTileEntityLib 1.1](https://github.com/Wolf-Team/Libraries/blob/d3667ec852a31bbcb0a456c46dbaf06cf83bcc35/RecipeTileEntityLib.js)
* [RecipeTileEntityLib 1.0](https://github.com/Wolf-Team/Libraries/blob/cabfc1f465699e87ef1081defa21ef662456d8d5/RecipeTileEntityLib.js)