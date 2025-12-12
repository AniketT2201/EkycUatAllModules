

import { IEkycTruboreUatProps } from "../../components/IEkycTruboreUatProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { ITopMenu } from '../interface/ITopMenu';


export interface ITopMenuOps {
    getTopMenuData(props: ITopMenu): Promise<ITopMenu[]>;
}
export default function TopMenuOps() {
    const spCrudOps = SPCRUDOPS();

    const getTopMenuData = async ( props: IEkycTruboreUatProps): Promise<ITopMenu[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const results = await spCrudOpsInstance.getData(
                "TopNavigation",
                "*",
                "",
                "Status eq 'Active'",
                { column: 'ID', isAscending: true }, // Sorting by Modified in descending order
                props
            );
    
            console.log('Results from API of TopMenu:', results);
    
            const brr: Array<ITopMenu> = new Array<ITopMenu>();
            results.map((item: { Id: any; Title: any;Children:any; ParantId: unknown;  DisplayOrder: any; Url: any; Link: any}) => {
                brr.push({
                    Id: item.Id,
                    ParantId: item.ParantId,
                    DisplayOrder: item.DisplayOrder,
                    Url: item.Url ? item.Url.Description : '',
                        Link: item.Url?.Url ? item.Url.Url : '',  // Safely access the 'Url' field
                        Title: item.Title,
                        Children:item.Children
                });
            });
    
            console.log('Processed Data for TopMenu:', brr);
            return brr;
        } catch (error) {
            console.error('Error in getTopMenuData:', error.message);
            throw error;
        }
    };
    

    return {
        getTopMenuData
    };
}
