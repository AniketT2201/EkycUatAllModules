import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { IEkycPrinceProps } from "../IEkycPrinceProps";
import { IEKYC } from '../../services/interface/IEKYC';
import DashboardOps from '../../services/BAL/EKYC';
import anime from 'animejs';
import html2canvas from 'html2canvas';
import '../styles.scss';
import { Link, useLocation, useParams, useHistory  } from 'react-router-dom';


export const Attachmentpage: React.FunctionComponent<IEkycPrinceProps> = (props: IEkycPrinceProps) => {
    const [attachmentItemId, setAttachmentItemId] = useState<number | null>(null);
    const [attachments, setAttachments] = useState<{name: string, url: string}[]>([]);
    const [showAttachmentModal, setShowAttachmentModal] = useState(true);
    const popupRef = useRef<HTMLDivElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { itemId } = useParams<{ itemId: string }>(); // get route param
    const location = useLocation();
    const history = useHistory();
    const [visible, setVisible] = useState(false);
    const [formData, setFormData] = useState<IEKYC>({
        Id : '',
        EmployeeCode : '',
        FirmName : '',
        Email : '',
        MobileNo : '',
        ApprovedBy : '',
        PipingSystem : 'Prince',
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
        PipingSystem : 'Prince',
        Attachment: '',
        RegDetail: '',
        View: '',
        SecurityCode: ''
      };
  
       // useeffect for fade - in effects on page load 
        useEffect(() => {
          // trigger fade-in after mount
          const timer = setTimeout(() => setVisible(true), 100); // small delay
          return () => clearTimeout(timer);
        }, []);

       useEffect(() => {
            const params = new URLSearchParams(location.search);
            const itemId = params.get('itemId');
            if (itemId) {
            loadAttachments(Number(itemId));
            }
        }, [location]);

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
            const overlayRect = overlay.getBoundingClientRect();
            const piece = document.createElement('div');
            piece.className = 'fragment';
            piece.style.width = `${cardRect.width / 4}px`;
            piece.style.height = `${cardRect.height / 5}px`;
            piece.style.backgroundImage = `url(${imgData})`;
            piece.style.backgroundSize = `${cardRect.width}px ${cardRect.height}px`;
            piece.style.backgroundPosition = `${-(i % 4) * (cardRect.width / 4)}px ${-Math.floor(i / 4) * (cardRect.height / 5)}px`;
            piece.style.position = 'absolute';
            const top = cardRect.top - overlayRect.top + Math.floor(i / 4) * (cardRect.height / 5);
            const left = cardRect.left - overlayRect.left + (i % 4) * (cardRect.width / 4);
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
                history.push("/");
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
            history.push("/");
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

         const handleUploadClick = async (itemId: number) => {
            try {
                await uploadFilesForId(itemId);
            } catch (err) {
                console.error("Error uploading files. Please try again.");
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

          const handleclick = async () => {
            await DashboardOps().updateDashboardData(itemId as any, 
            { 
              FirmName: 'test',
              EmployeeCode: '100',
              Email: 'any@gmail.com',
              MobileNo: '1234567890',
              ApprovedBy: 'Admin',
              Attachment: 'attachment',
              RegDetail: 'regdetail',
              View: 'view',
              PipingSystem: 'Prince'

            }, props);

          }


    return (

            <div className={`popup-overlay-attachment`} >
              <div className={`popup-card-attachment fade-in ${visible ? 'visible' : ''}`} ref={popupRef} >
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
                                readOnly
                              />
                            </div>
                            <div className="form-group"><label>Firm Name</label>
                              <input
                                type="text"
                                value={formData.FirmName}
                                readOnly
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


    );
}