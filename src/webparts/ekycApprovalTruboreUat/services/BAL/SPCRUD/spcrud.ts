import "@pnp/sp/lists";
import "@pnp/sp/items";
// import { IPatelEngProps } from "../../components/IPatelEngProps";
import { IEkycApprovalTruboreUatProps } from "../../../components/IEkycApprovalTruboreUatProps";
import SPCRUDOPS from "../../DAL/spcrudops";

export interface ISPCRUD {
    getData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string, orderby: { column: string, isAscending: boolean }, top: number, props: IEkycApprovalTruboreUatProps): Promise<any>;
    getRootData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string, orderby: { column: string, isAscending: boolean }, top: number, props: IEkycApprovalTruboreUatProps): Promise<any>;
    insertData(listName: string, data: any, props: IEkycApprovalTruboreUatProps): Promise<any>;
    updateData(listName: string, itemId: number, data: any, props: IEkycApprovalTruboreUatProps): Promise<any>;
    deleteData(listName: string, itemId: number, props: IEkycApprovalTruboreUatProps): Promise<any>;
    getListInfo(listName: string, props: IEkycApprovalTruboreUatProps): Promise<any>;
    getListData(listName: string, columnsToRetrieve: string, props: IEkycApprovalTruboreUatProps): Promise<any>;
    batchInsert(listName: string, data: any, props: IEkycApprovalTruboreUatProps): Promise<any>;
    batchUpdate(listName: string, data: any, props: IEkycApprovalTruboreUatProps): Promise<any>;
    batchDelete(listName: string, data: any, props: IEkycApprovalTruboreUatProps): Promise<any>;
    createFolder(listName: string, folderName: string, props: IEkycApprovalTruboreUatProps): Promise<any>;
    uploadFile(folderServerRelativeUrl: string, file: File, props: IEkycApprovalTruboreUatProps): Promise<any>;
    deleteFile(fileServerRelativeUrl: string, props: IEkycApprovalTruboreUatProps): Promise<any>;
    currentProfile(props: IEkycApprovalTruboreUatProps): Promise<any>;
    getLoggedInSiteGroups(props: IEkycApprovalTruboreUatProps): Promise<any>;
    getAllSiteGroups(props: IEkycApprovalTruboreUatProps): Promise<any>;
    getTopData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
        , orderby: { column: string, isAscending: boolean }, top: number, props: IEkycApprovalTruboreUatProps): Promise<any>;
    addAttchmentInList(attFiles: File, listName: string, itemId: number, fileName: string, props: IEkycApprovalTruboreUatProps): Promise<any>;

}

export default async function USESPCRUD(): Promise<ISPCRUD> {
    const spCrudOps = await SPCRUDOPS();
    return {
        getData: async (listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
            , orderby: { column: string, isAscending: boolean }, top: number, props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.getData(listName, columnsToRetrieve, columnsToExpand, filters, orderby, props);
        },
        getRootData: async (listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
            , orderby: { column: string, isAscending: boolean }, top: number, props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.getData(listName, columnsToRetrieve, columnsToExpand, filters, orderby, props);
        },
        insertData: async (listName: string, data: any, props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.insertData(listName, data, props);
        },
        updateData: async (listName: string, itemId: number, data: any, props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.updateData(listName, itemId, data, props);
        },
        deleteData: async (listName: string, itemId: number, props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.deleteData(listName, itemId, props);
        },
        getListInfo: async (listName: string, props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.getListInfo(listName, props);
        },
        getListData: async (listName: string, columnsToRetrieve: string, props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.getListData(listName, columnsToRetrieve, props);
        },
        batchInsert: async (listName: string, data: any, props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.batchInsert(listName, data, props);
        },
        batchUpdate: async (listName: string, data: any, props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.batchUpdate(listName, data, props);
        },
        batchDelete: async (listName: string, data: any, props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.batchDelete(listName, data, props);
        },
        createFolder: async (listName: string, folderName: string, props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.createFolder(listName, folderName, props);
        },
        uploadFile: async (folderServerRelativeUrl: string, file: File, props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.uploadFile(folderServerRelativeUrl, file, props);
        },
        deleteFile: async (fileServerRelativeUrl: string, props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.deleteFile(fileServerRelativeUrl, props);
        },
        currentProfile: async (props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.currentProfile(props);
        },

        getLoggedInSiteGroups: async (props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.getLoggedInSiteGroups(props);
        },
        getAllSiteGroups: async (props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.getAllSiteGroups(props);
        },
        getTopData: async (listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
            , orderby: { column: string, isAscending: boolean }, top: number, props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.getTopData(listName, columnsToRetrieve, columnsToExpand, filters, orderby, top, props);
        },
        addAttchmentInList: async (attFiles: File, listName: string, itemId: number, fileName: string, props: IEkycApprovalTruboreUatProps) => {
            return await spCrudOps.addAttchmentInList(attFiles, listName, itemId, fileName, props);
        }
    };
}