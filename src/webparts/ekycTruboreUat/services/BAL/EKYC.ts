import { IEkycTruboreUatProps } from "../../components/IEkycTruboreUatProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { IEKYC } from '../interface/IEKYC';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { IDashboardInsert } from "../interface/IDashboardInsert";


export interface IDashboardOps {
    getDashboardData(props: IEkycTruboreUatProps): Promise<IEKYC[]>;
    // getAttachments: (itemId: number) => Promise<any[]>;
    // uploadAttachment: (itemId: number, file: File) => Promise<void>;
    // deleteAttachment: (itemId: number, fileName: string) => Promise<void>;
    // Attachments
  getAttachments(listName: string, itemId: number, props: IEkycTruboreUatProps): Promise<any[]>;
  uploadAttachment(listName: string, itemId: number, file: File, props: IEkycTruboreUatProps): Promise<any>;
  deleteAttachment(listName: string, itemId: number, fileName: string, props: IEkycTruboreUatProps): Promise<any>;
  getUniqueColumnValues(listName: string, columnName: string): Promise<string[]>;
  getDashboardItemById(listName: string ,id: number, props: IEkycTruboreUatProps): Promise<IEKYC>;
  insertDashboardData(item: IEKYC, props: IEkycTruboreUatProps): Promise<any>;
  updateDashboardData(id: number, item: IEKYC, props: IEkycTruboreUatProps): Promise<void>;
  preFillData(code: string, props: IEkycTruboreUatProps): Promise<{EmployeeName?: string; Department?: string}>;

}

export default function DashboardOps(): IDashboardOps {
    const spCrudOps = SPCRUDOPS();

   

    const getDashboardData = async ( props: IEkycTruboreUatProps): Promise<IEKYC[]> => {
    
        try {
            const spCrudOpsInstance = await spCrudOps;

            // Assuming current user id is available via props
            const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // Filter to only show items created by current user
            const filter = `PipingSystem eq 'Trubore' and Author/Id eq ${currentUserId}`;

            const results = await spCrudOpsInstance.getData(
                "Ekyc",
                "*,Id,Created,Modified,EmployeeCode,FirmName,Email,MobileNo,ApprovedBy,PipingSystem,NantionalHeadNameT,ZoneHeadNameT,StateHeadNameT,AttachmentFiles,SecurityCode,Author/Id,Author/Title",
                "AttachmentFiles,Author",
                filter,
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
                    NantionalHeadNameT: item.NantionalHeadNameT,
                    ZoneHeadNameT: item.ZoneHeadNameT,
                    StateHeadNameT: item.StateHeadNameT,
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

    const normalizeDate = (value?: string | Date | null): string | null => {
        if (!value || value === "") return null;
        return new Date(value).toISOString();
    };

    const getDashboardItemById = async (listName: string ,id: number, props: IEkycTruboreUatProps): Promise<IEKYC> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const item = await spCrudOpsInstance.getItemData(
            listName,
            id,
            "*,Id,Created,Modified,EmployeeCode,FirmName,Email,MobileNo,ApprovedBy,PipingSystem,NantionalHeadNameT,ZoneHeadNameT,StateHeadNameT,AttachmentFiles,SecurityCode",
            "AttachmentFiles",
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
            NantionalHeadNameT: item.NantionalHeadNameT,
            ZoneHeadNameT: item.ZoneHeadNameT,
            StateHeadNameT: item.StateHeadNameT,
            SecurityCode: item.SecurityCode
            };
        } catch (error) {
            console.error("Error fetching item by ID:", error.message);
            throw error;
        }
    };

    const preFillData = async (code: string, props: IEkycTruboreUatProps): Promise<{EmployeeName?: string; Department?: string}> => {
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

    const insertDashboardData = async (item: IEKYC, props: IEkycTruboreUatProps): Promise<any> => {
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
                NantionalHeadNameT: item.NationalHeadEmail,
                ZoneHeadNameT: item.ZonalHeadEmail,
                StateHeadNameT: item.StateHeadEmail,
                SecurityCode: item.SecurityCode

            }, 
            props);
            return result;
        } catch (error) {
            console.error('Error inserting Dashboard Data:', error.message);
            throw error;
        }
    };

    const updateDashboardData = async (id: number, item: IEKYC, props: IEkycTruboreUatProps): Promise<void> => {
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
        props: IEkycTruboreUatProps
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
        props: IEkycTruboreUatProps
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
        props: IEkycTruboreUatProps
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