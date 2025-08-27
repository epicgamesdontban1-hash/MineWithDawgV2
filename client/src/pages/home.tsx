import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { useWebSocket } from '../lib/websocket';
import { useToast } from '../hooks/use-toast';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ServerProfileManager } from '../components/profiles/ServerProfileManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Server, MessageSquare, Settings, Users, Package, Shield, HelpCircle, LogOut, Eye, EyeOff, ChevronDown, ChevronUp, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Move3D, Activity, Gamepad2, Zap, Clock, Play, Pause, Trash2, Download, Info, AlertTriangle, CheckCircle2, Circle, Timer, Send, ExternalLink, BookOpen, Lock } from 'lucide-react';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  messageType: string;
  timestamp: Date;
  isCommand: boolean;
}

interface BotLog {
  id: string;
  connectionId: string;
  logLevel: string;
  message: string;
  timestamp: Date;
}

interface ConnectionStatus {
  isConnected: boolean;
  ping: number;
  username: string;
  position: {
    x: string;
    y: string;
    z: string;
  };
  serverInfo: {
    players: string;
    version: string;
    motd: string;
  };
}

interface OnlinePlayer {
  uuid: string;
  username: string;
  ping?: number;
}

interface AdminConnection {
  id: string;
  username: string;
  serverIp: string;
  version: string;
  isConnected: boolean;
  isActive: boolean;
  lastPing?: number;
  createdAt: string;
}

const MINECRAFT_VERSIONS = [
  '1.21.4', '1.21.3', '1.21.2', '1.21.1', '1.21.0',
  '1.20.6', '1.20.4', '1.20.2', '1.20.1',
  '1.19.4', '1.19.2', '1.18.2'
];

const QUICK_COMMANDS = ['/help', '/list', '/spawn', '/home'];

export default function Home() {
  const [username, setUsername] = useState("Player123");
  const [authMode, setAuthMode] = useState("login"); // Default to login view
  const [serverIP, setServerIP] = useState("");
  const [version, setVersion] = useState("1.21.4");
  const [chatInput, setChatInput] = useState("");
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [botLogs, setBotLogs] = useState<BotLog[]>([]);
  const [adminConnections, setAdminConnections] = useState<AdminConnection[]>([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'logs' | 'admin' | 'players' | 'inventory'>('chat');
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [kickReason, setKickReason] = useState<string | null>(null);
  const [autoReconnect, setAutoReconnect] = useState(false);
  const [lastConnectionData, setLastConnectionData] = useState<{
    username: string;
    serverIp: string;
    version: string;
    authMode: string;
  } | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [messageOnLoad, setMessageOnLoad] = useState("");
  const [messageOnLoadDelay, setMessageOnLoadDelay] = useState(2000);
  const [spammerEnabled, setSpammerEnabled] = useState(false);
  const [spammerMessage, setSpammerMessage] = useState("");
  const [spammerDelay, setSpammerDelay] = useState(1000);
  const [antiKickEnabled, setAntiKickEnabled] = useState(false);
  const [botInventory, setBotInventory] = useState<any[]>([]);
  const [alwaysOnlineEnabled, setAlwaysOnlineEnabled] = useState(false);
  const [showAlwaysOnlineModal, setShowAlwaysOnlineModal] = useState(false);
  const [alwaysOnlinePassword, setAlwaysOnlinePassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [showHelpChat, setShowHelpChat] = useState(false);
  const [helpSessionId, setHelpSessionId] = useState<string | null>(null);
  const [helpMessages, setHelpMessages] = useState<any[]>([]);
  const [helpInput, setHelpInput] = useState("");
  const [microsoftAuth, setMicrosoftAuth] = useState<{
    isActive: boolean;
    verificationUri?: string;
    userCode?: string;
    message?: string;
  }>({ isActive: false });
  const autoReconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spammerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const helpMessagesRef = useRef<HTMLDivElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    ping: 0,
    username: "",
    position: {
      x: "--",
      y: "--",
      z: "--"
    },
    serverInfo: {
      players: "0/0",
      version: "--",
      motd: "Offline"
    }
  });

  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const logsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [botAuthMode, setBotAuthMode] = useState('offline'); // New state for bot auth mode
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [activeLearnSection, setActiveLearnSection] = useState('overview');

  const { isConnected: wsConnected, sendMessage, ws } = useWebSocket({
    onMessage: (message) => {
      const { type, data } = message;

      switch (type) {
        case 'auth_status':
          if (data.status === 'starting_auth') {
            setMicrosoftAuth(prev => ({
              ...prev,
              isActive: true,
              message: data.message
            }));
          }
          break;

        case 'microsoft_auth_code':
          setMicrosoftAuth(prev => ({
            ...prev,
            isActive: true,
            verificationUri: data.verificationUri,
            userCode: data.userCode,
            message: data.message
          }));
          toast({
            title: "Microsoft Authentication Required",
            description: "Please complete authentication in the popup window",
          });
          break;

        case 'microsoft_auth_verified':
          setMicrosoftAuth(prev => ({
            ...prev,
            message: data.message,
            verificationUri: undefined,
            userCode: undefined
          }));

          toast({
            title: "Authentication Successful!",
            description: data.message,
          });

          // Close the modal after a short delay
          setTimeout(() => {
            setMicrosoftAuth({ isActive: false });
          }, 2000);
          break;

        case 'bot_connected':
          // setIsConnecting(false); // This is handled by useWebSocket hook
          setMicrosoftAuth({ isActive: false }); // Ensure modal is closed
          setConnectionStatus(prev => ({
            ...prev,
            isConnected: true,
            username: data.username,
            serverInfo: {
              ...prev.serverInfo,
              motd: "Connected",
              version: data.version || prev.serverInfo.version,
              players: data.players || prev.serverInfo.players
            }
          }));
          setKickReason(null);

          // Send message on load if configured
          if (messageOnLoad.trim()) {
            setTimeout(() => {
              if (sendMessage && connectionStatus.isConnected) {
                const messageToSend = messageOnLoad.trim();
                const isCommand = messageToSend.startsWith('/');
                const messageType = isCommand ? 'send_command' : 'send_chat';
                sendMessage({
                  type: messageType,
                  data: {
                    connectionId: data.connectionId,
                    [isCommand ? 'command' : 'message']: messageToSend
                  }
                });
              }
            }, messageOnLoadDelay);
          }

          toast({
            title: "Bot Connected",
            description: `Successfully connected as ${data.username}`,
          });
          break;

        case 'bot_disconnected':
          setConnectionStatus(prev => ({
            ...prev,
            isConnected: false,
            serverInfo: { ...prev.serverInfo, motd: "Disconnected" }
          }));
          setOnlinePlayers([]);

          // Close Microsoft auth modal if it's open
          setMicrosoftAuth({ isActive: false });

          // Set kick reason if provided
          if (data.reason) {
            setKickReason(data.reason);
          }

          const disconnectMessage = data.reason
            ? `Bot disconnected: ${data.reason}`
            : autoReconnect ? "Auto-reconnecting in 5 seconds..." : "Disconnected";

          if (autoReconnect && lastConnectionData) {
            toast({
              title: "Bot Disconnected",
              description: data.reason ? `${data.reason} - Auto-reconnecting in 5 seconds...` : "Auto-reconnecting in 5 seconds...",
            });

            // Clear any existing timeout
            if (autoReconnectTimeoutRef.current) {
              clearTimeout(autoReconnectTimeoutRef.current);
            }

            autoReconnectTimeoutRef.current = setTimeout(() => {
              if (lastConnectionData && wsConnected && sendMessage && autoReconnect) {
                console.log('Auto-reconnecting bot...');
                handleReconnect();
              }
            }, 5000);
          } else {
            toast({
              title: "Bot Disconnected",
              description: disconnectMessage,
              variant: data.reason ? "destructive" : "default",
            });
          }
          break;

        case 'chat_message':
          setChatMessages(prev => [...prev, data]);
          break;

        case 'ping_update':
          setConnectionStatus(prev => ({ ...prev, ping: data.ping }));
          break;

        case 'position_update':
          setConnectionStatus(prev => ({
            ...prev,
            position: {
              x: data.x,
              y: data.y,
              z: data.z
            }
          }));
          break;

        case 'server_info_update':
          setConnectionStatus(prev => ({
            ...prev,
            serverInfo: {
              players: data.players || prev.serverInfo.players,
              version: data.version || prev.serverInfo.version,
              motd: data.motd || prev.serverInfo.motd
            }
          }));
          break;

        case 'players_update':
          setOnlinePlayers(data.players || []);
          setConnectionStatus(prev => ({
            ...prev,
            serverInfo: {
              ...prev.serverInfo,
              players: `${data.players?.length || 0}/${data.maxPlayers || 20}`
            }
          }));
          break;

        case 'inventory_update':
          setBotInventory(data.inventory || []);
          break;

        case 'help_session_started':
          setHelpSessionId(data.sessionId);
          setHelpMessages([{
            id: '1',
            message: data.initialMessage,
            author: 'System',
            timestamp: new Date().toISOString(),
            isAgent: true
          }]);
          toast({
            title: "Help Session Started",
            description: "You are now connected to our support team",
          });
          break;

        case 'help_message':
          setHelpMessages(prev => [...prev, {
            id: Date.now().toString(),
            message: data.message,
            author: data.author,
            timestamp: data.timestamp,
            isAgent: data.isAgent
          }]);
          break;

        case 'help_session_ended':
          setHelpSessionId(null);
          setShowHelpChat(false);
          setHelpMessages([]);
          toast({
            title: "Help Session Ended",
            description: "Thank you for using our support system",
          });
          break;

        case 'help_error':
          toast({
            title: "Help System Error",
            description: data.error || "Something went wrong with the help system",
            variant: "destructive",
          });
          break;

        case 'help_session_exists':
          setHelpSessionId(data.sessionId);
          toast({
            title: "Help Session Active",
            description: "You already have an active help session",
          });
          break;

        // Removed redundant Microsoft auth cases as they are handled in the initial connection setup and the `message` payload
        // case 'auth_status':
        //   if (data.status === 'starting_auth') {
        //     setMicrosoftAuth(prev => ({
        //       ...prev,
        //       isActive: true,
        //       message: data.message
        //     }));
        //   }
        //   break;

        // case 'microsoft_auth_code':
        //   setMicrosoftAuth(prev => ({
        //     ...prev,
        //     isActive: true,
        //     verificationUri: data.verificationUri,
        //     userCode: data.userCode,
        //     message: data.message
        //   }));
        //   toast({
        //     title: "Microsoft Authentication Required",
        //     description: "Please complete authentication in the popup window",
        //   });
        //   break;

        // case 'microsoft_auth_verified':
        //   setMicrosoftAuth(prev => ({
        //     ...prev,
        //     message: data.message,
        //     verificationUri: undefined,
        //     userCode: undefined
        //   }));

        //   toast({
        //     title: "Authentication Successful!",
        //     description: data.message,
        //   });

        //   // Close the modal after a short delay
        //   setTimeout(() => {
        //     setMicrosoftAuth({ isActive: false });
        //   }, 2000);
        //   break;

        case 'connection_error':
          // setIsConnecting(false); // This is handled by useWebSocket hook
          setMicrosoftAuth({ isActive: false }); // Close auth modal on error
          toast({
            title: "Connection Error",
            description: message.message || "Failed to connect to server",
            variant: "destructive",
          });
          break;

        case 'bot_error': // Added specific handling for bot_error
          toast({
            title: "Bot Error",
            description: message.message || "An error occurred with the bot",
            variant: "destructive",
          });
          break;
      }
    }
  });

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [botLogs]);

  useEffect(() => {
    if (helpMessagesRef.current) {
      helpMessagesRef.current.scrollTop = helpMessagesRef.current.scrollHeight;
    }
  }, [helpMessages]);

  // Fetch logs when connected
  useEffect(() => {
    if (connectionId) {
      const fetchLogs = async () => {
        try {
          const response = await fetch(`/api/connections/${connectionId}/logs`);
          if (response.ok) {
            const logs = await response.json();
            setBotLogs(logs);
          }
        } catch (error) {
          console.error('Failed to fetch logs:', error);
        }
      };

      fetchLogs();
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [connectionId]);

  // Fetch admin connections on mount and when activeTab is 'admin'
  useEffect(() => {
    if (activeTab === 'admin') {
      const fetchAdminConnections = async () => {
        setIsLoadingAdmin(true);
        try {
          const response = await fetch('/api/admin/connections');
          if (response.ok) {
            const connections = await response.json();
            setAdminConnections(connections);
          }
        } catch (error) {
          console.error('Failed to fetch admin connections:', error);
          toast({
            title: "Error",
            description: "Failed to load bot connections.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingAdmin(false);
        }
      };
      fetchAdminConnections();
    }
  }, [activeTab]);

  useEffect(() => {
    // Check for saved authentication
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (wsConnected && connectionStatus.isConnected && kickReason) {
      // Auto-reconnect after kick if enabled
      if (autoReconnect && lastConnectionData) {
        const timeout = setTimeout(() => {
          handleReconnect();
          setKickReason(null);
        }, 5000);
        autoReconnectTimeoutRef.current = timeout;
      }
    }
  }, [kickReason, autoReconnect, wsConnected, connectionStatus.isConnected, lastConnectionData]);

  const handleLogin = (userId: string, username: string) => {
    const user = { id: userId, username };
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');

    // Disconnect bot if connected
    if (connectionStatus.isConnected && connectionId) {
      sendMessage({
        type: 'disconnect_bot',
        data: { connectionId }
      });
    }
  };

  const handleLoadProfile = (profile: any) => {
    setUsername(profile.username);
    setServerIP(profile.serverIp);
    setVersion(profile.version);
    setBotAuthMode(profile.authMode || 'offline');
    setMessageOnLoad(profile.messageOnLoad || '');
    setMessageOnLoadDelay(profile.messageOnLoadDelay || 2000);
  };


  const handleConnect = async () => {
    if (!username.trim() || !serverIP.trim()) {
      toast({
        title: "Invalid Input",
        description: authMode === 'microsoft'
          ? "Please enter both email and server IP"
          : "Please enter both username and server IP",
        variant: "destructive",
      });
      return;
    }

    if (botAuthMode === 'microsoft' && !username.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid Microsoft email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          serverIp: serverIP.trim(),
          version,
          authMode: botAuthMode // Use botAuthMode here
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create connection');
      }

      const connection = await response.json();
      setConnectionId(connection.id);

      // Store connection data for auto-reconnect
      setLastConnectionData({
        username: username.trim(),
        serverIp: serverIP.trim(),
        version,
        authMode: botAuthMode // Use botAuthMode here
      });

      // Directly send the connect_bot message through the WebSocket
      if (wsConnected && sendMessage) {
        sendMessage({
          type: 'connect_bot',
          data: {
            connectionId: connection.id,
            username,
            serverIp: serverIP,
            version,
            authMode: botAuthMode, // Use botAuthMode here
            messageOnLoad: messageOnLoad.trim(),
            messageOnLoadDelay
          }
        });
      }
    } catch (error) {
      console.error('Connection attempt failed:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    if (connectionId && sendMessage) {
      sendMessage({
        type: 'disconnect_bot',
        data: { connectionId }
      });
      setConnectionId(null);
      setChatMessages([]);
      setBotLogs([]);
      setAutoReconnect(false);
      setLastConnectionData(null);

      // Clear auto-reconnect timeout
      if (autoReconnectTimeoutRef.current) {
        clearTimeout(autoReconnectTimeoutRef.current);
        autoReconnectTimeoutRef.current = null;
      }

      // Stop spammer
      setSpammerEnabled(false);
      if (spammerIntervalRef.current) {
        clearInterval(spammerIntervalRef.current);
        spammerIntervalRef.current = null;
      }
    }
  };

  const handleReconnect = async () => {
    if (!lastConnectionData) return;

    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: lastConnectionData.username,
          serverIp: lastConnectionData.serverIp,
          version: lastConnectionData.version,
          authMode: lastConnectionData.authMode
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create connection');
      }

      const connection = await response.json();
      setConnectionId(connection.id);

      if (wsConnected && sendMessage) {
        sendMessage({
          type: 'connect_bot',
          data: {
            connectionId: connection.id,
            username: lastConnectionData.username,
            serverIp: lastConnectionData.serverIp,
            version: lastConnectionData.version,
            authMode: lastConnectionData.authMode
          }
        });
      }
    } catch (error) {
      toast({
        title: "Auto-Reconnect Failed",
        description: error instanceof Error ? error.message : "Failed to reconnect",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !connectionId || !sendMessage) return;

    const isCommand = chatInput.startsWith('/');
    const messageType = isCommand ? 'send_command' : 'send_chat';
    const content = isCommand ? chatInput : chatInput;

    sendMessage({
      type: messageType,
      data: {
        connectionId,
        [isCommand ? 'command' : 'message']: content
      }
    });

    setChatInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMovement = (direction: string, action: 'start' | 'stop') => {
    if (connectionId && sendMessage) {
      sendMessage({
        type: 'move_bot',
        data: { connectionId, direction, action }
      });
    }
  };

  const handleQuickCommand = (command: string) => {
    if (connectionId && sendMessage) {
      sendMessage({
        type: 'send_command',
        data: { connectionId, command }
      });
    }
  };

  const handleShowInventory = () => {
    if (connectionId && sendMessage) {
      sendMessage({
        type: 'get_inventory',
        data: { connectionId }
      });
    }
  };

  const handleDropItem = (slot: number) => {
    if (connectionId && sendMessage) {
      sendMessage({
        type: 'drop_item',
        data: { connectionId, slot }
      });

      // Refresh inventory after dropping
      setTimeout(() => {
        handleShowInventory();
      }, 500);
    }
  };

  const toggleSpammer = () => {
    if (!spammerEnabled) {
      if (!spammerMessage.trim()) {
        toast({
          title: "Spammer Error",
          description: "Please enter a message to spam",
          variant: "destructive",
        });
        return;
      }

      setSpammerEnabled(true);
      spammerIntervalRef.current = setInterval(() => {
        if (connectionId && sendMessage && spammerMessage.trim()) {
          let messageToSend = spammerMessage.trim();

          // Add random numbers and symbols for anti-kick if enabled
          if (antiKickEnabled) {
            const randomNum = Math.floor(Math.random() * 1000000);
            const symbols = ['!', '@', '#', '$', '%', '^', '&', '*', '~', '?', '+', '-', '=', '|', '\\', '/', ':', ';', '.', ',', '<', '>', '[', ']', '{', '}', '(', ')'];
            const randomSymbol1 = symbols[Math.floor(Math.random() * symbols.length)];
            const randomSymbol2 = symbols[Math.floor(Math.random() * symbols.length)];
            messageToSend = `${messageToSend} ${randomSymbol1}${randomNum}${randomSymbol2}`;
          }

          const isCommand = messageToSend.startsWith('/');
          const messageType = isCommand ? 'send_command' : 'send_chat';
          sendMessage({
            type: messageType,
            data: {
              connectionId,
              [isCommand ? 'command' : 'message']: messageToSend
            }
          });
        }
      }, spammerDelay);
    } else {
      setSpammerEnabled(false);
      if (spammerIntervalRef.current) {
        clearInterval(spammerIntervalRef.current);
        spammerIntervalRef.current = null;
      }
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === "Operator") {
      setIsAdminAuthenticated(true);
      setShowAdminLogin(false);
      setAdminPassword("");
      toast({
        title: "Access Granted",
        description: "Welcome to Admin Panel",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password",
        variant: "destructive",
      });
      setAdminPassword("");
    }
  };

  const handleAlwaysOnlineToggle = () => {
    if (!alwaysOnlineEnabled) {
      setShowAlwaysOnlineModal(true);
    } else {
      setAlwaysOnlineEnabled(false);
      if (connectionId && sendMessage) {
        sendMessage({
          type: 'disable_always_online',
          data: { connectionId }
        });
      }
      toast({
        title: "Always Online Disabled",
        description: "Bot will disconnect when website is closed",
      });
    }
  };

  const handleAlwaysOnlineAuth = async () => {
    if (alwaysOnlinePassword === "doggomc") {
      setIsAuthenticating(true);

      // Show checkmark animation
      setTimeout(() => {
        setShowCheckmark(true);
        setIsAuthenticating(false);

        setTimeout(() => {
          setAlwaysOnlineEnabled(true);
          setShowAlwaysOnlineModal(false);
          setAlwaysOnlinePassword("");
          setShowCheckmark(false);

          if (connectionId && sendMessage) {
            sendMessage({
              type: 'enable_always_online',
              data: { connectionId }
            });
          }

          toast({
            title: "Always Online Enabled",
            description: "Bot will stay connected even when website is closed",
          });
        }, 1500);
      }, 500);
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password",
        variant: "destructive",
      });
      setAlwaysOnlinePassword("");
    }
  };

  const handleAlwaysOnlineCancel = () => {
    setShowAlwaysOnlineModal(false);
    setAlwaysOnlinePassword("");
    setShowCheckmark(false);
    setIsAuthenticating(false);
  };

  const handleStartHelpSession = () => {
    if (wsConnected && sendMessage) {
      sendMessage({
        type: 'start_help_session',
        data: {}
      });
      setShowHelpChat(true);
    } else {
      toast({
        title: "Connection Error",
        description: "Please wait for the connection to establish",
        variant: "destructive",
      });
    }
  };

  const handleSendHelpMessage = () => {
    if (!helpInput.trim() || !helpSessionId || !sendMessage) return;

    sendMessage({
      type: 'send_help_message',
      data: {
        sessionId: helpSessionId,
        message: helpInput.trim()
      }
    });

    setHelpInput("");
  };

  const handleEndHelpSession = () => {
    if (helpSessionId && sendMessage) {
      sendMessage({
        type: 'end_help_session',
        data: { sessionId: helpSessionId }
      });
    }
    setShowHelpChat(false);
    setHelpSessionId(null);
    setHelpMessages([]);
  };

  const handleHelpKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendHelpMessage();
    }
  };

  const handleAdminTabClick = () => {
    if (!isAdminAuthenticated) {
      setShowAdminLogin(true);
    }
    setActiveTab('admin');
  };

  const handleTerminateBot = async (connectionId: string) => {
    try {
      const response = await fetch(`/api/admin/connections/${connectionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Bot Terminated",
          description: "Bot has been successfully terminated",
        });
        // Refresh the connections list
        const connectionsResponse = await fetch('/api/admin/connections');
        if (connectionsResponse.ok) {
          const connections = await connectionsResponse.json();
          setAdminConnections(connections);
        }
      } else {
        throw new Error('Failed to terminate bot');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to terminate bot",
        variant: "destructive",
      });
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMessageStyle = (messageType: string) => {
    switch (messageType) {
      case 'system':
        return 'text-yellow-400';
      case 'join':
        return 'text-green-400';
      case 'leave':
        return 'text-red-400';
      case 'death':
        return 'text-red-500';
      case 'console':
        return 'text-minecraft-gold';
      default:
        return 'text-gray-200';
    }
  };

  const getLogLevelStyle = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-400 border-red-400';
      case 'warning':
        return 'text-yellow-400 border-yellow-400';
      case 'info':
        return 'text-blue-400 border-blue-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {authMode === 'login' ? (
            <LoginForm 
              onLogin={handleLogin}
              onSwitchToRegister={() => setAuthMode('register')}
            />
          ) : (
            <RegisterForm 
              onRegister={handleLogin}
              onSwitchToLogin={() => setAuthMode('login')}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b-4 border-minecraft-green shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-gaming font-bold text-minecraft-green flex items-center">
              <Server className="mr-3 h-8 w-8" />
              MineWithDawg v2
            </h1>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className={`${wsConnected ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>
                {wsConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
              </Badge>

              <Badge variant="outline" className={`${connectionStatus.isConnected ? 'border-minecraft-green text-minecraft-green' : 'border-gray-500 text-gray-400'}`}>
                {connectionStatus.isConnected ? `Connected as ${connectionStatus.username}` : 'Bot Offline'}
              </Badge>

              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <span>Welcome, {currentUser?.username}!</span>
                <Dialog open={showLearnMore} onOpenChange={setShowLearnMore}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-minecraft-green text-minecraft-green hover:bg-minecraft-green hover:text-gray-900"
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Learn More
                    </Button>
                  </DialogTrigger>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-gray-600 text-gray-300 hover:bg-red-600 hover:text-white"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Connection Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-minecraft-dark-stone">
              <CardHeader>
                <CardTitle className="text-xl font-gaming font-bold text-minecraft-green flex items-center">
                  <Server className="mr-2" />
                  Server Connection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="botAuthMode" className="text-gray-300">Authentication Mode</Label>
                  <Select value={botAuthMode} onValueChange={setBotAuthMode} disabled={connectionStatus.isConnected}>
                    <SelectTrigger data-testid="select-auth-mode" className="bg-gray-700 border-gray-600 text-white focus:border-minecraft-green">
                      <SelectValue placeholder="Select authentication" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offline">Offline Mode</SelectItem>
                      <SelectItem value="microsoft">Microsoft Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="username" className="text-gray-300">
                    {botAuthMode === 'microsoft' ? 'Microsoft Email' : 'Username (Offline)'}
                  </Label>
                  <Input
                    id="username"
                    data-testid="input-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={botAuthMode === 'microsoft' ? 'your-email@example.com' : 'Enter your username'}
                    type={botAuthMode === 'microsoft' ? 'email' : 'text'}
                    className="bg-gray-700 border-gray-600 text-white focus:border-minecraft-green"
                    disabled={connectionStatus.isConnected}
                  />
                </div>

                <div>
                  <Label htmlFor="serverIP" className="text-gray-300">Server IP</Label>
                  <Input
                    id="serverIP"
                    data-testid="input-server-ip"
                    value={serverIP}
                    onChange={(e) => setServerIP(e.target.value)}
                    placeholder="127.0.0.1:25565"
                    className="bg-gray-700 border-gray-600 text-white focus:border-minecraft-green"
                    disabled={connectionStatus.isConnected}
                  />
                </div>

                <div>
                  <Label htmlFor="version" className="text-gray-300">Minecraft Version</Label>
                  <Select value={version} onValueChange={setVersion} disabled={connectionStatus.isConnected}>
                    <SelectTrigger data-testid="select-version" className="bg-gray-700 border-gray-600 text-white focus:border-minecraft-green">
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      {MINECRAFT_VERSIONS.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v} {v === '1.21.4' ? '(Latest Supported)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="messageOnLoad" className="text-gray-300">Message on Load (Optional)</Label>
                  <Input
                    id="messageOnLoad"
                    data-testid="input-message-on-load"
                    value={messageOnLoad}
                    onChange={(e) => setMessageOnLoad(e.target.value)}
                    placeholder="Message to send when joining (e.g., 'Hello!' or '/gamemode creative')"
                    className="bg-gray-700 border-gray-600 text-white focus:border-minecraft-green"
                    disabled={connectionStatus.isConnected}
                  />
                  <div className="mt-2">
                    <Label htmlFor="messageOnLoadDelay" className="text-gray-300">Delay (ms)</Label>
                    <Input
                      id="messageOnLoadDelay"
                      data-testid="input-message-on-load-delay"
                      type="number"
                      min="500"
                      max="30000"
                      value={messageOnLoadDelay}
                      onChange={(e) => setMessageOnLoadDelay(Math.max(500, parseInt(e.target.value) || 2000))}
                      className="bg-gray-700 border-gray-600 text-white focus:border-minecraft-green"
                      disabled={connectionStatus.isConnected}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    This message will be sent automatically after the specified delay
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    data-testid="button-connect"
                    onClick={handleConnect}
                    disabled={connectionStatus.isConnected || !wsConnected}
                    className="flex-1 bg-minecraft-green hover:bg-minecraft-dark-green"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                  <Button
                    data-testid="button-disconnect"
                    onClick={handleDisconnect}
                    disabled={!connectionStatus.isConnected}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </div>

                {lastConnectionData && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-minecraft-green/50 transition-all duration-200">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="auto-reconnect"
                          checked={autoReconnect}
                          onChange={(e) => setAutoReconnect(e.target.checked)}
                          className="w-4 h-4 text-minecraft-green bg-gray-600 border-gray-500 rounded focus:ring-minecraft-green transition-all duration-200"
                        />
                        {autoReconnect && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-minecraft-green rounded-full animate-pulse" />
                        )}
                      </div>
                      <label htmlFor="auto-reconnect" className="text-sm text-gray-300">
                        Auto-reconnect
                      </label>
                    </div>
                    <Button
                      data-testid="button-reconnect"
                      onClick={handleReconnect}
                      disabled={connectionStatus.isConnected || !wsConnected}
                      size="sm"
                      className="bg-minecraft-gold hover:bg-yellow-600 text-gray-900 transition-all duration-200 hover:scale-105"
                    >
                      Reconnect Now
                    </Button>
                  </div>
                )}

                <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-minecraft-green/50 transition-all duration-200">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="always-online"
                        checked={alwaysOnlineEnabled}
                        onChange={handleAlwaysOnlineToggle}
                        className="w-4 h-4 text-minecraft-green bg-gray-600 border-gray-500 rounded focus:ring-minecraft-green transition-all duration-200"
                      />
                      {alwaysOnlineEnabled && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-minecraft-green rounded-full animate-pulse" />
                      )}
                    </div>
                    <label htmlFor="always-online" className="text-sm text-gray-300">
                      Always Online
                    </label>
                  </div>
                  {alwaysOnlineEnabled && (
                    <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                      Bot stays connected when website closes
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 mt-4">
              <CardContent className="pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Status:</span>
                  <Badge variant={connectionStatus.isConnected ? "default" : "destructive"}>
                    {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-300">Ping:</span>
                  <span className="text-gray-400" data-testid="text-ping">
                    {connectionStatus.ping > 0 ? `${connectionStatus.ping} ms` : '-- ms'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Movement Controls */}
            <Card className="bg-gray-800 border-minecraft-dark-stone mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-gaming font-bold text-minecraft-green flex items-center">
                  <Gamepad2 className="mr-2" />
                  Movement Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-2">
                  <Button
                    data-testid="button-move-forward"
                    onMouseDown={() => handleMovement('forward', 'start')}
                    onMouseUp={() => handleMovement('forward', 'stop')}
                    onMouseLeave={() => handleMovement('forward', 'stop')}
                    disabled={!connectionStatus.isConnected}
                    className="w-12 h-12 bg-minecraft-stone hover:bg-minecraft-green text-white font-bold text-lg"
                  >
                    W
                  </Button>

                  <div className="flex space-x-2">
                    <Button
                      data-testid="button-move-left"
                      onMouseDown={() => handleMovement('left', 'start')}
                      onMouseUp={() => handleMovement('left', 'stop')}
                      onMouseLeave={() => handleMovement('left', 'stop')}
                      disabled={!connectionStatus.isConnected}
                      className="w-12 h-12 bg-minecraft-stone hover:bg-minecraft-green text-white font-bold text-lg"
                    >
                      A
                    </Button>
                    <Button
                      data-testid="button-move-back"
                      onMouseDown={() => handleMovement('back', 'start')}
                      onMouseUp={() => handleMovement('back', 'stop')}
                      onMouseLeave={() => handleMovement('back', 'stop')}
                      disabled={!connectionStatus.isConnected}
                      className="w-12 h-12 bg-minecraft-stone hover:bg-minecraft-green text-white font-bold text-lg"
                    >
                      S
                    </Button>
                    <Button
                      data-testid="button-move-right"
                      onMouseDown={() => handleMovement('right', 'start')}
                      onMouseUp={() => handleMovement('right', 'stop')}
                      onMouseLeave={() => handleMovement('right', 'stop')}
                      disabled={!connectionStatus.isConnected}
                      className="w-12 h-12 bg-minecraft-stone hover:bg-minecraft-green text-white font-bold text-lg"
                    >
                      D
                    </Button>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      data-testid="button-jump"
                      onClick={() => handleMovement('jump', 'start')}
                      disabled={!connectionStatus.isConnected}
                      className="w-16 h-10 bg-minecraft-gold hover:bg-yellow-600 text-gray-900 font-bold"
                    >
                      SPACE
                    </Button>
                    <Button
                      data-testid="button-crouch"
                      onMouseDown={() => handleMovement('crouch', 'start')}
                      onMouseUp={() => handleMovement('crouch', 'stop')}
                      onMouseLeave={() => handleMovement('crouch', 'stop')}
                      disabled={!connectionStatus.isConnected}
                      className="w-16 h-10 bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      SHIFT
                    </Button>
                  </div>
                </div>

                {!connectionStatus.isConnected && (
                  <div className="mt-4 text-xs text-gray-400 text-center">
                    Connect to server to enable controls
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Spammer Controls */}
            <Card className="bg-gray-800 border-minecraft-dark-stone mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-gaming font-bold text-minecraft-green flex items-center">
                  <MessageSquare className="mr-2" />
                  Auto Spammer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="spammerMessage" className="text-gray-300">Spam Message</Label>
                  <Textarea
                    id="spammerMessage"
                    data-testid="textarea-spammer-message"
                    value={spammerMessage}
                    onChange={(e) => setSpammerMessage(e.target.value)}
                    placeholder="Enter message or command to spam..."
                    className="bg-gray-700 border-gray-600 text-white focus:border-minecraft-green min-h-[60px]"
                    disabled={spammerEnabled}
                  />
                </div>

                <div>
                  <Label htmlFor="spammerDelay" className="text-gray-300">Delay (ms)</Label>
                  <Input
                    id="spammerDelay"
                    data-testid="input-spammer-delay"
                    type="number"
                    min="100"
                    max="10000"
                    value={spammerDelay}
                    onChange={(e) => setSpammerDelay(Math.max(100, parseInt(e.target.value) || 1000))}
                    className="bg-gray-700 border-gray-600 text-white focus:border-minecraft-green"
                    disabled={spammerEnabled}
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Minimum: 100ms (0.1 seconds)
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anti-kick"
                      checked={antiKickEnabled}
                      onChange={(e) => setAntiKickEnabled(e.target.checked)}
                      className="w-4 h-4 text-minecraft-green bg-gray-600 border-gray-500 rounded focus:ring-minecraft-green"
                      disabled={spammerEnabled}
                    />
                    <label htmlFor="anti-kick" className="text-sm text-gray-300">
                      Anti-Kick Mode
                    </label>
                  </div>
                </div>
                {antiKickEnabled && (
                  <div className="text-xs text-gray-400 bg-gray-700 p-2 rounded">
                    Anti-kick adds random numbers and symbols to the end of each message to avoid spam detection
                  </div>
                )}

                <Button
                  data-testid="button-toggle-spammer"
                  onClick={toggleSpammer}
                  disabled={spammerEnabled && !connectionStatus.isConnected}
                  className={`w-full font-bold ${
                    spammerEnabled
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-minecraft-gold hover:bg-yellow-600 text-gray-900'
                  }`}
                >
                  {spammerEnabled ? 'Stop Spammer' : 'Start Spammer'}
                </Button>

                {spammerEnabled && (
                  <div className="text-center">
                    <Badge className="bg-red-600 text-white animate-pulse">
                      {connectionStatus.isConnected ? `Spamming every ${spammerDelay}ms` : 'Waiting for connection...'}
                    </Badge>
                  </div>
                )}

                {!connectionStatus.isConnected && (
                  <div className="mt-4 text-xs text-gray-400 text-center">
                    Spammer can be configured offline, will start when connected
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-minecraft-dark-stone h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl font-gaming font-bold text-minecraft-green flex items-center">
                  <MessageSquare className="mr-2" />
                  Chat & Commands
                </CardTitle>
                <div className="flex space-x-2 mt-4">
                  <Button
                    data-testid="tab-chat"
                    onClick={() => setActiveTab('chat')}
                    variant={activeTab === 'chat' ? 'default' : 'outline'}
                    className="flex-1 text-sm"
                  >
                    Chat
                  </Button>
                  <Button
                    data-testid="tab-logs"
                    onClick={() => setActiveTab('logs')}
                    variant={activeTab === 'logs' ? 'default' : 'outline'}
                    className="flex-1 text-sm"
                  >
                    Logs
                  </Button>
                  <Button
                    data-testid="tab-players"
                    onClick={() => setActiveTab('players')}
                    variant={activeTab === 'players' ? 'default' : 'outline'}
                    className="flex-1 text-sm"
                  >
                    Players ({onlinePlayers.length})
                  </Button>
                  <Button
                    data-testid="tab-inventory"
                    onClick={() => setActiveTab('inventory')}
                    variant={activeTab === 'inventory' ? 'default' : 'outline'}
                    className="flex-1 text-sm"
                  >
                    📦 Inventory
                  </Button>
                  <Button
                    data-testid="tab-admin"
                    onClick={handleAdminTabClick}
                    variant={activeTab === 'admin' ? 'default' : 'outline'}
                    className="flex-1 text-sm"
                  >
                    Admin {isAdminAuthenticated ? '🔓' : '🔒'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 bg-chat-bg rounded-lg border border-gray-700 mb-4 overflow-hidden flex flex-col">
                  {activeTab === 'chat' ? (
                    <div
                      ref={chatMessagesRef}
                      className="flex-1 p-4 overflow-y-auto max-h-96 space-y-2"
                      data-testid="chat-messages"
                    >
                      {chatMessages.length === 0 ? (
                        <div className="text-gray-400 text-center py-8">
                          No messages yet. Connect to a server to start chatting!
                        </div>
                      ) : (
                        chatMessages.map((msg) => (
                          <div key={msg.id} className="text-sm">
                            <span className="text-gray-400 font-mono text-xs">
                              [{formatTime(new Date(msg.timestamp))}]
                            </span>
                            {msg.isCommand ? (
                              <span className="text-minecraft-gold font-medium ml-1">
                                &gt; {msg.message}
                              </span>
                            ) : (
                              <>
                                <span className={`font-medium ml-1 ${
                                  msg.messageType === 'system' || msg.messageType === 'join' || msg.messageType === 'leave' || msg.messageType === 'death'
                                    ? 'text-yellow-300'
                                    : 'text-minecraft-green'
                                }`}>
                                  {msg.messageType === 'system' || msg.messageType === 'join' || msg.messageType === 'leave' || msg.messageType === 'death'
                                    ? '[Server]'
                                    : `<${msg.username}>`
                                  }
                                </span>
                                <span className={`ml-1 ${getMessageStyle(msg.messageType)}`}>
                                  {msg.message}
                                </span>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  ) : activeTab === 'logs' ? (
                    <div
                      ref={logsRef}
                      className="flex-1 p-4 overflow-y-auto max-h-96 space-y-1"
                      data-testid="bot-logs"
                    >
                      {botLogs.length === 0 ? (
                        <div className="text-gray-400 text-center py-8">
                          No logs yet. Connect to a server to see activity logs!
                        </div>
                      ) : (
                        botLogs.map((log) => (
                          <div key={log.id} className={`text-xs p-2 rounded border-l-2 ${getLogLevelStyle(log.logLevel)}`}>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-gray-400">
                                [{formatTime(new Date(log.timestamp))}]
                              </span>
                              <span className={`uppercase text-xs font-bold ${
                                log.logLevel === 'error' ? 'text-red-400' :
                                log.logLevel === 'warning' ? 'text-yellow-400' :
                                'text-blue-400'
                              }`}>
                                {log.logLevel}
                              </span>
                            </div>
                            <div className="text-gray-300 mt-1">
                              {log.message}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : activeTab === 'players' ? (
                    <div
                      className="flex-1 p-4 overflow-y-auto max-h-96 space-y-2"
                      data-testid="players-list"
                    >
                      {!connectionStatus.isConnected ? (
                        <div className="text-gray-400 text-center py-8">
                          Connect to a server to see online players!
                        </div>
                      ) : onlinePlayers.length === 0 ? (
                        <div className="text-gray-400 text-center py-8">
                          No players online or data not available
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                            <h3 className="text-lg font-semibold text-minecraft-green">
                              Online Players ({onlinePlayers.length})
                            </h3>
                          </div>
                          {onlinePlayers.map((player) => (
                            <div key={player.uuid} className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-minecraft-green rounded flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">
                                      {player.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">
                                      {player.username}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      UUID: {player.uuid.substring(0, 8)}...
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {player.ping !== undefined && (
                                    <div className="text-sm text-gray-400">
                                      {player.ping}ms
                                    </div>
                                  )}
                                  <div className="w-3 h-3 bg-status-online rounded-full animate-pulse" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {kickReason && (
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-600 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full" />
                            <span className="text-red-400 font-medium">Last Disconnect Reason:</span>
                          </div>
                          <div className="text-red-300 mt-1">
                            {kickReason}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : activeTab === 'inventory' ? (
                    <div
                      className="flex-1 p-4 overflow-y-auto max-h-96 space-y-2"
                      data-testid="inventory-display"
                    >
                      {!connectionStatus.isConnected ? (
                        <div className="text-gray-400 text-center py-8">
                          Connect to a server to view bot inventory!
                        </div>
                      ) : botInventory.length === 0 ? (
                        <div className="text-gray-400 text-center py-8">
                          <div className="text-4xl mb-2">📦</div>
                          <div>Inventory is empty or not loaded</div>
                          <div className="text-sm mt-2">Click the "📦 Inventory" button to refresh</div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                            <h3 className="text-lg font-semibold text-minecraft-green">
                              Bot Inventory ({botInventory.length} items)
                            </h3>
                            <Button
                              onClick={handleShowInventory}
                              size="sm"
                              className="bg-minecraft-gold hover:bg-yellow-600 text-gray-900"
                            >
                              Refresh
                            </Button>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {botInventory.map((item, index) => (
                              <div key={index} className="bg-gray-700 rounded border border-gray-600 p-3 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="text-xl">📦</div>
                                  <div>
                                    <div className="text-white font-medium">
                                      {item.displayName || item.name || 'Unknown Item'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Slot {item.slot}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="text-minecraft-green font-bold">
                                    x{item.count}
                                  </div>
                                  <Button
                                    onClick={() => handleDropItem(item.slot)}
                                    size="sm"
                                    variant="destructive"
                                    className="text-xs px-2 py-1 h-6"
                                  >
                                    Drop
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="flex-1 p-4 overflow-y-auto max-h-96"
                      data-testid="admin-panel"
                    >
                      {showAdminLogin && !isAdminAuthenticated ? (
                        <div className="flex flex-col items-center justify-center space-y-4 py-12">
                          <div className="text-center">
                            <h3 className="text-xl font-semibold text-minecraft-green mb-2">Admin Access Required</h3>
                            <p className="text-gray-400 mb-6">Enter password to access admin panel</p>
                          </div>
                          <div className="w-full max-w-sm space-y-3">
                            <Input
                              type="password"
                              placeholder="Enter admin password"
                              value={adminPassword}
                              onChange={(e) => setAdminPassword(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                              className="bg-gray-700 border-gray-600 text-white focus:border-minecraft-green"
                            />
                            <div className="flex space-x-2">
                              <Button
                                onClick={handleAdminLogin}
                                className="flex-1 bg-minecraft-green hover:bg-minecraft-dark-green"
                              >
                                Login
                              </Button>
                              <Button
                                onClick={() => {
                                  setShowAdminLogin(false);
                                  setActiveTab('chat');
                                  setAdminPassword("");
                                }}
                                variant="outline"
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : !isAdminAuthenticated ? (
                        <div className="text-center py-12">
                          <div className="text-gray-400">
                            <div className="text-6xl mb-4">🔒</div>
                            <h3 className="text-lg font-semibold mb-2">Admin Panel Locked</h3>
                            <p>Click the Admin tab again to authenticate</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-minecraft-green">Bot Management</h3>
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline" className="text-xs">
                                {adminConnections.filter(conn => conn.isActive).length} Active
                              </Badge>
                              <Button
                                onClick={() => {
                                  setIsAdminAuthenticated(false);
                                  setActiveTab('chat');
                                }}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
                                Logout
                              </Button>
                            </div>
                          </div>

                          {isLoadingAdmin ? (
                            <div className="text-center py-8 text-gray-400">Loading bots...</div>
                          ) : adminConnections.length === 0 ? (
                            <div className="text-gray-400 text-center py-8">
                              No bot connections found
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {adminConnections.map((conn) => (
                                <div key={conn.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${
                                          conn.isActive ? 'bg-status-online animate-pulse' : 'bg-status-offline'
                                        }`} />
                                        <div>
                                          <div className="font-medium text-white">
                                            {conn.username}
                                          </div>
                                          <div className="text-sm text-gray-400">
                                            {conn.serverIp} • {conn.version}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                                        <span>
                                          Status: <span className={conn.isActive ? 'text-green-400' : 'text-red-400'}>
                                            {conn.isActive ? 'Online' : 'Offline'}
                                          </span>
                                        </span>
                                        {conn.lastPing !== undefined && (
                                          <span>Ping: {conn.lastPing}ms</span>
                                        )}
                                        <span>
                                          Created: {formatTime(new Date(conn.createdAt))}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      {conn.isActive && (
                                        <Button
                                          onClick={() => handleTerminateBot(conn.id)}
                                          variant="destructive"
                                          size="sm"
                                          className="text-xs"
                                          data-testid={`terminate-bot-${conn.id}`}
                                        >
                                          Terminate
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'chat' && (
                    <div className="border-t border-gray-700 p-3">
                      <div className="flex space-x-2">
                        <Input
                          data-testid="input-chat"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message or command (prefix with /)..."
                          className="flex-1 bg-gray-700 border-gray-600 text-white focus:border-minecraft-green"
                          disabled={!connectionStatus.isConnected}
                        />
                        <Button
                          data-testid="button-send-message"
                          onClick={handleSendMessage}
                          disabled={!connectionStatus.isConnected || !chatInput.trim()}
                          className="bg-minecraft-green hover:bg-minecraft-dark-green"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Tip: Use "/" prefix for commands (e.g., /help, /tp, /gamemode)
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Commands</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {QUICK_COMMANDS.map((command) => (
                      <Button
                        key={command}
                        data-testid={`button-quick-command-${command.slice(1)}`}
                        onClick={() => handleQuickCommand(command)}
                        disabled={!connectionStatus.isConnected}
                        variant="outline"
                        className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                      >
                        {command}
                      </Button>
                    ))}
                    <Button
                      data-testid="button-show-inventory"
                      onClick={handleShowInventory}
                      disabled={!connectionStatus.isConnected}
                      variant="outline"
                      className="bg-minecraft-gold hover:bg-yellow-600 border-yellow-600 text-gray-900 font-bold"
                    >
                      📦 Inventory
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Bar */}
        <Card className="mt-6 bg-gray-800 border-minecraft-dark-stone">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-minecraft-green" data-testid="text-players">
                  {connectionStatus.serverInfo.players}
                </div>
                <div className="text-xs text-gray-400">Players Online</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-minecraft-gold" data-testid="text-latency">
                  {connectionStatus.ping > 0 ? `${connectionStatus.ping} ms` : '-- ms'}
                </div>
                <div className="text-xs text-gray-400">Latency</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400" data-testid="text-coordinates">
                  {connectionStatus.position.x}, {connectionStatus.position.y}, {connectionStatus.position.z}
                </div>
                <div className="text-xs text-gray-400">Coordinates (X, Y, Z)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400" data-testid="text-server-version">
                  {connectionStatus.serverInfo.version}
                </div>
                <div className="text-xs text-gray-400">Server Version</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400" data-testid="text-server-status">
                  {connectionStatus.serverInfo.motd}
                </div>
                <div className="text-xs text-gray-400">Server Status</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Always Online Authentication Modal */}
      {showAlwaysOnlineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-minecraft-dark-stone rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-minecraft-green/10 rounded-full flex items-center justify-center">
                {showCheckmark ? (
                  <div className="text-green-400 text-2xl animate-bounce">✓</div>
                ) : (
                  <div className="text-minecraft-green text-2xl">🔒</div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-minecraft-green mb-2">Enable Always Online</h3>
              <p className="text-gray-400 text-sm">
                This feature keeps your bot connected to the server even when the website is closed.
                Enter the password to continue.
              </p>
            </div>

            {!showCheckmark ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="always-online-password" className="text-gray-300">Password</Label>
                  <Input
                    id="always-online-password"
                    type="password"
                    placeholder="Enter password"
                    value={alwaysOnlinePassword}
                    onChange={(e) => setAlwaysOnlinePassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAlwaysOnlineAuth()}
                    className="bg-gray-700 border-gray-600 text-white focus:border-minecraft-green"
                    disabled={isAuthenticating}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleAlwaysOnlineAuth}
                    disabled={!alwaysOnlinePassword.trim() || isAuthenticating}
                    className="flex-1 bg-minecraft-green hover:bg-minecraft-dark-green"
                  >
                    {isAuthenticating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </div>
                    ) : (
                      'Enable Always Online'
                    )}
                  </Button>
                  <Button
                    onClick={handleAlwaysOnlineCancel}
                    variant="outline"
                    className="flex-1"
                    disabled={isAuthenticating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-green-400 text-lg font-medium">Authentication Successful!</div>
                <div className="text-gray-400 text-sm">{microsoftAuth.message}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Microsoft Authentication Modal */}
      {microsoftAuth.isActive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-minecraft-dark-stone rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-600/10 rounded-full flex items-center justify-center">
                  <div className="text-blue-400 text-2xl">🔐</div>
                </div>
                <h3 className="text-xl font-semibold text-minecraft-green mb-2">Microsoft Authentication Required</h3>
                <p className="text-gray-400 text-sm">
                  {microsoftAuth.message || "Please complete the authentication process to continue"}
                </p>
              </div>

              {microsoftAuth.verificationUri && microsoftAuth.userCode ? (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="text-sm text-gray-300 mb-2">Step 1: Visit this URL</div>
                    <div className="bg-gray-800 rounded px-3 py-2 font-mono text-sm text-blue-400 break-all">
                      {microsoftAuth.verificationUri}
                    </div>
                    <Button
                      onClick={() => window.open(microsoftAuth.verificationUri, '_blank')}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
                    >
                      Open Microsoft Login
                    </Button>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="text-sm text-gray-300 mb-2">Step 2: Enter this code</div>
                    <div className="bg-gray-800 rounded px-3 py-2 font-mono text-xl text-center text-minecraft-green font-bold tracking-wider">
                      {microsoftAuth.userCode}
                    </div>
                    <Button
                      onClick={() => navigator.clipboard.writeText(microsoftAuth.userCode || '')}
                      variant="outline"
                      className="w-full mt-2"
                    >
                      Copy Code
                    </Button>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span>Waiting for authentication...</span>
                    </div>
                  </div>
                </div>
              ) : microsoftAuth.message && microsoftAuth.message.includes('verified') ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-600/10 rounded-full flex items-center justify-center">
                    <div className="text-green-400 text-2xl">✓</div>
                  </div>
                  <div className="text-green-400 font-medium">Authentication Successful!</div>
                  <div className="text-sm text-gray-400">{microsoftAuth.message}</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>Starting authentication...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Chat Modal */}
      {showHelpChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-minecraft-dark-stone rounded-lg w-full max-w-md h-96 mx-4 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold text-minecraft-green">Get Help</h3>
              </div>
              <Button
                onClick={handleEndHelpSession}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <div
              ref={helpMessagesRef}
              className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-900"
            >
              {helpMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isAgent ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg ${
                    msg.isAgent
                      ? 'bg-gray-700 text-white'
                      : 'bg-minecraft-green text-gray-900'
                  }`}>
                    <div className="text-sm font-medium mb-1">
                      {msg.author}
                    </div>
                    <div className="text-sm">
                      {msg.message}
                    </div>
                    <div className={`text-xs mt-1 ${
                      msg.isAgent ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      {formatTime(new Date(msg.timestamp))}
                    </div>
                  </div>
                </div>
              ))}

              {helpMessages.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  Starting help session...
                </div>
              )}
            </div>

            <div className="border-t border-gray-700 p-3">
              <div className="flex space-x-2">
                <Input
                  value={helpInput}
                  onChange={(e) => setHelpInput(e.target.value)}
                  onKeyPress={handleHelpKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-700 border-gray-600 text-white focus:border-minecraft-green"
                  disabled={!helpSessionId}
                />
                <Button
                  onClick={handleSendHelpMessage}
                  disabled={!helpInput.trim() || !helpSessionId}
                  className="bg-minecraft-green hover:bg-minecraft-dark-green"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {!helpSessionId && (
                <div className="text-xs text-gray-400 mt-1">
                  Connecting to support team...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Learn More Dialog */}
      <Dialog open={showLearnMore} onOpenChange={setShowLearnMore}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-800 border-minecraft-dark-stone text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-gaming text-minecraft-green flex items-center">
              <BookOpen className="mr-2" />
              About MineWithDawg v2
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Everything you need to know about our free Minecraft bot service
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-4 h-full">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-gray-900 rounded-lg p-4">
              <div className="space-y-2">
                {[
                  { id: 'overview', title: 'Overview', icon: Info },
                  { id: 'mojang', title: 'Mojang Disclaimer', icon: Shield },
                  { id: 'how-it-works', title: 'How It Works', icon: Settings },
                  { id: 'privacy', title: 'Privacy Policy', icon: Eye },
                  { id: 'safety', title: 'Account Safety', icon: Lock },
                  { id: 'updates', title: 'Recent Updates', icon: Download },
                  { id: 'developer', title: 'About Developer', icon: Users },
                  { id: 'features', title: 'Features', icon: Package },
                ].map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <Button
                      key={section.id}
                      onClick={() => setActiveLearnSection(section.id)}
                      variant={activeLearnSection === section.id ? 'default' : 'ghost'}
                      className={`w-full justify-start text-left ${
                        activeLearnSection === section.id 
                          ? 'bg-minecraft-green text-gray-900' 
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {section.title}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <ScrollArea className="flex-1 bg-gray-900 rounded-lg p-6">
              {activeLearnSection === 'overview' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-minecraft-green">Welcome to MineWithDawg v2</h3>
                  <p className="text-gray-300">
                    MineWithDawg is the first and best free Minecraft bot service that runs entirely through your web browser. 
                    No downloads, no installations, no complex setup - just pure convenience.
                  </p>
                  <div className="bg-minecraft-green/10 border border-minecraft-green rounded-lg p-4">
                    <h4 className="font-semibold text-minecraft-green mb-2">What makes us different?</h4>
                    <ul className="space-y-1 text-gray-300">
                      <li>• Completely free to use - no hidden fees or premium tiers</li>
                      <li>• Web-based interface - works on any device with internet</li>
                      <li>• Real-time bot control with live chat and logs</li>
                      <li>• Multiple authentication modes (Offline & Microsoft)</li>
                      <li>• Advanced features like auto-reconnect and movement controls</li>
                    </ul>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Version 2.0 brings enhanced stability, improved UI, user authentication, and many more features!
                  </p>
                </div>
              )}

              {activeLearnSection === 'mojang' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-minecraft-green">Mojang Disclaimer</h3>
                  <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-400 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Important Notice
                    </h4>
                    <p className="text-gray-300">
                      <strong>MineWithDawg is NOT affiliated with, endorsed by, or connected to Mojang AB, Microsoft Corporation, 
                      or any official Minecraft services.</strong>
                    </p>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <p>
                      Minecraft® is a trademark of Mojang AB and Microsoft Corporation. This service is an independent, 
                      community-created tool that interacts with Minecraft servers through publicly available protocols.
                    </p>
                    <p>
                      We respect Mojang's Terms of Service and encourage all users to:
                    </p>
                    <ul className="space-y-1 ml-4">
                      <li>• Only use bots on servers where they are explicitly allowed</li>
                      <li>• Follow all server rules and guidelines</li>
                      <li>• Respect other players and fair gameplay</li>
                      <li>• Not use bots for griefing, cheating, or malicious activities</li>
                    </ul>
                    <p className="text-yellow-400">
                      Use this service responsibly and at your own risk. We are not responsible for any consequences 
                      resulting from bot usage on third-party servers.
                    </p>
                  </div>
                </div>
              )}

              {activeLearnSection === 'how-it-works' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-minecraft-green">How MineWithDawg Works</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h4 className="font-semibold text-minecraft-green mb-2">1. Browser-Based Architecture</h4>
                      <p className="text-gray-300">
                        Our service runs entirely in your web browser using modern web technologies. When you connect a bot, 
                        our servers create a Minecraft client that communicates with the target server on your behalf.
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h4 className="font-semibold text-minecraft-green mb-2">2. Real-Time Communication</h4>
                      <p className="text-gray-300">
                        WebSocket connections provide instant communication between your browser and the bot. You can see 
                        live chat messages, player movements, and server events in real-time.
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h4 className="font-semibold text-minecraft-green mb-2">3. Advanced Bot Features</h4>
                      <p className="text-gray-300">
                        Control your bot with movement keys, send chat messages and commands, view inventory, monitor player lists, 
                        and use advanced features like auto-reconnect and spam protection.
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h4 className="font-semibold text-minecraft-green mb-2">4. Security & Privacy</h4>
                      <p className="text-gray-300">
                        Microsoft authentication is handled through official OAuth flows. We never store passwords and use 
                        secure token-based authentication for all communications.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeLearnSection === 'privacy' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-minecraft-green">Privacy Policy</h3>
                  <div className="space-y-3 text-gray-300">
                    <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
                      <h4 className="font-semibold text-green-400 mb-2">Your Privacy Matters</h4>
                      <p>We are committed to protecting your privacy and only collect the minimum data necessary to provide our service.</p>
                    </div>
                    <h4 className="font-semibold text-minecraft-green">What We Collect:</h4>
                    <ul className="space-y-1 ml-4">
                      <li>• Server connection details (IP addresses, usernames) for bot functionality</li>
                      <li>• Chat messages and commands sent through the bot interface</li>
                      <li>• Basic connection logs for debugging and service improvement</li>
                      <li>• Anonymous usage statistics to understand feature popularity</li>
                    </ul>
                    <h4 className="font-semibold text-minecraft-green">What We DON'T Collect:</h4>
                    <ul className="space-y-1 ml-4">
                      <li>• Minecraft passwords (authentication handled by Microsoft)</li>
                      <li>• Personal information beyond what you voluntarily provide</li>
                      <li>• Data from servers you're not connected to through our service</li>
                      <li>• Browser history or activities outside our service</li>
                    </ul>
                    <h4 className="font-semibold text-minecraft-green">Data Usage:</h4>
                    <p>
                      All collected data is used solely for providing bot functionality, debugging issues, and improving 
                      the service. We never sell, rent, or share your data with third parties for marketing purposes.
                    </p>
                  </div>
                </div>
              )}

              {activeLearnSection === 'safety' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-minecraft-green">Account Safety & Security</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-400 mb-2 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Microsoft Authentication
                      </h4>
                      <p className="text-gray-300">
                        When using Microsoft authentication, you're redirected to official Microsoft servers. 
                        We never see or store your Microsoft credentials.
                      </p>
                    </div>
                    <h4 className="font-semibold text-minecraft-green">Best Practices:</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Use offline mode for testing on private servers</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Only connect to servers where bots are allowed</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Avoid sharing server credentials or sensitive information</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Log out when finished using the service</span>
                      </li>
                    </ul>
                    <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
                      <h4 className="font-semibold text-red-400 mb-2">Important Warnings:</h4>
                      <ul className="space-y-1 text-gray-300">
                        <li>• Never share your MineWithDawg account with others</li>
                        <li>• Don't use bots on servers with anti-bot policies</li>
                        <li>• Be aware that some servers may ban bot usage</li>
                        <li>• Report any suspicious activity immediately</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeLearnSection === 'updates' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-minecraft-green">Recent Updates & Changelog</h3>
                  <div className="space-y-4">
                    <div className="bg-minecraft-green/10 border border-minecraft-green rounded-lg p-4">
                      <h4 className="font-semibold text-minecraft-green mb-2">Version 2.0 - The Complete Rebuild 🎉</h4>
                      <p className="text-gray-400 text-sm mb-3">Released: January 2025</p>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>• Complete UI redesign with modern Minecraft-themed styling</li>
                        <li>• User authentication system with login/register functionality</li>
                        <li>• Server profile management - save and load your favorite servers</li>
                        <li>• Enhanced bot controls with WASD movement and advanced features</li>
                        <li>• Real-time player list and inventory management</li>
                        <li>• Auto-spammer with anti-kick protection</li>
                        <li>• Admin panel for bot management</li>
                        <li>• Always-online mode for continuous bot operation</li>
                        <li>• Improved error handling and connection stability</li>
                        <li>• Microsoft authentication integration</li>
                      </ul>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h4 className="font-semibold text-gray-300 mb-2">Version 1.x - Legacy Features</h4>
                      <p className="text-gray-400 text-sm mb-3">Previous versions (2024)</p>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>• Basic bot connectivity and chat functionality</li>
                        <li>• Simple movement controls</li>
                        <li>• Connection logging and debugging</li>
                        <li>• WebSocket-based real-time communication</li>
                      </ul>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-400 mb-2">Coming Soon 🚀</h4>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>• Advanced bot scripting capabilities</li>
                        <li>• Plugin system for custom bot behaviors</li>
                        <li>• Multi-bot management</li>
                        <li>• Enhanced server compatibility</li>
                        <li>• Mobile app for on-the-go bot control</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeLearnSection === 'developer' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-minecraft-green">About the Developer</h3>
                  <div className="space-y-4">
                    <div className="bg-minecraft-gold/10 border border-minecraft-gold rounded-lg p-4">
                      <h4 className="font-semibold text-minecraft-gold mb-2">Created by Doggo 🐕</h4>
                      <p className="text-gray-300">
                        MineWithDawg was developed by a passionate Minecraft enthusiast who wanted to create 
                        the first truly accessible, web-based Minecraft bot service that anyone could use for free.
                      </p>
                    </div>
                    <h4 className="font-semibold text-minecraft-green">Why Was MineWithDawg Created?</h4>
                    <div className="space-y-3 text-gray-300">
                      <p>
                        The idea for MineWithDawg came from personal frustration with existing bot solutions:
                      </p>
                      <ul className="space-y-1 ml-4">
                        <li>• Most bot services require complex installations and technical knowledge</li>
                        <li>• Many services charge premium fees for basic functionality</li>
                        <li>• Existing solutions often lack user-friendly interfaces</li>
                        <li>• There was no truly web-based bot service available</li>
                      </ul>
                      <p>
                        The goal was simple: <strong>Create the first and best free Minecraft bot service that runs 
                        entirely through the web, making bot functionality accessible to everyone.</strong>
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h4 className="font-semibold text-minecraft-green mb-2">Fun Facts</h4>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>• Development started as a weekend project and grew into a full service</li>
                        <li>• The name "MineWithDawg" combines "Minecraft" with "Dawg" (slang for friend/buddy)</li>
                        <li>• Version 2.0 represents over 100 hours of development and testing</li>
                        <li>• The service has been used by thousands of players worldwide</li>
                        <li>• All development is done with love for the Minecraft community</li>
                      </ul>
                    </div>
                    <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
                      <h4 className="font-semibold text-green-400 mb-2">Our Mission</h4>
                      <p className="text-gray-300">
                        To provide the Minecraft community with free, accessible, and powerful bot tools while 
                        respecting the game, its developers, and fellow players. We believe everyone should have 
                        access to quality bot services without barriers.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeLearnSection === 'features' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-minecraft-green">Complete Feature List</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h4 className="font-semibold text-minecraft-green mb-2 flex items-center">
                        <Server className="h-4 w-4 mr-2" />
                        Connection Features
                      </h4>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>• Multiple Minecraft version support</li>
                        <li>• Offline and Microsoft authentication</li>
                        <li>• Auto-reconnect functionality</li>
                        <li>• Connection status monitoring</li>
                        <li>• Ping and latency tracking</li>
                      </ul>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h4 className="font-semibold text-minecraft-green mb-2 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat & Communication
                      </h4>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>• Real-time chat messaging</li>
                        <li>• Command execution support</li>
                        <li>• Message history and logging</li>
                        <li>• Quick command buttons</li>
                        <li>• Message-on-load functionality</li>
                      </ul>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h4 className="font-semibold text-minecraft-green mb-2 flex items-center">
                        <Gamepad2 className="h-4 w-4 mr-2" />
                        Bot Control
                      </h4>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>• WASD movement controls</li>
                        <li>• Jump and crouch functionality</li>
                        <li>• Position tracking (X, Y, Z)</li>
                        <li>• Inventory management</li>
                        <li>• Item dropping capabilities</li>
                      </ul>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h4 className="font-semibold text-minecraft-green mb-2 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Player Management
                      </h4>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>• Online player list</li>
                        <li>• Player ping monitoring</li>
                        <li>• Join/leave notifications</li>
                        <li>• Player count tracking</li>
                        <li>• Real-time player updates</li>
                      </ul>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h4 className="font-semibold text-minecraft-green mb-2 flex items-center">
                        <Zap className="h-4 w-4 mr-2" />
                        Advanced Features
                      </h4>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>• Auto-spammer with anti-kick</li>
                        <li>• Always-online mode</li>
                        <li>• Server profile saving</li>
                        <li>• Admin bot management</li>
                        <li>• Help chat system</li>
                      </ul>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h4 className="font-semibold text-minecraft-green mb-2 flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Technical Features
                      </h4>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>• WebSocket real-time communication</li>
                        <li>• Comprehensive error logging</li>
                        <li>• Multi-tab support</li>
                        <li>• Responsive design</li>
                        <li>• Cross-platform compatibility</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}