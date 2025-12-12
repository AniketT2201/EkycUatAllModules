
import { IEkycApprovalPrinceUatProps } from "../../components/IEkycApprovalPrinceUatProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { ITopNavigation } from '../interface/ITopNavigation';


export interface ITopNavigationOps {
    getTopNavigationData(props: ITopNavigation): Promise<ITopNavigation[]>;
}
export default function TopNavigationOps() {
    const spCrudOps = SPCRUDOPS();

    const getTopNavigationData = async ( props: IEkycApprovalPrinceUatProps): Promise<ITopNavigation[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const results = await spCrudOpsInstance.getData(
                "SSRSReports",
                "Title,Department,Links",
                "",
                "Activate eq '1'",
                { column: 'ID', isAscending: true }, // Sorting by Modified in descending order
                props
            );
    
            console.log('Results from API of TopNavigation:', results);
    
            const brr: Array<ITopNavigation> = new Array<ITopNavigation>();
            results.map((item: { Id: any; Title: any;Children:any; ParantId: unknown; Department: any; DisplayOrder: any; Url: any; Links: any}) => {
                brr.push({
                    Id: item.Id,
                    ParantId: item.ParantId,
                    Department: item.Department,
                    DisplayOrder: item.DisplayOrder,
                    Url: item.Url ? item.Url.Description : '',
                        Links: item.Links ? item.Links : '',  // Safely access the 'Url' field
                        Title: item.Title,
                        Children:item.Children
                });
            });
    
            console.log('Processed Data for TopNavigation:', brr);
            return brr;
        } catch (error) {
            console.error('Error in getTopNavigationData:', error.message);
            throw error;
        }
    };
    

    return {
        getTopNavigationData
    };
}


