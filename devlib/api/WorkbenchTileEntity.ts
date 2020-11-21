namespace RecipeTE {
    interface WorkbenchPrototype extends TileEntity.TileEntityPrototype {
        workbench: Workbench;
        useNetworkItemContainer: true;
        //TileEntity
        getScreenByName: (name: string) => UI.IWindow;
        getScreenName: (player: number, coords: Vector) => string;
    }

    export class WorkbenchTileEntity implements WorkbenchPrototype {
        public workbench: Workbench;
        public container:ItemContainer;
        public useNetworkItemContainer: true = true;

        constructor(workbench: Workbench | string) {
            this.setWorkbench(workbench);
        }

        public setWorkbench(workbench: Workbench | string): void {
            if (!Workbench.isRegister(workbench))
                throw new RegisterError(`Workbench with sID "${workbench}" yet not been registered.`);

            if (workbench instanceof Workbench)
                this.workbench = workbench;
            else
                this.workbench = Workbench.getWorkbench(workbench);
        }

        //TileEntity
        public init():void{
            this.container.setGlobalAddTransferPolicy(
            function(container: ItemContainer, name: string, id: number, amount: number, data: number, extra: ItemExtraData, playerUid: number){
                
                return amount;
            });
        }
        public getScreenName(): string {
            return "main";
        }
        public getScreenByName(): UI.IWindow {
            return this.workbench.window;
        }

        public registerTileEntity(BlockID: number): void {
            TileEntity.registerPrototype(BlockID, this);
        }
    }

    export function registerTileEntity(BlockID: number, prototype: WorkbenchPrototype) {
        if (prototype instanceof WorkbenchTileEntity)
            prototype.registerTileEntity(BlockID);

    }
    //WorkbenchTileEntity
}