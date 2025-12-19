import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { IEKYC } from '../../services/interface/IEKYC';
import type { IEkycApprovalTruboreUatProps } from '../IEkycApprovalTruboreUatProps';
import { Link } from 'react-router-dom';
import { sp } from '@pnp/sp/presets/all';
import { KYCData } from '../../services/interface/IEKYC';
import { CustomerDetail } from '../../services/interface/IEKYC';
import { SalesDetail } from '../../services/interface/IEKYC';
import { SalesByCategory } from '../../services/interface/IEKYC';
import { CustomerSales } from '../../services/interface/IEKYC';
import { EstimatedBusiness } from '../../services/interface/IEKYC';
import { KYCResponse } from '../../services/interface/IEKYC';
import { HttpClient, HttpClientResponse } from '@microsoft/sp-http';
import Swal from 'sweetalert2';
import '../ViewKYC.scss';
import '../styles.scss';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPComponentLoader } from '@microsoft/sp-loader';
import SPCRUDOPS from '../../services/DAL/spcrudops';
import KycService from '../../utils/KycService';
import axios from 'axios';
import DashboardOps from '../../services/BAL/EKYC';
import { useHistory } from 'react-router-dom';
import { IHistory } from '../../../ekycApprovalPrinceUat/services/interface/IHistory';
import HistoryOps from '../../services/BAL/ApproverHistory';


SPComponentLoader.loadCss('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
SPComponentLoader.loadCss('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');
//SPComponentLoader.loadCss('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
//SPComponentLoader.loadCss('https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css');



export const ViewKYC: React.FunctionComponent<IEkycApprovalTruboreUatProps> = (props: IEkycApprovalTruboreUatProps) => {

	const {httpClient} = props;
	const [kycData, setKycData] = React.useState<any>(null);
  const histroy =useHistory();
  const kycRef = React.useRef<any>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachments, setAttachments] = useState<{name: string, url: string}[]>([]);

  const kycService = new KycService(props.currentSPContext.httpClient);
  const [activeTab, setActiveTab] = useState("communication");
  //const [ kycData, setKycData] = useState<KYCData | null>(null);
	const [sameAsAbove, setSameAsAbove] = useState<boolean>(false);
	const [customerDetails, setCustomerDetails] = useState<CustomerDetail[]>([]);
	const [salesDetails, setSalesDetails] = useState<SalesDetail[]>([]);
	const [salesByCategory, setSalesByCategory] = useState<SalesByCategory[]>([]);
	const [customerSales, setCustomerSales] = useState<CustomerSales[]>([]);
	const [estimatedBusiness, setEstimatedBusiness] = useState<EstimatedBusiness[]>([]);
	const [securityNo, setSecurityNo] = useState<string>('');
	const [itemID, setItemId] = useState<string>('');
	const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
	const [isCurrentApprover, setIsCurrentApprover] = useState<boolean>(false);
	const [visible, setVisible] = useState(false);
	const [showButtons, setShowButtons] = useState<{
		approve: boolean;
		reject: boolean;
    reject1: boolean;
		update: boolean;
		navision: boolean;
		save: boolean;
		secondaryPatch: boolean;
	}>({
		approve: false,
		reject: false,
    reject1: false,
		update: false,
		navision: false,
		save: false,
		secondaryPatch: false,
	});
  const [rejectRemark, setRejectRemark] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  // Show / hide history popup
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  const [history, setHistory] = React.useState<IHistory[]>([]);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);
  

  // Example validation errors (later you can replace with real logic)
  // const [errors, setErrors] = useState<{ [key: string]: string }>({
  //     businessName: "",
  //     email: ""
  // });

	useEffect(() => {
			// trigger fade-in after mount
			const timer = setTimeout(() => setVisible(true), 100); // small delay
			return () => clearTimeout(timer);
		}, []);

  const tabs = [
    { id: "communication", label: "Communication Details", icon: "fa fa-user-circle" },
    { id: "financial", label: "Financial Details", icon: "fa fa-inr" },
    { id: "tax", label: "TAX/GST Details", icon: "fa fa-newspaper-o" },
    { id: "bank", label: "Bank Details", icon: "fa fa-credit-card" }
  ];

	// Fetch URL parameters
  const getUrlVars = (): { ID: string; itemID: string } => {
    const vars: { [key: string]: string } = {};
    const query = window.location.hash.substring(0).split('?')[1].split('&');
    query.forEach(param => {
      const [key, value] = param.split('=');
      vars[key] = value;
    });
    return { ID: vars.ID || '', itemID: vars.itemID || '' };
  };

	// Fetch current user email
	const fetchCurrentUser = async () => {
		try {
			const user = await sp.web.currentUser.get();
			setCurrentUserEmail(user.Email);
      console.log('current user', user.Email);
		} catch (error) {
			console.error('Error fetching user:', error);
			Swal.fire('Error', 'Failed to fetch user details', 'error');
		}
	};

	useEffect(() => {
		sp.setup({sp: {
						baseUrl: window.location.origin,
					},});
		 fetchCurrentUser();
		if(currentUserEmail){
      fetchKYCData();
    }
	}, [currentUserEmail]);

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
	

	const fetchKYCData = async () => {
    if (!currentUserEmail) {
      console.log('users email is not set');
      return;
    }
		const { ID, itemID } = getUrlVars();
		setSecurityNo(ID);
		setItemId(itemID);
	  
    // UAT url
    const _apiUrl = "https://uat.princepipes.com:567/api/TruboreCustomerKYC/getCustomerKYCDetails";

    // Production url
    //const _apiUrl = "https://travelservices.princepipes.com/imonwebapi-new/api/TruboreCustomerKYC/getCustomerKYCDetails";


		const requestBody = {
			ActionID: "2",
			SecurityNo: ID
		  };	  
		try {
		  const response = await kycService.getCustomerKYCDetails(requestBody,_apiUrl);
	  
		  if (response?.aMessage?.[0]?.Result === "100") {
			const data = response.Table[0];
	  
			setKycData({
			  ...data,
        itemID: itemID,
			  ["Date of Birth"]: data["Date of Birth"] ? getFormatDate(data["Date of Birth"]) : "",
			  ["Modified Datetime"]: getFormatDate(data["Modified Datetime"]),
			});
	  
			setCustomerDetails(response.Table5);
			setSalesDetails(response.Table4);
			setSalesByCategory(response.Table1);
			setCustomerSales(response.Table3);
			setEstimatedBusiness(response.Table2);
	  
			// Growth %
			const prevYear2 = parseFloat(data.GrowthPrecedingYear2) || 0;
			const prevYear1 = parseFloat(data.GrowthPrecedingYear1) || 0;
			const lastYear = parseFloat(data.GrowthLastYear) || 0;
	  
			const growth1 = prevYear2 ? ((prevYear1 / prevYear2 - 1) * 100).toFixed(2) : "0";
			const growth2 = prevYear1 ? ((lastYear / prevYear1 - 1) * 100).toFixed(2) : "0";
	  
			setKycData((prev: any) =>
			  prev
				? {
					...prev,
					Growth1: growth1,
					Growth2: growth2,
				  }
				: prev
			);
	  
			// Current Approver permissions
			let currentApproverList = data["Current Approver"].toLowerCase()
			  .split(",")
			  .map((email: string) => email.trim());

      currentApproverList[0] = 'Sharepoint-admin@princepipes.com';
	  
			if (currentApproverList.includes(currentUserEmail)) {
			  setIsCurrentApprover(true);
			  // setShowButtons({
				// approve: !["7", "8", "9"].includes(data["KYC Status"]),
				// reject: !["7", "8", "9"].includes(data["KYC Status"]),
				// update: !["7", "8", "9"].includes(data["KYC Status"]),
				// navision: data["KYC Status"] == "7",
				// save: ["7", "8"].includes(data["KYC Status"]),
				// secondaryPatch: data["KYC Status"] == "8",
			  // });
        const kycStatus = data["KYC Status"];
          // switch (kycStatus) {
          //   case "7":
          //     setShowButtons({
          //       approve: false,
          //       reject: false,
          //       update: false,
          //       navision: true,
          //       save: true,
          //       secondaryPatch: false,
          //     });
          //     break;
      
          //   case "8":
          //     setShowButtons({
          //       approve: false,
          //       reject: false,
          //       update: false,
          //       navision: false,
          //       save: true,
          //       secondaryPatch: true,
          //     });
          //     break;
      
          //   case "9":
          //     setShowButtons({
          //       approve: false,
          //       reject: false,
          //       update: false,
          //       navision: false,
          //       save: false,
          //       secondaryPatch: false,
          //     });
          //     break;
      
          //   default:
          //     setShowButtons({
          //       approve: true,
          //       reject: true,
          //       update: true,
          //       navision: false,
          //       save: false,
          //       secondaryPatch: false,
          //     });
          //     break;
          // }
          if (kycStatus === 7) {
            setShowButtons({
              approve: false,
              reject: false,
              reject1: false,
              update: false,
              navision: true,
              save: true,
              secondaryPatch: false,
            });
          } else if (kycStatus === 8) {
            setShowButtons({
              approve: false,
              reject: false,
              reject1: false,
              update: false,
              navision: false,
              save: true,
              secondaryPatch: true,
            });
          } else if (kycStatus === "9") {
            setShowButtons({
              approve: false,
              reject: false,
              reject1: false,
              update: false,
              navision: false,
              save: false,
              secondaryPatch: false,
            });
          } else {
            setShowButtons({
              approve: true,
              reject: true,
              reject1: true,
              update: true,
              navision: false,
              save: false,
              secondaryPatch: false,
            });
          }
          
      
			}
		  }
      
      else {
			Swal.fire({
			  icon: "warning",
			  title: "No Data Found",
			  text: "No KYC data was found for this Security Number.",
			});
		  }
		} catch (error: any) {
		  console.error("Error fetching KYC data:", error);
	  
		  if (error.message?.includes("timed out")) {
			errorPopup("Request Timeout", "The KYC API request timed out.");
		  } else if (error.message?.includes("Failed to fetch")) {
			errorPopup("Network Error", "Failed to connect to the KYC API.");
		  } else {
			errorPopup("Error", `Failed to fetch KYC data: ${error.message}`);
		  }
		}
	  };
	  
	  const errorPopup = (title: string, text: string) => {
		Swal.fire({ icon: "error", title, text });
	  };

    // Handle PIN code blur
    // Const method that calls the async method to get pin code data
    const handlePinCodeBlur = async () => {

      const pinCode = kycData["Post Code"];
      // UAT url
      const _apiUrl = `https://uat.princepipes.com:446/wsVendorDetails.asmx/getPinCode?PinCode=${pinCode}`;
      
      // Production url
      //const _apiUrl = `https://travelservices.princepipes.com/wsVendorDetails.asmx/getPinCode?PinCode=${pinCode}`;

      try {
        // Call the async method to fetch pin code data
        const data = await fetchPinCodeData(_apiUrl); 
    
        // Check if the data structure is as expected before accessing it
        if (Array.isArray(data) && data[0] && data[0].Message && Array.isArray(data[0].Message)) {
          // Access the first item of the Message array if it's valid
          const message = data[0].Message[0];
    
          // Now we can safely access City and State
          setKycData((prev: any) => ({
            ...prev,
            City: message.City,
            State: message.StateCode
          }));
        } else {
          console.error('Unexpected data structure', data);
        }
      } catch (error) {
        console.error("Error in handlePinCodeBlur:", error);
      }
    };
    

    
  
    // Handle same as above checkbox
    const handleSameAsAbove = (checked: boolean) => {
      setSameAsAbove(checked);
      if (checked && kycData) {
        setKycData({
          ...kycData,
          "Warehouse Address": kycData.Address,
          "Warehouse Address 2": kycData["Address 2"],
          "Warehouse Post Code": kycData["Post Code"],
          "Warehouse City": kycData.City,
          "Warehouse State": kycData.State,
        });
      } else if (kycData) {
        setKycData({
          ...kycData,
          "Warehouse Address": '',
          "Warehouse Address 2": '',
          "Warehouse Post Code": '',
          "Warehouse City": '',
          "Warehouse State": '',
        });
      }
    };
    
    //currently not in working
    const handleSubmit = async (event: Event) => {
      event.preventDefault(); // Prevents default behavior (like page reload)
    
      // Your logic here
      await updateKyc;
    };
    
    // Update KYC
    const updateKyc = async () => {

      const data = kycRef.current;
 
      // If data.CustomerCode is either null or the string "null", fall back to kycData.CustomerCode
      const finalCustomerCode = (data && data.CustomerCode && data.CustomerCode !== "null")
      ? data.CustomerCode
      : kycData.CustomerCode;

      if (!kycData) return;
    
      if (!kycData["Gross Turnover"]) {
        Swal.fire('Error', 'Select Gross Turnover', 'error');
        return;
      }
    
      if (!kycData["PAN No"]) {
        Swal.fire('Error', 'Enter PAN No', 'error');
        return;
      }
    
      if (!validatePAN(kycData["PAN No"])) return;
    
      if (!kycData["GST No"]) {
        Swal.fire('Error', 'Enter GST No', 'error');
        return;
      }
    
      if (!validateGST(kycData["GST No"], kycData["PAN No"])) return;
    
      const kycStatus = kycData.SecondaryPatchInstalled ? '9' : '8';
    
      const requestBody = {
        ActionID: '5',
        SecurityNo: securityNo,
        FirmName: kycData["Firm Name"],
        Constituion: kycData.Cosnstituion,
        Name: kycData.Name,
        YearOfEstablishment: kycData["Year Of Establishment"],
        MobileNo: kycData["Mobile No"],
        PhoneNo: kycData["Phone No"],
        FaxNo: kycData["Fax No"],
        Email: kycData.Email,
        Address: kycData.Address,
        Address2: kycData["Address 2"],
        PostCode: kycData["Post Code"],
        City: kycData.City,
        State: kycData.State,
        WarehouseAddress: kycData["Warehouse Address"],
        WarehouseAddress2: kycData["Warehouse Address 2"],
        WarehousePostCode: kycData["Warehouse Post Code"],
        WarehouseCity: kycData["Warehouse City"],
        WarehouseState: kycData["Warehouse State"],
        Cibil: kycData.Cibil,
        GrossTurnover: kycData["Gross Turnover"],
        ProposedDistrict: kycData.ProposedDistrict,
        PANNo: kycData["PAN No"],
        AadharNo: kycData["Aadhar No"],
        GSTNo: kycData["GST No"],
        GSTRegType: kycData.GSTRegType,
        AccountNo: kycData["Account No"],
        IFSCCode: kycData["IFSC Code"],
        BankName: kycData["Bank Name"],
        BankAddress: kycData["Bank Address"],
        BranchCode: kycData["Branch Code"],
        DepositAmount: kycData["Deposit Amount"],
        CreditPeriodFittings: kycData["Credit Period Fittings"],
        CreditPeriodPipes: kycData["Credit Period Pipes"],
        CreditLimit: kycData["Credit Limit"],
        NearestDistributor: kycData["Nearest Distributor"],
        CustomerCode: finalCustomerCode,
        DateofBirth: kycData["Date of Birth"],
        Mobile_nos: kycData.Mobile_nos,
        Name_of_the_person: kycData.Name_of_the_person,
        IsPVR: kycData.IsPVR,
        Remark: kycData.Remark,
        SecondaryPatchInstalled: kycData.SecondaryPatchInstalled,
        //...kycData,
        KYCStatus: kycStatus,
        ModifiedBy: '10691',
      };
    
      // UAT url
      const _apiUrl = "https://uat.princepipes.com:567/api/TruboreCustomerKYC/updateCustomerKYCDetails";

      // Production url
      //const _apiUrl = "https://travelservices.princepipes.com/imonwebapi-new/api/TruboreCustomerKYC/updateCustomerKYCDetails";

    
      try {
        // Using HttpClient to send the POST request
        await kycService.updateCustomerKYCDetails(requestBody, _apiUrl);
    
        await updateListItem();
        Swal.fire('Updated!', 'KYC Details Updated successfully', 'success');
        histroy.push('/');
      } catch (error) {
        console.error('Error updating KYC:', error);
    
        Swal.fire('Error', `Failed to update KYC: ${error.message}`, 'error');
      }
    };
    
  
    // Approve KYC
    const approveKyc = async () => {
      if (!kycData) return;
    
      const requestBody = {
        ActionID: '6',
        ModifiedBy: 'XYZ', // Replace with actual user ID if necessary
        KYCStatus: kycData["New KYC Status"],
        SHPID: itemID,
        SecurityNo: securityNo,
      };
    
      // UAT url
      const _apiUrl = "https://uat.princepipes.com:567/api/TruboreCustomerKYC/approveCustomerKYCDetails";

      // Production url
      //const _apiUrl = "https://travelservices.princepipes.com/imonwebapi-new/api/TruboreCustomerKYC/approveCustomerKYCDetails";

    
      try {
        // Using HttpClient to send the POST request
        const response = await kycService.approveCustomerKYCDetails(requestBody, _apiUrl);
    
        await updateSHPID();
        await updatePending();
        Swal.fire('Success', 'Send For Approval', 'success');
        histroy.push('/')
      } catch (error) {
        console.error('Error approving KYC:', error);
    
        Swal.fire('Error', `Failed to approve KYC: ${error.message}`, 'error');
      }
    };
    
  
    // Reject KYC
    const rejectKyc = async () => {
      if (!kycData) return;
    
      const requestBody = {
        ActionID: '7',
        ModifiedBy: '9961',
        KYCStatus: '1', // Assuming "1" represents rejected status
        SecurityNo: securityNo,
        IsPending: kycData.IsPending,
        SHPID: itemID,
        RejectRemark: rejectRemark,
      };
    
      // UAT url
      const _apiUrl = "https://uat.princepipes.com:567/api/TruboreCustomerKYC/RejectCustomerKYCDetails";

      // Production url
      //const _apiUrl = "https://travelservices.princepipes.com/imonwebapi-new/api/TruboreCustomerKYC/RejectCustomerKYCDetails";

    
      try {
        // Using HttpClient to send the POST request
        await kycService.rejectCustomerKYCDetails(requestBody, _apiUrl);
        // Insert history record
        await insertHistory(kycData);
        setShowRejectModal(false);
        Swal.fire('Success', 'KYC Rejected', 'success');
        histroy.push('/')
      } catch (error) {
        console.error('Error rejecting KYC:', error);
    
        Swal.fire('Error', `Failed to reject KYC: ${error.message}`, 'error');
      }
    };
    
  
    // Update SharePoint ID
    const updateSHPID = async () => {
      const requestBody = {
        ActionID: '8',
        SecurityNo: securityNo,
        SHPID: itemID,
      };
    
      // UAT url
      const _apiUrl = "https://uat.princepipes.com:567/api/TruboreCustomerKYC/updateSHPID";

      // Production url
      //const _apiUrl = "https://travelservices.princepipes.com/imonwebapi-new/api/TruboreCustomerKYC/updateSHPID";

    
      try {
        // Using HttpClient to send the POST request
        await kycService.updateSHPID(requestBody, _apiUrl);
      } catch (error) {
        console.error('Error updating SHPID:', error);
    
        Swal.fire('Error', `Failed to update SHPID: ${error.message}`, 'error');
      }
    };
    
  
    // Update SharePoint list item
    const updateListItem = async () => {
      if (!kycData || !itemID) return;

      try {
        const data = kycRef.current;
 
        // If data.CustomerCode is either null or the string "null", fall back to kycData.CustomerCode
        const customerCode = (data && data.CustomerCode && data.CustomerCode !== "null")
        ? data.CustomerCode
        : kycData.CustomerCode;

      const spCrudOpsInstance = await SPCRUDOPS;
       (await spCrudOpsInstance()).updateData(
      "Ekyc",
      +itemID,
      {
        FirmName: kycData["Firm Name"],
          MobileNo:''+ kycData["Mobile No"],
          Email: kycData.Email,
          CustomerID: customerCode,
          ApprovedBy: kycData.IsPending,

      },
      props
      );
  
      
        
        console.log('SharePoint list item updated');
      } catch (error) {
        console.error('Error updating SharePoint item:', error);
      }
    };
  
    // Update pending status
    const updatePending = async () => {
      if (!kycData || !itemID) return;
  
      try {

        const spCrudOpsInstance = await SPCRUDOPS;
        (await spCrudOpsInstance()).updateData(
        "Ekyc",
        +itemID,
        {
          ApprovedBy: kycData.IsPending,
        },
        props
        );
        // Insert history record
        await insertHistory(kycData);
        console.log('Pending status updated');
      } catch (error) {
        console.error('Error updating pending status:', error);
      }
    };

    // Insert Approvers data for using History 
    const insertHistory = async (kycData: any) => {
      const insertResult = await HistoryOps().insertHistoryData(kycData, props);
      //itemId = insertResult;
      await uploadFilesForId(insertResult);
    }

    // Helper: upload all pending newFiles for given item id------------------------------------>
    const uploadFilesForId = async (itemId: number) => {
        if (newFiles.length === 0) return;
    
        try {
          // get existing names to avoid duplicates (case-insensitive)
          const existingFileNames = attachments
            .filter(a => a && a.name)
            .map(a => a.name.toLowerCase());
    
          const uploaded: string[] = [];
          const skipped: string[] = [];
    
    
          for (const f of newFiles) {
            if (!(f instanceof File)) continue; // guard
            if (existingFileNames.includes(f.name.toLowerCase())) {
              // skip duplicates to avoid SharePoint error
              skipped.push(f.name);
              continue;
            }
            await HistoryOps().uploadAttachment("WorkflowHistory", itemId, f, props);
            uploaded.push(f.name);
          }
    
    
          // Refresh attachments
          //await loadAttachments(itemId);
    
    
          // Clear pending files that were uploaded
          setNewFiles([]);
    
    
          // Clear file input element if present
          const input = document.getElementById("fileUpload") as HTMLInputElement | null;
          if (input) input.value = "";
    
    
          if (uploaded.length > 0) {
            console.log(`Uploaded: ${uploaded.join(', ')}`);
            alert(`Data Inserted and Successfully Uploaded: ${uploaded.join(', ')}.`);
          }
          if (skipped.length > 0) {
            console.log(`Skipped (already existed): ${skipped.join(', ')}`);
          }
    
    
        } catch (err) {
          console.error("Error uploading files:", err);
          throw err; // Rethrow to handle in submit
        } finally {
          
        }
      };
  
    // Create in Navision
    const createInNavision = async () => {
      if (!kycData) return;
    
      const params = new URLSearchParams({
        newCustNo: securityNo,
        name: kycData["Firm Name"],
        address: kycData.Address,
        address2: kycData["Address 2"],
        city: kycData.City,
        contact: kycData.Name,
        phoneNo: kycData["Phone No"],
        faxNo: kycData["Fax No"],
        postCode: kycData["Post Code"],
        eMail: kycData.Email,
        pANNo: kycData["PAN No"],
        stateCode: kycData.State,
        gSTRegistrationNo: kycData["GST No"],
        gsTCustTypeoption: '1',
        birthDate: kycData["Date of Birth"],
        mobile: kycData["Mobile No"],
        mobileNo2: kycData.Mobile_nos,
        salespersonCode: '',
        areaSalesManager: '',
        ownersName: kycData.Name,
        creditLimit: kycData["Credit Limit"],
        dateofcreation: kycData["Modified Datetime"],
        DepositAmount: kycData["Deposit Amount"],
      });
    
      // UAT url
      const _apiUrl = `https://uat.princepipes.com:446/wscustomerdetails.asmx/updateCustomerDetial?${params.toString()}`;

      // Production url
      //const _apiUrl = `https://travelservices.princepipes.com/wscustomerdetails.asmx/updateCustomerDetial?${params.toString()}`;

    
      try {
        // Using HttpClient to send the GET request
        const response = await kycService.createCustomerInNavision(_apiUrl);

        if (response[0] && response[0].Result === 'Failed') {
          Swal.fire('Error', 'Server Busy!!', 'error');
          
        } else {
          // Build updated object synchronously
          const updatedKycData = {
            ...kycData,  // Retain the name 'kycData'
            CustomerCode: response[0].CustomerCode,
          };
 
          // Update ref first (sync)
          kycRef.current = updatedKycData;
 
          // Update state (async)
          setKycData(updatedKycData);

          Swal.fire('Success', 'Details Updated in Navision!!', 'success');
          await updateKyc();

          histroy.push('/')
        }
      } catch (error) {
        console.error('Error updating Navision:', error);
        Swal.fire('Error', 'Server Busy!!', 'error');
      }
    };
    
    //for clearning input field of an attachment section
    const handleRemoveFile = (idx: number) => {
      setNewFiles((prev) => {
        const updated = prev.filter((_, i) => i !== idx);

        // 🔑 rebuild FileList using DataTransfer
        if (fileInputRef.current) {
          const dt = new DataTransfer();
          updated.forEach((file) => dt.items.add(file));
          fileInputRef.current.files = dt.files;
        }

        return updated;
      });
    };
    const handleHistoryOpen = async () => {
      setShowHistoryModal(true);
      const data = await HistoryOps().getHistoryData(itemID as any, props);
      setHistory(data);
    };

    const handleHistoryClose = () => {
      setShowHistoryModal(false);
    };
	  
  return (
    <div className={`form-wrapper`}>
			{/* Tabs */}
			<div className='tabsContainer'>
				<div className="tabs">
					{tabs.map(tab => (
							<div
								key={tab.id}
								className={`tab ${activeTab === tab.id ? "active" : ""}`}
								onClick={() => setActiveTab(tab.id)}
								>
								<i className={tab.icon}></i> {tab.label}
							</div>
					))}
				</div>
				<Link to={`/`} className="viewFormClose">
					✖
				</Link>
			</div>


      {/* Form Body */}
      <div className={`form-container`}>
        {activeTab === "communication" && (
          <form className="custom-form">
            {/* Row 1 */}
            <div className="row">
              <div className={`field `}>
                <label>
                  Registered Business Name <span className="required">*</span>
                </label>
                <input type="text" readOnly value={kycData?.["Firm Name"] || ''} />
              </div>

              <div className="field">
                <label>ID</label>
                <input type="text" readOnly value={itemID || ''} />
              </div>
            </div>

            {/* Row 2 */}
            <div className="row">
              <div className="field full-width">
                <label>Registered Address</label>
                <input type="text" readOnly value={kycData?.RegisteredAddress || ''} />
              </div>
            </div>

            {/* Row 3 - Radio group */}
            <div className="row">
              <div className="field">
                  <label>Constitution of Firm</label>
                  <div className="radio-group">
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
            </div>

            {/* Row 4 */}
            <div className="row">
              <div className="field">
                <label>Name</label>
                <input type="text" readOnly value={kycData?.Name || ''} />
              </div>
              <div className="field">
                <label>Date of Birth</label>
                <input type="date" readOnly value={kycData?.["Date of Birth"] || ''} />
              </div>
              <div className="field">
                <label>Year of Establishment</label>
                <input type="text" readOnly value={kycData?.["Year Of Establishment"] || ''} />
              </div>
            </div>

            {/* Row 5 */}
            <div className="row">
              <div className="field">
                <label>Mobile No.</label>
                <input type="text" readOnly value={kycData?.["Mobile No"]} />
              </div>
              <div className="field">
                <label>Telephone No.</label>
                <input type="text" readOnly value={kycData?.["Phone No"] } />
              </div>
              <div className="field">
                <label>Fax No.</label>
                <input type="text" readOnly value={kycData?.["Fax No"] } />
              </div>
              <div className={`field `}>
                <label>
                  Email 
                </label>
                <input type="email" readOnly value={kycData?.Email || ''} />
              </div>
            </div>

            {/* Row 6 */}
            <div className="row">
              <div className="field">
                <label>Alternate Mobile No.</label>
                <input type="text" readOnly value={kycData?.Mobile_nos || ''} />
              </div>
              <div className="field">
                <label>Alternate Name</label>
                <input type="text" readOnly value={kycData?.Name_of_the_person || ''} />
              </div>
            </div>

            {/* Section - Billing Address */}
            <div className="form-section">
              <h4>Trading / Billing Address</h4>
              <div className="row">
                <div className="field">
                  <label>Address 1</label>
                  <input type="text"  readOnly value={kycData?.Address || ''} />
                </div>
                <div className="field">
                  <label>Address 2</label>
                  <input type="text"  readOnly value={kycData?.["Address 2"] || ''} />
                </div>
              </div>
              <div className="row">
                <div className="field">
                  <label>Post Code</label>
                  <input type="text" readOnly value={kycData?.["Post Code"] || ''}
                         onBlur={handlePinCodeBlur}/>
                </div>
                <div className="field">
                  <label>City</label>
                  <input type="text"  readOnly value={kycData?.City || ''} />
                </div>
                <div className="field">
                  <label>State</label>
                  <input type="text"  readOnly value={kycData?.State || ''} />
                </div>
              </div>
            </div>

            {/* Section - Warehouse Address */}
            <div className="form-section">
              <h4>Warehouse / Delivery Address</h4>
              <div className="checkbox">
                <label>
                  <input type="checkbox" checked={sameAsAbove}
                   onChange={(e) => handleSameAsAbove(e.target.checked)} /> Same as above
                </label>
              </div>
              <div className="row">
                <div className="field">
                  <label>Address 1</label>
                  <input type="text" readOnly value={kycData?.["Warehouse Address"] || ''} />
                </div>
                <div className="field">
                  <label>Address 2</label>
                  <input type="text" readOnly value={kycData?.["Warehouse Address 2"] || ''} />
                </div>
              </div>
              <div className="row">
                <div className="field">
                  <label>Post Code</label>
                  <input type="text" readOnly value={kycData?.["Warehouse Post Code"] || ''} />
                </div>
                <div className="field">
                  <label>City</label>
                  <input type="text" readOnly value={kycData?.["Warehouse City"] || ''} />
                </div>
                <div className="field">
                  <label>State</label>
                  <input type="text" readOnly value={kycData?.["Warehouse State"] || ''} />
                </div>
              </div>
            </div>

            {/* Section - Proprietors */}
            <div className="form-section">
              <h4>Full Details of Proprietor / Partners / Directors (Name, Residential Address and Telephone Nos.)</h4>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Phone No</th>
                    <th>Date of Birth</th>
                    <th>Date of Anniversary</th>
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
          </form>
        )}
				{activeTab === "financial" && (
					<form className="custom-form">
						<div className="financial-details-section">
							<label className="financial-details-label">No of years in distributor business</label>
							<input type="text" className="financial-details-input" readOnly value={kycData?.NoOfYearDistribution || ''} />
						</div>
						<div className="financial-details-section">
							<label className="financial-details-label">Nature & Details of current business</label>
							<input type="text" className="financial-details-input" readOnly value={kycData?.NatureofBusiness || ''} />
						</div>
						<div className="financial-details-section">
							<table className="financial-details-table">
								<thead>
									<tr>
										<th>Growth of last 3 years</th>
										<th>Preceding Year</th>
										<th>Preceding Year</th>
										<th>Last Year</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>Turnover</td>
										<td><input type="text" className="financial-details-table-input" readOnly value={kycData?.GrowthPrecedingYear2 || ''} /></td>
										<td><input type="text" className="financial-details-table-input" readOnly value={kycData?.GrowthPrecedingYear1 || ''} /></td>
										<td><input type="text" className="financial-details-table-input" readOnly value={kycData?.GrowthLastYear || ''} /></td>
									</tr>
									<tr>
										<td>% Growth</td>
										<td><input type="text" className="financial-details-table-input" readOnly value={kycData?.Growth || '0'} /></td>
										<td><input type="text" className="financial-details-table-input" readOnly value={kycData?.Growth1 || ''} /></td>
										<td><input type="text" className="financial-details-table-input" readOnly value={kycData?.Growth2 || ''} /></td>
									</tr>
								</tbody>
							</table>
						</div>
						<div className="financial-details-section">
							<label className="financial-details-label">No of Manpower in hand</label>
							<div className="financial-details-section">
								<label className="financial-details-sublabel">1) For Dispatch</label>
								<input type="text" className="financial-details-input" readOnly value={kycData?.NoOfMenpowerDispatch || ''} />
							</div>
							<div className="financial-details-section">
								<label className="financial-details-sublabel">2) For Marketing</label>
								<input type="text" className="financial-details-input" readOnly value={kycData?.NoOfMenpowerMarketing || ''} />
							</div>
							<div className="financial-details-section">
								<label className="financial-details-sublabel">3) For Collection</label>
								<input type="text" className="financial-details-input" readOnly value={kycData?.NoOfMenpowerCollection || ''} />
							</div>
							<div className="financial-details-section">
								<label className="financial-details-sublabel">4) For Computer System</label>
								<input type="text" className="financial-details-input" readOnly value={kycData?.NoOfMenpowerComputer || ''} />
							</div>
						</div>
						<div className="financial-details-section">
							<label className="financial-details-label">System of Billing & Stock (Inventory) Management</label>
							<input type="text" className="financial-details-input" readOnly value={kycData?.SystemofBilling || ''} />
						</div>
						<div className="financial-details-section">
							<label className="financial-details-label">No of Vehicle & Type</label>
							<input type="text" className="financial-details-input" readOnly value={kycData?.NoOfVehical || ''} />
						</div>
						<div className="financial-details-section">
							<label className="financial-details-label">District/towns proposed to be covered</label>
							<input type="text" className="financial-details-input" readOnly value={kycData?.ProposedDistrictCovered || ''} />
						</div>
						<div className="financial-details-section">
							<label className="financial-details-label">Details of Infrastructure</label>
							<table className="financial-details-table">
								<thead>
									<tr>
										<th>On Rent</th>
										<th>Owned</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>
											Rent per Month
											<input type="text" className="financial-details-table-input" readOnly value={kycData?.OnRentPM || ''} />
										</td>
										<td>
											Market Value
											<input type="text" className="financial-details-table-input" readOnly value={kycData?.OwnedMarketValue || ''} />
										</td>
									</tr>
									<tr>
										<td>
											Area (In Sq. Ft.)
											<input type="text" className="financial-details-table-input" readOnly value={kycData?.OnRentArea || ''} />
										</td>
										<td>
											Area (In Sq. Ft.)
											<input type="text" className="financial-details-table-input" readOnly value={kycData?.OwnedArea || ''} />
										</td>
									</tr>
								</tbody>
							</table>
						</div>
						<div className="financial-details-section">
							<label className="financial-details-label">Details of Sales</label>
							<table className="financial-details-table">
								<thead>
									<tr>
										<th>Sr No.</th>
										<th>Product</th>
										<th>Brand</th>
										<th>No of Years</th>
										<th>Current year Sales (In Lakhs)</th>
									</tr>
								</thead>
								<tbody>
									{/* {salesDetails.map((item, index) => (
                    <tr key={index}>
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{item.Product}</td>
                      <td className="border p-2">{item.Brand}</td>
                      <td className="border p-2">{item.NoofYears}</td>
                      <td className="border p-2">{item.CY_Sales_in_Lac}</td>
                    </tr>
                  ))} */}
									{salesDetails.map((item, index) => (
									<tr key={index}>
										<td><input type="text" className="financial-details-table-input" value={index + 1} readOnly/></td>
										<td><input type="text" className="financial-details-table-input" value={item.Product} readOnly/></td>
										<td><input type="text" className="financial-details-table-input" value={item.Brand} readOnly/></td>
										<td><input type="text" className="financial-details-table-input" value={item.NoofYears} readOnly/></td>
										<td><input type="text" className="financial-details-table-input" value={item.CY_Sales_in_Lac} readOnly/></td>
									</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="financial-details-section">
							<label className="financial-details-label">Gross Turnover(Per Annum)</label>
							<div className="financial-details-radio-group">
								{['<2 CR', '2 to 3 CR', '3 to 5 CR', '5 to 8 CR', '>8 CR'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="grossTurnover"
                      value={option}
                      checked={kycData?.["Gross Turnover"] === option}
                      readOnly
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}

							</div>
						</div>
						<div className="financial-details-section">
							<label className="financial-details-label">Cibil Score</label>
							<input type="text" className="financial-details-input" readOnly value={kycData?.Cibil || ''} />
						</div>
						<div className="financial-details-section">
							<label className="financial-details-label">Dealing With the PVC</label>
							<div className="financial-details-radio-group">
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
						<div className="financial-details-section">
							<label className="financial-details-label">Remark</label>
							<input type="text" className="financial-details-input" readOnly value={kycData?.Remark || ''} />
						</div>
						<div className="financial-details-section">
							<label className="financial-details-label">Have you ever dealt with Prince Products earlier.</label>
							<div className="financial-details-radio-group">
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
						{/* ----- LAST THREE TABLES ----- */}
						{/* 1) Total sale value of the firm for the last three years (Category Wise) */}
						<h3 className="section-title">Total sale value of the firm for the last three years</h3>
						<table className="sales-table">
							<thead>
								<tr>
									<th rowSpan={2}> Category Wise</th>
									
									<th colSpan={4}>Sales (Rs. in Lacs)</th>
								</tr>
								<tr>
									<th>Sr No</th>
									<th>L2LY</th>
									<th>LY</th>
									<th>CY</th>
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
								{/* <tr>
									<td><input placeholder="Category" /></td>
									<td><input placeholder="1" /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
								</tr>
								<tr>
									<td><input placeholder="Category" /></td>
									<td><input placeholder="2" /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
								</tr> */}
							</tbody>
						</table>

						{/* 2) Details of the best Customers of the firm */}
						<h3 className="section-title">Details of the best Customers of the firm</h3>
						<table className="customers-table">
							<thead>
								<tr>
									<th rowSpan={2}>Name of the Customer</th>
									<th colSpan={4}>Category Sold (Rs. In Lacs)</th>
								</tr>
								<tr>
									<th>AP</th>
									<th>AGF</th>
									<th>CPVC, SWR & EF</th>
									<th>PPR</th>
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
								{/* <tr>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
								</tr>
								<tr>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
								</tr> */}
							</tbody>
						</table>

						{/* 3) Estimated business in the first year (Category wise by District/Town) */}
						<h3 className="section-title">Sales assured by the firm to the area proposed / MOU — Estimated business in the first year (Rs. In Lacs)</h3>
						<table className="estimate-table">
							<thead>
								<tr>
									<th rowSpan={2}>District</th>
									<th rowSpan={2}>Town</th>
									<th colSpan={6}>Estimated business in the first year (Rs. In Lacs)</th>
								</tr>
								<tr>
									<th>Agri Pipes</th>
									<th>Agri Fittings</th>
									<th>CPVC P&F</th>
									<th>Ultrafit P&F</th>
									<th>Easyfit P&F</th>
									<th>PPR P&F</th>

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
								{/* <tr>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
								</tr>
								<tr>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
									<td><input /></td>
								</tr> */}
							</tbody>
						</table>
					</form>

				)}
				{activeTab === "tax" && (
					<form className="custom-form">
						<div className="row">
							<div className="field">
								<label>PAN No.</label>
								<input type="text"  readOnly value={kycData?.["PAN No"] || ''} />
							</div>
							<div className="field">
								<label>ADHAAR No.</label>
								<input type="text" readOnly value={kycData?.["Aadhar No"] || ''} />
							</div>
							<div className="field">
								<label>GST No.</label>
								<input type="text" readOnly value={kycData?.["GST No"] || ''} />
							</div>
							<div className="field">
								<label>Customer Type</label>
								<input type="text" readOnly value={kycData?.GSTRegType || ''} />
							</div>
						</div>
					</form>
				)}
				{activeTab === "bank" && (
					<form className="custom-form">
						<div className="row">
							<div className="field">
								<label>Account No.</label>
								<input type="text" readOnly value={kycData?.["Account No"] || ''} />
							</div>
							<div className="field">
								<label>IFSC Code</label>
								<input type="text" readOnly value={kycData?.["IFSC Code"] || ''} />
							</div>
						</div>
						<div className="row">
              <div className="field">
                <label>Bank Name</label>
                <input type="text" readOnly value={kycData?.["Bank Name"] || ''}/>
              </div>
              <div className="field">
                <label>Bank Address</label>
                <textarea  readOnly value={kycData?.["Bank Address"] || ''} />
              </div>
              <div className="field">
                <label>Branch Code</label>
                <input type="text" readOnly value={kycData?.["Branch Code"] || ''} />
              </div>
            </div>
						<div className="row">
              <div className="field">
                <label>Bank Contact No</label>
                <input type="text" readOnly value={kycData?.BankContactNo || ''} />
              </div>
              <div className="field">
                <label>Bank Limit</label>
                <input type="text" readOnly value={kycData?.BankLimit || ''} />
              </div>
              <div className="field">
                <label>LC Limit</label>
                <input type="text" readOnly value={kycData?.LCLimit || ''} />
              </div>
            </div>
						<div className="row">
              <div className="field">
                <label>Deposit Amount</label>
                <input type="text" readOnly value={kycData?.["Deposit Amount"] || ''}/>
              </div>
              <div className="field">
                <label>Credit Term Pipes</label>
                <input type="text"  readOnly value={kycData?.["Credit Period Pipes"] || ''}/>
              </div>
              <div className="field">
                <label>Credit Term Fittings</label>
                <input type="text" readOnly value={kycData?.["Credit Period Fittings"] || ''}/>
              </div>
            </div>
						<div className="row">
              <div className="field">
                  <label>Blank Cheque</label>
                  <div className="radio-group">
                    {["Yes", "No"].map(option => (
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
            </div>
						<div className="row">
              <div className="field">
                <label>Credit Limit</label>
                <input type="text" readOnly value={kycData?.["Credit Limit"] || ''}/>
              </div>
              <div className="field">
                <label>Name of nearest distributor with distance</label>
                <input type="text" readOnly value={kycData?.["Nearest Distributor"] || ''} />
              </div>
              <div className="field">
                <label>Reject Remark</label>
                <textarea readOnly value={kycData?.RejectRemark || ''}  onChange={e => setRejectRemark(e.target.value)}/>
              </div>
            </div><div className="row">
              <div className="field">
                <label>Is Pending From Status</label>
                <input type="text" readOnly value={kycData?.IsPending || ''}/>
              </div>
              <div className="field">
                <label>Plant Head Approval Date</label>
                <input type="date" readOnly value={kycData?.["Modified Datetime"] || ''} />
              </div>
              <div className="field">
                <label>Customer ID</label>
                <input type="text" readOnly value={kycData?.CustomerCode || ''}/>
              </div>
            </div>
            <div className="row">
              {/* Attachments section */}
              <div className="field">
                <label>Attachments</label>
                <div className="form-group">
                  { (
                    <>
                      {/* File Upload */}
                      <input
                        type="file"
                        id="fileUpload"
                        multiple
                        ref={fileInputRef}
                        onChange={(e) =>
                          setNewFiles(e.target.files ? Array.from(e.target.files) : [])
                        }
                        
                      />
                      {/* New Files Preview */}
                      {newFiles.length > 0 && (
                        <div className="new-files">
                          {newFiles.map((file, idx) => (
                            <div key={idx} className="file-chip">
                              <span className="file-name">{file.name}</span>
                              <button
                                type="button"
                                className="remove-btn"
                                onClick={() => handleRemoveFile(idx)}
                              >
                                ✖
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="field">
                <label>Remarks</label>
                <textarea
                  value={kycData?.newRemark || ""}
                  onChange={(e) => setKycData({ ...kycData, newRemark: e.target.value })}
              
                />
              </div>
              <div className="field">
                <button
                  type="button"
                  className="btn-view-history"
                  onClick={() => handleHistoryOpen()}
                  title="View Approval History"
                >
                  🛈 View History
                </button>


              </div>
            </div>
						<div className="declaration">
							<input type="checkbox" checked={true} disabled={true}></input>
							<label>
								I hereby declare that the details furnished above are true and correct to the best of my knowledge and belief and I undertake to inform you of any changes
								therein, the form, immediately. In case any of the information is found to be false or untrue or misleading or misrepresenting, I am aware that I may held liable for it.
								I hereby authorise sharing of the information furnished on the form.
							</label>
						</div>
            {showButtons.secondaryPatch && ( 
              <div className="col">
                <label className="modcheckbox">
                  <input
                    type="checkbox"
                    checked={kycData?.SecondaryPatchInstalled}
                    onChange={(e) =>
                      setKycData((prev: any) =>
                        prev ? { ...prev, SecondaryPatchInstalled: e.target.checked } : prev
                      )
                    }
                    //onClick={() => updateKyc()}
                  />
                  <span>
                    DMS Training of Distributor is completed, and Secondary Patch has been installed.
                  </span>
                </label>
              </div>
            )}
            {showButtons.reject1 && (
              <button type='button' className='btn btn-red' onClick={() => setRejectRemark("")}>
                Reject1
              </button>
            )}

            {showButtons.navision && (
              <button type="button" className="btn btn-green" onClick={createInNavision}>
                Create In Navision
              </button>
            )} 

            {isCurrentApprover && (
              <div className="buttonrows">
                {showButtons.update && (
                  <button type="button" className="btn btn-blue" onClick={updateKyc}>
                    Update
                  </button>
                )} 

                {showButtons.approve && (
                  <button type="button" className="btn btn-green" onClick={approveKyc}>
                    Approve
                  </button>
                )}

                {showButtons.reject && (
                  <button type="button" className="btn btn-red" onClick={() => setShowRejectModal(true)}>
                    Reject
                  </button>
                )} 

                {showButtons.save && (
                  <button type="button" className="btn btn-green" onClick={updateKyc}>
                    Submit
                  </button>
               )}
              </div>
            )}

            {showRejectModal && (
              <div className="modalbackdrop">
                <div className="modalbox">
                  <button className="modalclose" onClick={() => setShowRejectModal(false)} style={{fontWeight: 700}}>
                    ×
                  </button>

                  <label className="block text-sm font-medium" style={{fontSize: 'medium', fontWeight: 500}}>Reject Remark</label>

                  <textarea
                    className="modtextarea"
                    style={{marginTop: '6px'}}
                    value={rejectRemark}
                    onChange={(e) => setRejectRemark(e.target.value)}
                  />

                  <button
                    type="button"
                    className="btn btn-red mt-3"
                    onClick={rejectKyc}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}


					</form>
				)}
      </div>
      {showHistoryModal && (
        <div className="popup-overlay-history">
          <div className="popup-card-history" ref={popupRef}>

            {/* Header */}
            <div className="popup-header-history">
              <span className="header-icon">📜</span>
              <h3>Approval History</h3>
              <button className="close-btn" onClick={handleHistoryClose}>✖</button>
            </div>

            {/* Body */}
            <div className="history-body">
              {isLoadingHistory ? (
                <p className="loading-text">Loading...</p>
              ) : history.length === 0 ? (
                <p className="no-history">No history available.</p>
              ) : (
                history.map((item, idx) => (
                  <div key={idx} className="history-item">

                    <div className="history-meta">
                      <span className="history-user">👤 {item.Author}</span>
                      <span className="history-date">📅 {new Date(item.Created as any).toLocaleString()}</span>
                    </div>

                    <div className="history-remark">
                      📝 {item.newRemark as any}
                    </div>

                    {(item.Attachment as any)?.length > 0 && (
                      <div className="history-attachments">
                        {(item.Attachment as any).map((file: any, fIdx: number) => (
                          <a
                            key={fIdx}
                            href={file.ServerRelativeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-link"
                          >
                            📎️{file.FileName}
                          </a>
                        ))}
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );


};

function fetchPinCodeData(pinCode: string) {
  throw new Error('Function not implemented.');
}
