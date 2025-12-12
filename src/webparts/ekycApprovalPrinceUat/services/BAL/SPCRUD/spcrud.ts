import "@pnp/sp/lists";
import "@pnp/sp/items";
// import { IPatelEngProps } from "../../components/IPatelEngProps";
import { IEkycApprovalPrinceUatProps } from "../../../components/IEkycApprovalPrinceUatProps";
import SPCRUDOPS from "../../DAL/spcrudops";

export interface ISPCRUD {
    getData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string, orderby: { column: string, isAscending: boolean }, top: number, props: IEkycApprovalPrinceUatProps): Promise<any>;
    getRootData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string, orderby: { column: string, isAscending: boolean }, top: number, props: IEkycApprovalPrinceUatProps): Promise<any>;
    insertData(listName: string, data: any, props: IEkycApprovalPrinceUatProps): Promise<any>;
    updateData(listName: string, itemId: number, data: any, props: IEkycApprovalPrinceUatProps): Promise<any>;
    deleteData(listName: string, itemId: number, props: IEkycApprovalPrinceUatProps): Promise<any>;
    getListInfo(listName: string, props: IEkycApprovalPrinceUatProps): Promise<any>;
    getListData(listName: string, columnsToRetrieve: string, props: IEkycApprovalPrinceUatProps): Promise<any>;
    batchInsert(listName: string, data: any, props: IEkycApprovalPrinceUatProps): Promise<any>;
    batchUpdate(listName: string, data: any, props: IEkycApprovalPrinceUatProps): Promise<any>;
    batchDelete(listName: string, data: any, props: IEkycApprovalPrinceUatProps): Promise<any>;
    createFolder(listName: string, folderName: string, props: IEkycApprovalPrinceUatProps): Promise<any>;
    uploadFile(folderServerRelativeUrl: string, file: File, props: IEkycApprovalPrinceUatProps): Promise<any>;
    deleteFile(fileServerRelativeUrl: string, props: IEkycApprovalPrinceUatProps): Promise<any>;
    currentProfile(props: IEkycApprovalPrinceUatProps): Promise<any>;
    getLoggedInSiteGroups(props: IEkycApprovalPrinceUatProps): Promise<any>;
    getAllSiteGroups(props: IEkycApprovalPrinceUatProps): Promise<any>;
    getTopData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
        , orderby: { column: string, isAscending: boolean }, top: number, props: IEkycApprovalPrinceUatProps): Promise<any>;
    addAttchmentInList(attFiles: File, listName: string, itemId: number, fileName: string, props: IEkycApprovalPrinceUatProps): Promise<any>;

}

export default async function USESPCRUD(): Promise<ISPCRUD> {
    const spCrudOps = await SPCRUDOPS();
    return {
        getData: async (listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
            , orderby: { column: string, isAscending: boolean }, top: number, props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.getData(listName, columnsToRetrieve, columnsToExpand, filters, orderby, props);
        },
        getRootData: async (listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
            , orderby: { column: string, isAscending: boolean }, top: number, props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.getData(listName, columnsToRetrieve, columnsToExpand, filters, orderby, props);
        },
        insertData: async (listName: string, data: any, props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.insertData(listName, data, props);
        },
        updateData: async (listName: string, itemId: number, data: any, props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.updateData(listName, itemId, data, props);
        },
        deleteData: async (listName: string, itemId: number, props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.deleteData(listName, itemId, props);
        },
        getListInfo: async (listName: string, props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.getListInfo(listName, props);
        },
        getListData: async (listName: string, columnsToRetrieve: string, props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.getListData(listName, columnsToRetrieve, props);
        },
        batchInsert: async (listName: string, data: any, props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.batchInsert(listName, data, props);
        },
        batchUpdate: async (listName: string, data: any, props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.batchUpdate(listName, data, props);
        },
        batchDelete: async (listName: string, data: any, props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.batchDelete(listName, data, props);
        },
        createFolder: async (listName: string, folderName: string, props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.createFolder(listName, folderName, props);
        },
        uploadFile: async (folderServerRelativeUrl: string, file: File, props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.uploadFile(folderServerRelativeUrl, file, props);
        },
        deleteFile: async (fileServerRelativeUrl: string, props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.deleteFile(fileServerRelativeUrl, props);
        },
        currentProfile: async (props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.currentProfile(props);
        },

        getLoggedInSiteGroups: async (props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.getLoggedInSiteGroups(props);
        },
        getAllSiteGroups: async (props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.getAllSiteGroups(props);
        },
        getTopData: async (listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
            , orderby: { column: string, isAscending: boolean }, top: number, props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.getTopData(listName, columnsToRetrieve, columnsToExpand, filters, orderby, top, props);
        },
        addAttchmentInList: async (attFiles: File, listName: string, itemId: number, fileName: string, props: IEkycApprovalPrinceUatProps) => {
            return await spCrudOps.addAttchmentInList(attFiles, listName, itemId, fileName, props);
        }
    };
}