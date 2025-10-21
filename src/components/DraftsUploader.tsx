import React, { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { styled } from '@linaria/react';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { StyledSelect } from '../App';

interface DraftsUploaderProps {
  socketUrl: string;
  organizer: string;
}


const getDropNumber = (dropName: string) => {
  const map = {
    "Crash Site": 1,
    "Repulsor": 2, // 2
    "Basin": 3,
    "Swamps": 4,
    "Market": 5,
    "Map Room": 6,
    "Runoff": 7,
    "Capacitor": 8,
    "Labs": 9,
    "Artillery": 10,
    "Spotted Lake": 11,
    "Bunker": 12,
    "The Cage": 13,
    "Airbase": 14, // 17
    "The Pit": 15,
    "Gauntlet": 16,
    "Caustic Treatment": 17,
    "The Rig": 18,
    "Hillside": 19,
    "Hydro": 20,
    "Relic": 21,
    "Containment": 22, // missing
    "Two Spines": 23, // not exist
    "River": 24, // not exist
    "Verdant": 25, // not exist
    "High Desert": 26, // not exist
    "N. 82": 27, // not exist
  }
  return map[dropName];
}

const DraftsUploader: React.FC<DraftsUploaderProps> = ({ socketUrl, organizer }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const queryClient = new QueryClient();
  const [matchId, setMatchId] = useState('');
  console.log("🚀 ~ DraftsUploader ~ matchId:", matchId)
  const [selectedGame, setSelectedGame] = useState<number>();
  const [fetchedMaps, setFetchedMaps] = useState();
  const [teams, setTeams] = useState();
  const [selectedMap, setSelectedMap] = useState<{ game: number; map: string; }>({});

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: () => true,
    reconnectInterval: 5000,
    onError: (event) => setError(`WebSocket Error: ${event.type}`),
  });

  const matchList = useQuery(
    {
      queryKey: ['list', organizer],
      queryFn: () => fetch(`https://overstat.gg/api/settings/match_list/${organizer}`).then((res) => res.json()),
    },
    queryClient
  );

  const matchQuery = useQuery(
    {
      queryKey: ['map-list', matchId],
      queryFn: () => fetch(`https://overstat.gg/api/settings/match/${matchId}`).then((res) => res.json()),
      enabled: !!matchId,
    },
    queryClient
  );

  const teamsQuery = useQuery(
    {
      queryKey: ['teams-list', matchId],
      queryFn: () => fetch(`https://overstat.gg/api/settings/match/${matchId}/teams`).then((res) => res.json()),
      enabled: !!matchId,
    },
    queryClient
  );

  const draftsQuery = useQuery(
    {
      queryKey: ['drafts-list', matchId, selectedMap.game],
      queryFn: () => fetch(`https://overstat.gg/api/drops/${matchId}/${selectedMap.map}/${selectedMap.game}`).then((res) => res.json()),
      staleTime: 0,
    },
    queryClient
  );

  // Apply bans to server
const applyDrafts = () => {
  setIsLoading(true);
  setStatusMessage('Applying drafts...');
  
  const orderedTeams = teamsQuery.data; // [{name: "A", teamId: 2}, ...]
  const draftData = draftsQuery.data;   // {a: [{drop: "River"}], b: [{drop: "Labs"}], ...}
  
  console.log({orderedTeams});
  console.log("🚀 ~ applyDrafts ~ draftData:", draftData);

  // Create the final teams array with drops
  const teamsWithDrops = orderedTeams.map(team => {
    const lowercaseName = team.name.toLowerCase();
    const dropData = draftData[team.name];
    console.log("🚀 ~ applyDrafts ~ dropData:", dropData)
    const drop = dropData ? dropData[0].drop : 'Unknown';
    
    return {
      ...team,
      drop
    };
  });

  console.log("🚀 ~ teamsWithDrops:", teamsWithDrops);
  setTeams(teamsWithDrops);

  if(!teamsWithDrops) return;

  // Send commands for each team
  teamsWithDrops.forEach((team, index) => {
    if (team.drop !== 'Unknown') {
      setTimeout(()=> {
      sendMessage(JSON.stringify({
        type: "command",
        cmd: {
          withAck: true,
          customMatch_SetSpawnPoint: { 
            "teamId": team.teamId, 
            "spawnPoint": getDropNumber(team.drop)
          }
        }
      }));
    },1000)
      console.log(`Setting team ${team.name} (ID: ${team.teamId}) to drop: ${team.drop} dropId ${getDropNumber(team.drop)}`);
    }
  });
};

  useEffect(() => {
    if (!matchQuery.isSuccess) return;
    setFetchedMaps(matchQuery?.data?.drops?.maps);
  }, [matchQuery])

  useEffect(() => {
    if (!matchQuery.isSuccess) return;
    setSelectedMap(matchQuery?.data?.drops?.maps.find((i) => i.game == selectedGame));
  }, [selectedGame])

  useEffect(() => {
    if (!matchId) return;
    matchQuery.refetch();
  }, [matchId])

  useEffect(() => {
    if (!selectedGame) return;
    draftsQuery.refetch();
  }, [selectedGame])

  return (
    <Container>
      <Header>
        <Title>Drafts uploader</Title>
        {matchList.isSuccess && (
          <>
            <StyledSelect value={matchId} onChange={(e) => setMatchId(e.target.value)}>
              {matchList.data.map(
                (match: { id: number; eventId: string; archived: boolean }) => (
                  <option key={match.id} value={match.id}>
                    {match.eventId}
                  </option>
                )
              )}
            </StyledSelect>
          </>
        )}

        {matchQuery.isSuccess && (
          <>
            <StyledSelect value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)}>
              {fetchedMaps?.map(
                (i: { game: number; map: string; }) => (
                  <option key={i.game} value={i.game}>
                    {i.map}
                  </option>
                )
              )}
            </StyledSelect>
          </>
        )}

        <Controls>

          <ButtonGroup>
            <ApplyButton onClick={() => applyDrafts()}>
              Apply Drafts
            </ApplyButton>

            <ResetButton disabled={isLoading}>
              Reset
            </ResetButton>

            <RefreshButton onClick={() => draftsQuery.refetch()} disabled={isLoading}>
              Refresh
            </RefreshButton>
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
      {teams?.map((t) => <>{t.name}: {t.drop}@{getDropNumber(t.drop)} <br /></>)}
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

export default DraftsUploader;
