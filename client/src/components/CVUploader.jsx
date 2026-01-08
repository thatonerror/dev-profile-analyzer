import { useState } from 'react';
import { Upload, FileText, Loader2, Sparkles } from 'lucide-react';
// CVUploader Component
const CVUploader = ({ setResumeData, githubData, leetcodeData, hackerrankData, setAiAnalysis }) => {
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
      setUploadProgress(30);
      const uploadResult = await uploadResume(file);
      setResumeData(uploadResult.parsedData);
      setUploadProgress(70);

      if (githubData || leetcodeData || hackerrankData) {
        setUploadProgress(90);
        const analysis = await analyzeProfile(uploadResult.parsedData, githubData, leetcodeData, hackerrankData);
        setAiAnalysis(analysis);
      }
      
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1500);
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-gray-700 shadow-2xl">
      <div className="flex items-center justify-center gap-3 mb-6">
        <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-100">Upload Resume</h2>
      </div>
      
      <div
        className={`relative border-4 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 group cursor-pointer ${
          dragActive
            ? 'border-blue-500 bg-blue-500/10 scale-105 shadow-2xl'
            : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
        } ${uploading ? 'opacity-75 cursor-not-allowed' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-blue-500 animate-spin" />
            <div className="space-y-2">
              <p className="text-base sm:text-lg font-semibold text-gray-200">Analyzing your profile...</p>
              <div className="w-full bg-gray-700 rounded-full h-2.5 sm:h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-300 shadow-lg"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs sm:text-sm text-gray-400">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-100">Drop your PDF/DOCX</h3>
              <p className="text-gray-400 text-base sm:text-lg">or click to browse files</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Max 5MB • AI analysis included</p>
          </div>
        )}
      </div>

      {!uploading && (
        <div className="mt-6 p-3 sm:p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
            <p className="font-semibold text-sm sm:text-base text-emerald-300">
              AI will analyze your resume + profiles automatically!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default CVUploader;