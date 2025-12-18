import { IEkycPrinceProps } from "../../components/IEkycPrinceProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { IEKYC } from '../interface/IEKYC';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { IHistory } from "../interface/IHistory";


export interface IDashboardOps {
    getHistoryData(ekycId: number,props: IEkycPrinceProps): Promise<IHistory[]>;
    insertHistoryData(item: IHistory, props: IEkycPrinceProps): Promise<any>;
    getAttachments(listName: string, itemId: number, props: IEkycPrinceProps): Promise<any[]>;
    uploadAttachment(listName: string, itemId: number, file: File, props: IEkycPrinceProps): Promise<any>;
}


export default function HistoryOps(): IDashboardOps {
    const spCrudOps = SPCRUDOPS();

    const getHistoryData = async (ekycId: number, props: IEkycPrinceProps): Promise<IHistory[]> => {
        
        try {
            const spCrudOpsInstance = await spCrudOps;

            // Assuming current user id is available via props
            //const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // Filter to only show items created by current user
            const filter = `KYCId/Id eq ${ekycId}`;

            const results = await spCrudOpsInstance.getData(
                "WorkflowHistory",
                "*,Id,Created,Modified,Remark,Author/Id,Author/Title,AttachmentFiles,AttachmentFiles/Id,AttachmentFiles/FileName,AttachmentFiles/ServerRelativeUrl",
                "AttachmentFiles, Author",
                filter,
                { column: "Id", isAscending: false }, 
                props
            );
    
            console.log('Results from API of Dashboard:', results);

            // 🔑 Sort descending by Id
            const sortedResults = results.sort(
                (a: any, b: any) => b.Id - a.Id
            );
    
            let brr: Array<IHistory> = new Array<IHistory>();
            sortedResults.map((item: any) => {
                brr.push({
                    Id: item.Id, 
                    newRemark: item.Remark,
                    Created: item.Created,
                    Author: item.Author?.Title,
                    Attachment: item.AttachmentFiles ?? []
                });
            });
    
            console.log('Processed Data for History:', brr);
            return brr;
        } catch (error) {
            console.error('Error in History Data:', error.message);
            throw error;
        }
    };


    const insertHistoryData = async (item: IHistory, props: IEkycPrinceProps): Promise<any> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const result = await spCrudOpsInstance.insertData(
            "WorkflowHistory",
            { 
                EKYCIdId: item.Id,
                Remark: item.newRemark

            }, 
            props);

            const historyItemId = result?.data?.Id ?? result?.Id;
            return historyItemId;
        } catch (error) {
            console.error('Error inserting History Data:', error.message);
            throw error;
        }
    };

    const getAttachments = async (
        listName: string,
        itemId: number,
        props: IEkycPrinceProps
        ): Promise<{ name: string; url: string }[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const attachments = await spCrudOpsInstance.getAttachments(listName, itemId, props);
            return attachments ?? [];
        } catch (error) {
            console.error(`Error fetching attachments for item ${itemId} in list ${listName}:`, error);
            return []; // return empty list so UI doesn’t break
        }
    };


    const uploadAttachment = async (
        listName: string,
        itemId: number,
        file: File,
        props: IEkycPrinceProps
        ): Promise<void> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            await spCrudOpsInstance.uploadAttachment(listName, itemId, file, props);
            console.log(`Uploaded ${file.name} successfully`);
        } catch (error: any) {
            console.error("Error uploading attachment:", error.message || error);
            throw error;
        }
        };

    return {
        getHistoryData,
        insertHistoryData,
        getAttachments,
        uploadAttachment
    };
}
    