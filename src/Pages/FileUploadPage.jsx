import React, { useState } from 'react'
import './FileUploadPage.css'
import FileCopyIcon from '@mui/icons-material/FileCopy';
import axios from "axios";

const FileUploadPage = () => {


  const [page, setPage] = useState(0);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const steps = ["Upload", "Preview", "Result"];

  const validateFile = (file) => {
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowedTypes.includes(file.type) || !["pdf", "png", "jpg", "jpeg"].includes(ext)) {
      alert("Only PDF, PNG, JPG allowed!");
      return null;
    }
    return file;
  };

  const handleInputFile = (e) => {
    const validated = validateFile(e.target.files[0]);
    if (!validated) return;
    setFile(validated);
    setTimeout(() => setPage(1), 1800);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDropFile = (e) => {
    e.preventDefault();
    setDragOver(false);
    const validated = validateFile(e.dataTransfer.files[0]);
    if (!validated) return;
    setFile(validated);
    setTimeout(() => setPage(1), 1800);
  };

  const [ocrText, setOcrText] = useState("");
const [loading, setLoading] = useState(false);

const processOCR = async () => {

  if (!file) return;

  try {

    setLoading(true);

    const formData = new FormData();

    formData.append("file", file);

    const response = await axios.post(
      "https://imprint-chirping-tassel.ngrok-free.dev/api/ocr",
      //"http://127.0.0.1:8000/api/ocr",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    setOcrText(response.data.extracted_text);

    setPage(2);

  } catch (error) {

    console.error(error);

    alert("OCR Failed");

  } finally {

    setLoading(false);

  }
};

  const reset = () => {
    setPage(0);
    setFile(null);
  };

  return (
    <div className='main'>

      {/* Stepper */}
      <div className='stepper'>
        {steps.map((label, i) => (
          <React.Fragment key={i}>
            <div className='step-item'>
              <div className={`circle ${i < page ? 'completed' : ''} ${i === page ? 'active' : ''}`}>
                {i < page ? '✓' : i + 1}
              </div>
              <span className={`step-label ${i === page ? 'label-active' : ''} ${i < page ? 'label-done' : ''}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <div className={`line ${i < page ? 'line-done' : ''}`}></div>}
          </React.Fragment>
        ))}
      </div>

      {/* Card */}
      <div className='card'>

        {/* ADD THIS 👇 */}
        {loading && (
          <div className='loading-overlay'>
            <div className='spinner'></div>
            <p>Running OCR...</p>
          </div>
        )}
        {/* Page 0 - Upload */}
        {page === 0 && (
          <div
            className={`file-upload ${dragOver ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropFile}
            onClick={() => document.getElementById("fileInput").click()}
          >
            <input
              type="file"
              id="fileInput"
              accept=".pdf,.png,.jpg,.jpeg"
              style={{ display: "none" }}
              onChange={handleInputFile}
            />
            <div className='upload-icon-bg'>
              <FileCopyIcon sx={{ fontSize: "44px", color: "#2196F3" }} />
            </div>
            <p className="upload-title">Drag & Drop your file here</p>
            <p className="upload-sub">or</p>
            <button className="upload-btn" onClick={e => { e.stopPropagation(); document.getElementById("fileInput").click(); }}>
              Browse File
            </button>
            <p className="upload-hint">Supported: PDF, PNG, JPG</p>
          </div>
        )}

        {/* Page 1 - Preview */}
        {page === 1 && file && (
          <div className='preview-card'>
            <div className='file-bar'>
              <span className={`file-badge ${file.type === 'application/pdf' ? 'badge-pdf' : 'badge-img'}`}>
                {file.name.split('.').pop().toUpperCase()}
              </span>
              <div>
                <p className='file-name'>{file.name}</p>
                <p className='file-meta'>{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>

            <div className="preview-box">
              {file.type.startsWith("image/") && (
                <img src={URL.createObjectURL(file)} className="preview-image" alt="preview" />
              )}
              {file.type === "application/pdf" && (
                <iframe src={URL.createObjectURL(file)} className="preview-pdf" title="pdf-preview" />
              )}
            </div>

            <div className="actions">
              <button className="btn-secondary" onClick={reset}>← Change File</button>
              <button className="btn-primary" onClick={processOCR}>Run OCR →</button>
            </div>
          </div>
        )}

        {/* Page 2 - Result */}
        {page === 2 && (
          <div className='result-card'>
            <div className='result-icon'>✔</div>
            <h3 className='result-title'>OCR Complete</h3>
            <p className='result-sub'>Text extracted from <strong>{file?.name}</strong></p>
            <div className='text-box'>
              <div className='text-box-header'>
                <span>Extracted Text</span>
                <button className='copy-btn' onClick={() => navigator.clipboard.writeText(ocrText)}>Copy</button>
              </div>
              <pre className='extracted-text'>{ocrText}</pre>
            </div>
            <button className='btn-primary' style={{ width: '100%' }} onClick={reset}>Process Another File</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default FileUploadPage;