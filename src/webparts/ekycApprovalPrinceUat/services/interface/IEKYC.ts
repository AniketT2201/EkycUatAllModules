import { IUserProps } from "./IUser";
import { HttpClient } from "@microsoft/sp-http";

export interface IEKYC {
    Id? : any;
    Author?: any;
    Editor?: any;
    Created?: any;
    Modified?: any;
    Title? : any;
    Name? : any;
    PhoneNo? : any;
    defaultValue? : any;
    EmployeeCode : any;
    CustomerID? : any;
    FirmName : any;
    Email : any;
    MobileNo : any;
    ApprovedBy? : any;
//  Author : IUserProps;
    PipingSystem : any;
    Attachment: string;
    RegDetail: string;
    View: string;
    NantionalHeadName?: any;
    ZoneHeadName?: any;
    StateHeadName?: any;
    SecurityCode?: any;
    
    Department?: string;
    isPrefilled?: boolean;
    NationalHeadId?: number;
    NationalHeadEmail?: string;

    ZonalHeadId?: number;
    ZonalHeadEmail?: string;
    
    StateHead?: any;
    StateHeadId?: number;
    StateHeadEmail?: string;

    httpClient?: HttpClient;
}


export interface KYCData {
  ID: string;
  "Firm Name": string;
  Cosnstituion: string;
  Name: string;
  "Year Of Establishment": string;
  "Date of Birth": string;
  "Mobile No": string;
  Mobile_nos: string;
  Name_of_the_person: string;
  IsPVR: string;
  Cibil: string;
  Remark: string;
  "Phone No": string;
  "Fax No": string;
  Email: string;
  Address: string;
  "Address 2": string;
  "Post Code": string;
  City: string;
  State: string;
  "Warehouse Address": string;
  "Warehouse Address 2": string;
  "Warehouse Post Code": string;
  "Warehouse City": string;
  "Warehouse State": string;
  "Gross Turnover": string;
  IsDealtWith: string;
  TurnoverFinance: string;
  FromWhichDistributor: string;
  ProposedDistrict: string;
  "PAN No": string;
  "Aadhar No": string;
  "GST No": string;
  GSTRegType: string;
  "Account No": string;
  "IFSC Code": string;
  "Bank Name": string;
  "Bank Address": string;
  "Branch Code": string;
  "Deposit Amount": string;
  "Credit Period Fittings": string;
  "Credit Period Pipes": string;
  "Credit Limit": string;
  "Nearest Distributor": string;
  RejectRemark: string;
  CustomerCode: string;
  IsPending: string;
  "Modified Datetime": string;
  CurrentApprover: string;
  "KYC Status": string;
  "New KYC Status": string;
  "Reject KYC Status": string;
  RegisteredAddress: string;
  BankContactNo: string;
  BankLimit: string;
  LCLimit: string;
  Blankcheck: string;
  OwnedArea: string;
  OnRentArea: string;
  OwnedMarketValue: string;
  OnRentPM: string;
  ProposedDistrictCovered: string;
  NoOfVehical: string;
  SystemofBilling: string;
  NoOfMenpowerComputer: string;
  NoOfMenpowerCollection: string;
  NoOfMenpowerMarketing: string;
  NoOfMenpowerDispatch: string;
  GrowthPrecedingYear2: string;
  GrowthPrecedingYear1: string;
  GrowthLastYear: string;
  NatureofBusiness: string;
  NoOfYearDistribution: string;
  SecondaryPatchInstalled: boolean;
  Growth?: string;
  Growth1?: string;
  Growth2?: string;
}

export interface CustomerDetail {
  Name: string;
  Address: string;
  PhoneNo: string;
  DOB: string;
  DOA: string;
}

export interface SalesDetail {
  Product: string;
  Brand: string;
  NoofYears: string;
  CY_Sales_in_Lac: string;
}

export interface SalesByCategory {
  Category: string;
  SrNo: string;
  lineL2LY: string;
  lineLY: string;
  lineCY: string;
}

export interface CustomerSales {
  Name: string;
  AP: string;
  AGF: string;
  CPVC_SWR_EF: string;
  PPR: string;
}

export interface EstimatedBusiness {
  District: string;
  Town: string;
  AP: string;
  AF: string;
  CPVCPF: string;
  SWRPF: string;
  EFPF: string;
  PPRPF: string;
}

export interface KYCResponse {
  aMessage: { Result: string }[];
  Table: KYCData[];
  Table1: SalesByCategory[];
  Table2: EstimatedBusiness[];
  Table3: CustomerSales[];
  Table4: SalesDetail[];
  Table5: CustomerDetail[];
}

