import { styled } from '@linaria/react';
import { StyledInput, StyledSpan } from './App';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LegendBanManager from './components/LegendBanManager';

const StyledContainer = styled.div`
    background-color: #210f0f;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    width: 100%;
    height: 100%;

    .debug-container {
        padding: 20px;
        font-family: monospace;
        background: #1e1e1e;
        color: #d4d4d4;
        height: 90%;
    }

    .connection-controls {
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #444;
    }

    .url-input {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
    }

    .url-input label {
        margin-right: 10px;
        white-space: nowrap;
    }

    .url-input input {
        flex: 1;
        padding: 8px 12px;
        background: #2d2d2d;
        color: #e6e6e6;
        border: 1px solid #555;
        border-radius: 4px;
    }

    .status-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .controls button {
        margin-left: 10px;
        padding: 6px 12px;
        background: #3a3a3a;
        color: #fff;
        border: 1px solid #555;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.3s;
    }

    .controls button:hover {
        background: #4a4a4a;
    }

    .message-viewer {
        background: #252526;
        border-radius: 8px;
        padding: 15px;
        max-height: 55%;
        overflow-y: auto;
    }

    .message-card {
        background: #2d2d2d;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 15px;
        border-left: 3px solid #4ec9b0;
    }

    .message-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #3c3c3c;
    }

    .timestamp {
        color: #9cdcfe;
    }

    .message-type {
        color: #ce9178;
        text-transform: uppercase;
        font-weight: bold;
    }

    .empty-state {
        text-align: center;
        padding: 40px;
        color: #888;
    }
`;

const StyledItemsStyler = styled.div`
    filter: invert();
`;

const StyledRow = styled.div`
    display: flex;
    justify-content: center;
    align-items: start;
    gap: 1em;
`;

export const convertGameUrlToSiteUrl = (gameUrl: string): string => {
    try {
        const url = new URL(gameUrl);

        // Check if it's a game URL (write endpoint)
        if (url.pathname.startsWith('/live/write/')) {
            const pathParts = url.pathname.split('/');
            const [, , , sessionId, userId] = pathParts;

            // Convert to site URL (read endpoint)
            return `wss://${url.host}/api/live/read/13yog/${userId}/${sessionId}`;
        }

        // If it's already a site URL or invalid, return as-is
        return gameUrl;
    } catch (e) {
        // If URL parsing fails, return original
        return gameUrl;
    }
};

// Local storage key for WebSocket URL
export const WS_URL_KEY = 'websocket_url';

interface LiveDebuggerProps {
    defaultUrl?: string;
    socketUrl: string;
}

const LiveDebugger: React.FC<LiveDebuggerProps> = ({ defaultUrl = '', socketUrl }) => {
    const [messageHistory, setMessageHistory] = useState<any[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [customMessage, setCustomMessage] = useState('{"event":"ping","data":{}}');
    const [messageFormat, setMessageFormat] = useState<'json' | 'text'>('json');
    const [lastSentMessage, setLastSentMessage] = useState<string | null>(null);
    const historyEndRef = useRef<HTMLDivElement>(null);

    // Save URL to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(WS_URL_KEY, socketUrl);
    }, [socketUrl]);

    // WebSocket connection
    const { sendMessage, readyState } = useWebSocket(socketUrl, {
        shouldReconnect: () => true,
        reconnectInterval: 3000,
        reconnectAttempts: 5,
        onOpen: () => setConnectionStatus('Connected ✅'),
        onClose: () => setConnectionStatus('Disconnected ❌'),
        onError: () => setConnectionStatus('Error ⚠️'),
        onMessage: (event: WebSocketEventMap['message']) => {
            if (isPaused) return;

            try {
                const data = messageFormat === 'json' ? JSON.parse(event.data) : event.data;
                const newEntry = {
                    timestamp: new Date().toLocaleTimeString(),
                    direction: 'IN',
                    data,
                };

                setMessageHistory((prev) => [newEntry, ...prev.slice(0, 99)]);
            } catch (e) {
                setMessageHistory((prev) => [
                    {
                        timestamp: new Date().toLocaleTimeString(),
                        direction: 'IN',
                        data: `[RAW] ${event.data}`,
                        error: 'Invalid JSON',
                    },
                    ...prev.slice(0, 99),
                ]);
            }
        },
    });

    // Auto-scroll to bottom
    useEffect(() => {
        historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messageHistory]);

    // Send custom message
    const handleSendMessage = useCallback(() => {
        try {
            const messageToSend = messageFormat === 'json' ? JSON.stringify(JSON.parse(customMessage)) : customMessage;

            sendMessage(messageToSend);
            setLastSentMessage(messageToSend);

            setMessageHistory((prev) => [
                {
                    timestamp: new Date().toLocaleTimeString(),
                    direction: 'OUT',
                    data: messageFormat === 'json' ? JSON.parse(customMessage) : customMessage,
                },
                ...prev.slice(0, 99),
            ]);
        } catch (e) {
            alert(`Invalid JSON: ${(e as Error).message}`);
        }
    }, [customMessage, sendMessage, messageFormat]);

    // Connection status indicator
    const connectionStatusColor = {
        'Connected ✅': 'green',
        'Disconnected ❌': 'red',
        'Error ⚠️': 'orange',
        'Connecting...': 'yellow',
    }[connectionStatus];

    return (
        <div className="debug-container">
            <div className="connection-controls">
                <h2>WebSocket Debugger</h2>

                <div className="status-bar">
                    <span style={{ color: connectionStatusColor }}>
                        Status: {connectionStatus} (
                        {readyState === 0
                            ? 'CONNECTING'
                            : readyState === 1
                            ? 'OPEN'
                            : readyState === 2
                            ? 'CLOSING'
                            : 'CLOSED'}
                        )
                    </span>
                    <div className="controls">
                        <button onClick={() => setIsPaused(!isPaused)}>{isPaused ? 'Resume ▶️' : 'Pause ⏸️'}</button>
                        <button onClick={() => setMessageHistory([])}>Clear 🧹</button>
                    </div>
                </div>
            </div>

            <div className="message-sender">
                <div className="sender-header">
                    <h3>Send Custom Message</h3>
                    <div className="format-selector">
                        <label>
                            <input
                                type="radio"
                                checked={messageFormat === 'json'}
                                onChange={() => setMessageFormat('json')}
                            />
                            JSON
                        </label>
                        <label>
                            <input
                                type="radio"
                                checked={messageFormat === 'text'}
                                onChange={() => setMessageFormat('text')}
                            />
                            Text
                        </label>
                    </div>
                </div>

                <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder={
                        messageFormat === 'json'
                            ? '{"event":"test","data":{"key":"value"}}'
                            : 'Enter raw message content'
                    }
                    rows={6}
                />

                <div className="sender-controls">
                    <button onClick={handleSendMessage}>Send Message 📤</button>
                </div>
            </div>

            <div className="message-viewer">
                <h3>Message History (Newest First)</h3>
                <div className="message-list">
                    {messageHistory.length === 0 ? (
                        <div className="empty-state">No messages exchanged yet...</div>
                    ) : (
                        messageHistory.map((msg, index) => (
                            <div key={index} className={`message-card ${msg.direction.toLowerCase()}`}>
                                <div className="message-header">
                                    <span className="timestamp">{msg.timestamp}</span>
                                    <span className="direction">{msg.direction}</span>
                                    {msg.error && <span className="error-badge">ERROR</span>}
                                </div>

                                <pre
                                    style={{
                                        background: '#2d2d2d',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        overflowX: 'auto',
                                    }}
                                >
                                    {JSON.stringify(msg.data, null, 2)}
                                </pre>

                                {msg.error && <div className="error-message">{msg.error}</div>}
                            </div>
                        ))
                    )}
                    <div ref={historyEndRef} />
                </div>
            </div>
        </div>
    );
};

const Host = () => {
    const [activeTab, setActiveTab] = useState<'messages' | 'bans'>('bans');

    // Initialize with converted URL if localStorage has a game URL
    const [socketUrl, setSocketUrl] = useState(() => {
        const savedUrl = localStorage.getItem(WS_URL_KEY);
        return savedUrl ? convertGameUrlToSiteUrl(savedUrl) : '';
    });

    const [inputUrl, setInputUrl] = useState(() => {
        const savedUrl = localStorage.getItem(WS_URL_KEY);
        return savedUrl || '';
    });

    // Save URL to localStorage whenever it changes
    useEffect(() => {
        if (inputUrl) {
            localStorage.setItem(WS_URL_KEY, inputUrl);
            setSocketUrl(convertGameUrlToSiteUrl(inputUrl));
        }
    }, [inputUrl]);

    return (
        <>
            <StyledContainer>
                <StyledRow className="tab-navigation">
                    <button className={activeTab === 'bans' ? 'active' : ''} onClick={() => setActiveTab('bans')}>
                        Legend Ban Manager
                    </button>
                    <button
                        className={activeTab === 'messages' ? 'active' : ''}
                        onClick={() => setActiveTab('messages')}
                    >
                        Message Debugger
                    </button>
                </StyledRow>

                <StyledRow>
                    <div className="url-input">
                        <StyledItemsStyler>
                            <label>Connection URL:</label>
                            <input
                                type="text"
                                value={inputUrl}
                                onChange={(e) => setInputUrl(e.target.value)}
                                placeholder="ws://overstat.gg/live/write/..."
                            />
                        </StyledItemsStyler>
                        <button
                            onClick={() => {
                                localStorage.removeItem(WS_URL_KEY);
                                setInputUrl('');
                                setSocketUrl('');
                            }}
                            title="Reset to default URL"
                        >
                            Reset
                        </button>
                    </div>
                </StyledRow>

                {/* <StyledItemsStyler>
                    <StyledRow>
                        <div className="url-info">
                            Using WebSocket URL: {socketUrl}
                        </div>
                    </StyledRow>
                </StyledItemsStyler> */}

                {activeTab === 'messages' ? (
                    <LiveDebugger socketUrl={socketUrl} />
                ) : (
                    <LegendBanManager socketUrl={socketUrl} />
                )}
            </StyledContainer>
        </>
    );
};

export default Host;
