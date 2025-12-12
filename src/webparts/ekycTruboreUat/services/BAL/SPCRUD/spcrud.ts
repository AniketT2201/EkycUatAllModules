import "@pnp/sp/lists";
import "@pnp/sp/items";
// import { IPatelEngProps } from "../../components/IPatelEngProps";
import { IEkycTruboreUatProps } from "../../../components/IEkycTruboreUatProps";
import SPCRUDOPS from "../../DAL/spcrudops";

export interface ISPCRUD {
    getData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string, orderby: { column: string, isAscending: boolean }, top: number, props: IEkycTruboreUatProps): Promise<any>;
    getRootData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string, orderby: { column: string, isAscending: boolean }, top: number, props: IEkycTruboreUatProps): Promise<any>;
    insertData(listName: string, data: any, props: IEkycTruboreUatProps): Promise<any>;
    updateData(listName: string, itemId: number, data: any, props: IEkycTruboreUatProps): Promise<any>;
    deleteData(listName: string, itemId: number, props: IEkycTruboreUatProps): Promise<any>;
    getListInfo(listName: string, props: IEkycTruboreUatProps): Promise<any>;
    getListData(listName: string, columnsToRetrieve: string, props: IEkycTruboreUatProps): Promise<any>;
    batchInsert(listName: string, data: any, props: IEkycTruboreUatProps): Promise<any>;
    batchUpdate(listName: string, data: any, props: IEkycTruboreUatProps): Promise<any>;
    batchDelete(listName: string, data: any, props: IEkycTruboreUatProps): Promise<any>;
    createFolder(listName: string, folderName: string, props: IEkycTruboreUatProps): Promise<any>;
    uploadFile(folderServerRelativeUrl: string, file: File, props: IEkycTruboreUatProps): Promise<any>;
    deleteFile(fileServerRelativeUrl: string, props: IEkycTruboreUatProps): Promise<any>;
    currentProfile(props: IEkycTruboreUatProps): Promise<any>;
    getLoggedInSiteGroups(props: IEkycTruboreUatProps): Promise<any>;
    getAllSiteGroups(props: IEkycTruboreUatProps): Promise<any>;
    getTopData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
        , orderby: { column: string, isAscending: boolean }, top: number, props: IEkycTruboreUatProps): Promise<any>;
    addAttchmentInList(attFiles: File, listName: string, itemId: number, fileName: string, props: IEkycTruboreUatProps): Promise<any>;

}

export default async function USESPCRUD(): Promise<ISPCRUD> {
    const spCrudOps = await SPCRUDOPS();
    return {
        getData: async (listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
            , orderby: { column: string, isAscending: boolean }, top: number, props: IEkycTruboreUatProps) => {
            return await spCrudOps.getData(listName, columnsToRetrieve, columnsToExpand, filters, orderby, props);
        },
        getRootData: async (listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
            , orderby: { column: string, isAscending: boolean }, top: number, props: IEkycTruboreUatProps) => {
            return await spCrudOps.getData(listName, columnsToRetrieve, columnsToExpand, filters, orderby, props);
        },
        insertData: async (listName: string, data: any, props: IEkycTruboreUatProps) => {
            return await spCrudOps.insertData(listName, data, props);
        },
        updateData: async (listName: string, itemId: number, data: any, props: IEkycTruboreUatProps) => {
            return await spCrudOps.updateData(listName, itemId, data, props);
        },
        deleteData: async (listName: string, itemId: number, props: IEkycTruboreUatProps) => {
            return await spCrudOps.deleteData(listName, itemId, props);
        },
        getListInfo: async (listName: string, props: IEkycTruboreUatProps) => {
            return await spCrudOps.getListInfo(listName, props);
        },
        getListData: async (listName: string, columnsToRetrieve: string, props: IEkycTruboreUatProps) => {
            return await spCrudOps.getListData(listName, columnsToRetrieve, props);
        },
        batchInsert: async (listName: string, data: any, props: IEkycTruboreUatProps) => {
            return await spCrudOps.batchInsert(listName, data, props);
        },
        batchUpdate: async (listName: string, data: any, props: IEkycTruboreUatProps) => {
            return await spCrudOps.batchUpdate(listName, data, props);
        },
        batchDelete: async (listName: string, data: any, props: IEkycTruboreUatProps) => {
            return await spCrudOps.batchDelete(listName, data, props);
        },
        createFolder: async (listName: string, folderName: string, props: IEkycTruboreUatProps) => {
            return await spCrudOps.createFolder(listName, folderName, props);
        },
        uploadFile: async (folderServerRelativeUrl: string, file: File, props: IEkycTruboreUatProps) => {
            return await spCrudOps.uploadFile(folderServerRelativeUrl, file, props);
        },
        deleteFile: async (fileServerRelativeUrl: string, props: IEkycTruboreUatProps) => {
            return await spCrudOps.deleteFile(fileServerRelativeUrl, props);
        },
        currentProfile: async (props: IEkycTruboreUatProps) => {
            return await spCrudOps.currentProfile(props);
        },

        getLoggedInSiteGroups: async (props: IEkycTruboreUatProps) => {
            return await spCrudOps.getLoggedInSiteGroups(props);
        },
        getAllSiteGroups: async (props: IEkycTruboreUatProps) => {
            return await spCrudOps.getAllSiteGroups(props);
        },
        getTopData: async (listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
            , orderby: { column: string, isAscending: boolean }, top: number, props: IEkycTruboreUatProps) => {
            return await spCrudOps.getTopData(listName, columnsToRetrieve, columnsToExpand, filters, orderby, top, props);
        },
        addAttchmentInList: async (attFiles: File, listName: string, itemId: number, fileName: string, props: IEkycTruboreUatProps) => {
            return await spCrudOps.addAttchmentInList(attFiles, listName, itemId, fileName, props);
        }
    };
}