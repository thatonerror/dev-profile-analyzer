import { useState } from 'react';
import { uploadResume, analyzeProfile } from '../services/api';

const CVUploader = ({ setResumeData, githubData, leetcodeData, setAiAnalysis }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadResult = await uploadResume(file);
      setResumeData(uploadResult.parsedData);
      setUploadProgress(70);

      // Auto-trigger AI analysis if profile data exists
      if (githubData || leetcodeData) {
        setUploadProgress(90);
        const analysis = await analyzeProfile(
          uploadResult.parsedData,
          githubData,
          leetcodeData
        );
        setAiAnalysis(analysis);
      }
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to process resume. Please try again.');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1500);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold mb-6 text-center">📄 Upload Resume</h2>
      
      <div
        className={`relative border-4 border-dashed rounded-2xl p-12 text-center transition-all duration-300 group cursor-pointer ${
          dragActive
            ? 'border-blue-400 bg-blue-500/20 scale-105 shadow-2xl'
            : 'border-white/30 hover:border-white/50 hover:bg-white/5'
        } ${uploading ? 'opacity-75 cursor-default' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="space-y-4">
            <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 mx-auto rounded-full animate-spin"></div>
            <div className="space-y-2">
              <p className="text-lg font-semibold">Analyzing your profile...</p>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 shadow-lg"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-300">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Drop your PDF/DOCX</h3>
              <p className="text-gray-300 text-lg">or click to browse files</p>
            </div>
            <p className="text-sm text-gray-400">Max 5MB • AI analysis included</p>
          </div>
        )}
      </div>

      {!uploading && (
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-xl text-center">
          <p className="font-semibold text-emerald-200">
            ✨ AI will analyze your resume + profiles automatically!
          </p>
        </div>
      )}
    </div>
  );
};

export default CVUploader;
