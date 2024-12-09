import React, { useState } from 'react';
import axios from 'axios';
import './ImageUpload.css'; 

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [microorganisms, setMicroorganisms] = useState([]);
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null); 
  const [isWaterSafe, setIsWaterSafe] = useState(null);
  const [activeTab, setActiveTab] = useState('waterSafety');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);


    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl); 
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please upload an image first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/detect/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { microorganisms } = response.data;
      const waterSafetyStatus = determineWaterSafety(microorganisms);
      setIsWaterSafe(waterSafetyStatus);
      setMicroorganisms(microorganisms);
      setAnnotatedImage(response.data.annotated_image);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const determineWaterSafety = (microorganisms) => {
    const pathogenicMicroorganisms = microorganisms.filter(microbe => 
      microbe.name.endsWith('-0') 
    );

    return pathogenicMicroorganisms.length > 0 
      ? "Unsafe to drink" 
      : "Safe to drink";
  };

  return (
    <div className="container">
      <h1 className="title">Microorganism Detection</h1>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="file-input"
      />
      <button onClick={handleUpload} className="upload-button">Upload Image</button>

      {uploadedImage && (  
        <div className="uploaded-image">
          <h2>Uploaded Image</h2>
          <img src={uploadedImage} alt="Uploaded" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}

      <div className="tab-container">
        <button
          onClick={() => setActiveTab('waterSafety')}
          className={`tab-button ${activeTab === 'waterSafety' ? 'active' : ''}`}
        >
          Water Safety
        </button>
        <button
          onClick={() => setActiveTab('microorganisms')}
          className={`tab-button ${activeTab === 'microorganisms' ? 'active' : ''}`}
        >
          Microorganism Details
        </button>
      </div>

      
      {activeTab === 'waterSafety' && (
        <div className="tab-content">
          <h2>Water Safety Status</h2>
          {isWaterSafe !== null ? (
            <p className={`status ${isWaterSafe === "Safe to drink" ? 'safe' : 'unsafe'}`}>
              {isWaterSafe}
            </p>
          ) : (
            <p>No analysis yet.</p>
          )}
        </div>
      )}

      
      {activeTab === 'microorganisms' && (
        <div className="tab-content">
          <h2>Detected Microorganisms</h2>
          {annotatedImage && (
            <div className="annotated-image">
              <h3>Annotated Image</h3>
              <img src={`data:image/jpeg;base64,${annotatedImage}`} alt="Annotated" />
            </div>
          )}
          {microorganisms.length > 0 ? (
            <ul className="microbe-list">
              {microorganisms.map((microbe, index) => (
                <li key={index} className="microbe-item">
                  <strong>{microbe.name}</strong> - Confidence: {microbe.confidence.toFixed(2)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No microorganisms detected.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
