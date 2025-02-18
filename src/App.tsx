import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Table from './components/Table';
import Chat from './components/Chat';
import FileUpload from './components/FileUpload';
import { TableData, TableFilter, MessagePublic } from './types/interfaces';
import { readConversation } from './services/api';

const sampleData: TableData[] = [
  { name: 'Kelly Homes', country: 'Italy', language: 'French', games: 'Patolli' },
  { name: 'John Doe', country: 'Spain', language: 'Spanish', games: 'Chess' },
  { name: 'Jane Smith', country: 'France', language: 'French', games: 'Go' },
];

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #1a1a1a;
  padding: 16px;
  gap: 16px;
`;

const TablePanel = styled.div<{ isCollapsed: boolean }>`
  width: ${props => props.isCollapsed ? '48px' : '50%'};
  height: 100%;
  position: relative;
  background-color: #1a1a1a;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
`;

const CollapsedPanel = styled.div`
  width: 48px;
  height: 100%;
  display: flex;
  justify-content: center;
  padding-top: 16px;
  background-color: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a2a2a;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  color: #ffffff;
  &:hover {
    background: #3a3a3a;
  }
`;

const Header = styled.div`
  padding: 16px;
  background-color: #1a1a1a;
  border-bottom: 1px solid #2a2a2a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ffffff;
  font-size: 18px;
`;

const TableContent = styled.div<{ isCollapsed: boolean }>`
  flex: 1;
  opacity: ${props => props.isCollapsed ? 0 : 1};
  transition: opacity 0.2s ease;
  visibility: ${props => props.isCollapsed ? 'hidden' : 'visible'};
  background-color: #1a1a1a;
`;

const ChatPanel = styled.div`
  flex: 1;
  min-width: 300px;
  height: 100%;
  background-color: #1a1a1a;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
`;

const NavigationBar = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #1a1a1a;
  border-bottom: 1px solid #2a2a2a;
  color: #ffffff;
  gap: 8px;
`;

const NavLink = styled.span`
  color: #666;
  &:after {
    content: '/';
    margin: 0 8px;
  }
  &:last-child {
    color: #fff;
    &:after {
      content: '';
    }
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const App: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tableData, setTableData] = useState<TableData[]>(sampleData);
  const [filteredData, setFilteredData] = useState<TableData[]>(sampleData);
  const [messages, setMessages] = useState<MessagePublic[]>([]);
  const [selectedRowData, setSelectedRowData] = useState<TableData | undefined>();
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [chatContexts, setChatContexts] = useState<Map<string, MessagePublic[]>>(new Map());

  const getConversationId = (rowData: TableData): string => {
    return `row_${String(rowData.name).toLowerCase().replace(/\s+/g, '_')}`;
  };

  useEffect(() => {
    if (selectedRowData) {
      const conversationId = getConversationId(selectedRowData);
      setActiveConversationId(conversationId);
      
      const loadConversation = async () => {
        try {
          const conversation = await readConversation(conversationId);
          const newMessages = conversation.messages || [];
          setChatContexts(prev => new Map(prev).set(conversationId, newMessages));
          setMessages(newMessages);
        } catch (error) {
          console.error('Error loading conversation:', error);
        }
      };

      if (!chatContexts.has(conversationId)) {
        loadConversation();
      } else {
        const existingMessages = chatContexts.get(conversationId) || [];
        setMessages(existingMessages);
      }
    }
  }, [selectedRowData, chatContexts]);

  const handleFilterChange = (filters: TableFilter[]) => {
    console.log('Filters changed:', filters);
  };

  const handleDataChange = (data: TableData[]) => {
    setFilteredData(data);
  };

  const handleRowClick = (rowData: TableData) => {
    console.log('Row clicked in App:', rowData);
    setSelectedRowData(rowData);
  };

  const handleDataUpdate = (newData: TableData[]) => {
    setTableData(newData);
    setFilteredData(newData);
  };

  return (
    <AppContainer>
      {isCollapsed ? (
        <CollapsedPanel>
          <IconButton onClick={() => setIsCollapsed(false)} title="Show Table">
            →
          </IconButton>
        </CollapsedPanel>
      ) : (
        <TablePanel isCollapsed={isCollapsed}>
          <NavigationBar>
            <NavLink>Home</NavLink>
            <NavLink>{selectedRowData?.name || 'Select a row'}</NavLink>
          </NavigationBar>
          <Header>
            <HeaderContent>
              <span>Table Data</span>
              <FileUpload onDataUpdate={handleDataUpdate} />
            </HeaderContent>
            <IconButton onClick={() => setIsCollapsed(true)} title="Hide Table">
              ←
            </IconButton>
          </Header>
          <TableContent isCollapsed={isCollapsed}>
            <Table
              data={tableData}
              onFilterChange={handleFilterChange}
              onDataChange={handleDataChange}
              onRowClick={handleRowClick}
            />
          </TableContent>
        </TablePanel>
      )}
      <ChatPanel>
        <Chat
          conversationId={parseInt(activeConversationId.split('_')[1]) || 0}
          messages={messages}
          onNewMessage={(message: MessagePublic) => {
            if (activeConversationId) {
              setMessages(prevMessages => {
                const updatedMessages = [...prevMessages, message];
                setChatContexts(prev => new Map(prev).set(activeConversationId, updatedMessages));
                return updatedMessages;
              });
            }
          }}
          tableData={filteredData}
          selectedRowData={selectedRowData}
        />
      </ChatPanel>
    </AppContainer>
  );
};

export default App;
