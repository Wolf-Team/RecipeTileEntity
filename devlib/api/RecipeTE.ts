/// <reference path="Exceptions.ts" />

namespace RecipeTE {
    
    abstract class WorkbenchInfo {
        public sid: string;
        public block_sid?: string;
        public cols: number;
        public rows?: number;
        public window: UI.IWindow;
        public input?: string[] | string;
        public output?: string;

        public static getDefaultWorkbenchInfo(workbench: WorkbenchInfo): WorkbenchInfo {
            workbench.block_sid = workbench.block_sid || workbench.sid;
            workbench.rows = workbench.rows || 1;
            workbench.input = workbench.input || "inputSlot";
            workbench.output = workbench.output || "outputSlot";
            return workbench;
        }

        private static workbenches: { [key: string]: WorkbenchInfo } = {}
        public static isRegistered(sid: string): boolean {
            return this.workbenches[sid] != undefined;
        }
        public static registerWorkbench(workbench: WorkbenchInfo) {
            if (this.isRegistered(workbench.sid))
                throw new RegisterException(`Workbench ${workbench.sid} already was been registered.`);

            this.workbenches[workbench.sid] = this.getDefaultWorkbenchInfo(workbench);
        }
        public static getWorkbench(sid: string): WorkbenchInfo {
            if (!this.isRegistered(sid))
                throw new RegisterException(`Workbench ${sid} not been registered.`);

            return this.workbenches[sid];
        }
    }

    interface IWorkbench extends TileEntity.TileEntityPrototype {
        workbench: WorkbenchInfo;
        setWorkbench: (sid: string) => void;
        setWorkbenchInfo: (info: WorkbenchInfo) => void;
        registerTileEntity: () => void;

        setEnable: (active: boolean) => void;
        isEnabled: () => boolean;
    }

    export abstract class WorkbenchBase implements IWorkbench {
        public useNetworkItemContainer: boolean = true;
        public workbench: WorkbenchInfo;
        public container: ItemContainer;
        private enable: boolean = true;

        constructor(info?: WorkbenchInfo) {
            if (info) {
                if (!WorkbenchInfo.isRegistered(info.sid))
                    WorkbenchInfo.registerWorkbench(info);

                this.setWorkbenchInfo(info);
            }
        }

        public setWorkbench(sid: string) {
            this.workbench = WorkbenchInfo.getWorkbench(sid);
        }
        public setWorkbenchInfo(info: WorkbenchInfo) {
            if (!WorkbenchInfo.isRegistered(info.sid))
                throw new RegisterException(`Workbench ${info.sid} was not been registered.`);

            this.workbench = info;
        }

        public registerTileEntity() {
            TileEntity.registerPrototype(BlockID[this.workbench.block_sid], this)
        }

        public isEnabled() { return this.enable; }

        public setEnable(active: boolean) {
            this.enable = active;
        }

        //TileEntity
        public init() {
            print("Init")
            this.container.setGlobalAddTransferPolicy(function (container, name, id, amount) {
                print(`Add ${name} - ${amount}`)
                return amount;
            });
            this.container.setGlobalGetTransferPolicy(function (container, name, id, amount) {
                print(`Get ${name} - ${amount}`)
                return amount;
            })
        }
        public getScreenByName(name: string) {
            return this.workbench.window;
        }
        public getScreenName() { return "main"; }
    }

    export class Workbench extends WorkbenchBase { }

    function registerDefaultTileEntity(workbench: WorkbenchInfo, tile: TileEntity.TileEntityPrototype) {
        tile.setWorkbench = function (sid: string) {
            this.workbench = WorkbenchInfo.getWorkbench(sid);
        }
        tile.setWorkbenchInfo = function (info: WorkbenchInfo) {
            if (!WorkbenchInfo.isRegistered(info.sid))
                throw new RegisterException(`Workbench ${info.sid} was not been registered.`);

            this.workbench = info;
        }
        tile.setWorkbenchInfo(workbench);
        tile.isEnabled = function () { return this.enable; }

        tile.setEnable = function (active: boolean) {
            this.enable = active;
        }

        TileEntity.registerPrototype(BlockID[workbench.block_sid], tile);
    }
    export function registerWorkbench(workbench: WorkbenchInfo, tile: TileEntity.TileEntityPrototype) {
        WorkbenchInfo.registerWorkbench(workbench);
        if (tile instanceof WorkbenchBase) {
            print("Rregister")
            tile.setWorkbenchInfo(workbench)
            tile.registerTileEntity();
        } else {
            print("Rregister2")
            registerDefaultTileEntity(workbench, () => {
                tile.click = function () {
                    Debug.message(this.getScreenName);
                }
                return tile
            })

        }

    }
}