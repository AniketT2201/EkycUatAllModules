import { IEkycApprovalPrinceUatProps } from "../../components/IEkycApprovalPrinceUatProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { IEKYC } from '../interface/IEKYC';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { IDashboardInsert } from "../interface/IDashboardInsert";


export interface IDashboardOps {
    getDashboardData(props: IEkycApprovalPrinceUatProps): Promise<IEKYC[]>;
    // getAttachments: (itemId: number) => Promise<any[]>;
    // uploadAttachment: (itemId: number, file: File) => Promise<void>;
    // deleteAttachment: (itemId: number, fileName: string) => Promise<void>;
    // Attachments
  getAttachments(listName: string, itemId: number, props: IEkycApprovalPrinceUatProps): Promise<any[]>;
  uploadAttachment(listName: string, itemId: number, file: File, props: IEkycApprovalPrinceUatProps): Promise<any>;
  deleteAttachment(listName: string, itemId: number, fileName: string, props: IEkycApprovalPrinceUatProps): Promise<any>;
  getUniqueColumnValues(listName: string, columnName: string): Promise<string[]>;
  getDashboardItemById(listName: string ,id: number, props: IEkycApprovalPrinceUatProps): Promise<IEKYC>;
  insertDashboardData(item: IEKYC, props: IEkycApprovalPrinceUatProps): Promise<any>;
  updateDashboardData(id: number, item: IEKYC, props: IEkycApprovalPrinceUatProps): Promise<void>;
  preFillData(code: string, props: IEkycApprovalPrinceUatProps): Promise<{EmployeeName?: string; Department?: string}>;

}

export default function DashboardOps(): IDashboardOps {
    const spCrudOps = SPCRUDOPS();

   

    const getDashboardData = async ( props: IEkycApprovalPrinceUatProps): Promise<IEKYC[]> => {
    
        try {
            const spCrudOpsInstance = await spCrudOps;

            // // Assuming current user id is available via props
            // const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // // Filter to only show items created by current user
            // const filter = `Author/Id eq ${currentUserId}`;

            const results = await spCrudOpsInstance.getData(
                "Ekyc",
                "*,Id,Created,Modified,EmployeeCode,FirmName,Email,MobileNo,ApprovedBy,PipingSystem,NantionalHeadName,ZoneHeadName,StateHeadName,AttachmentFiles,SecurityCode",
                "AttachmentFiles",
                "PipingSystem eq 'Prince'",
                { column: "Id", isAscending: false }, 
                props
            );
    
            console.log('Results from API of Dashboard:', results);

            // 🔑 Sort descending by Id
            const sortedResults = results.sort(
              (a: any, b: any) => b.Id - a.Id
            );
    
            let brr: Array<IEKYC> = new Array<IEKYC>();
            sortedResults.map((item: any) => {
                brr.push({
                    Id: item.Id, 
                    RegDetail: "Details",
                    View: "View",
                    Attachment: "Download",
                    EmployeeCode: item.EmployeeCode,
                    FirmName: item.FirmName,
                    Email: item.Email,
                    MobileNo: item.MobileNo,
                    ApprovedBy: item.ApprovedBy,
                    PipingSystem: item.PipingSystem,
                    NantionalHeadName: item.NantionalHeadName,
                    ZoneHeadName: item.ZoneHeadName,
                    StateHeadName: item.StateHeadName,
                    SecurityCode: item.SecurityCode

                });
            });
    
            console.log('Processed Data for Dashboard:', brr);
            return brr;
        } catch (error) {
            console.error('Error in Dashboard Data:', error.message);
            throw error;
        }
    };

    const getUniqueColumnValues = async (listName: string, columnName: string): Promise<string[]> => {
        try {
            const items: any[] = await sp.web.lists.getByTitle(listName).items.select(columnName).getAll();

            // Extract column values
            const values = items.map(i => i[columnName]);

            // Remove empty + duplicates
            const uniqueValues = Array.from(new Set(values.filter(v => v && v.trim() !== "")));

            return uniqueValues;
        } catch (err) {
            console.error("Error fetching values:", err);
            return [];
        }
    };

    const formatDisplayDateTime = (value?: string | Date | null): string => {
        if (!value) return "";
        const d = new Date(value);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };



    const getDashboardItemById = async (listName: string ,id: number, props: IEkycApprovalPrinceUatProps): Promise<IEKYC> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const item = await spCrudOpsInstance.getItemData(
            listName,
            id,
            "*,Id,Created,Modified,Author/Id,Author/Title,Author/EMail,Editor/Id,Editor/Title,Editor/EMail,ApprovedBy,CustomerID,defaultValue,Name,PhoneNo,StateHead/Id,StateHead/Title,StateHead/EMail,EmployeeCode,FirmName,Email,MobileNo,ApprovedBy,PipingSystem,NantionalHeadName,ZoneHeadName,StateHeadName,AttachmentFiles,SecurityCode",
            "AttachmentFiles, StateHead, Author, Editor",
            props
            );

            return {
            Id: item.Id,
            RegDetail: "Details",
            View: "View",
            Attachment: "Download",
            EmployeeCode: item.EmployeeCode,
            FirmName: item.FirmName,
            Email: item.Email,
            MobileNo: item.MobileNo,
            ApprovedBy: item.ApprovedBy,
            PipingSystem: item.PipingSystem,
            NantionalHeadName: item.NantionalHeadName,
            ZoneHeadName: item.ZoneHeadName,
            StateHeadName: item.StateHeadName,
            SecurityCode: item.SecurityCode,
            CustomerID: item.CustomerID,
            defaultValue: item.defaultValue,
            Name: item.Name,
            PhoneNo: item.PhoneNo,
            StateHead: item.StateHead?.EMail,
            Created: formatDisplayDateTime(item.Created),
            Modified: formatDisplayDateTime(item.Modified),
            Author: item.Author?.Title,
            Editor: item.Editor?.Title
            };
        } catch (error) {
            console.error("Error fetching item by ID:", error.message);
            throw error;
        }
    };

    const preFillData = async (code: string, props: IEkycApprovalPrinceUatProps): Promise<{EmployeeName?: string; Department?: string}> => {
        try {
            const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);

            const items = await web.lists.getByTitle("Ekyc")
                .items
                .select("Id, EmployeeCode, EmployeeName, Department")
                .filter(`EmployeeCode eq '${code}'`)
                .top(1)
                .get();

            if (items.length > 0) {
                return {
                    EmployeeName: items[0].EmployeeName,
                    Department: items[0].Department,
                };
            }
            return{};

        }catch (err) {
            console.error("Error fetching employee by code:", err);
            return{};
        }
    };

    const insertDashboardData = async (item: IEKYC, props: IEkycApprovalPrinceUatProps): Promise<any> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const result = await spCrudOpsInstance.insertData(
            "Ekyc",
            { 
                EmployeeCode: item.EmployeeCode,
                FirmName: item.FirmName,
                Email: item.Email,
                MobileNo: item.MobileNo,
                ApprovedBy: item.ApprovedBy,
                PipingSystem: item.PipingSystem,
                NantionalHeadName: item.NationalHeadEmail,
                ZoneHeadName: item.ZonalHeadEmail,
                StateHeadName: item.StateHeadEmail

            }, 
            props);
            return result;
        } catch (error) {
            console.error('Error inserting Dashboard Data:', error.message);
            throw error;
        }
    };

    const updateDashboardData = async (id: number, item: IEKYC, props: IEkycApprovalPrinceUatProps): Promise<void> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            await spCrudOpsInstance.updateData(
            "Ekyc",
            id,
            {
                ...item,

            },
            props
            );
        } catch (error) {
            console.error("Error updating Dashboard Data:", error.message);
            throw error;
        }
    };


    const getAttachments = async (
        listName: string,
        itemId: number,
        props: IEkycApprovalPrinceUatProps
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
        props: IEkycApprovalPrinceUatProps
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


    const deleteAttachment = async (
        listName: string,
        itemId: number,
        fileName: string,
        props: IEkycApprovalPrinceUatProps
        ): Promise<void> => {
        if (!fileName) {
            console.error("No filename provided for deleteAttachment");
            return;
        }
        try {
            const spCrudOpsInstance = await spCrudOps;
            await spCrudOpsInstance.deleteAttachment(listName, itemId, fileName.trim(), props);
            console.log(`Deleted ${fileName} successfully`);
        } catch (error: any) {
            console.error("Error deleting attachment:", error.message || error);
            throw error;
        }
        };

        





    

    return {
        getDashboardData,
        insertDashboardData,
        preFillData,
        getUniqueColumnValues,
        updateDashboardData,
        getDashboardItemById,
        getAttachments,
        uploadAttachment,
        deleteAttachment
    };
}