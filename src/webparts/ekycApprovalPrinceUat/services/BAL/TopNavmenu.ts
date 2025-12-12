
import { IEkycApprovalPrinceUatProps } from "../../components/IEkycApprovalPrinceUatProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { ITopNavmenu } from '../interface/ITopNavmenu';

export interface ITopNavmenuOps {
    getTopNavmenuData(props: IEkycApprovalPrinceUatProps): Promise<ITopNavmenu[]>;
}

export default function TopNavmenuOps(): ITopNavmenuOps {
    const spCrudOps = SPCRUDOPS();

    const getTopNavmenuData = async (props: IEkycApprovalPrinceUatProps): Promise<ITopNavmenu[]> => {
        try {
            const results = await (await spCrudOps).getData(
                "Navbar",
                "*", 
                "",
                "Status eq 'Active'",
                { column: 'ID', isAscending: true }, // Sorting
                props
            );

            console.log('Results from API of TopNavMenu:', results);

            const brr: ITopNavmenu[] = results.map((item: any) => ({
                Id: item.Id,
                Title: item.Title,
                Url: item.Hyperlink?.Description || '',
                Hyperlink: item.Hyperlink?.Url || ''
                }));


            console.log('Processed Data for TopNavMenu:', brr);
            return brr;
        } catch (error: any) {
            console.error('Error in getTopMenuData:', error.message);
            throw error;
        }
    };

    return {
        getTopNavmenuData
    };
}
