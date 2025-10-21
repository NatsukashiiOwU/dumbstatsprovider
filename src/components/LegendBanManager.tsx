import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import useWebSocket from 'react-use-websocket';
import { styled } from '@linaria/react';
import { Legend } from './types';

interface LegendBanManagerProps {
    socketUrl: string;
}

const LegendBanManager: React.FC<LegendBanManagerProps> = ({ socketUrl }) => {
  const [allLegends, setAllLegends] = useState<Legend[]>([]);
  const [selectedBans, setSelectedBans] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
const pendingBansRef = useRef<string[]>([]);
const filterLegends = ["random","dummie","bangalore", "bloodhound", "caustic", "gibraltar", "lifeline", "mirage", "pathfinder", "wraith", "octane", "wattson", "crypto", "revenant", "loba"]

  // Get the references of legends that are NOT in filterLegends
  const otherLegendReferences = useMemo(() => {
    return allLegends
      .filter(legend => !filterLegends.includes(legend.reference.toLowerCase()))
      .map(legend => legend.reference);
  }, [allLegends]);


  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: () => true,
    reconnectInterval: 5000,
    onError: (event) => setError(`WebSocket Error: ${event.type}`),
  });

  const fetchBanStatus = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setStatusMessage('Fetching ban status...');
    sendMessage(JSON.stringify({
      type: "command",
      cmd: {
        withAck: true,
        customMatch_GetLegendBanStatus: {}
      }
    }));
  }, [sendMessage]);

  // Initial fetch on mount
  useEffect(() => {
    fetchBanStatus();
  }, [fetchBanStatus]);

  // Handle incoming messages
useEffect(() => {
  if (!lastMessage) return;

  try {
    const data = JSON.parse(lastMessage.data);

    if (data.body?.legends) {
      const bannedLegends = data.body.legends
        .filter((l: Legend) => l.banned)
        .map((l: Legend) => l.reference);

      setAllLegends(data.body.legends);
      setSelectedBans(bannedLegends);
      setIsLoading(false);
      setStatusMessage('Ban status loaded');
    } else if (data.body?.success && data.type === "cmd_res") {
      // Update allLegends based on pendingBansRef
      setAllLegends(prevLegends =>
        prevLegends.map(legend => ({
          ...legend,
          banned: pendingBansRef.current.includes(legend.reference)
        }))
      );

      // Clear pending bans
      pendingBansRef.current = [];

      setIsLoading(false);
      setStatusMessage('Bans updated successfully!');
    }
  } catch (e) {
    setError('Failed to parse WebSocket message');
    setIsLoading(false);
  }
}, [lastMessage]);

  // Apply bans to server
const applyBans = () => {
  if (selectedBans.length === 0) {
    setStatusMessage('No bans selected!');
    return;
  }

  setIsLoading(true);
  setStatusMessage('Applying bans...');

  // Store current selected bans for later use
  pendingBansRef.current = [...selectedBans];

  sendMessage(JSON.stringify({
    type: "command",
    cmd: {
      withAck: true,
      customMatch_SetLegendBan: {
        legendRefs: selectedBans.join(',')
      }
    }
  }));
};

  // Reset to current server state
  const resetSelection = () => {
    const bannedLegends = allLegends
      .filter(l => l.banned)
      .map(l => l.reference);
    setSelectedBans(bannedLegends);
  };

  const filteredLegends = useMemo(() => {
    if (!searchTerm) return allLegends;

    return allLegends.filter(legend =>
      legend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legend.reference.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allLegends, searchTerm]);

  const toggleLegendSelection = useCallback((reference: string) => {
    setSelectedBans(prev =>
      prev.includes(reference)
        ? prev.filter(r => r !== reference)
        : [...prev, reference]
    );
  }, []);

    return (
        <Container>
            <Header>
                <Title>Legend Ban Manager</Title>

                <Controls>
                    <SearchInput
                        type="text"
                        placeholder="Search legends..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <SelectionInfo>
                        <BanCount>{selectedBans.length} Bans Selected</BanCount>
                    </SelectionInfo>

                    <ButtonGroup>
                        <ApplyButton onClick={applyBans} disabled={isLoading || readyState !== 1}>
                            Apply Bans
                        </ApplyButton>

                        <ResetButton onClick={resetSelection} disabled={isLoading}>
                            Reset
                        </ResetButton>

                        <RefreshButton onClick={fetchBanStatus} disabled={isLoading}>
                            Refresh
                        </RefreshButton>
                        
                        <ResetButton onClick={()=> setSelectedBans(otherLegendReferences)} disabled={isLoading}>
                            Set all legends until 5 season
                        </ResetButton>
                    </ButtonGroup>
                </Controls>

                <StatusArea>
                    {isLoading ? (
                        <Loader>⏳ Loading...</Loader>
                    ) : error ? (
                        <Error>❌ {error}</Error>
                    ) : statusMessage ? (
                        <Status>✅ {statusMessage}</Status>
                    ) : null}
                </StatusArea>
            </Header>

            <BanListContainer>
                {filteredLegends.length > 0 ? (
                    filteredLegends.map((legend) => {
                        const isBanned = selectedBans.includes(legend.reference);
                        return (
                            <LegendRow
                                key={legend.reference}
                                className={isBanned ? 'banned' : ''}
                                onClick={() => toggleLegendSelection(legend.reference)}
                            >
                                <LegendInfo>
                                    <LegendName>{legend.name}</LegendName>
                                    <LegendRef>{legend.reference}</LegendRef>
                                </LegendInfo>
                                <BanIndicator>{isBanned ? 'BANNED' : 'Available'}</BanIndicator>
                            </LegendRow>
                        );
                    })
                ) : (
                    <NoResults>No legends match your search</NoResults>
                )}
            </BanListContainer>
        </Container>
    );
};

// Linaria styling
const Container = styled.div`
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background: #1e1e2e;
    color: #e0e0ff;
    border-radius: 10px;
    height: 80vh;
    display: flex;
    flex-direction: column;
`;

const Header = styled.div`
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #444466;
`;

const Title = styled.h2`
    margin: 0 0 15px 0;
    color: #8a7fff;
`;

const Controls = styled.div`
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 15px;
    align-items: center;
    margin-bottom: 15px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const SearchInput = styled.input`
    padding: 10px 15px;
    background: #2a2a3a;
    color: #e0e0ff;
    border: 1px solid #444466;
    border-radius: 5px;
    font-size: 16px;
    min-width: 200px;
`;

const SelectionInfo = styled.div`
    text-align: center;
    padding: 0 15px;
`;

const BanCount = styled.span`
    background: #3a1e2e;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 600;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const Button = styled.button`
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    white-space: nowrap;
`;

const ApplyButton = styled(Button)`
    background: #e74c3c;
    color: white;

    &:disabled {
        background: #7a3a33;
        cursor: not-allowed;
    }
`;

const ResetButton = styled(Button)`
    background: #3498db;
    color: white;
`;

const RefreshButton = styled(Button)`
    background: #2ecc71;
    color: white;
`;

const StatusArea = styled.div`
    min-height: 30px;
    padding: 8px 0;
    text-align: center;
`;

const StatusMessage = styled.div`
    padding: 5px 10px;
    border-radius: 5px;
    display: inline-block;
`;

const Loader = styled(StatusMessage)`
    background: #2c3e50;
    color: #3498db;
`;

const Error = styled(StatusMessage)`
    background: #2c1e1e;
    color: #e74c3c;
`;

const Status = styled(StatusMessage)`
    background: #1e2c1e;
    color: #2ecc71;
`;

const BanListContainer = styled.div`
    flex: 1;
    background: #2a2a3a;
    border-radius: 8px;
    overflow-y: auto;
    padding: 10px;
`;

const LegendRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    margin-bottom: 8px;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.2s;
    background: #3a3a4a;
    border: 1px solid #444466;

    &:hover {
        background: #4a4a5a;
    }

    &.banned {
        background: #3a1e1e;
        border-color: #e74c3c;
    }
`;

const LegendInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

const LegendName = styled.span`
    font-weight: 600;
    font-size: 16px;
`;

const LegendRef = styled.span`
    font-size: 12px;
    color: #8a7fff;
    opacity: 0.7;
`;

const BanIndicator = styled.span`
    font-size: 12px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
    background: #333344;

    .banned & {
        background: #e74c3c;
        color: white;
    }
`;

const NoResults = styled.div`
    text-align: center;
    padding: 40px;
    color: #888;
    font-style: italic;
`;

export default LegendBanManager;
