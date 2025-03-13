import React, { useState } from 'react';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Input = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string>('');
    const [summary,setSummary] = useState<string | null>('');

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if (!isValidType(file)) {
                alert("Invalid file type");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch("http://localhost:3000/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            console.log("Response from FastAPI:", data);

            setMessage(data.message); // "COVID Positive", "COVID Negative", or "Invalid file type"
            setSummary(data.summary || null)
        } catch (error) {
            console.error("Error uploading file:", error);
            setMessage("Error uploading file");
            setSummary(null)
        }
    };

    const isValidType = (file: File): boolean => {
        const allowed = ["image/jpg","image/png","image/jpeg","application/pdf"]
        return allowed.includes(file.type);
    };

    return (
        <div className='flex items-center justify-center min-h-screen w-screen m-0 p-0 bg-emerald-50'>
            <div className='flex flex-col items-center justify-center w-[450px] h-[500px]'>
                <div className='relative flex items-center justify-center border border-dashed border-gray-400 rounded-lg p-4 w-full h-[250px] cursor-pointer bg-sky-100'>
                    <input
                        type='file'
                        onChange={handleInput}
                        className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                    />
                    <div className='text-center'>
                        {selectedFile ? (
                            <p className='text-gray-700'>{selectedFile.name}</p>
                        ) : (
                            <p className='text-gray-500'>Drag & drop or click to upload a file</p>
                        )}
                    </div>
                </div>
                <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mt: 3 }}
                    onClick={handleFileUpload}
                >
                    Upload file
                </Button>
                {message && (
                    <div className='p-4 mt-4 text-lg font-semibold'>
                        {message === "COVID Positive" ? (
                            <div>
                            <p className='text-red-600'>🚨 COVID Positive</p>
                            <h3 className="text-xl font-bold">📄 Summary:</h3>
                            <p className='text-black'>{summary}</p>
                            </div>
                            
                        ) : message === "COVID Negative" ? (
                            <div>
                            <p className='text-green-600'>✅ COVID Negative</p>
                            <h3 className="text-xl font-bold">📄 Summary:</h3>
                            <p className='text-black'>{summary}</p>
                            </div>
                        ) : (
                            <p className='text-gray-600'>⚠️ {message}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Input;
