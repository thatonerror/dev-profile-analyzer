import { useState } from 'react';
import { Upload, FileText, Loader2, Sparkles } from 'lucide-react';
import { uploadResume, analyzeProfile } from '../services/api';

// CVUploader Component  
// CVUploader Component  
const CVUploader = ({ setResumeData, githubData, leetcodeData, hackerrankData, setAiAnalysis }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
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
      console.log('📤 Starting upload for:', file.name);
      
      // Upload resume
      const formData = new FormData();
      formData.append('resume', file);
      
const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) throw new Error('Upload failed');
      
      const uploadResult = await uploadResponse.json();
      console.log('✅ Upload result:', uploadResult);
      
      setResumeData(uploadResult.parsedData);
      setUploadProgress(70);

      // Trigger AI analysis
      setUploadProgress(90);
      console.log('🤖 Starting AI analysis...');
      
      try {
const analysisResponse = await fetch(`${import.meta.env.VITE_API_URL}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeData: uploadResult.parsedData,
            githubData,
            leetcodeData,
            hackerrankData
          })
        });
        
        const analysis = await analysisResponse.json();
        console.log('✅ Analysis complete:', analysis);
        setAiAnalysis(analysis);
      } catch (analysisError) {
        console.error('⚠️ Analysis failed:', analysisError);
        // Set basic analysis if API fails
        setAiAnalysis({
          summary: `${uploadResult.parsedData.name} has skills in ${uploadResult.parsedData.skills}. Add GitHub/LeetCode profiles for deeper analysis.`,
          technicalStrengths: [uploadResult.parsedData.skills],
          improvementTips: ['Add your GitHub profile', 'Start solving LeetCode problems', 'Participate in HackerRank challenges']
        });
      }
      
      setUploadProgress(100);
      console.log('✅ All done!');
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert(`Failed to process resume: ${error.message || 'Unknown error'}`);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1500);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-gray-900/30 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Sparkles className="w-7 h-7 text-purple-400" />
        <h2 className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Upload Resume
        </h2>
      </div>
      
      <div
        className={`relative border-3 border-dashed rounded-3xl p-10 sm:p-16 text-center transition-all duration-300 cursor-pointer ${
          dragActive
            ? 'border-purple-400 bg-purple-500/20 scale-105 shadow-2xl'
            : 'border-purple-500/30 hover:border-purple-400/50 hover:bg-purple-500/10'
        } ${uploading ? 'opacity-75 cursor-not-allowed' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          accept=".pdf,.docx"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="space-y-6">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
              <svg className="animate-spin w-full h-full text-purple-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            </div>
            <div className="space-y-3">
              <p className="text-lg sm:text-xl font-bold text-purple-200">Analyzing Profile...</p>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-purple-300">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-purple-100">Drop your resume</h3>
              <p className="text-purple-300 text-base sm:text-lg">PDF or DOCX • Click to browse</p>
            </div>
            <p className="text-sm text-purple-400">Max 5MB • AI-powered analysis included</p>
          </div>
        )}
      </div>

      {!uploading && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl">
          <p className="text-center font-semibold text-purple-200 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI analyzes your resume + profiles automatically
          </p>
        </div>
      )}
    </div>
  );
};

export default CVUploader;