

// const formatDate = (dateStr: string | null): string => {
//     if (!dateStr) return "-";
//         return new Intl.DateTimeFormat("en-GB", {
//             year: "numeric",
//             month: "short",
//             day: "2-digit",
//         }).format(new Date(dateStr));
//     };
import { IEkycTruboreUatProps } from "../components/IEkycTruboreUatProps";
 
 
 
 
 
 // Helper function to create a delay
export const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

