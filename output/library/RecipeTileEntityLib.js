var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    v.3.0
        - Rename
        - Migrate TypeScript
        - Support Multiplayer
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
    version: 30,
    api: "CoreEngine",
    shared: true
});
var RecipeTE;
(function (RecipeTE) {
    var RegisterError = /** @class */ (function (_super) {
        __extends(RegisterError, _super);
        function RegisterError() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return RegisterError;
    }(Error));
    RecipeTE.RegisterError = RegisterError;
})(RecipeTE || (RecipeTE = {}));
var RecipeTE;
(function (RecipeTE) {
    var WorkbenchTileEntity = /** @class */ (function () {
        function WorkbenchTileEntity(workbench, state) {
            if (state === void 0) { state = true; }
            this.useNetworkItemContainer = true;
            this.enabled = true;
            this.setWorkbench(workbench);
            this.enabled = state;
        }
        WorkbenchTileEntity.prototype.setWorkbench = function (workbench) {
            if (!RecipeTE.Workbench.isRegister(workbench))
                throw new RecipeTE.RegisterError("Workbench with sID \"" + workbench + "\" yet not been registered.");
            if (workbench instanceof RecipeTE.Workbench)
                this.workbench = workbench;
            else
                this.workbench = RecipeTE.Workbench.getWorkbench(workbench);
        };
        WorkbenchTileEntity.prototype.takeResult = function (container, name, id, amount, data, extra, playerUid) {
            for (var i = 0; i < amount; i++)
                this.currentRecipe.craft(container, this.workbench, this);
            return amount;
        };
        WorkbenchTileEntity.prototype.setTransferPolicy = function () {
            this.container.setGlobalAddTransferPolicy(function (container, name, id, amount, data, extra, playerUid) {
                var self = container.getParent();
                if (self.workbench.output == name)
                    return 0;
                if (self.workbench.hasInputSlot(name)) {
                    self.validRecipe(name, {
                        id: id,
                        data: data,
                        count: container.getSlot(name).count + amount,
                        extra: extra
                    });
                }
                return amount;
            });
            this.container.setGlobalGetTransferPolicy(function (container, name, id, amount, data, extra, playerUid) {
                var self = container.getParent();
                if (self.workbench.output == name) {
                    return self.takeResult(container, name, id, amount, data, extra, playerUid);
                }
                if (self.workbench.hasInputSlot(name)) {
                    var item = {
                        id: id,
                        data: data,
                        count: container.getSlot(name).count - amount,
                        extra: extra
                    };
                    if (item.count == 0)
                        item = { id: 0, data: 0, count: 0 };
                    self.validRecipe(name, item);
                }
                return amount;
            });
        };
        WorkbenchTileEntity.prototype.getInputSlots = function (slotName, item) {
            var slots = [];
            for (var i = 0, l = this.workbench.countSlot; i < l; i++) {
                var key = void 0;
                if (Array.isArray(this.workbench.input))
                    key = this.workbench.input[i];
                else
                    key = this.workbench.input + i;
                slots.push(slotName == key ? item : this.container.getSlot(key));
            }
            return slots;
        };
        WorkbenchTileEntity.prototype.getOutputSlot = function () {
            return this.container.getSlot(this.workbench.output);
        };
        WorkbenchTileEntity.prototype.validRecipe = function (slotName, item) {
            if (!this.enabled) {
                this.currentRecipe = null;
                return this.container.clearSlot(this.workbench.output);
            }
            var inputs = this.getInputSlots(slotName, item);
            var recipe = this.workbench.getRecipe(inputs);
            var result = RecipeTE.AIR_ITEM;
            if (recipe)
                result = recipe.result;
            if (result.count === undefined)
                result.count = 1;
            if (result.data === undefined)
                result.data = 0;
            var count = 1;
            if (result.id != 0) {
                count = 0;
                for (var i = inputs.length - 1; i >= 1 && count != 1; i--)
                    if ((count == 0 && inputs[i].count != 0) || (count > inputs[i].count))
                        count = inputs[i].count;
            }
            this.currentRecipe = recipe;
            this.container.setSlot(this.workbench.output, result.id, result.count * count, result.data);
        };
        //TileEntity
        WorkbenchTileEntity.prototype.init = function () {
            this.container.setParent(this);
            this.setTransferPolicy();
        };
        WorkbenchTileEntity.prototype.getScreenName = function () {
            return "main";
        };
        WorkbenchTileEntity.prototype.getScreenByName = function () {
            return this.workbench.window;
        };
        WorkbenchTileEntity.prototype.registerTileEntity = function (BlockID) {
            TileEntity.registerPrototype(BlockID, this);
        };
        WorkbenchTileEntity.prototype.setEnabled = function (state) {
            this.enabled = state;
            this.validRecipe();
        };
        WorkbenchTileEntity.prototype.enable = function () {
            this.setEnabled(true);
        };
        WorkbenchTileEntity.prototype.disable = function () {
            this.setEnabled(false);
        };
        WorkbenchTileEntity.prototype.isEnabled = function () {
            return this.enabled;
        };
        return WorkbenchTileEntity;
    }());
    RecipeTE.WorkbenchTileEntity = WorkbenchTileEntity;
    function registerTileEntity(BlockID, prototype) {
        if (prototype instanceof WorkbenchTileEntity)
            prototype.registerTileEntity(BlockID);
    }
    RecipeTE.registerTileEntity = registerTileEntity;
})(RecipeTE || (RecipeTE = {}));
/// <reference path="WorkbenchTileEntity.ts" />
var RecipeTE;
(function (RecipeTE) {
    var TimerWorkbenchTileEntity = /** @class */ (function (_super) {
        __extends(TimerWorkbenchTileEntity, _super);
        function TimerWorkbenchTileEntity() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.ticks = 0;
            return _this;
        }
        TimerWorkbenchTileEntity.prototype.tick = function () {
            if (!this.currentRecipe || !this.isEnabled)
                return;
            this.ticks++;
            this.container.setScale(this.workbench.scale, this.ticks / this.workbench.time);
            if (this.ticks >= this.workbench.time) {
                var output = this.getOutputSlot();
                this.currentRecipe.craft(this.container, this.workbench, this);
                this.container.setSlot(this.workbench.output, this.currentRecipe.result.id, output.count + this.currentRecipe.result.count, this.currentRecipe.result.data);
                this.validRecipe();
                this.ticks = 0;
            }
            this.container.sendChanges();
        };
        TimerWorkbenchTileEntity.prototype.takeResult = function (container, name, id, amount, data, extra, playerUid) {
            var item = {
                id: id,
                data: data,
                count: container.getSlot(name).count - amount,
                extra: extra
            };
            if (item.count == 0)
                item = { id: 0, data: 0, count: 0 };
            this.validRecipe(name, item);
            return amount;
        };
        TimerWorkbenchTileEntity.prototype.validRecipe = function (slotName, item) {
            var inputs = this.getInputSlots(slotName, item);
            var recipe = this.workbench.getRecipe(inputs);
            if (!recipe) {
                this.container.setScale(this.workbench.scale, this.ticks = 0);
                return this.currentRecipe = null;
            }
            var output = (slotName && slotName == this.workbench.output) ? item : this.getOutputSlot();
            if (output.id == 0 || output.id == recipe.result.id)
                this.currentRecipe = recipe;
            else
                this.currentRecipe = null;
        };
        TimerWorkbenchTileEntity.prototype.setEnabled = function (state) {
            if (!state)
                this.container.setScale(this.workbench.scale, this.ticks = 0);
            _super.prototype.setEnabled.call(this, state);
        };
        return TimerWorkbenchTileEntity;
    }(RecipeTE.WorkbenchTileEntity));
    RecipeTE.TimerWorkbenchTileEntity = TimerWorkbenchTileEntity;
})(RecipeTE || (RecipeTE = {}));
/// <reference path="Errors.ts" />
var RecipeTE;
(function (RecipeTE) {
    RecipeTE.AIR_ITEM = { id: 0, count: 0 };
    var Workbench = /** @class */ (function () {
        function Workbench(sID, info) {
            this._rows = 1;
            this._input = "inputSlot";
            this._output = "outputSlot";
            this._scale = "progressScale";
            this._time = 0;
            this.recipes = [];
            this.sID = sID;
            this._window = info.window;
            if (info.columns < 1)
                throw new RangeError("\"info.columns\" must be > 0.");
            this._columns = info.columns;
            if (info.rows != undefined) {
                if (info.rows < 1)
                    throw new RangeError("\"info.rows\" must be > 0.");
                this._rows = info.rows || 1;
            }
            this._countSlot = this._columns * this._rows;
            if (info.input) {
                if (Array.isArray(info.input) && info.input.length != this.countSlot)
                    throw new RangeError("Length \"info.input\" mast be = " + this.countSlot + "(columns * rows).");
                this._input = info.input;
            }
            if (info.output != undefined)
                this._output = info.output;
            if (info.scale != undefined)
                this._scale = info.scale;
            if (info.time != undefined) {
                if (info.time < 0)
                    throw new RangeError("\"info.time\" must be >= 0.");
                this._time = info.time;
            }
        }
        Object.defineProperty(Workbench.prototype, "countSlot", {
            get: function () {
                return this._countSlot;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Workbench.prototype, "window", {
            get: function () {
                return this._window;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Workbench.prototype, "columns", {
            get: function () {
                return this._columns;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Workbench.prototype, "cols", {
            get: function () {
                return this._columns;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Workbench.prototype, "rows", {
            get: function () {
                return this._rows;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Workbench.prototype, "time", {
            get: function () {
                return this._time;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Workbench.prototype, "input", {
            get: function () {
                return this._input;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Workbench.prototype, "output", {
            get: function () {
                return this._output;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Workbench.prototype, "scale", {
            get: function () {
                return this._scale;
            },
            enumerable: false,
            configurable: true
        });
        Workbench.prototype.addRecipe = function (result, ingredients, craftFunction) {
            if (result.count === undefined)
                result.count = 1;
            if (result.data === undefined)
                result.data = 0;
            var count = 0;
            var outputIngredients = {};
            ingredients.forEach(function (item) {
                if (item.count === undefined)
                    item.count = 1;
                if (item.data === undefined)
                    item.data = -1;
                count += item.count;
                outputIngredients[item.id + ":" + item.data] = item;
            });
            for (var i = ingredients.length - 1; i >= 1; i--) {
                if (ingredients[i].count === undefined)
                    ingredients[i].count = 1;
                if (ingredients[i].data === undefined)
                    ingredients[i].data = -1;
                count += ingredients[i].count;
            }
            if (count > this.countSlot)
                throw new RangeError("Ingredients must be <= " + this.countSlot);
            var recipe = {
                result: result,
                mask: null,
                ingredients: outputIngredients,
                craft: craftFunction || defaultCraftFunction
            };
            this.recipes.push(recipe);
            return this;
        };
        Workbench.prototype.addShapeRecipe = function (result, mask, ingredients, craftFunction) {
            if (result.count === undefined)
                result.count = 1;
            if (result.data === undefined)
                result.data = 0;
            var length = mask.length;
            if (ingredients["#"])
                throw new SyntaxError("Ingredient cannot be registered to char #");
            if (ingredients[" "])
                throw new SyntaxError("Ingredient cannot be registered to chas \"space\"");
            ingredients["#"] = RecipeTE.AIR_ITEM;
            if (Array.isArray(mask)) {
                if (length > this.rows)
                    throw new RangeError("Length of the mask must be <= " + this.rows);
                else if (length < 1)
                    throw new RangeError("Length of the mask must be >= 1");
                var l = mask[0].length;
                if (l > this.columns)
                    throw new RangeError("Length of the mask line must be <= " + this.columns);
                else if (l < 1)
                    throw new RangeError("Length of the mask line must be >= 1");
                for (var i = length - 1; i >= 0; i--) {
                    var ll = mask[i].length;
                    if (ll == 0)
                        mask[i] = "".padStart(l, "#");
                    else if (ll != l)
                        throw new RangeError("Mask lines must be the same size.");
                    else
                        mask[i] = mask[i].replace(/\s/g, "#");
                    for (var ii = l - 1; ii >= 0; ii--)
                        if (ingredients[mask[i][ii]] == undefined)
                            throw new SyntaxError("Unknown ingredient " + mask[i][ii]);
                }
            }
            else if (length > this.countSlot)
                throw new RangeError("Length of the mask must be <= " + this.countSlot);
            else if (length < 1)
                throw new RangeError("Length of the mask must be >= 1");
            else {
                mask = mask.replace(/\s/g, "#");
                for (var i = length - 1; i >= 0; i--)
                    if (ingredients[mask[i]] == undefined)
                        throw new SyntaxError("Unknown ingredient " + mask[i]);
            }
            var recipe = {
                result: result,
                mask: mask,
                ingredients: ingredients,
                craft: craftFunction || defaultCraftFunction
            };
            this.recipes.push(recipe);
            return this;
        };
        Workbench.prototype.getRecipes = function () {
            return this.recipes;
        };
        Workbench.prototype.getRecipe = function (inputs) {
            var _this = this;
            return this.recipes.find(function (recipe) {
                var select = false;
                if (Array.isArray(recipe.mask)) {
                    var iLength = _this.rows - recipe.mask.length, jLength = _this.cols - recipe.mask[0].length, iOffset = 0, jOffset = 0;
                    for (var i = 0; i < _this.rows; i++) {
                        for (var j = 0; j < _this.cols; j++) {
                            if (i > iLength && !select)
                                return false;
                            var input = inputs[i * _this.cols + j];
                            if (j > jLength && !select)
                                if (input.id != RecipeTE.AIR_ITEM.id)
                                    return false;
                            if (!select) {
                                var ingredient = recipe.ingredients[recipe.mask[0][0]];
                                if (ingredient.data == undefined)
                                    ingredient.data = -1;
                                if (ingredient.id == input.id && (ingredient.data == -1 || ingredient.data == input.data)) {
                                    iOffset = i;
                                    jOffset = j;
                                    select = true;
                                }
                                else if (input.id != 0) {
                                    return false;
                                }
                            }
                            else {
                                var ingredient = RecipeTE.AIR_ITEM;
                                var row = recipe.mask[i - iOffset];
                                if (row) {
                                    var col = row[j - jOffset];
                                    if (col)
                                        ingredient = recipe.ingredients[col];
                                }
                                if (input.id != ingredient.id) {
                                    if (recipe.ingredients[recipe.mask[0][0]].id == 0) {
                                        select = false;
                                        i = iOffset;
                                        j = jOffset;
                                    }
                                    else {
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                }
                else if (recipe.mask) {
                    var iLength = _this.countSlot - recipe.mask.length, iOffset = 0;
                    for (var i = 0; i < _this.countSlot; i++) {
                        if (i > iLength && !select)
                            return false;
                        var input = inputs[i];
                        if (!select) {
                            var ingredient = recipe.ingredients[recipe.mask[0]];
                            if (input.id == ingredient.id) {
                                iOffset = i;
                                select = true;
                            }
                            else if (input.id != 0) {
                                return false;
                            }
                        }
                        else {
                            var ingredient = RecipeTE.AIR_ITEM;
                            var col = recipe.mask[i - iOffset];
                            if (col)
                                ingredient = recipe.ingredients[col];
                            if (input.id != ingredient.id)
                                return false;
                        }
                    }
                }
                else {
                    var currentRecipe = {};
                    for (var i = _this.countSlot - 1; i >= 0; i--) {
                        var input = inputs[i];
                        var key = input.id + ":" + input.data;
                        if (!recipe.ingredients[input.id + ":" + input.data])
                            key = input.id + ":-1";
                        if (recipe.ingredients[key]) {
                            if (!currentRecipe[key])
                                currentRecipe[key] = 0;
                            currentRecipe[key]++;
                        }
                        else if (input.id != 0)
                            return false;
                    }
                    for (var i in recipe.ingredients)
                        if (recipe.ingredients[i].count != currentRecipe[i])
                            return false;
                    return true;
                }
                return select;
            }, this);
        };
        Workbench.prototype.hasInputSlot = function (nameSlot) {
            if (Array.isArray(this._input))
                return this._input.indexOf(nameSlot) != -1;
            if (!nameSlot.startsWith(this._input))
                return false;
            var i = parseInt(nameSlot.replace(this._input, ""));
            if (isNaN(i))
                return false;
            return i >= 0 && i < this.countSlot;
        };
        Workbench.prototype.toString = function () {
            return this.sID;
        };
        Workbench.isRegister = function (workbench) {
            if (workbench instanceof Workbench)
                workbench = workbench.sID;
            return this.workbenches[workbench] != undefined;
        };
        Workbench.registerWorkbench = function (workbench) {
            if (this.isRegister(workbench))
                throw new RecipeTE.RegisterError("Workbench with sID \"" + workbench.sID + "\" already has been registered.");
            this.workbenches[workbench.sID] = workbench;
        };
        Workbench.getWorkbench = function (sID) {
            if (!this.isRegister(sID))
                throw new RecipeTE.RegisterError("Workbench with sID \"" + sID + "\" yet not been registered.");
            return this.workbenches[sID];
        };
        Workbench.workbenches = {};
        return Workbench;
    }());
    RecipeTE.Workbench = Workbench;
    function defaultCraftFunction(container, workbench) {
        for (var i = 0; i < workbench.countSlot; i++) {
            var input_slot_name;
            if (Array.isArray(workbench.input))
                input_slot_name = workbench.input[i];
            else
                input_slot_name = workbench.input + i;
            var slot = container.getSlot(input_slot_name);
            if (slot.count > 0) {
                slot.count--;
                if (slot.count == 0)
                    slot.data = slot.id = slot.count;
            }
            container.setSlot(input_slot_name, slot.id, slot.count, slot.data, slot.extra);
        }
    }
    RecipeTE.isRegister = Workbench.isRegister;
    function registerWorkbench(sID, info) {
        var workbench = new Workbench(sID, info);
        Workbench.registerWorkbench(workbench);
        return workbench;
    }
    RecipeTE.registerWorkbench = registerWorkbench;
    function addRecipe(sID, result, ingredients, craft) {
        Workbench.getWorkbench(sID).addRecipe(result, ingredients, craft);
    }
    RecipeTE.addRecipe = addRecipe;
    function addShapeRecipe(sID, result, mask, ingredients, craft) {
        Workbench.getWorkbench(sID).addShapeRecipe(result, mask, ingredients, craft);
    }
    RecipeTE.addShapeRecipe = addShapeRecipe;
})(RecipeTE || (RecipeTE = {}));
//throw new RegisterError(`Workbench with sID "${sID}" yet not been registered.`);
EXPORT("RecipeTE", RecipeTE);
