import React, { useRef } from 'react';
import styled from 'styled-components';
import Papa from 'papaparse';
import { TableData } from '../types/interfaces';

interface FileUploadProps {
    onDataUpdate: (data: TableData[]) => void;
}

const UploadButton = styled.button`
    padding: 8px 16px;
    background-color: #2a2a2a;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;

    &:hover {
        background-color: #3a3a3a;
        border-color: rgba(255, 255, 255, 0.2);
    }
`;

const HiddenInput = styled.input`
    display: none;
`;

const FileUpload: React.FC<FileUploadProps> = ({ onDataUpdate }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    const data = results.data as TableData[];
                    onDataUpdate(data);
                },
                error: (error) => {
                    console.error('Error parsing CSV:', error);
                }
            });
        }
    };

    return (
        <>
            <UploadButton onClick={() => fileInputRef.current?.click()}>
                <span>📄</span> Upload CSV
            </UploadButton>
            <HiddenInput
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
            />
        </>
    );
};

export default FileUpload; 