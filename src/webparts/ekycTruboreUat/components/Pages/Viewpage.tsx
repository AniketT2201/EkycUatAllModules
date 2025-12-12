import * as React from 'react';
import { useState, useEffect } from 'react';
import { sp } from '@pnp/sp/presets/all';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import axios, { AxiosResponse } from 'axios';
import Swal from 'sweetalert2';
//import 'tailwindcss/tailwind.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import { HttpClientResponse, HttpClient } from "@microsoft/sp-http";
import { IEkycTruboreUatProps } from '../IEkycTruboreUatProps';
import { ISPFXContext } from '@pnp/common';
import { SPComponentLoader } from '@microsoft/sp-loader';


SPComponentLoader.loadCss('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
SPComponentLoader.loadCss('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');
//SPComponentLoader.loadCss('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
//SPComponentLoader.loadCss('https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css');

interface KYCFormProps extends IEkycTruboreUatProps{
  context: ISPFXContext;
  httpClient: HttpClient;
}

interface KYCData {
  ID: string;
  FirmName: string;
  Cosnstituion: string;
  Name: string;
  YearOfEstablishment: string;
  DateofBirth: string;
  MobileNo: string;
  Mobile_nos: string;
  Name_of_the_person: string;
  IsPVR: string;
  Cibil: string;
  Remark: string;
  PhoneNo: string;
  FaxNo: string;
  Email: string;
  Address: string;
  Address2: string;
  PostCode: string;
  City: string;
  State: string;
  WarehouseAddress: string;
  WarehouseAddress2: string;
  WarehousePostCode: string;
  WarehouseCity: string;
  WarehouseState: string;
  GrossTurnover: string;
  IsDealtWith: string;
  TurnoverFinance: string;
  FromWhichDistributor: string;
  ProposedDistrict: string;
  PANNo: string;
  AadharNo: string;
  GSTNo: string;
  GSTRegType: string;
  AccountNo: string;
  IFSCCode: string;
  BankName: string;
  BankAddress: string;
  BranchCode: string;
  DepositAmount: string;
  CreditPeriodFittings: string;
  CreditPeriodPipes: string;
  CreditLimit: string;
  NearestDistributor: string;
  RejectRemark: string;
  CustomerCode: string;
  IsPending: string;
  ModifiedDatetime: string;
  CurrentApprover: string;
  NewKYCStatus: string;
  RejectKYCStatus: string;
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

interface CustomerDetail {
  Name: string;
  Address: string;
  PhoneNo: string;
  DOB: string;
  DOA: string;
}

interface SalesDetail {
  Product: string;
  Brand: string;
  NoofYears: string;
  CY_Sales_in_Lac: string;
}

interface SalesByCategory {
  Category: string;
  SrNo: string;
  lineL2LY: string;
  lineLY: string;
  lineCY: string;
}

interface CustomerSales {
  Name: string;
  AP: string;
  AGF: string;
  CPVC_SWR_EF: string;
  PPR: string;
}

interface EstimatedBusiness {
  District: string;
  Town: string;
  AP: string;
  AF: string;
  CPVCPF: string;
  SWRPF: string;
  EFPF: string;
  PPRPF: string;
}

interface KYCResponse {
  aMessage: { Result: string }[];
  Table: KYCData[];
  Table1: SalesByCategory[];
  Table2: EstimatedBusiness[];
  Table3: CustomerSales[];
  Table4: SalesDetail[];
  Table5: CustomerDetail[];
}

export const Viewpage: React.FC<KYCFormProps> = ({ currentSPContext, httpClient }) => {
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetail[]>([]);
  const [salesDetails, setSalesDetails] = useState<SalesDetail[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategory[]>([]);
  const [customerSales, setCustomerSales] = useState<CustomerSales[]>([]);
  const [estimatedBusiness, setEstimatedBusiness] = useState<EstimatedBusiness[]>([]);
  const [securityNo, setSecurityNo] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [isCurrentApprover, setIsCurrentApprover] = useState<boolean>(false);
  const [showButtons, setShowButtons] = useState<{
    approve: boolean;
    reject: boolean;
    update: boolean;
    navision: boolean;
    save: boolean;
    secondaryPatch: boolean;
  }>({
    approve: false,
    reject: false,
    update: false,
    navision: false,
    save: false,
    secondaryPatch: false,
  });
  const [rejectRemark, setRejectRemark] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [sameAsAbove, setSameAsAbove] = useState<boolean>(false);

  // Fetch URL parameters
  const getUrlVars = (): { ID: string; itemID: string } => {
    const vars: { [key: string]: string } = {};
    const query = window.location.search.substring(1).split('&');
    query.forEach(param => {
      const [key, value] = param.split('=');
      vars[key] = value;
    });
    return { ID: vars.ID || '', itemID: vars.itemID || '' };
  };

  // Format date to YYYY-MM-DD
  const getFormatDate = (date: string): string => {
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  // Validate PAN
  const validatePAN = (pan: string): boolean => {
    const regex = /^[a-zA-Z]{5}\d{4}[a-zA-Z]{1}$/;
    if (!regex.test(pan)) {
      Swal.fire('Error', 'Enter Correct PAN No', 'error');
      return false;
    }
    return true;
  };

  // Validate GST
  const validateGST = (gst: string, pan: string): boolean => {
    const regex = /^([0-9]{2}[a-zA-Z]{4}([a-zA-Z]{1}|[0-9]{1})[0-9]{4}[a-zA-Z]{1}([a-zA-Z]|[0-9]){3}){0,15}$/;
    if (!regex.test(gst)) {
      Swal.fire('Error', 'Enter Correct GST Number', 'error');
      return false;
    }
    if (!gst.includes(pan)) {
      Swal.fire('Error', 'PAN & GST Not Matched', 'error');
      return false;
    }
    return true;
  };

  // Fetch current user email
  const fetchCurrentUser = async () => {
    try {
      const user = await sp.web.currentUser.get();
      setCurrentUserEmail(user.Email.toLowerCase());
    } catch (error) {
      console.error('Error fetching user:', error);
      Swal.fire('Error', 'Failed to fetch user details', 'error');
    }
  };

  // Fetch KYC data
  const fetchKYCData = async () => {
  //const { ID, itemID } = getUrlVars();
  const ID = "76CA35C4149F401C910DA04CB901A4B2";
  const itemID = "1867";
  setSecurityNo(ID);
  setItemId(itemID);

  const apiUrl = "https://uat.princepipes.com:567/api/CustomerKYC/getCustomerKYCDetails";

  try {
    // ✅ Similar to your getHttpData pattern
    const response: HttpClientResponse = await httpClient.post(
      apiUrl,
      HttpClient.configurations.v1,
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ ActionID: "2", SecurityNo: ID }),
      }
    );

    const responseData: KYCResponse = await response.json();

    if (responseData?.aMessage?.[0]?.Result === "100") {
      const data = responseData.Table[0];

      // ✅ Set KYC data
      setKycData({
        ...data,
        DateofBirth: data.DateofBirth ? getFormatDate(data.DateofBirth) : "",
        ModifiedDatetime: getFormatDate(data.ModifiedDatetime),
      });

      setCustomerDetails(responseData.Table5);
      setSalesDetails(responseData.Table4);
      setSalesByCategory(responseData.Table1);
      setCustomerSales(responseData.Table3);
      setEstimatedBusiness(responseData.Table2);

      // ✅ Calculate growth %
      const prevYear2 = parseFloat(data.GrowthPrecedingYear2) || 0;
      const prevYear1 = parseFloat(data.GrowthPrecedingYear1) || 0;
      const lastYear = parseFloat(data.GrowthLastYear) || 0;

      const growth1 = prevYear2 ? ((prevYear1 / prevYear2 - 1) * 100).toFixed(2) : "0";
      const growth2 = prevYear1 ? ((lastYear / prevYear1 - 1) * 100).toFixed(2) : "0";

      setKycData((prev) =>
        prev
          ? {
              ...prev,
              Growth: "0",
              Growth1: growth1,
              Growth2: growth2,
            }
          : prev
      );

      // ✅ Check current approver & set permissions
      const currentApproverList = data.CurrentApprover.toLowerCase().split(",").map((email: string) => email.trim());
      if (currentApproverList.includes(currentUserEmail)) {
        setIsCurrentApprover(true);
        setShowButtons({
          approve: !["7", "8", "9"].includes(data.NewKYCStatus),
          reject: !["7", "8", "9"].includes(data.NewKYCStatus),
          update: !["7", "8", "9"].includes(data.NewKYCStatus),
          navision: data.NewKYCStatus === "7",
          save: ["7", "8"].includes(data.NewKYCStatus),
          secondaryPatch: data.NewKYCStatus === "8",
        });
      }
    } else {
      Swal.fire({
        icon: "warning",
        title: "No Data Found",
        text: "No KYC data was found for this Security Number.",
      });
    }
  } catch (error) {
    console.error("Error fetching KYC data:", error);

    if (error instanceof Error) {
      if (error.message.includes("timed out")) {
        Swal.fire({
          icon: "error",
          title: "Request Timeout",
          text: "The KYC API request timed out. Please try again or contact the administrator.",
        });
      } else if (error.message.includes("Failed to fetch")) {
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Failed to connect to the KYC API. Please check your network or contact the administrator.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Failed to fetch KYC data: ${error.message}`,
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred.",
      });
    }
  }
};



  // Handle PIN code blur
  const handlePinCodeBlur = async (pinCode: string) => {
    try {
      const response = await axios.get(`https://uat.princepipes.com:446/wsVendorDetails.asmx/getPinCode?PinCode=${pinCode}`);
      setKycData(prev => prev ? ({
        ...prev,
        City: response.data[0].Message[0].City,
        State: response.data[0].Message[0].StateCode,
      }) : prev);
    } catch (error) {
      console.error('Error fetching PIN code:', error);
    }
  };

  // Handle same as above checkbox
  const handleSameAsAbove = (checked: boolean) => {
    setSameAsAbove(checked);
    if (checked && kycData) {
      setKycData({
        ...kycData,
        WarehouseAddress: kycData.Address,
        WarehouseAddress2: kycData.Address2,
        WarehousePostCode: kycData.PostCode,
        WarehouseCity: kycData.City,
        WarehouseState: kycData.State,
      });
    } else if (kycData) {
      setKycData({
        ...kycData,
        WarehouseAddress: '',
        WarehouseAddress2: '',
        WarehousePostCode: '',
        WarehouseCity: '',
        WarehouseState: '',
      });
    }
  };

  // Update KYC
  const updateKyc = async () => {
    if (!kycData) return;

    if (!kycData.GrossTurnover) {
      Swal.fire('Error', 'Select Gross Turnover', 'error');
      return;
    }

    if (!kycData.PANNo) {
      Swal.fire('Error', 'Enter GST No', 'error');
      return;
    }

    if (!validatePAN(kycData.PANNo)) return;

    if (!kycData.GSTNo) {
      Swal.fire('Error', 'Enter GST No', 'error');
      return;
    }

    if (!validateGST(kycData.GSTNo, kycData.PANNo)) return;

    const kycStatus = kycData.SecondaryPatchInstalled ? '9' : '8';

    try {
      const response = await axios.post(
        'https://uat.princepipes.com:567/api/CustomerKYC/updateCustomerKYCDetails',
        {
          ActionID: '5',
          SecurityNo: securityNo,
          ...kycData,
          KYCStatus: kycStatus,
          ModifiedBy: '10691',
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      await updateListItem();
      Swal.fire('Updated!', 'KYC Details Updated successfully', 'success');
      window.location.href = 'https://princepipes.sharepoint.com/sites/E_KycUAT/E_KYC_Library/EKYC_PrinceDashboard.aspx';
    } catch (error) {
      console.error('Error updating KYC:', error);
    }
  };

  // Approve KYC
  const approveKyc = async () => {
    if (!kycData) return;

    try {
      await axios.post(
        'https://uat.princepipes.com:567/api/CustomerKYC/approveCustomerKYCDetails',
        {
          ActionID: '6',
          ModifiedBy: 'XYZ',
          KYCStatus: kycData.NewKYCStatus,
          SHPID: kycData.ID,
          SecurityNo: securityNo,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      await updateSHPID();
      await updatePending();
      Swal.fire('Success', 'Send For Approval', 'success');
    } catch (error) {
      console.error('Error approving KYC:', error);
    }
  };

  // Reject KYC
  const rejectKyc = async () => {
    if (!kycData) return;

    try {
      await axios.post(
        'https://uat.princepipes.com:567/api/CustomerKYC/RejectCustomerKYCDetails',
        {
          ActionID: '7',
          ModifiedBy: '9961',
          KYCStatus: '1',
          SecurityNo: securityNo,
          IsPending: kycData.IsPending,
          SHPID: kycData.ID,
          RejectRemark: rejectRemark,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setShowRejectModal(false);
      Swal.fire('Success', 'KYC Rejected', 'success');
    } catch (error) {
      console.error('Error rejecting KYC:', error);
    }
  };

  // Update SharePoint ID
  const updateSHPID = async () => {
    try {
      await axios.post(
        'https://uat.princepipes.com:567/api/CustomerKYC/updateSHPID',
        {
          ActionID: '8',
          SecurityNo: securityNo,
          SHPID: kycData?.ID,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error updating SHPID:', error);
    }
  };

  // Update SharePoint list item
  const updateListItem = async () => {
    if (!kycData || !itemId) return;

    try {
      await sp.web.lists.getByTitle('Ekyc').items.getById(parseInt(itemId)).update({
        FirmName: kycData.FirmName,
        MobileNo: kycData.MobileNo,
        Email: kycData.Email,
        CustomerID: kycData.CustomerCode,
        ApprovedBy: kycData.IsPending,
      });
      console.log('SharePoint list item updated');
    } catch (error) {
      console.error('Error updating SharePoint item:', error);
    }
  };

  // Update pending status
  const updatePending = async () => {
    if (!kycData || !itemId) return;

    try {
      await sp.web.lists.getByTitle('Ekyc').items.getById(parseInt(itemId)).update({
        ApprovedBy: kycData.IsPending,
      });
      console.log('Pending status updated');
    } catch (error) {
      console.error('Error updating pending status:', error);
    }
  };

  // Create in Navision
  const createInNavision = async () => {
    if (!kycData) return;

    const params = new URLSearchParams({
      newCustNo: securityNo,
      name: kycData.FirmName,
      address: kycData.Address,
      address2: kycData.Address2,
      city: kycData.City,
      contact: kycData.Name,
      phoneNo: kycData.PhoneNo,
      faxNo: kycData.FaxNo,
      postCode: kycData.PostCode,
      eMail: kycData.Email,
      pANNo: kycData.PANNo,
      stateCode: kycData.State,
      gSTRegistrationNo: kycData.GSTNo,
      gsTCustTypeoption: '1',
      birthDate: kycData.DateofBirth,
      mobile: kycData.MobileNo,
      mobileNo2: kycData.Mobile_nos,
      salespersonCode: '',
      areaSalesManager: '',
      ownersName: kycData.Name,
      creditLimit: kycData.CreditLimit,
      dateofcreation: kycData.ModifiedDatetime,
      DepositAmount: kycData.DepositAmount,
    });

    try {
      const response = await axios.get(
        `https://uat.princepipes.com:446/wscustomerdetails.asmx/updateCustomerDetial?${params.toString()}`
      );

      if (response.data[0].Result === 'Failed') {
        Swal.fire('Error', 'Server Busy!!', 'error');
      } else {
        setKycData(prev => prev ? ({ ...prev, CustomerCode: response.data[0].CustomerCode }) : prev);
        Swal.fire('Success', 'Details Updated in Navision!!', 'success');
        await updateKyc();
      }
    } catch (error) {
      console.error('Error updating Navision:', error);
      Swal.fire('Error', 'Server Busy!!', 'error');
    }
  };

  useEffect(() => {
    // Create a wrapper object to match @pnp/common's ISPFXContext
  const pnpContext: ISPFXContext = {
    ...currentSPContext, // Spread all properties from currentSPContext
    msGraphClientFactory: {
      getClient: () => currentSPContext.msGraphClientFactory.getClient('3'), // Adapt to match expected signature
    },
    pageContext: {
      web: {
        absoluteUrl: currentSPContext.pageContext.web.absoluteUrl, // Ensure pageContext is included
      },
    },
  };
  sp.setup({ spfxContext: pnpContext });
  fetchCurrentUser();
  fetchKYCData();
}, [currentSPContext, currentUserEmail]);

  return (
    <div className="container mx-auto p-4">
      <ul className="flex border-b">
        <li className="mr-1">
          <a className="inline-block py-2 px-4 text-blue-500 font-semibold border-b-2 border-blue-500" href="#communication">Communication Details</a>
        </li>
        <li className="mr-1">
          <a className="inline-block py-2 px-4 text-gray-500 font-semibold" href="#financial">Financial Details</a>
        </li>
        <li className="mr-1">
          <a className="inline-block py-2 px-4 text-gray-500 font-semibold" href="#tax">TAX/GST Details</a>
        </li>
        <li className="mr-1">
          <a className="inline-block py-2 px-4 text-gray-500 font-semibold" href="#bank">Bank Details</a>
        </li>
      </ul>

      <div className="tab-content mt-4">
        {/* Communication Details */}
        <div id="communication" className="tab-pane active">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Registered Business Name</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.FirmName || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">ID</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.ID || ''} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Registered Address</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.RegisteredAddress || ''} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Constitution of the Firm</label>
              <div className="flex space-x-4">
                {['Proprietor', 'Partner', 'Private', 'Public', 'Others'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="constitution"
                      value={option}
                      checked={kycData?.Cosnstituion === option}
                      readOnly
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.Name || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Date of Birth</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.DateofBirth || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Year of Establishment</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.YearOfEstablishment || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Mobile No.</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.MobileNo || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Telephone No.</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.PhoneNo || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Fax No.</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.FaxNo || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.Email || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Alternate Mobile No.</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.Mobile_nos || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Alternate Name</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.Name_of_the_person || ''} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Trading/Billing Address</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.Address || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Address 2</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.Address2 || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Post Code</label>
              <input
                className="w-full p-2 border rounded"
                readOnly
                value={kycData?.PostCode || ''}
                onBlur={(e) => handlePinCodeBlur(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">City</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.City || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">State</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.State || ''} />
            </div>
            <div className="col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sameAsAbove}
                  onChange={(e) => handleSameAsAbove(e.target.checked)}
                />
                <span className="ml-2">Same as above</span>
              </label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Warehouse/Delivery Address</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.WarehouseAddress || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Address 2</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.WarehouseAddress2 || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Post Code</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.WarehousePostCode || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">City</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.WarehouseCity || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">State</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.WarehouseState || ''} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Full Details of Proprietor/Partners/Directors</label>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border p-2">Sr No</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Address</th>
                    <th className="border p-2">Phone No</th>
                    <th className="border p-2">Date of Birth</th>
                    <th className="border p-2">Date of Anniversary</th>
                  </tr>
                </thead>
                <tbody>
                  {customerDetails.map((item, index) => (
                    <tr key={index}>
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{item.Name}</td>
                      <td className="border p-2">{item.Address}</td>
                      <td className="border p-2">{item.PhoneNo}</td>
                      <td className="border p-2">{item.DOB}</td>
                      <td className="border p-2">{item.DOA}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div id="financial" className="tab-pane hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">No of Years in Distributor Business</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.NoOfYearDistribution || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Nature & Details of Current Business</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.NatureofBusiness || ''} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Growth of Last 3 Years</label>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border p-2">Growth</th>
                    <th className="border p-2">Preceding Year</th>
                    <th className="border p-2">Preceding Year</th>
                    <th className="border p-2">Last Year</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">Turnover</td>
                    <td className="border p-2"><input className="w-full p-1 border rounded" readOnly value={kycData?.GrowthPrecedingYear2 || ''} /></td>
                    <td className="border p-2"><input className="w-full p-1 border rounded" readOnly value={kycData?.GrowthPrecedingYear1 || ''} /></td>
                    <td className="border p-2"><input className="w-full p-1 border rounded" readOnly value={kycData?.GrowthLastYear || ''} /></td>
                  </tr>
                  <tr>
                    <td className="border p-2">% Growth</td>
                    <td className="border p-2"><input className="w-full p-1 border rounded" readOnly value={kycData?.Growth || ''} /></td>
                    <td className="border p-2"><input className="w-full p-1 border rounded" readOnly value={kycData?.Growth1 || ''} /></td>
                    <td className="border p-2"><input className="w-full p-1 border rounded" readOnly value={kycData?.Growth2 || ''} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">No of Manpower</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">For Dispatch</label>
                  <input className="w-full p-2 border rounded" readOnly value={kycData?.NoOfMenpowerDispatch || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium">For Marketing</label>
                  <input className="w-full p-2 border rounded" readOnly value={kycData?.NoOfMenpowerMarketing || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium">For Collection</label>
                  <input className="w-full p-2 border rounded" readOnly value={kycData?.NoOfMenpowerCollection || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium">For Computer System</label>
                  <input className="w-full p-2 border rounded" readOnly value={kycData?.NoOfMenpowerComputer || ''} />
                </div>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">System of Billing & Stock Management</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.SystemofBilling || ''} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">No of Vehicle & Type</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.NoOfVehical || ''} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">District/Towns Proposed to be Covered</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.ProposedDistrictCovered || ''} />
            </div>
            <div className="col-span-2 border p-4 rounded">
              <h3 className="text-center font-semibold">Details of Infrastructure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4>On Rent</h4>
                  <div>
                    <label className="block text-sm font-medium">Rent per Month</label>
                    <input className="w-full p-2 border rounded" readOnly value={kycData?.OnRentPM || ''} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Area (in Sq. Ft.)</label>
                    <input className="w-full p-2 border rounded" readOnly value={kycData?.OnRentArea || ''} />
                  </div>
                </div>
                <div>
                  <h4>Owned</h4>
                  <div>
                    <label className="block text-sm font-medium">Market Value</label>
                    <input className="w-full p-2 border rounded" readOnly value={kycData?.OwnedMarketValue || ''} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Area (in Sq. Ft.)</label>
                    <input className="w-full p-2 border rounded" readOnly value={kycData?.OwnedArea || ''} />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Details of Sales</label>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border p-2">Sr No.</th>
                    <th className="border p-2">Product</th>
                    <th className="border p-2">Brand</th>
                    <th className="border p-2">No of Years</th>
                    <th className="border p-2">Current Year Sales (In Lakhs)</th>
                  </tr>
                </thead>
                <tbody>
                  {salesDetails.map((item, index) => (
                    <tr key={index}>
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{item.Product}</td>
                      <td className="border p-2">{item.Brand}</td>
                      <td className="border p-2">{item.NoofYears}</td>
                      <td className="border p-2">{item.CY_Sales_in_Lac}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Gross Turnover (Per Annum)</label>
              <div className="flex space-x-4">
                {['<2 CR', '2 to 3 CR', '3 to 5 CR', '5 to 8 CR', '>8 CR'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="grossTurnover"
                      value={option}
                      checked={kycData?.GrossTurnover === option}
                      readOnly
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Cibil Score</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.Cibil || ''} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Dealing With the PVC</label>
              <div className="flex space-x-4">
                {['Y', 'N'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="isPVR"
                      value={option}
                      checked={kycData?.IsPVR === option}
                      readOnly
                    />
                    <span className="ml-2">{option === 'Y' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Remark</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.Remark || ''} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Have you ever dealt with Prince Products earlier</label>
              <div className="flex space-x-4">
                {['Y', 'N'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="isDealtWith"
                      value={option}
                      checked={kycData?.IsDealtWith === option}
                      readOnly
                    />
                    <span className="ml-2">{option === 'Y' ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Total Sale Value of the Firm for the Last Three Years</label>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border p-2" rowSpan={2}>Category Wise</th>
                    <th className="border p-2" colSpan={4}>Sales (Rs. In Lacs)</th>
                  </tr>
                  <tr>
                    <th className="border p-2">Sr No</th>
                    <th className="border p-2">L2LY</th>
                    <th className="border p-2">LY</th>
                    <th className="border p-2">CY</th>
                  </tr>
                </thead>
                <tbody>
                  {salesByCategory.map(item => (
                    <tr key={item.SrNo}>
                      <td className="border p-2">{item.Category}</td>
                      <td className="border p-2">{item.SrNo}</td>
                      <td className="border p-2">{item.lineL2LY}</td>
                      <td className="border p-2">{item.lineLY}</td>
                      <td className="border p-2">{item.lineCY}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Details of the Best Customers of the Firm</label>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border p-2" rowSpan={2}>Name of the Customer</th>
                    <th className="border p-2" colSpan={4}>Category Sold (Rs. In Lacs)</th>
                  </tr>
                  <tr>
                    <th className="border p-2">AP</th>
                    <th className="border p-2">AGF</th>
                    <th className="border p-2">CPVC, SWR & EF</th>
                    <th className="border p-2">PPR</th>
                  </tr>
                </thead>
                <tbody>
                  {customerSales.map(item => (
                    <tr key={item.Name}>
                      <td className="border p-2">{item.Name}</td>
                      <td className="border p-2">{item.AP}</td>
                      <td className="border p-2">{item.AGF}</td>
                      <td className="border p-2">{item.CPVC_SWR_EF}</td>
                      <td className="border p-2">{item.PPR}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Sales Assured by the Firm to the Area Proposed/MOU</label>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border p-2" rowSpan={2}>District</th>
                    <th className="border p-2" rowSpan={2}>Town</th>
                    <th className="border p-2" colSpan={6}>Estimated Business in the First Year (Rs. In Lacs)</th>
                  </tr>
                  <tr>
                    <th className="border p-2">Agri Pipes</th>
                    <th className="border p-2">Agri Fittings</th>
                    <th className="border p-2">CPVC P&F</th>
                    <th className="border p-2">Ultrafit P&F</th>
                    <th className="border p-2">Easyfit P&F</th>
                    <th className="border p-2">PPR P&F</th>
                  </tr>
                </thead>
                <tbody>
                  {estimatedBusiness.map(item => (
                    <tr key={`${item.District}-${item.Town}`}>
                      <td className="border p-2">{item.District}</td>
                      <td className="border p-2">{item.Town}</td>
                      <td className="border p-2">{item.AP}</td>
                      <td className="border p-2">{item.AF}</td>
                      <td className="border p-2">{item.CPVCPF}</td>
                      <td className="border p-2">{item.SWRPF}</td>
                      <td className="border p-2">{item.EFPF}</td>
                      <td className="border p-2">{item.PPRPF}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* TAX/GST Details */}
        <div id="tax" className="tab-pane hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">PAN No.</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.PANNo || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Aadhaar No.</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.AadharNo || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">GST No.</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.GSTNo || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Customer Type</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.GSTRegType || ''} />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div id="bank" className="tab-pane hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Account No.</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.AccountNo || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">IFSC Code</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.IFSCCode || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Bank Name</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.BankName || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Bank Address</label>
              <textarea className="w-full p-2 border rounded" readOnly value={kycData?.BankAddress || ''}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium">Branch Code</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.BranchCode || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Bank Contact No</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.BankContactNo || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Bank Limit</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.BankLimit || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">LC Limit</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.LCLimit || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Blank Cheque</label>
              <div className="flex space-x-4">
                {['Yes', 'No'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="blankCheque"
                      value={option}
                      checked={kycData?.Blankcheck === option}
                      readOnly
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Deposit Amount</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.DepositAmount || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Credit Term Pipes</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.CreditPeriodPipes || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Credit Term Fittings</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.CreditPeriodFittings || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Credit Limit</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.CreditLimit || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Name of Nearest Distributor</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.CreditLimit || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Reject Remark</label>
              <textarea className="w-full p-2 border rounded" readOnly value={kycData?.RejectRemark || ''}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium">Is Pending From Status</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.IsPending || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Plant Head Approval Date</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.ModifiedDatetime || ''} />
            </div>
            <div>
              <label className="block text-sm font-medium">Customer ID</label>
              <input className="w-full p-2 border rounded" readOnly value={kycData?.CustomerCode || ''} />
            </div>
            {showButtons.secondaryPatch && (
              <div className="col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={kycData?.SecondaryPatchInstalled}
                    onChange={(e) => setKycData(prev => prev ? ({ ...prev, SecondaryPatchInstalled: e.target.checked }) : prev)}
                  />
                  <span className="ml-2">DMS Training of Distributor is completed, and Secondary Patch has been installed.</span>
                </label>
              </div>
            )}
            {showButtons.navision && (
              <div>
                <button className="bg-green-500 text-white p-2 rounded" onClick={createInNavision}>Create In Navision</button>
              </div>
            )}
            <div className="col-span-2">
              <label className="flex items-center">
                <input type="checkbox" checked disabled />
                <span className="ml-2">
                  I hereby declare that the details furnished above are true and correct to the best of my knowledge...
                </span>
              </label>
            </div>
            {isCurrentApprover && (
              <div className="col-span-2 flex space-x-4">
                {showButtons.update && (
                  <button className="bg-blue-500 text-white p-2 rounded" onClick={updateKyc}>Update</button>
                )}
                {showButtons.approve && (
                  <button className="bg-green-500 text-white p-2 rounded" onClick={approveKyc}>Approve</button>
                )}
                {showButtons.reject && (
                  <button className="bg-red-500 text-white p-2 rounded" onClick={() => setShowRejectModal(true)}>Reject</button>
                )}
                {showButtons.save && (
                  <button className="bg-green-600 text-white p-2 rounded" onClick={updateKyc}>Submit</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <div className="flex justify-end">
              <button className="text-red-500" onClick={() => setShowRejectModal(false)}>×</button>
            </div>
            <div>
              <label className="block text-sm font-medium">Reject Remark</label>
              <textarea
                className="w-full p-2 border rounded"
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
              ></textarea>
            </div>
            <div className="mt-4">
              <button className="bg-red-500 text-white p-2 rounded" onClick={rejectKyc}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
