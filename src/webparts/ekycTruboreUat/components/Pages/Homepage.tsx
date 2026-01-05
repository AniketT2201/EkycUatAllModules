import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import USESPCRUD, { ISPCRUD } from '../../services/BAL/SPCRUD/spcrud';
import ITopNavigationOps from '../../services/BAL/TopNavigation';
import { ITopNavigation } from '../../services/interface/ITopNavigation';
import ITopMenuOps from '../../services/BAL/TopMenu';
import { ITopMenu } from '../../services/interface/ITopMenu';
import { IEKYC } from '../../services/interface/IEKYC';
import DashboardOps,  { IDashboardOps } from '../../services/BAL/EKYC';
import { getHttpData } from '../../utils/HttpService';
import { SPComponentLoader } from '@microsoft/sp-loader';
import '../styles.scss';
import type { IEkycTruboreUatProps } from '../IEkycTruboreUatProps';
import { IconButton } from '@fluentui/react/lib/Button';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faEdit, faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { PeoplePicker, PrincipalType, IPeoplePickerContext } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import logo from '../../assets/Logo.png';
import { Item } from '@pnp/sp/items';
import { IDashboardInsert } from '../../services/interface/IDashboardInsert';
import { ViewKYC } from './ViewKYC';
import { Link } from 'react-router-dom';
import anime from "animejs/lib/anime.es.js"; // Ensure correct path
import html2canvas from 'html2canvas';
import { Search24Regular } from "@fluentui/react-icons";
import { Parallax } from 'react-scroll-parallax';
import KycService from '../../utils/KycService';
import Swal from 'sweetalert2';

// Load Bootstrap + FontAwesome
SPComponentLoader.loadCss('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
SPComponentLoader.loadCss('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');
//SPComponentLoader.loadCss('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');


interface NavigationItem {
  Id: number;
  //Department: string;
  ParantId: number;
  Title: string;
  Url: string;
  Children?: NavigationItem[];
}
interface Props {
  isMobile: boolean;
  getTopNavigationData: (props: any) => Promise<NavigationItem[]>;
}

export const Homepage: React.FunctionComponent<IEkycTruboreUatProps> = (props: IEkycTruboreUatProps) => {
  //const [data, setData] = useState<ITopNavigation[]>([]);
  const [loading, setLoading] = useState(false);
  const kycService = new KycService(props.currentSPContext.httpClient);
  const [isLoading, setIsLoading] = useState(true);
  const [groupedData, setGroupedData] = useState<Record<string, ITopNavigation[]>>({});
  const [topMenuData, setTopMenuData] = useState<NavigationItem[]>([]);
  const [DashboardData, setDashboardData] = useState<IEKYC[]>([]);
  const [DashboardItemById, setDashboardItemById] = useState<IEKYC[]>([]);
  const [openIds, setOpenIds] = useState<number[]>([]);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 992);
  const columns = DashboardData.length > 0 ? (Object.keys(DashboardData[0]) as (keyof IEKYC)[]) : [];
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredData, setFilteredData] = useState<IEKYC[]>([])
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredData.slice(startIndex, startIndex + rowsPerPage);
  const [isOpen, setIsOpen] = useState(false);
  const [Location, setLocation] = useState<string[]>([]);
  const [ACT, setACT] = useState<string[]>([]);
  const [Category, setCategory] = useState<string[]>([]);
  const [CurrentStatus, setCurrentStatus] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedACT, setSelectedACT] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCurrentStatus, setSelectedCurrentStatus] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [attachmentItemId, setAttachmentItemId] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<{name: string, url: string}[]>([]);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showViewForm, setShowViewForm] = useState(false);
  const [currentAttachments, setCurrentAttachments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEmployeeValid, setIsEmployeeValid] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({
    NationalHead: "",
    StateHead: "",
    ZonalHead: ""
  });

  const [formData, setFormData] = useState<IEKYC>({
    Id : '',
    EmployeeCode : '',
    FirmName : '',
    Email : '',
    MobileNo : '',
    ApprovedBy : '',
    PipingSystem : 'Trubore',
    Attachment: '',
    RegDetail: '',
    View: '',
    SecurityCode: ''
  })

  const initialFormState: IEKYC = {
    Id : "",
    EmployeeCode : '',
    FirmName : '',
    Email : '',
    MobileNo : '',
    ApprovedBy : '',
    PipingSystem : 'Trubore',
    Attachment: '',
    RegDetail: '',
    View: '',
    SecurityCode: ''
  };


  // Column definitions: header label + field key + optional render
const columnsConfig = [
  { header: "ID", key: "Id" },
  { 
    header: "Reg Detail", key: "RegDetail", 
    render: (item: IEKYC) => (
      <a
        href="#" className="clickable-text"
        onClick={(e) => {
          e.preventDefault(); // prevent page reload
          handleView(item);
        }}
      >
        Details
      </a>
    )
  },
  { 
    header: "View", key: "View", 
    render: (item: IEKYC) => (
      <Link to={`/ViewKYC?ID=${item.SecurityCode}&itemID=${item.Id}`} className="clickable-text">
      View
    </Link>
    )
  },
  { 
    header: "Attachment", key: "Attachment", 
    render: (item: IEKYC) => (
      <Link to={`/Attachmentpage?itemId=${item.Id}`} className="clickable-text">
      Attachment
    </Link>
    )
  },

  { header: "Customer Code", key: "EmployeeCode" },
  { header: "Firm Name", key: "FirmName" },
  { header: "Email", key: "Email" },
  { header: "Mobile", key: "MobileNo" },
  { header: "Approved BY", key: "ApprovedBy" },
  { header: "Pipes", key: "PipingSystem" }
];

 // useeffect for fade - in effects on page load 
  useEffect(() => {
    // trigger fade-in after mount
    const timer = setTimeout(() => setVisible(true), 100); // small delay
    return () => clearTimeout(timer);
  }, []);

 // useeffect for getting user group on page load
  React.useEffect(() => {
    sp.setup({
      sp: {
        baseUrl: window.location.origin,
      },
    });
    const handleResize = () => {
        const width = window.innerWidth;
        setIsLargeScreen(width > 992);
        setIsMobile(width <= 992);
    };

    window.addEventListener("resize", handleResize);

    // for fetching logged in user group details
    const fetchUserGroups = async () => {
      try {
        let spCrudObj: ISPCRUD = await USESPCRUD();
        const brrLoggedColl = await spCrudObj.getLoggedInSiteGroups(props);

        const GroupData: number[] = [];
        const GroupDataTitle: string[] = [];

        brrLoggedColl?.forEach((group: { Id: number; Title: string }) => {
          GroupData.push(group.Id);
          GroupDataTitle.push(group.Title);
        });

        console.log("User Groups:", GroupData, GroupDataTitle);
      } catch (error) {
        console.error("Error fetching user group data:", error);
      }
    };

    fetchUserGroups();


    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // useeffect for Filtering DashboardData based on searchQuery
  useEffect(() => {
    // Filter DashboardData based on searchQuery
    const filtered = DashboardData.filter((item) =>
      [
        item.Id,
        item.EmployeeCode,
        item.FirmName,
        item.Email,
        item.MobileNo,
        item.ApprovedBy,
        item.PipingSystem,
      ]
        .filter((field) => field) // Remove null/undefined
        .some((field) =>
          field.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    setFilteredData(filtered);
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchQuery, DashboardData]);

  // For buidlding hierarchical menu tree
  const buildMenuTree = (items: NavigationItem[]): NavigationItem[] => {
    const itemMap: Record<number, NavigationItem> = {};
    const roots: NavigationItem[] = [];

    items.forEach((item) => {
        item.Children = [];
        itemMap[item.Id] = item;
    });

    items.forEach((item) => {
        if (item.ParantId && itemMap[item.ParantId]) {
        itemMap[item.ParantId].Children!.push(item);
        } else {
        roots.push(item);
        }
    });

    return roots;
  };

  const toggleMenu = (id: number) => {
    setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((openId) => openId !== id) : [...prev, id]
    );
  };

  
  // render menu function which generates ui for menu
  const renderMenu = (items: NavigationItem[], level = 0) => (
    <ul className={`menu level-${level}`}>
        {items.map((item) => {
        const hasChildren = item.Children && item.Children.length > 0;

        return (
            <li key={item.Id} className="menu-item">
            <div className={`menu-link ${hasChildren ? 'has-children' : ''}`}>
                <a
                href={item.Url || '#'}
                target={item.Url ? '_blank' : '_self'}
                rel="noopener noreferrer"
                style={{ color: hasChildren ? 'Black' : 'Black ' }}
                >
                {item.Title}
                </a>
                {hasChildren && (
                <i
                    className={`fa ${level === 0 ? 'fa-chevron-down' : 'fa-chevron-right'} arrow-icon`}
                    aria-hidden="true"
                    style={{ color: hasChildren ? 'Black' : 'red', paddingLeft: '5px' }}
                ></i>
                )}
            </div>

            {hasChildren && (
                <div className="submenu">
                {renderMenu(item.Children || [], level + 1)}
                </div>
            )}
            </li>
        );
        })}
    </ul>
  );

  //Handle Create Click for opening popup in create mode
  const handleCreate = () => {
    setFormData(initialFormState); // Reset all fields
    setEditId(null);               // Not in edit mode
    setIsEditMode(false);
    setIsViewMode(false);
    setIsOpen(true);               // Open popup
    setAttachments([]);
    setNewFiles([]);
  };

  //Handle Cancel Click for closing popup and resetting states
  const handleCancel = () => {
    setIsOpen(false);              // Close popup
    setFormData(initialFormState); // Reset form for next time
    setEditId(null);
    setIsEditMode(false);
    setIsViewMode(false);
    setAttachments([]);
    setNewFiles([]);
    setIsUploading(false);
  };


  // Helper: load attachments for an item id and normalize
  const loadAttachments = async (itemId: number) => {
    setShowAttachmentModal(true);
    setAttachmentItemId(itemId);

    if (!itemId) {
      setAttachments([]);
      setFormData(initialFormState); // Reset formData if no itemId
      return;
    }

    try {
      // Fetch item details including SecurityCode and FirmName
      const item = await DashboardOps().getDashboardItemById("Ekyc", itemId, props);
      
      // Update formData with the fetched item details
      setFormData({
        ...initialFormState, // Start with initial state to ensure all fields are present
        ...item,
        Id: item.Id ? Number(item.Id) : itemId, // Ensure Id is a number
        SecurityCode: item.SecurityCode || "", // Ensure SecurityCode is set
        FirmName: item.FirmName || "", // Ensure FirmName is set
      });

      // Fetch attachments
      const files = await DashboardOps().getAttachments("Ekyc", itemId, props);

      if (!files || files.length === 0) {
        setAttachments([]);
        return;
      }

      setAttachments(files);
    } catch (err) {
      console.error("Error loading item details or attachments:", err);
      setAttachments([]);
      setFormData(initialFormState); // Reset on error
    }
  };

  const handleEmployeeCodeChange = async (code: string) => {
    setFormData((prev) => ({ ...prev, EmployeeCode: code }));

    if (!code) {
      setFormData((prev) => ({ ...prev, EmployeeName: "", Department: "" }));
      setIsEmployeeValid(false);
      setIsPrefilled(false);
      return;
    }

    try {
      const data = await getHttpData(`EmployeeDetails?EmployeeCode=${code}`, props);
      if (data && data.length > 0 && data[0].Message[0].FullName && data[0].Message[0].Department) {
        const d = data[0].Message[0];
        setFormData((prev) => ({
          ...prev,
          EmployeeName: d.FullName,
          Department: d.Department,
        }));
        setIsEmployeeValid(true);
        setIsPrefilled(true);
      } else {
        setFormData((prev) => ({ ...prev, EmployeeName: "", Department: "" }));
        setIsEmployeeValid(false);
        setIsPrefilled(false);
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      setFormData((prev) => ({ ...prev, EmployeeName: "", Department: "" }));
      setIsEmployeeValid(false);
      setIsPrefilled(false);
    }
  };

  //handle people picker change
  const handlePeopleChange = (field: string, items: any[]) => {
    if (items.length > 0) {
      const selectedUser = items[0]; // single selection
      setFormData({
        ...formData,
        [`${field}Id`]: selectedUser.id,              // for saving People field in SP list
        [`${field}Email`]: selectedUser.secondaryText // email shown in extra field
      });
    } else {
      setFormData({
        ...formData,
        [`${field}Id`]: null,
        [`${field}Email`]: ""
      });
    }
  };


  const handleView = async (row: IEKYC) => {
    try {
      const item = await DashboardOps().getDashboardItemById("Ekyc", row.Id, props);

      setFormData({
        ...item,
        NationalHeadEmail: item.NantionalHeadNameT,
        ZonalHeadEmail: item.ZoneHeadNameT,
        StateHeadEmail: item.StateHeadNameT,
        SecurityCode: item.SecurityCode,
      });

      const actualId = item.Id ? Number(item.Id) : Number(row.Id);
      setShowViewForm(true);
      setIsEditMode(false);
      setIsViewMode(true);
      setEditId(actualId);
      //setIsOpen(true);

      // load attachments for view mode too
      //await loadAttachments(actualId);
    }catch(err) {
      console.error("Error loading item details for view:", err);
    }
  };


  // Helper: upload all pending newFiles for given item id------------------------------------>
  const uploadFilesForId = async (itemId: number) => {
    if (newFiles.length === 0) return;

    setIsUploading(true);
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
        await DashboardOps().uploadAttachment("Ekyc", itemId, f, props);
        uploaded.push(f.name);
      }


      // Refresh attachments
      await loadAttachments(itemId);


      // Clear pending files that were uploaded
      setNewFiles([]);


      // Clear file input element if present
      const input = document.getElementById("fileUpload") as HTMLInputElement | null;
      if (input) input.value = "";


      if (uploaded.length > 0) {
        console.log(`Uploaded: ${uploaded.join(', ')}`);
        alert(`Successfully Uploaded: ${uploaded.join(', ')}.`);
      }
      if (skipped.length > 0) {
        console.log(`Skipped (already existed): ${skipped.join(', ')}`);
      }


    } catch (err) {
      console.error("Error uploading files:", err);
      throw err; // Rethrow to handle in submit
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = async (itemId: number) => {
  try {
    await uploadFilesForId(itemId);
  } catch (err) {
    console.error("Error uploading files. Please try again.");
  }
};

  const errorPopup = (title: string, text: string) => {
      Swal.fire({ icon: "error", title, text });
  };

   const handleFetchSecutiryCode = async () => {
    // UAT url
    const _apiUrl = "https://uat.princepipes.com:567/api/TruboreCustomerKYC/sendKYCRequest";
  
    // Production url
    //const _apiUrl = "https://travelservices.princepipes.com/imonwebapi-new/api/TruboreCustomerKYC/sendKYCRequest";

      const requestBody = {
        ActionID: "1",
        FirmName: formData.FirmName ?? "",
        MobileNo: formData.MobileNo ?? "",
        Email: formData.Email?.toLowerCase() ?? "",
        ModifiedBy: formData.EmployeeCode ?? "",
        NationalHead: formData.NationalHeadEmail?.toLowerCase() ?? "",
        StateHead: formData.StateHeadEmail?.toLowerCase() ?? "",
        ZoneHead: formData.ZonalHeadEmail?.toLowerCase() ?? "",
        SystemName: "Trubore"
      };
    setLoading(true);
    try {
      const response = await kycService.getCustomerKYCDetails(requestBody,_apiUrl);
      const messages = response?.aMessage?.[0]?.Description; 

      if (response?.aMessage?.[0]?.Result === "100") {
        const data = response.Table[0];
        const updatedData = {
          ...formData,
          SecurityCode: response.Table[0].SecurityNo
        };
        setFormData(updatedData);
        handleSubmit(updatedData);
      } else {
        alert(messages);
      }
  
    } catch (error) {
      console.error("Email Already Exist..", error);

      if (error.message?.includes("timed out")) {
			errorPopup("Request Timeout", "The UAT API request timed out.");
		  } else if (error.message?.includes("Failed to fetch")) {
			errorPopup("Network Error", "Failed to connect to the UAT API.");
		  } else {
			errorPopup("Error", `Failed to Connect UAT API: ${error.message}`);
		  }
      
    } finally {
      setLoading(false);
    }
  }

  // Handle form submission for both create and update----------------------------->
  const handleSubmit = async (formData: any) => {
    try {
      let itemId: number;

      if (isEditMode && editId) {
        await DashboardOps().updateDashboardData(editId, formData, props);
        itemId = editId;
      } else {
        const insertResult = await DashboardOps().insertDashboardData(formData, props);
        itemId = insertResult.data.Id; // Assuming returns {data: {Id: number, ...}}
      }

      //await uploadFilesForId(itemId);

      alert("New E-KYC request submitted successfully");

      // Reset form + close popup
      setFormData(initialFormState);
      setIsOpen(false);
      setIsEditMode(false);
      setEditId(null);

      // Refresh dashboard data
      DashboardOps().getDashboardData(props).then((DashboardColl) => {
        setDashboardData(DashboardColl);
      });

    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error. Please try again.");
    }
  };

  // Delete an attachment by name for the current editId (uses DashboardOps if available)
  const handleDeleteAttachment = async (fileName: string) => {
    if (!attachmentItemId) return;
    if (!fileName || fileName.trim() === "") {
      console.error("Invalid fileName for deleteAttachment");
      return;
    }

    if (!confirm(`Delete attachment "${fileName}"?`)) return;

    try {
      await DashboardOps().deleteAttachment("Ekyc", attachmentItemId, fileName, props);
      await loadAttachments(attachmentItemId); // refresh after delete
    } catch (err) {
      console.error("Failed to delete attachment:", err);
      alert("Failed to delete attachment.");
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
  


const handleClose = async () => {
  if (!popupRef.current) {
    console.error("popupRef is not defined");
    setShowAttachmentModal(false);
    return;
  }

  if (!anime) {
    console.error("Anime.js is not loaded");
    setShowAttachmentModal(false);
    return;
  }

  const card = popupRef.current;
  const overlay = card.parentElement; // .popup-overlay-attachment
  if (!overlay) {
    console.error("Overlay not found");
    setShowAttachmentModal(false);
    return;
  }

  const fragmentCount = 20;
  const fragments: HTMLDivElement[] = [];
  const cardRect = card.getBoundingClientRect();

  console.log("Card dimensions:", {
    width: cardRect.width,
    height: cardRect.height,
    top: cardRect.top,
    left: cardRect.left,
  });

  // Capture card as image
  const canvas = await html2canvas(card, { backgroundColor: null });
  const imgData = canvas.toDataURL('image/png');

  // Hide the card
  card.style.opacity = '0';

  // Create fragments and append to overlay
  for (let i = 0; i < fragmentCount; i++) {
    const piece = document.createElement('div');
    piece.className = 'fragment';
    piece.style.width = `${cardRect.width / 4}px`;
    piece.style.height = `${cardRect.height / 5}px`;
    piece.style.backgroundImage = `url(${imgData})`;
    piece.style.backgroundSize = `${cardRect.width}px ${cardRect.height}px`;
    piece.style.backgroundPosition = `${-(i % 4) * (cardRect.width / 4)}px ${-Math.floor(i / 4) * (cardRect.height / 5)}px`;
    piece.style.position = 'absolute';
    const top = cardRect.top + Math.floor(i / 4) * (cardRect.height / 5);
    const left = cardRect.left + (i % 4) * (cardRect.width / 4);
    piece.style.top = `${top}px`;
    piece.style.left = `${left}px`;
    piece.style.zIndex = '10000';
    piece.style.pointerEvents = 'none';
    piece.style.border = '1px solid rgba(0, 0, 0, 0.2)';
    piece.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    piece.style.transformOrigin = 'center';
    overlay.appendChild(piece);
    fragments.push(piece);
    console.log(`Fragment ${i}: top=${top}, left=${left}, width=${cardRect.width / 4}, height=${cardRect.height / 5}`);
  }

  try {
    console.log("Starting animation with", fragments.length, "fragments");
    const timeline = anime.timeline({
      autoplay: true,
      duration: 1500,
      delay: anime.stagger(100, { start: 0 }),
      complete: () => {
        console.log("Animation completed");
        fragments.forEach((f) => f.remove());
        card.style.opacity = '1';
        setShowAttachmentModal(false);
        setAttachmentItemId(null);
      },
    });

    timeline.add({
      targets: fragments,
      translateY: 300,
      translateX: () => (Math.random() - 0.5) * 200,
      opacity: [1, 0],
      easing: 'easeInQuad',
      duration: () => Math.random() * 500 + 1000,
      delay: () => Math.random() * 800,
    });
  } catch (error) {
    console.error("Animation failed:", error);
    fragments.forEach((f) => f.remove());
    card.style.opacity = '1';
    setShowAttachmentModal(false);
    setAttachmentItemId(null);
  }
};

const validateForm = () => {
  let newErrors = { NationalHead: "", ZonalHead: "", StateHead: "", MobileNo: "", Email: "", Name: "" };
  let isValid = true;

  // ✅ National Head validation
  if (!formData.NationalHeadEmail || formData.NationalHeadEmail.length === 0) {
    newErrors.NationalHead = "National Head is required.";
    isValid = false;
  }

  // ✅ Zonal Head validation
  if (!formData.ZonalHeadEmail || formData.ZonalHeadEmail.length === 0) {
    newErrors.ZonalHead = "Zonal Head is required.";
    isValid = false;
  }

  // ✅ State Head validation
  if (!formData.StateHeadEmail || formData.StateHeadEmail.length === 0) {
    newErrors.StateHead = "State Head is required.";
    isValid = false;
  }

  // ✅ Firm Name validation
  if (!formData.FirmName || formData.FirmName.trim() === "") {
    newErrors.Name = "Firm Name is required.";
    isValid = false;
  }

  // ✅ Email validation
  const emailRegex = /^(?!.*\.\.)[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!formData.Email) {
    newErrors.Email = "Email is required.";
    isValid = false;
  } else if (!emailRegex.test(formData.Email)) {
    newErrors.Email = "Enter a valid email address.";
    isValid = false;
  }

  // ✅ Mobile number validation
  if (!formData.MobileNo) {
    newErrors.MobileNo = "Mobile number is required.";
    isValid = false;
  } else {
    const isMobileValid = /^(?:[6-9][0-9]{9}|\+91[6-9][0-9]{9})$/.test(formData.MobileNo);

    if (!isMobileValid) {
      newErrors.MobileNo = "Enter valid mobile number (10 digits or +91XXXXXXXXXX starting with 6–9).";
      isValid = false;
    }
  }

  setErrors(newErrors);
  return isValid;
};



  // Initialize PnP Logic
  // useEffect(() => {
  //   // Fetch top navigation data
  //   ITopMenuOps().getTopMenuData(props).then(
  //       (data) => {
  //       const tree = buildMenuTree(data); // Builds hierarchical menu structure
  //       setTopMenuData(tree);
  //       },
  //       (error) => console.error('Error fetching navigation data:', error)
  //   );
    
  //   // Fetch Dashboard data
  //   DashboardOps().getDashboardData(props).then((DashboardColl) => {
  //     console.log(' Dashboard Data received:', DashboardColl);
  //     setDashboardData(DashboardColl);
  //   }, error => {
  //     console.error('Error fetching data:', error);
  //   });
  // }, [props]);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashboardData] = await Promise.all([
          DashboardOps().getDashboardData(props)
        ]);

        setDashboardData(dashboardData);
        setFilteredData(dashboardData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [props]);


  // for fetching unique values for dropdowns in form
  useEffect(() => {
    const loadData = async () => {
      try {
        const items: any[] = await sp.web.lists
        .getByTitle("ContractDocument")
        .items.select("Location", "ACT", "Category", "CurrenrtStatus")
        .getAll()

        // Extract column values and remove empty + duplicates
        const uniqueLocations = Array.from(new Set(items.map(i => i["Location"]).filter(v => v && v.trim() !== "")));
        const uniqueACTs = Array.from(new Set(items.map(i => i["ACT"]).filter(v => v && v.trim() !== "")));
        const uniqueCategories = Array.from(new Set(items.map(i => i["Category"]).filter(v => v && v.trim() !== "")));
        const uniqueCurrentStatuses = Array.from(new Set(items.map(i => i["CurrenrtStatus"]).filter(v => v && v.trim() !== "")));

        setLocation(uniqueLocations);
        setACT(uniqueACTs);
        setCategory(uniqueCategories);
        setCurrentStatus(uniqueCurrentStatuses);
        
      } catch (error) {
        console.error("Error fetching unique values:", error);
      }
    };
    loadData();
  }, []);


  // Render Loader or Main Content
  // if (isLoading) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
  //       <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
  //       <p className="text-gray-700 font-semibold text-lg">Loading, please wait...</p>
  //     </div>
  //   );
  // }
  
  return (
    <div className={`pageContainer `}>
      {/* SPINNER */}
      {loading && (
        <div className="loadingOverlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className={`menuWrapper fade-in ${visible ? 'visible' : ''}`} style={{ transitionDelay: '0.4s'}}>
        <div className ="Logo">
          <img src={logo}alt="Logo" />
        </div>
        {/* <div className="topBar">
          {!isMobile && topMenuData.length > 0 && (
            <div className="topbarmenu mobile">
              <nav className="sidemainMenu">{renderMenu(topMenuData.slice(0, 8))}</nav>
            </div>
          )}
          <IconButton
            iconProps={{ iconName: 'GlobalNavButton' }}
            className="hamburger"
            onClick={() => setMenuOpen(true)}
            ariaLabel="Open menu"
          />
        </div> */}
        {/* Side Tray for Mobile */}
        <div className={`sideTray ${menuOpen ? 'open' : ''}`}>
          <div className="trayHeader">
            <IconButton
              iconProps={{ iconName: 'ChromeClose' }}
              onClick={() => setMenuOpen(false)}
              ariaLabel="Close menu"
              className="closeButton"
            />
          </div>
            {topMenuData && topMenuData.length > 0 && (
              <div className="topbarmenu mobile scrollbox">
                <nav className="sidemainMenu">{renderMenu(topMenuData)}</nav>
              </div>
            )}
        </div>
      </div>

      <div>
        <h1 className={`main-heading fade-in ${visible ? 'visible' : ''}`} style={{ transitionDelay: '0.4s'}}>E-KYC Dashboard Trubore</h1>
      </div>
      <div className={`createFormBtnWrapper fade-in ${visible ? 'visible' : ''}`} style={{ transitionDelay: '0.7s'}}>
        <button className="createFormBtn"
          onClick={handleCreate}>
          Add KYC-Trubore
        </button>
      </div>

      {/* Search and Page Size Controls */}
      <div className={`"table-controls d-flex mb-3 flex-wrap" fade-in ${visible ? 'visible' : ''}`} style={{marginLeft: '2%', transitionDelay: '0.7s'}}>
        <div className="search-container me-3 mb-2" style={{height: 'auto', position: 'relative'}}>
          <Search24Regular className='searchIcon' />
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: '300px', paddingLeft: '38px' }}
          />
        </div>
        <div className="page-size-container mb-2" style={{height: 'auto'}}>
          <label htmlFor="rowsPerPage" className="me-2 font-medium">Rows per page:</label>
          <select
            id="rowsPerPage"
            className="form-select"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when page size changes
            }}
            style={{ width: 'auto', display: 'inline-block' }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      
      <div className={`Table-container fade-in ${visible ? 'visible' : ''}`} style={{ transitionDelay: '1.4s'}}>
        <table className={`Table responsive-table ${visible ? 'visible' : ''}`} style={{ transitionDelay: '1.6s'}}>
          <thead className="Table-header">
            <tr className="Header-rows">
              {columnsConfig.map(col => (
                <th key = {col.key} className='Header-data'>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className={`Table-body ${visible ? 'visible' : ''}`} style={{ transitionDelay: '0.2s'}}>
            {currentRows.length > 0 ? (
              currentRows.map((item, index) => (
                <tr key={index} className={`Body-rows ${visible ? 'visible' : ''} ${index % 2 === 0 ? "even" : "odd"}`}>
                  {columnsConfig.map((col) => (
                    <td key={col.key} className="Body-data">
                      {col.render
                        ? col.render(item)
                        : (item as any)[col.key] != null
                          ? (item as any)[col.key].toString()
                          : "-"
                      }
                    </td>
              ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columnsConfig.length} style={{ textAlign: "center" }}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="Pagination d-flex align-items-center flex-wrap">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
      


      {/* Form Section */}
      {/* Popup Overlay */}
      {isOpen && (
        <div className="popup-overlay">
          <div className="popup-card">
            <div className="popup-header">
              <h3>{isViewMode ? "View New KYC-Trubore" : (isEditMode ? "Update New KYC-Trubore" : "Create New KYC-Trubore")}</h3>
              <button className="close-btn" onClick={handleCancel}>×</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!e.currentTarget.checkValidity()) return;
              if (!isEmployeeValid) {
                alert("Invalid Employee Code. Please enter a valid code.");
                return;
              } 
              if (!validateForm()) {
                console.log("Validation failed");
                return;
              }
              handleFetchSecutiryCode();
              }}>
              {/* Employee Details */}
              <h3 className="form-section-title">Employee Details</h3>
              <div className="form-grid">
                <div className="form-group"><label>Employee Code</label>
                  <input type="text"
                        value={formData.EmployeeCode || ""}
                        onChange={(e) => handleEmployeeCodeChange(e.target.value)}
                        readOnly={isViewMode}
                        disabled={isViewMode}
                        required
                  />
                </div>
                <div className="form-group"><label>Department</label>
                  <input type="text"
                        value={formData.Department || ""}
                        onChange={(e) => setFormData({ ...formData, Department: e.target.value })}
                        readOnly
                        disabled={isViewMode}
                        required
                  />
                </div>
                <div className="form-group"><label>Pipes</label>
                  <input type="text"
                        value={formData.PipingSystem}
                        //onChange={(e) => setFormData({ ...formData, PipingSystem: e.target.value })}
                        readOnly
                        disabled={isViewMode}
                        required
                  />
                </div>
              </div>
              {/* Document Details */}
              {formData.Department && (
                <div>
                  <h3 className="form-section-title">Approver</h3>
                  <div className="form-grid-2">
                    {/* National Head */}
                    <div className="form-group">
                      <label>National Head*</label>
                      <PeoplePicker
                        context={{
                          absoluteUrl: props.currentSPContext.pageContext.web.absoluteUrl,  // ✅ no more undefined
                          spHttpClient: props.currentSPContext.spHttpClient,
                          msGraphClientFactory: props.currentSPContext.msGraphClientFactory
                        }}
                        titleText=""
                        personSelectionLimit={1}
                        showtooltip={true}
                        ensureUser={true}
                        disabled={isViewMode}
                        required={true}
                        onChange={(items) => {
                          handlePeopleChange("NationalHead", items);
                          setErrors(prev => ({ ...prev, NationalHead: "" }));
                        }}
                        principalTypes={[PrincipalType.User]}
                        resolveDelay={500}
                      />
                      {errors.NationalHead && (
                        <span style={{ color: "red", fontSize: 12 }}>
                          {errors.NationalHead}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        value={formData.NationalHeadEmail || ""}
                        readOnly
                      />
                    </div>

                    {/* Zonal Head */}
                    <div className="form-group">
                      <label>Zonal Head*</label>
                      <PeoplePicker
                        context={{
                          absoluteUrl: props.currentSPContext.pageContext.web.absoluteUrl,  // ✅ no more undefined
                          spHttpClient: props.currentSPContext.spHttpClient,
                          msGraphClientFactory: props.currentSPContext.msGraphClientFactory
                        }}
                        titleText=""
                        personSelectionLimit={1}
                        showtooltip={true}
                        ensureUser={true}
                        disabled={isViewMode}
                        required={true}
                        onChange={(items) => {
                          handlePeopleChange("ZonalHead", items);
                          setErrors(prev => ({ ...prev, ZonalHead: "" }));
                        }}
                        principalTypes={[PrincipalType.User]}
                        resolveDelay={500}
                      />
                      {errors.ZonalHead && (
                        <span style={{ color: "red", fontSize: 12 }}>
                          {errors.ZonalHead}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        value={formData.ZonalHeadEmail || ""}
                        readOnly
                      />
                    </div>

                    {/* State Head */}
                    <div className="form-group">
                      <label>State Head*</label>
                      <PeoplePicker
                        context={{
                          absoluteUrl: props.currentSPContext.pageContext.web.absoluteUrl,  // ✅ no more undefined
                          spHttpClient: props.currentSPContext.spHttpClient,
                          msGraphClientFactory: props.currentSPContext.msGraphClientFactory
                        }}
                        titleText=""
                        personSelectionLimit={1}
                        showtooltip={true}
                        ensureUser={true}
                        disabled={isViewMode}
                        required={true}
                        onChange={(items) => {
                          handlePeopleChange("StateHead", items);
                          setErrors(prev => ({ ...prev, StateHead: "" }));
                        }}
                        principalTypes={[PrincipalType.User]}
                        resolveDelay={500}
                      />
                      {errors.StateHead && (
                        <span style={{ color: "red", fontSize: 12 }}>
                          {errors.StateHead}
                        </span>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <input
                        type="text"
                        value={formData.StateHeadEmail || ""}
                        readOnly
                      />
                    </div>

                  </div> 
                </div>
              )}
              {/* KYC Details */}
              <h3 className="form-section-title">KYC Details</h3>
              <div >
                <div className="form-group"><label>Name of the Firm</label>
                  <input type="text"
                        value={formData.FirmName}  
                        onChange={(e) => setFormData({ ...formData, FirmName: e.target.value })}
                        readOnly={isViewMode}
                        disabled={isViewMode}
                        required
                  />
                </div>
                <div className="form-group"><label>Mobile</label>
                  <input
                    type="text"
                    value={formData.MobileNo || ""}
                    onChange={(e) => {
                      let value = e.target.value;

                      // Allow only digits and +
                      if (!/^[0-9+]*$/.test(value)) return;

                      // Allow + only at the beginning
                      if (value.includes("+") && !value.startsWith("+")) return;

                      // If starts with +, allow only +91 prefix (partial allowed)
                      if (value.startsWith("+") && !"+91".startsWith(value.replace(/\d/g, "")) && !value.startsWith("+91")) {
                        return;
                      }

                      // Length control:
                      // 10 digits normally, 13 if starts with +91
                      if (
                        (!value.startsWith("+") && value.length > 10) ||
                        (value.startsWith("+91") && value.length > 13) 
                      ) {
                        return;
                      }

                      setFormData({ ...formData, MobileNo: value });
                    }}
                    pattern="^(?:[6-9][0-9]{9}|\+91[6-9][0-9]{9})$"
                    title="Enter valid mobile number (10 digits or +91XXXXXXXXXX starting with 6–9)"
                    required
                    readOnly={isViewMode}
                    disabled={isViewMode}
                  />
                </div>
                {/* Inline error */}
                {formData.MobileNo &&
                !/^(?:[6-9][0-9]{9}|\+91[6-9][0-9]{9})$/.test(formData.MobileNo) && (
                  <span style={{ color: "red", fontSize: "12px" }}>
                    Enter valid mobile number (10 digits or +91XXXXXXXXXX starting with 6–9).
                  </span>
                )}

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.Email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, Email: e.target.value || "" })
                    }
                    readOnly={isViewMode}
                    disabled={isViewMode}
                    required
                    //pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                    title="Enter a valid email (no consecutive dots, must start with a letter/number, valid domain and TLD)"
                  />
                </div>

                {/* Inline Email Error */}
                {formData.Email &&
                  !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.Email) && (
                    <span style={{ color: "red", fontSize: "12px" }}>
                      Please enter a valid email address (example: user@example.com, no double dots, must start with a letter/number).
                    </span>
                )}
              </div>
              {/* Attachments section */}
              


              {/* Buttons */}
              {!isViewMode && (
                <div className="form-buttons">
                  <button className="btn-submit" type='submit' disabled={isUploading}>
                    {isEditMode ? 'Update' : 'Submit'}
                  </button>
                  <button className="btn-exit" type='button' onClick={handleCancel}>Exit</button>
                </div>
              )}

              {isViewMode && (
                <div className="form-buttons">
                  <button className="btn-exit" type='button' onClick={handleCancel}>Close</button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      {/* Custom Attachment form currently not in use */}
      {showAttachmentModal && (
        <div className="popup-overlay-attachment">
          <div className="popup-card-attachment" ref={popupRef}>
            <div className="attachment-section">
                  <div className="popup-header-attachment">
                    <h3 className="form-section-title">Attachments</h3>
                    <button className="close-btn" onClick={handleClose}>×</button>
                  </div>

                  <div className="form-group">
                      <>
                        <div className="form-group"><label>Security Code</label>
                          <input
                            type="text"
                            value={formData.SecurityCode}
                          />
                        </div>
                        <div className="form-group"><label>Firm Name</label>
                          <input
                            type="text"
                            value={formData.FirmName}
                          />
                        </div>
                        {/* File Upload */}
                        <input
                          type="file"
                          id="fileUpload"
                          multiple
                          ref={fileInputRef}
                          onChange={(e) =>
                            setNewFiles(e.target.files ? Array.from(e.target.files) : [])
                          }
                          className="file-input"
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
                  </div>

                  {/* Existing Attachments */}
                  <div className="existing-files">
                    {attachments.length > 0 ? (
                      attachments.map((att, idx) => (
                        <div key={idx} className="file-item">
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-link"
                          >
                            📄 {att.name}
                          </a>
                          
                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() => handleDeleteAttachment(att.name)}
                            >
                              🗑️
                            </button>

                        </div>
                      ))
                    ) : (
                      <p className="no-files">No attachments uploaded.</p>
                    )}
                  </div>
                </div>
                <button className="btn-submit"
                  onClick={() => attachmentItemId && handleUploadClick(attachmentItemId)}
                  disabled={isUploading || newFiles.length === 0 || !attachmentItemId}
                >
                  Upload Files
                </button>
          </div>
        </div>
      )}

      {/* for view form code  */}
      {showViewForm && (
        <div className="popup-overlay">
          <div className="popup-card">
            <div className="popup-header">
              <h3>Customer Registration Details</h3>
              <button className="close-btn" onClick={() => setShowViewForm(false)}>×</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!e.currentTarget.checkValidity()) return;
                if (!isEmployeeValid) {
                  alert("Invalid Employee Code. Please enter a valid code.");
                  return;
                }
                handleSubmit(formData);
              }}
            >

              {/* Employee Details */}
              <h3 className="form-section-title">Employee Detail</h3>
              <div className="form-grid-0">
                <div className="form-group">
                  <label>Name of the Firm</label>
                  <input
                    type="text"
                    value={formData.FirmName}
                    onChange={(e) => setFormData({ ...formData, FirmName: e.target.value })}
                    readOnly={isViewMode}
                    disabled={isViewMode}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mobile</label>
                  <input
                    type="text"
                    value={formData.MobileNo || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9+\s-]{0,13}$/.test(value)) {
                        setFormData({ ...formData, MobileNo: value });
                      }
                    }}
                    readOnly={isViewMode}
                    disabled={isViewMode}
                    required
                    pattern="^(?:\+91[ -]?[1-9]\d{9}|0[1-9]\d{9}|[1-9]\d{9})$"
                    title="Enter valid mobile number: 
                    9876543210, 09876543210, or +91 9876543210"
                  />
                </div>

                {formData.MobileNo &&
                  !/^(?:\+91[ -]?[1-9]\d{9}|0[1-9]\d{9}|[1-9]\d{9})$/.test(formData.MobileNo) && (
                    <span style={{ color: "red", fontSize: "12px" }}>
                      Please enter a valid mobile number.
                    </span>
                  )}

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.Email}
                    onChange={(e) => setFormData({ ...formData, Email: e.target.value || null })}
                    readOnly={isViewMode}
                    disabled={isViewMode}
                    required
                  />
                </div>
              </div>

              {/* Approver Section */}
              <h3 className="form-section-title">Approver</h3>
              <div className="form-grid-0">
                {/* National Head */}
                <div className="form-group">
                  <label>National Head*</label>
                </div>
                <div className="form-group">
                  <input type="text" value={formData.NationalHeadEmail || ""} readOnly />
                </div>

                {/* Zonal Head */}
                <div className="form-group">
                  <label>Zonal Head*</label>
                </div>
                <div className="form-group">
                  <input type="text" value={formData.ZonalHeadEmail || ""} readOnly />
                </div>

                {/* State Head */}
                <div className="form-group">
                  <label>State Head*</label>

                </div>
                <div className="form-group">
                  <input type="text" value={formData.StateHeadEmail || ""} readOnly />
                </div>
              </div>

              {/* Approval Status */}
              <h3 className="form-section-title">Approval Status</h3>
              <div className="form-group">
                <label>Approved By</label>
                <input type="text" value={formData.ApprovedBy || ""} readOnly />
              </div>

            </form>
          </div>
        </div>
      )}



    </div>
  );
};