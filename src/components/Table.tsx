import React, { useState, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import styled from 'styled-components';
import { TableData, TableFilter } from '../types/interfaces';
import { SortDirection, ColumnMenuTab } from 'ag-grid-community';

interface TableProps {
    data: TableData[];
    onFilterChange: (filters: TableFilter[]) => void;
    onDataChange: (data: TableData[]) => void;
    onRowClick: (rowData: TableData) => void;
}

const TableContainer = styled.div`
    height: calc(100% - 56px);
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: #1a1a1a;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    overflow: hidden;
`;

const FilterChips = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 16px;
    background: #1a1a1a;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    min-height: 52px;
`;

const FilterChip = styled.div`
    background-color: #2a2a2a;
    padding: 6px 12px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ffffff;
    font-size: 13px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;

    &:hover {
        background-color: #3a3a3a;
        border-color: rgba(255, 255, 255, 0.2);
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    color: #ffffff;
    opacity: 0.7;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s ease;

    &:hover {
        opacity: 1;
    }
`;

const GridContainer = styled.div`
    flex: 1;
    width: 100%;
    overflow: hidden;
    background: #1a1a1a;

    .ag-root-wrapper {
        background: #1a1a1a;
        border: none;
    }

    .ag-root {
        background: #1a1a1a;
    }

    .ag-header {
        background: #1a1a1a;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .ag-header-row {
        background: #1a1a1a;
    }

    .ag-header-cell {
        background: #1a1a1a;
        color: #ffffff;
        border: none;
        font-weight: 500;
        display: flex;
        align-items: center;
        padding: 0 16px;
    }

    .ag-header-cell:hover {
        background: #2a2a2a;
    }

    .ag-header-cell-label {
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .ag-cell {
        background: #1a1a1a;
        color: #ffffff;
        border-right: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        line-height: 40px;
    }

    .ag-row {
        background: #1a1a1a;
        border: none;
    }

    .ag-row-hover {
        background: #2a2a2a;
    }

    .ag-row-selected {
        background: #2a2a2a;
    }

    /* Sort Icons */
    .ag-header-cell-sorted-asc,
    .ag-header-cell-sorted-desc {
        color: #007AFF;
    }

    .ag-sort-indicator-container {
        padding-left: 4px;
    }

    .ag-sort-ascending-icon,
    .ag-sort-descending-icon {
        color: #007AFF;
    }

    .ag-sort-indicator-icon {
        color: rgba(255, 255, 255, 0.7);
    }

    /* Filter Popup */
    .ag-popup-child {
        background: #2a2a2a;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .ag-filter-wrapper {
        background: #2a2a2a;
        color: #ffffff;
        padding: 16px;
        border-radius: 8px;
        min-width: 240px;
    }

    /* Filter Select Dropdown */
    .ag-filter-select, 
    .ag-filter-condition-operator select,
    .ag-select .ag-picker-field-wrapper {
        background: #1a1a1a;
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        height: inherit !important;
        padding: 0 8px;
        width: 100%;
        cursor: pointer;
        font-size: 13px;

    }

    .ag-picker-field-wrapper {
        border: none !important;
        height: 32px !important;
    }

    .ag-picker-field-display {
        color: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    .ag-select-list-item {
        background: #1a1a1a !important;
        color: #ffffff !important;
        padding: 8px !important;
    }

    .ag-select-list-item:hover {
        background: #2a2a2a !important;
    }

    /* Filter Input */
    .ag-filter input[type="text"],
    .ag-floating-filter-input input {
        background: #1a1a1a;
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        height: 32px;
        padding: 0 8px;
        width: 100%;
        margin: 8px 0;
        font-size: 13px;
    }

    .ag-floating-filter-input input {
        margin: 0;
        background: #2a2a2a;
    }

    .ag-floating-filter-input {
        padding: 8px;
    }

    .ag-floating-filter-button {
        color: rgba(255, 255, 255, 0.7);
    }

    .ag-floating-filter-button:hover {
        color: #ffffff;
    }

    .ag-filter input[type="text"]:focus,
    .ag-floating-filter-input input:focus,
    .ag-filter-select:focus,
    .ag-filter-condition-operator select:focus {
        border-color: #007AFF;
        outline: none;
    }

    /* Filter Buttons */
    .ag-filter-apply-panel {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: 12px;
    }

    .ag-filter-apply-panel button,
    .ag-standard-button {
        background: #3a3a3a;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #ffffff;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s ease;
    }

    .ag-filter-apply-panel button:hover,
    .ag-standard-button:hover {
        background: #4a4a4a;
        border-color: rgba(255, 255, 255, 0.2);
    }

    /* Filter Sections */
    .ag-simple-filter-body-wrapper {
        padding: 4px 0;
    }

    .ag-filter-condition-operator {
        color: #ffffff;
        padding: 8px 0;
    }

    /* Filter Labels */
    .ag-set-filter-label {
        color: #ffffff;
    }

    .ag-filter-condition {
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        margin: 4px 0;
    }

    /* Mini Filter */
    .ag-mini-filter {
        background: #1a1a1a;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #ffffff;
    }

    .ag-mini-filter:focus {
        border-color: #007AFF;
    }

    /* List Items */
    .ag-list-item {
        color: #ffffff;
    }

    .ag-list-item:hover {
        background: #2a2a2a;
    }

    /* Virtual List */
    .ag-virtual-list-container {
        background: #1a1a1a;
    }

    /* Filter Toolbar */
    .ag-filter-toolbar {
        background: #2a2a2a;
        padding: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Scrollbars */
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    ::-webkit-scrollbar-track {
        background: #1a1a1a;
    }

    ::-webkit-scrollbar-thumb {
        background: #2a2a2a;
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #3a3a3a;
    }

    /* Remove cell focus outline */
    .ag-cell-focus {
        border: none !important;
    }
`;

const Table: React.FC<TableProps> = ({ data, onFilterChange, onDataChange, onRowClick }) => {
    const [filters, setFilters] = useState<TableFilter[]>([]);
    const [gridApi, setGridApi] = useState<any>(null);

    const onGridReady = (params: any) => {
        setGridApi(params.api);
        params.api.sizeColumnsToFit();

        window.addEventListener('resize', () => {
            params.api.sizeColumnsToFit();
        });
    };

    const onFilterChanged = useCallback(() => {
        if (!gridApi) return;
        
        const filterModel = gridApi.getFilterModel();
        const newFilters = Object.entries(filterModel).map(([column, filter]: [string, any]) => ({
            column,
            value: filter.filter
        }));
        
        setFilters(newFilters);
        onFilterChange(newFilters);
        
        const filteredData: TableData[] = [];
        gridApi.forEachNodeAfterFilter((node: any) => {
            filteredData.push(node.data);
        });
        onDataChange(filteredData);
    }, [gridApi, onFilterChange, onDataChange]);

    const removeFilter = (columnName: string) => {
        if (!gridApi) return;
        gridApi.setFilterModel({
            ...gridApi.getFilterModel(),
            [columnName]: null
        });
    };

    const columnDefs = Object.keys(data[0] || {}).map(field => ({
        field,
        filter: 'agTextColumnFilter',
        menuTabs: ['filterMenuTab'] as ColumnMenuTab[],
        sortable: true,
        headerClass: 'custom-header',
        cellClass: 'custom-cell',
        resizable: true,
        filterParams: {
            buttons: ['apply', 'clear'],
            closeOnApply: true,
            suppressAndOrCondition: true
        },
        sortingOrder: ['asc', 'desc'] as SortDirection[]
    }));

    const defaultColDef = {
        flex: 1,
        minWidth: 150,
        filter: 'agTextColumnFilter',
        sortable: true,
        resizable: true,
        suppressMovable: true,
        unSortIcon: false,
        filterParams: {
            buttons: ['apply', 'clear'],
            closeOnApply: true,
            filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
            defaultOption: 'contains'
        }
    };

    const onRowClicked = useCallback((event: any) => {
        console.log('Row clicked:', event.data);
        onRowClick(event.data);
    }, [onRowClick]);

    return (
        <TableContainer>
            <FilterChips>
                {filters.map((filter, index) => (
                    <FilterChip key={index}>
                        <span style={{ fontWeight: 500 }}>{filter.column}:</span> {filter.value}
                        <CloseButton 
                            onClick={() => removeFilter(filter.column)}
                            title={`Remove ${filter.column} filter`}
                        >
                            ×
                        </CloseButton>
                    </FilterChip>
                ))}
            </FilterChips>
            <GridContainer>
                <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                    <AgGridReact
                        rowData={data}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        onGridReady={onGridReady}
                        onFilterChanged={onFilterChanged}
                        onRowClicked={onRowClicked}
                        suppressCellFocus={true}
                        rowHeight={40}
                        headerHeight={48}
                        rowSelection="single"
                        animateRows={true}
                        suppressDragLeaveHidesColumns={true}
                        suppressRowHoverHighlight={false}
                        enableCellTextSelection={false}
                        suppressScrollOnNewData={true}
                        suppressPropertyNamesCheck={true}
                    />
                </div>
            </GridContainer>
        </TableContainer>
    );
};

export default Table; 