import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Send,
  Copy,
  Plus,
  Users,
  UserMinus,
  Volume2,
  Tv,
  X,
  VolumeX,
  Sun,
  Moon,
  Smile,
  Github,
  Instagram,
  Linkedin,
  Maximize2,
  Minimize2,
  Pin,
  MoreVertical,
  Grid
} from 'lucide-react';

// Custom GOSSIP Logo SVG Component
function GossipLogo({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <path d="M 45 30 C 25 30, 15 42, 15 58 C 15 70, 22 80, 32 84 L 27 98 L 46 90 C 49 91, 52 91, 55 91 C 40 85, 36 72, 36 58 C 36 42, 45 30, 65 30 Z" fill="#3b82f6" />
      <path d="M 75 30 C 55 30, 42 42, 42 58 C 42 74, 55 86, 75 86 C 79 86, 85 85, 90 83 L 99 92 L 94 77 C 99 73, 105 65, 105 54 C 105 38, 92 30, 75 30 Z" fill="#f43f5e" />
      <circle cx="66" cy="52" r="4.5" fill="#facc15" />
      <circle cx="82" cy="52" r="4.5" fill="#facc15" />
      <path d="M 70 63 C 72 67, 76 67, 78 63" stroke="#facc15" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Avatar Predefined Lists
const AVAILABLE_EMOJIS = ['🐼', '🦊', '🦁', '🦉', '🦄', '🐱', '🐶', '🐸', '🐙', '🐒', '🐯', '🐨', '🦖', '🐝', '🐧', '🐻', '🐼', '🦊', '🦁'];
const AVAILABLE_BGS = [
  'linear-gradient(135deg, #fbbf24, #f59e0b)', // Amber/Yellow
  'linear-gradient(135deg, #3b82f6, #1d4ed8)', // Royal Blue
  'linear-gradient(135deg, #f43f5e, #be123c)', // Coral Red
  'linear-gradient(135deg, #10b981, #047857)', // Mint Green
  'linear-gradient(135deg, #8b5cf6, #5b21b6)', // Purple
  'linear-gradient(135deg, #ec4899, #be185d)', // Pink
  'linear-gradient(135deg, #06b6d4, #0891b2)', // Cyan
  'linear-gradient(135deg, #f97316, #c2410c)'  // Orange
];

const getEmojiHex = (emoji) => {
  const codePoints = [];
  let i = 0;
  while (i < emoji.length) {
    const codePoint = emoji.codePointAt(i);
    codePoints.push(codePoint.toString(16));
    i += codePoint > 0xffff ? 2 : 1;
  }
  return codePoints.filter(cp => cp !== 'fe0f').join('-');
};

const WhatsAppEmojiInline = ({ emoji, isFloating = false }) => {
  const [failed, setFailed] = useState(false);
  const hex = getEmojiHex(emoji);
  const url = `https://cdn.jsdelivr.net/gh/realityripple/emoji/whatsapp/${hex}.png`;

  if (failed) {
    return <span className={isFloating ? 'whatsapp-emoji-floating' : ''}>{emoji}</span>;
  }

  return (
    <img
      src={url}
      alt={emoji}
      className={isFloating ? 'whatsapp-emoji-floating' : 'whatsapp-emoji-inline'}
      onError={() => setFailed(true)}
    />
  );
};

const renderFormattedMessage = (text) => {
  if (!text) return '';
  const regex = /(\p{Extended_Pictographic})/gu;
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (part.match(/\p{Extended_Pictographic}/u)) {
      return <WhatsAppEmojiInline key={index} emoji={part} />;
    }
    return part;
  });
};

const WHATSAPP_PICKER_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
  '😘', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐',
  '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔',
  '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩',
  '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯',
  '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓',
  '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑',
  '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱',
  '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮',
  '🤧', '😷', '🤒', '🤕', '😈', '👿', '👹', '👺',
  '💀', '☠️', '👻', '👽', '👾', '🤖', '💩', '🤡',
  '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️',
  '🤟', '🤘', '👌', '👈', '👉', '👆', '👇', '☝️',
  '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🙏',
  '👏', '🙌', '🤝', '💅', '🤳', '✍️', '🗣️', '👤',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
  '💘', '💝', '💟', '💯', '💢', '💥', '💫', '💦',
  '💨', '💣', '💬', '💭', '💤', '🔥', '✨', '🌟',
  '⭐', '🎈', '🎉', '🎊', '🎂', '🚀', '🛸', '🎮',
  '🎲', '👑', '💎', '💍', '📢', '🎯', '👀', '🥳',
  '🍻', '🍕', '🍟', '🍩', '🥑', '🌈', '☀️', '🐱',
];

const getSenderColor = (name) => {
  if (!name) return 'var(--accent-blue)';
  const colors = [
    '#3b82f6', // Bright Blue
    '#10b981', // Mint Emerald
    '#f59e0b', // Amber/Orange
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316', // Orange-Red
    '#6366f1'  // Indigo
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

function App() {
  // Lobby Navigation & Room Settings
  const [lobbyTab, setLobbyTab] = useState('create'); // 'create' | 'join'
  const [screen, setScreen] = useState('lobby'); // 'lobby' | 'room'
  const [theme, setTheme] = useState(() => localStorage.getItem('gossip-theme') || 'light');
  const [toast, setToast] = useState({ message: '', visible: false });

  // Creation Inputs
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [initialMode, setInitialMode] = useState('chat'); // 'chat' | 'talk' | 'video'
  const [roomType, setRoomType] = useState('private'); // 'private' | 'public'
  const [hostPermissionRequired, setHostPermissionRequired] = useState(false);

  // Selected Avatar (for Guest/Host profile setup)
  const [selectedEmoji, setSelectedEmoji] = useState(AVAILABLE_EMOJIS[0]);
  const [selectedBg, setSelectedBg] = useState(AVAILABLE_BGS[0]);
  const [selectedImage, setSelectedImage] = useState('');

  // Reactions & Emojis States
  const [remoteReactions, setRemoteReactions] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // false | 'stage' | 'drawer'

  // Pinning and Fullscreen Video Call States
  const [pinnedUser, setPinnedUser] = useState(null); // null | 'me' | socketId
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoLayout, setVideoLayout] = useState('sidebar'); // 'sidebar' | 'spotlight'
  const [forceFullscreenControls, setForceFullscreenControls] = useState(false);
  const stageRef = useRef(null);

  // Active Directory for Public Rooms
  const [publicRooms, setPublicRooms] = useState([]);
  const lobbySocketRef = useRef(null);

  // Join Approval Waiting Room state
  const [joinRequestStatus, setJoinRequestStatus] = useState('none'); // 'none' | 'pending' | 'approved' | 'rejected'

  // Room State
  const [roomTitle, setRoomTitle] = useState('');
  const [roomMode, setRoomMode] = useState('chat');
  const [participants, setParticipants] = useState({}); // socketId -> { username, avatar, isHost, isCoHost }
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);

  // Host/Co-host approvals state
  const [pendingRequests, setPendingRequests] = useState([]); // Array of { socketId, username, avatar }

  // Live profile editor modal
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [editBg, setEditBg] = useState('');
  const [editImage, setEditImage] = useState('');

  // WebRTC & Media States
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // socketId -> MediaStream
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState({}); // socketId -> boolean

  // Refs
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({}); // socketId -> RTCPeerConnection
  const chatEndRef = useRef(null);
  const pendingCandidatesRef = useRef({}); // socketId -> Array of candidates

  // Audio Analysis Refs for Speaking Indicators
  const audioContextRef = useRef(null);
  const localAnalyserRef = useRef(null);
  const remoteAnalysersRef = useRef(null);
  if (!remoteAnalysersRef.current) {
    remoteAnalysersRef.current = {};
  }

  // Handle URL shareable links on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRoomId = params.get('room');
    if (urlRoomId) {
      setRoomId(urlRoomId);
      setLobbyTab('join'); // Default to join tab if room URL is opened
    }
  }, []);

  // Sync theme with document class attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gossip-theme', theme);
  }, [theme]);

  // Connect to global Lobby Directory socket to receive public room updates
  useEffect(() => {
    if (screen === 'lobby') {
      const lobbySocket = io();
      lobbySocketRef.current = lobbySocket;

      lobbySocket.on('connect', () => {
        lobbySocket.emit('join-lobby');
      });

      lobbySocket.on('public-rooms-list', (roomsList) => {
        setPublicRooms(roomsList);
      });

      return () => {
        if (lobbySocket) {
          lobbySocket.emit('leave-lobby');
          lobbySocket.disconnect();
        }
      };
    }
  }, [screen]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showChat]);

  // Voice Activity Visualizer loop
  useEffect(() => {
    let animationId;

    const checkVoiceActivity = () => {
      const activeSpeakers = {};

      if (localStreamRef.current && !micMuted && localAnalyserRef.current) {
        const dataArray = new Uint8Array(localAnalyserRef.current.frequencyBinCount);
        localAnalyserRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const average = sum / dataArray.length;
        if (average > 18) {
          activeSpeakers['me'] = true;
        }
      }

      Object.entries(remoteAnalysersRef.current).forEach(([socketId, analyser]) => {
        if (analyser) {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((acc, val) => acc + val, 0);
          const average = sum / dataArray.length;
          if (average > 18) {
            activeSpeakers[socketId] = true;
          }
        }
      });

      setSpeakingUsers(activeSpeakers);
      animationId = requestAnimationFrame(checkVoiceActivity);
    };

    if (roomMode === 'talk' || roomMode === 'video') {
      animationId = requestAnimationFrame(checkVoiceActivity);
    } else {
      setSpeakingUsers({});
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [roomMode, micMuted, remoteStreams]);

  // Fullscreen change listener to sync state (e.g. if user presses ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Theme toggle helper
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Toast helper
  const showToast = (message) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast({ message: '', visible: false });
    }, 4000);
  };

  // Extract room ID from full URL if pasted in Room ID field
  const handleRoomIdChange = (val) => {
    try {
      if (val.includes('?room=')) {
        const url = new URL(val);
        const urlRoomId = url.searchParams.get('room');
        if (urlRoomId) {
          setRoomId(urlRoomId.trim());
          return;
        }
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
    setRoomId(val);
  };

  // Helper: Request local camera/mic stream
  const acquireLocalStream = async (mode) => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    
    localAnalyserRef.current = null;

    if (mode === 'chat') {
      return null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast("Media access blocked on insecure HTTP. Please use localhost or HTTPS (e.g. ngrok).");
      return null;
    }

    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1
      },
      video: mode === 'video' ? {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 24 }
      } : false
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);
      
      setupAudioAnalysis('me', stream);

      stream.getAudioTracks().forEach(track => {
        track.enabled = !micMuted;
      });
      stream.getVideoTracks().forEach(track => {
        track.enabled = !cameraOff;
      });

      return stream;
    } catch (err) {
      console.error("Error acquiring user media:", err);
      showToast("Could not access camera/microphone. Standard chat enabled.");
      return null;
    }
  };

  // Helper: Setup Web Audio analyser node for a stream
  const setupAudioAnalysis = (id, stream) => {
    if (!stream || !stream.getAudioTracks().length) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);

      if (id === 'me') {
        localAnalyserRef.current = analyser;
      } else {
        remoteAnalysersRef.current[id] = analyser;
      }
    } catch (e) {
      console.error(`Audio analysis setup failed for: ${id}`, e);
    }
  };

  // Helper: Clean up peer connections
  const cleanUpPeers = () => {
    Object.keys(peersRef.current).forEach(socketId => {
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
      }
    });
    peersRef.current = {};
    setRemoteStreams({});
    remoteAnalysersRef.current = {};
    pendingCandidatesRef.current = {};
  };

  // WebRTC Peer Connection logic
  const initiatePeerConnection = (targetSocketId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('signal', {
          targetId: targetSocketId,
          signalData: { candidate: event.candidate }
        });
      }
    };

    pc.ontrack = (event) => {
      console.log(`Received remote track from: ${targetSocketId}`);
      const stream = event.streams[0];
      setRemoteStreams(prev => ({
        ...prev,
        [targetSocketId]: stream
      }));
      setupAudioAnalysis(targetSocketId, stream);
    };

    peersRef.current[targetSocketId] = pc;
    return pc;
  };

  // Handle profile image file upload and compression (JPEG 128x128)
  const handleImageUpload = (e, isModal = false) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image too large. Please select a file smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, 128, 128);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.75);
        
        if (isModal) {
          setEditEmoji('');
          setEditBg('transparent');
          setEditImage(base64);
        } else {
          setSelectedEmoji('');
          setSelectedBg('transparent');
          setSelectedImage(base64);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Request to join room (knocking on door)
  const submitRequestJoin = (e) => {
    e.preventDefault();
    if (!username.trim() || !roomId.trim()) return;

    // Disconnect lobby directory socket
    if (lobbySocketRef.current) {
      lobbySocketRef.current.disconnect();
      lobbySocketRef.current = null;
    }

    // Connect to room server
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      // Send a request to join to check for permissions
      socket.emit('request-join', {
        roomId: roomId.trim(),
        username: username.trim(),
        avatar: { emoji: selectedEmoji, bg: selectedBg, image: selectedImage }
      });
    });

    // Listen to approvals
    socket.on('join-request-status', ({ status }) => {
      if (status === 'approved') {
        setJoinRequestStatus('approved');
        proceedToJoinRoom();
      } else if (status === 'pending') {
        setJoinRequestStatus('pending');
      } else if (status === 'rejected') {
        setJoinRequestStatus('rejected');
        showToast("Join request was declined by the host.");
        disconnectSocket();
      }
    });
  };

  // Cancel waiting room request
  const cancelWaitingRequest = () => {
    if (socketRef.current) {
      socketRef.current.emit('cancel-join-request', { roomId: roomId.trim() });
    }
    disconnectSocket();
  };

  // Proceed with actual room entry after approval
  const proceedToJoinRoom = () => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit('join-room', {
      roomId: roomId.trim(),
      roomName: roomName.trim() || roomId.trim(),
      username: username.trim(),
      avatar: { emoji: selectedEmoji, bg: selectedBg, image: selectedImage },
      type: roomType,
      hostPermissionRequired: hostPermissionRequired
    });

    // Receive initial room details
    socket.on('room-info', async ({ name, mode, type, users, hostSocketId }) => {
      setRoomTitle(name);
      setRoomMode(mode);
      setParticipants(users);
      setScreen('room');
      setJoinRequestStatus('none');
      
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('room', roomId.trim());
      window.history.pushState({}, '', currentUrl);

      // Acquire media based on active mode
      const stream = await acquireLocalStream(mode);
      if (stream || mode === 'chat') {
        socket.emit('ready-for-call', { roomId: roomId.trim() });
      }
    });

    // A peer joins
    socket.on('user-joined', ({ socketId, username, avatar }) => {
      setParticipants(prev => ({
        ...prev,
        [socketId]: { username, avatar, isHost: false, isCoHost: false }
      }));
      showToast(`${username} joined the room.`);
      
      setMessages(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          senderId: 'system',
          senderName: 'System',
          text: `${username} joined the room.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    });

    // Handle incoming pending join requests (for Host/Co-host)
    socket.on('join-request-pending', ({ socketId, username, avatar }) => {
      setPendingRequests(prev => [...prev, { socketId, username, avatar }]);
      showToast(`${username} requested to join the room.`);
    });

    // Handle guest canceling request
    socket.on('join-request-canceled', ({ socketId }) => {
      setPendingRequests(prev => prev.filter(r => r.socketId !== socketId));
    });

    // Server sends us the list of other ready peers to initiate connections to
    socket.on('ready-peers', async (readyPeerIds) => {
      for (const peerId of readyPeerIds) {
        const pc = initiatePeerConnection(peerId);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('signal', {
            targetId: peerId,
            signalData: { sdp: offer }
          });
        } catch (err) {
          console.error("Error creating RTC offer:", err);
        }
      }
    });

    // Signaling channel
    socket.on('signal', async ({ senderId, signalData }) => {
      let pc = peersRef.current[senderId];
      if (!pc) {
        pc = initiatePeerConnection(senderId);
      }

      if (signalData.sdp) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
          if (signalData.sdp.type === 'offer') {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('signal', {
              targetId: senderId,
              signalData: { sdp: answer }
            });
          }
          
          const candidates = pendingCandidatesRef.current[senderId] || [];
          for (const cand of candidates) {
            try {
              await pc.addIceCandidate(cand);
            } catch (err) {
              console.error("Error adding queued ICE candidate:", err);
            }
          }
          pendingCandidatesRef.current[senderId] = [];
        } catch (err) {
          console.error("Error handling SDP signal:", err);
        }
      } else if (signalData.candidate) {
        const candidate = new RTCIceCandidate(signalData.candidate);
        if (pc.remoteDescription && pc.remoteDescription.type) {
          try {
            await pc.addIceCandidate(candidate);
          } catch (err) {
            console.error("Error adding ICE candidate directly:", err);
          }
        } else {
          if (!pendingCandidatesRef.current[senderId]) {
            pendingCandidatesRef.current[senderId] = [];
          }
          pendingCandidatesRef.current[senderId].push(candidate);
        }
      }
    });

    // Chat Message received
    socket.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Room mode changed (e.g. Chat -> Video Call)
    socket.on('mode-updated', async (newMode) => {
      setRoomMode(newMode);
      showToast(`Mode switched to ${newMode.toUpperCase()}. Re-connecting media...`);
      
      cleanUpPeers();
      const stream = await acquireLocalStream(newMode);
      socket.emit('ready-for-call', { roomId: roomId.trim() });
    });

    // Reaction received from a user
    socket.on('reaction-received', ({ senderId, reaction }) => {
      const reactionId = `${senderId}-${Date.now()}-${Math.random()}`;
      setRemoteReactions(prev => {
        const userReactions = prev[senderId] || [];
        return {
          ...prev,
          [senderId]: [...userReactions, { id: reactionId, emoji: reaction }]
        };
      });
      // Remove reaction after 2.2 seconds
      setTimeout(() => {
        setRemoteReactions(prev => {
          const userReactions = prev[senderId] || [];
          return {
            ...prev,
            [senderId]: userReactions.filter(r => r.id !== reactionId)
          };
        });
      }, 2200);
    });

    // Role Promotion / Demotion Sync
    socket.on('roles-updated', ({ users }) => {
      setParticipants(users);
    });

    // Real-time profile updates (avatar/nickname change)
    socket.on('profile-updated', ({ socketId, username, avatar, users }) => {
      setParticipants(users);
      
      if (socketId !== socket.id) {
        const prevName = participants[socketId]?.username || 'A member';
        showToast(`${prevName} changed their profile to ${username}.`);
      }
    });

    // Kicked Event handler
    socket.on('kicked', () => {
      showToast("You have been kicked out of the room by a moderator.");
      leaveRoom();
    });

    // Peer disconnected
    socket.on('user-left', (socketId) => {
      const leaverName = participants[socketId]?.username || 'Someone';
      
      setParticipants(prev => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });

      setMessages(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          senderId: 'system',
          senderName: 'System',
          text: `${leaverName} left the room.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      
      showToast(`${leaverName} left the room.`);

      // Clean up WebRTC peer
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
      }
      setRemoteStreams(prev => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
      if (remoteAnalysersRef.current[socketId]) {
        delete remoteAnalysersRef.current[socketId];
      }
      if (pendingCandidatesRef.current[socketId]) {
        delete pendingCandidatesRef.current[socketId];
      }
    });
  };

  // Helper: Approve or Reject a guest request
  const handleApproveRequest = (guestSocketId, approved) => {
    if (socketRef.current) {
      socketRef.current.emit('approve-join', {
        roomId: roomId.trim(),
        guestSocketId,
        approved
      });
      setPendingRequests(prev => prev.filter(r => r.socketId !== guestSocketId));
    }
  };

  // Admin action: Kick user
  const kickUser = (targetId) => {
    if (socketRef.current) {
      socketRef.current.emit('kick-user', {
        roomId: roomId.trim(),
        targetId
      });
    }
  };

  // Admin action: Toggle Co-host tag (Promote or Demote)
  const toggleCoHost = (targetId) => {
    if (socketRef.current) {
      socketRef.current.emit('toggle-cohost', {
        roomId: roomId.trim(),
        targetId
      });
    }
  };

  // Handle saving live profile edits
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    if (socketRef.current) {
      socketRef.current.emit('update-profile', {
        roomId: roomId.trim(),
        username: editName.trim(),
        avatar: { emoji: editEmoji, bg: editBg, image: editImage }
      });
      
      // Update local credentials
      setUsername(editName.trim());
      setSelectedEmoji(editEmoji);
      setSelectedBg(editBg);
      setSelectedImage(editImage);
      setShowProfileEditor(false);
      showToast("Profile updated successfully!");
    }
  };

  // Send a text chat message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current) return;
    
    socketRef.current.emit('send-message', {
      roomId: roomId.trim(),
      text: chatInput.trim()
    });
    setChatInput('');
  };

  // Toggle Microphone
  const toggleMic = () => {
    const nextMuted = !micMuted;
    setMicMuted(nextMuted);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !nextMuted;
      });
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    const nextCameraOff = !cameraOff;
    setCameraOff(nextCameraOff);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !nextCameraOff;
      });
    }
  };

  // Update room mode from controls (broadcasts to all users)
  const changeRoomMode = (newMode) => {
    if (socketRef.current) {
      socketRef.current.emit('set-mode', {
        roomId: roomId.trim(),
        newMode: newMode
      });
    }
  };

  // Copy shareable room link with fallback for insecure HTTP
  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}${window.location.pathname}?room=${roomId.trim()}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => showToast("Invite link copied to clipboard!"))
        .catch(() => fallbackCopyText(inviteLink));
    } else {
      fallbackCopyText(inviteLink);
    }
  };

  const fallbackCopyText = (text) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        showToast("Invite link copied!");
      } else {
        showToast(`Please manually copy: ${text}`);
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      showToast(`Copy failed. Share code: ${roomId.trim()}`);
    }
  };

  // Send reaction (voice/video calls)
  const sendReaction = (emoji) => {
    if (socketRef.current) {
      socketRef.current.emit('send-reaction', {
        roomId: roomId.trim(),
        reaction: emoji
      });
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!stageRef.current) return;
    if (!document.fullscreenElement) {
      stageRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Error enabling fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Toggle pinned participant
  const handleTogglePin = (id) => {
    setPinnedUser(prev => prev === id ? null : id);
  };

  // Render modular local video frame
  const renderLocalVideoFrame = (isPinned = false) => {
    return (
      <div className={`video-frame ${speakingUsers['me'] ? 'speaking' : ''} ${isPinned ? 'pinned-frame' : ''}`}>
        <div className="floating-reactions-container">
          {(remoteReactions[socketRef.current?.id] || []).map(r => (
            <span key={r.id} className="floating-reaction">
              <WhatsAppEmojiInline emoji={r.emoji} isFloating={true} />
            </span>
          ))}
        </div>
        
        <button
          type="button"
          onClick={() => handleTogglePin('me')}
          className={`video-pin-btn ${pinnedUser === 'me' ? 'pinned' : ''}`}
          title={pinnedUser === 'me' ? "Unpin Video" : "Pin Video"}
        >
          <Pin size={14} style={{ transform: pinnedUser === 'me' ? 'none' : 'rotate(45deg)' }} />
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="video-fullscreen-corner-btn"
          title="Toggle Fullscreen Mode"
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>

        {cameraOff ? (
          <div className="video-placeholder">
            <div className="placeholder-avatar" style={{ background: myAvatar.bg, color: 'white', overflow: 'hidden' }}>
              {myAvatar.image ? (
                <img src={myAvatar.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                myAvatar.emoji
              )}
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-secondary)' }}>Camera Off</span>
          </div>
        ) : (
          localStream && (
            <video
              className="video-element"
              ref={(el) => {
                if (el && el.srcObject !== localStream) {
                  el.srcObject = localStream;
                }
              }}
              autoPlay
              playsInline
              muted
            />
          )
        )}
        <div className="video-overlay" style={{ pointerEvents: 'auto' }}>
          <span
            className="video-username-badge"
            onClick={() => {
              setEditName(username);
              setEditEmoji(myAvatar.emoji);
              setEditBg(myAvatar.bg);
              setShowProfileEditor(true);
            }}
            style={{ cursor: 'pointer' }}
            title="Click to edit profile"
          >
            {username} (You)
          </span>
          <div className="video-status-icons">
            {micMuted && (
              <div className="status-icon-badge off">
                <MicOff size={14} />
              </div>
            )}
            {cameraOff && (
              <div className="status-icon-badge off">
                <VideoOff size={14} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render modular remote video frame
  const renderRemoteVideoFrame = (socketId, isPinned = false) => {
    const p = participants[socketId];
    if (!p) return null;
    const stream = remoteStreams[socketId];
    const hasVideo = stream && stream.getVideoTracks().length > 0;
    
    return (
      <div key={socketId} className={`video-frame ${speakingUsers[socketId] ? 'speaking' : ''} ${isPinned ? 'pinned-frame' : ''}`}>
        <div className="floating-reactions-container">
          {(remoteReactions[socketId] || []).map(r => (
            <span key={r.id} className="floating-reaction">
              <WhatsAppEmojiInline emoji={r.emoji} isFloating={true} />
            </span>
          ))}
        </div>
        
        <button
          type="button"
          onClick={() => handleTogglePin(socketId)}
          className={`video-pin-btn ${pinnedUser === socketId ? 'pinned' : ''}`}
          title={pinnedUser === socketId ? "Unpin Video" : "Pin Video"}
        >
          <Pin size={14} style={{ transform: pinnedUser === socketId ? 'none' : 'rotate(45deg)' }} />
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="video-fullscreen-corner-btn"
          title="Toggle Fullscreen Mode"
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>

        {!stream || !hasVideo ? (
          <div className="video-placeholder">
            <div className="placeholder-avatar" style={{ background: p.avatar?.bg || 'var(--bg-secondary)', overflow: 'hidden' }}>
              {p.avatar?.image ? (
                <img src={p.avatar.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                p.avatar?.emoji || '🐼'
              )}
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {!stream ? 'Connecting...' : 'Camera Off'}
            </span>
          </div>
        ) : null}

        {stream && (
          <video
            className="video-element remote"
            style={{ display: hasVideo ? 'block' : 'none' }}
            ref={(el) => {
              if (el && el.srcObject !== stream) {
                el.srcObject = stream;
              }
            }}
            autoPlay
            playsInline
          />
        )}

        <div className="video-overlay">
          <span className="video-username-badge">
            {p.username}
            {p.isHost && <span className="user-badge host">Host</span>}
            {p.isCoHost && <span className="user-badge cohost">Co-host</span>}
          </span>
        </div>
      </div>
    );
  };

  // Disconnect socket clean helper
  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setJoinRequestStatus('none');
    setPendingRequests([]);
    setRemoteReactions({});
    setPinnedUser(null);
  };

  // Exit Room
  const leaveRoom = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    cleanUpPeers();
    disconnectSocket();

    setScreen('lobby');
    setParticipants({});
    setMessages([]);
    setMicMuted(false);
    setCameraOff(false);
    setRemoteReactions({});
    setPinnedUser(null);

    // Clean query parameters
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('room');
    window.history.pushState({}, '', currentUrl);
  };

  // Extract roles of self
  const myUserId = socketRef.current?.id;
  const isHost = participants[myUserId]?.isHost || false;
  const isCoHost = participants[myUserId]?.isCoHost || false;
  const myAvatar = participants[myUserId]?.avatar || { emoji: selectedEmoji, bg: selectedBg };

  // Render Lobby screen
  if (screen === 'lobby') {
    return (
      <div className="welcome-screen">
        
        {/* Waiting Room Overlay */}
        {joinRequestStatus === 'pending' && (
          <div className="waiting-overlay">
            <div className="waiting-card">
              <h2 className="waiting-title">Waiting Room</h2>
              <div className="spinner"></div>
              <p className="waiting-desc">
                Knocking on room doors... Please wait for the Host or Co-hosts to approve your entry.
              </p>
              <button onClick={cancelWaitingRequest} className="btn btn-danger" style={{ width: '100%' }}>
                Cancel Request
              </button>
            </div>
          </div>
        )}

        <div className="welcome-card">
          {/* Lobby Theme Toggle Button */}
          <div className="theme-toggle-lobby">
            <button
              onClick={toggleTheme}
              className="theme-btn"
              type="button"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>

          <div className="logo-container">
            <div className="logo-icon-wrapper">
              <GossipLogo className="logo-svg" />
              <h1 className="logo-icon">GOSSIP</h1>
            </div>
            <p className="welcome-subtitle">Premium Real-Time Named Video, Voice, & Text Rooms</p>
          </div>

          {/* Tab Selection */}
          <div className="lobby-tabs">
            <button
              type="button"
              className={`lobby-tab-btn ${lobbyTab === 'create' ? 'active' : ''}`}
              onClick={() => setLobbyTab('create')}
            >
              Create Room
            </button>
            <button
              type="button"
              className={`lobby-tab-btn ${lobbyTab === 'join' ? 'active' : ''}`}
              onClick={() => setLobbyTab('join')}
            >
              Browse Public
            </button>
          </div>

          {/* Lobby Configuration Forms */}
          <form onSubmit={submitRequestJoin}>
            <div className="form-group">
              <label className="form-label">Your Nickname</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Alice"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Lobby Avatar Picker Grid */}
            <div className="avatar-preview-container">
              <span className="avatar-picker-title">Select Avatar Character</span>
              <div className="avatar-preview-circle" style={{ background: selectedBg, overflow: 'hidden' }}>
                {selectedImage ? (
                  <img src={selectedImage} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  selectedEmoji
                )}
              </div>
              <div className="avatar-picker-scrollable">
                <div className="avatar-picker-grid">
                  {AVAILABLE_EMOJIS.map((emoji, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedEmoji(emoji);
                        setSelectedImage('');
                        setSelectedBg(AVAILABLE_BGS[0]);
                      }}
                      className={`avatar-emoji-option ${selectedEmoji === emoji && !selectedImage ? 'selected' : ''}`}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <div className="avatar-picker-bg-list">
                  {AVAILABLE_BGS.map((bg, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedBg(bg);
                        setSelectedImage('');
                      }}
                      className={`avatar-bg-option ${selectedBg === bg && !selectedImage ? 'selected' : ''}`}
                      style={{ background: bg }}
                    />
                  ))}
                </div>
                {/* Custom File Upload for DP */}
                <div style={{ marginTop: '6px', textAlign: 'left', width: '100%' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Or Upload Custom DP</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={(e) => handleImageUpload(e, false)}
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  />
                </div>
              </div>
            </div>

            {lobbyTab === 'create' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Room ID / Join Code</label>
                  <div className="room-input-container">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., product-sync"
                      value={roomId}
                      onChange={(e) => handleRoomIdChange(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      title="Generate Random Code"
                      onClick={() => {
                        const randCode = Math.random().toString(36).substring(2, 10);
                        setRoomId(randCode);
                      }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Room Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Product Planning Sync"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                </div>

                {/* Public vs Private Room Settings */}
                <div className="form-group">
                  <label className="form-label">Room Privacy</label>
                  <div className="mode-selector" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    <button
                      type="button"
                      className={`mode-option ${roomType === 'private' ? 'active' : ''}`}
                      onClick={() => setRoomType('private')}
                    >
                      <span>Private (Direct Link)</span>
                    </button>
                    <button
                      type="button"
                      className={`mode-option ${roomType === 'public' ? 'active' : ''}`}
                      onClick={() => setRoomType('public')}
                    >
                      <span>Public (Listed)</span>
                    </button>
                  </div>
                </div>

                {/* Conditional Host Permission Toggle */}
                {roomType === 'public' && (
                  <div className="room-settings-row">
                    <div className="settings-label-group">
                      <span className="settings-label-title">Host Permission Required</span>
                      <span className="settings-label-desc">Require approval before entry</span>
                    </div>
                    <div>
                      <input
                        id="perm-toggle"
                        type="checkbox"
                        className="toggle-switch-input"
                        checked={hostPermissionRequired}
                        onChange={(e) => setHostPermissionRequired(e.target.checked)}
                      />
                      <label htmlFor="perm-toggle" className="toggle-switch-label" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Join Tab: Browse Active Public Rooms Directory
              <div className="form-group">
                <label className="form-label">Browse Active Public Rooms</label>
                <div className="public-rooms-dir">
                  {publicRooms.length === 0 ? (
                    <div className="empty-dir-state">
                      <span>No active public rooms listed.</span>
                      <span style={{ fontSize: '0.75rem', marginTop: '6px', fontWeight: 'normal' }}>
                        Create one using the tab above!
                      </span>
                    </div>
                  ) : (
                    publicRooms.map((room) => (
                      <button
                        type="button"
                        key={room.roomId}
                        onClick={() => {
                          setRoomId(room.roomId);
                          setRoomName(room.name);
                        }}
                        className={`public-room-card ${roomId === room.roomId ? 'selected' : ''}`}
                        style={{
                          width: '100%',
                          cursor: 'pointer',
                          borderColor: roomId === room.roomId ? 'var(--border-focus)' : 'var(--border-color)',
                          background: roomId === room.roomId ? 'var(--bg-secondary)' : 'var(--bg-card)'
                        }}
                      >
                        <div className="public-room-info">
                          <span className="public-room-title">{room.name}</span>
                          <div className="public-room-meta">
                            <span className="room-type-pill">Code: {room.roomId}</span>
                            {room.hostPermissionRequired && (
                              <span className="room-type-pill" style={{ color: 'var(--accent-red)' }}>Approval Required</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                          <Users size={16} />
                          <span>{room.participantCount}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                
                {/* Manual Code override box in Join tab */}
                <div style={{ marginTop: '16px' }}>
                  <label className="form-label">Selected Room ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Select room above or enter code manually"
                    value={roomId}
                    onChange={(e) => handleRoomIdChange(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '18px' }}>
              {lobbyTab === 'create' ? 'Create & Enter Room' : 'Enter Room'}
            </button>
          </form>
        </div>
        <footer className="lobby-footer">
          <p className="made-by-text">Made By Pravin</p>
          <div className="social-links-row">
            <a href="https://github.com/pravintiwary21-tech" target="_blank" rel="noopener noreferrer" title="GitHub" className="social-icon-link">
              <Github size={20} />
            </a>
            <a href="https://www.instagram.com/pravin_x" target="_blank" rel="noopener noreferrer" title="Instagram" className="social-icon-link">
              <Instagram size={20} />
            </a>
            <a href="https://www.linkedin.com/in/pravin-kumar-tiwary-ab15a636b" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="social-icon-link">
              <Linkedin size={20} />
            </a>
          </div>
        </footer>
      </div>
    );
  }

  // Render Room screen
  return (
    <div className={`app-container room-container ${showChat ? '' : 'chat-collapsed'}`}>
      
      {/* Toast notifications */}
      {toast.visible && (
        <div className="toast-notification">
          <span>{toast.message}</span>
        </div>
      )}

      {/* Floating Host Approval Requests Prompt Dialog */}
      {pendingRequests.length > 0 && (
        <div className="approval-modal-backdrop">
          <div className="approval-modal">
            <h3 className="approval-header">Join Request</h3>
            <div className="approval-user-info">
              <div className="avatar-preview-circle" style={{ background: pendingRequests[0].avatar.bg, overflow: 'hidden' }}>
                {pendingRequests[0].avatar.image ? (
                  <img src={pendingRequests[0].avatar.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  pendingRequests[0].avatar.emoji
                )}
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{pendingRequests[0].username}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>wants to join your room.</span>
            </div>
            <div className="modal-action-row">
              <button
                onClick={() => handleApproveRequest(pendingRequests[0].socketId, false)}
                className="btn btn-secondary"
              >
                Reject
              </button>
              <button
                onClick={() => handleApproveRequest(pendingRequests[0].socketId, true)}
                className="btn btn-primary"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Profile Editor Modal (Change avatar/nickname inside the room) */}
      {showProfileEditor && (
        <div className="profile-modal-backdrop">
          <div className="profile-modal">
            <h3 className="profile-modal-title">Edit Your Profile</h3>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Update Nickname</label>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              {/* Avatar Selector in Modal */}
              <div className="avatar-preview-container">
                <span className="avatar-picker-title">Select New Avatar</span>
                <div className="avatar-preview-circle" style={{ background: editBg, overflow: 'hidden' }}>
                  {editImage ? (
                    <img src={editImage} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    editEmoji
                  )}
                </div>
                <div className="avatar-picker-scrollable">
                  <div className="avatar-picker-grid">
                    {AVAILABLE_EMOJIS.map((emoji, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setEditEmoji(emoji);
                          setEditImage('');
                          setEditBg(AVAILABLE_BGS[0]);
                        }}
                        className={`avatar-emoji-option ${editEmoji === emoji && !editImage ? 'selected' : ''}`}
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <div className="avatar-picker-bg-list">
                    {AVAILABLE_BGS.map((bg, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setEditBg(bg);
                          setEditImage('');
                        }}
                        className={`avatar-bg-option ${editBg === bg && !editImage ? 'selected' : ''}`}
                        style={{ background: bg }}
                      />
                    ))}
                  </div>
                  {/* Custom File Upload for Modal DP */}
                  <div style={{ marginTop: '6px', textAlign: 'left', width: '100%' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Or Upload Custom DP</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-input"
                      onChange={(e) => handleImageUpload(e, true)}
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-action-row">
                <button
                  type="button"
                  onClick={() => setShowProfileEditor(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <aside className="room-sidebar">
        <div className="sidebar-header">
          <GossipLogo className="sidebar-logo-svg" />
          <div className="sidebar-logo">GOSSIP</div>
        </div>

        <div className="room-details">
          <h2 className="room-name-title">{roomTitle}</h2>
          <div className="room-id-badge" onClick={copyInviteLink}>
            <span>Code: {roomId}</span>
            <Copy size={12} />
          </div>
        </div>

        <div className="participants-list">
          <h3 className="section-title">Participants ({Object.keys(participants).length + 1})</h3>
          
          {/* Me */}
          <div
            className="participant-item sidebar-self-profile"
            onClick={() => {
              setEditName(username);
              setEditEmoji(myAvatar.emoji);
              setEditBg(myAvatar.bg);
              setShowProfileEditor(true);
            }}
            title="Click to edit your profile"
          >
            <div className="participant-avatar" style={{ background: myAvatar.bg, overflow: 'hidden' }}>
              {myAvatar.image ? (
                <img src={myAvatar.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                myAvatar.emoji
              )}
            </div>
            <span className="participant-name" style={{ fontWeight: 600 }}>
              {username} (You)
            </span>
            {isHost && <span className="user-badge host">Host</span>}
            {isCoHost && <span className="user-badge cohost">Co-host</span>}
            <div className="participant-status me"></div>
          </div>

          {/* Remote users */}
          {Object.entries(participants).map(([socketId, p]) => (
            <div className="participant-item" key={socketId}>
              <div className="participant-avatar" style={{ background: p.avatar?.bg || 'var(--bg-secondary)', overflow: 'hidden' }}>
                {p.avatar?.image ? (
                  <img src={p.avatar.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  p.avatar?.emoji || '🐼'
                )}
              </div>
              <span className="participant-name">
                {p.username}
              </span>
              {p.isHost && <span className="user-badge host">Host</span>}
              {p.isCoHost && <span className="user-badge cohost">Co-host</span>}
              
              <div className="participant-status"></div>

              {/* Admin Actions (Visible to Host/Co-host on hover) */}
              {(isHost || isCoHost) && !p.isHost && (!p.isCoHost || isHost) && (
                <div className="participant-actions-container">
                  {isHost && (
                    p.isCoHost ? (
                      <button
                        onClick={() => toggleCoHost(socketId)}
                        className="action-icon-btn promote"
                        style={{ background: 'var(--accent-red)', color: 'white' }}
                        title="Remove Co-host Tag"
                      >
                        <UserMinus size={12} />
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleCoHost(socketId)}
                        className="action-icon-btn promote"
                        title="Promote to Co-host"
                      >
                        <Users size={12} />
                      </button>
                    )
                  )}
                  <button
                    onClick={() => kickUser(socketId)}
                    className="action-icon-btn kick"
                    title="Kick Member"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Center stage area */}
      <main className={`room-stage ${isFullscreen ? 'fullscreen-active' : ''} ${forceFullscreenControls ? 'controls-forced' : ''}`} ref={stageRef}>
        {isFullscreen && (
          <button
            onClick={() => setForceFullscreenControls(prev => !prev)}
            className={`fullscreen-options-toggle ${forceFullscreenControls ? 'active' : ''}`}
            title="Toggle Controls Panel"
          >
            <MoreVertical size={20} />
          </button>
        )}
        <header className="stage-header">
          <div className="mode-badge">
            {roomMode === 'chat' && <MessageSquare size={16} />}
            {roomMode === 'talk' && <Volume2 size={16} />}
            {roomMode === 'video' && <Tv size={16} />}
            <span style={{ marginLeft: '6px' }}>{roomMode === 'chat' ? 'Text Chat' : roomMode === 'talk' ? 'Voice Call' : 'Video Call'}</span>
          </div>

          <div className="header-right-controls">
            {/* Theme Toggle Button inside Room Stage */}
            <button
              onClick={toggleTheme}
              className="theme-btn"
              type="button"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              style={{ width: '40px', height: '40px' }}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Fullscreen Toggle Button */}
            <button
              onClick={toggleFullscreen}
              className="theme-btn"
              type="button"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            {/* Toggle Chat Drawer Button */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`control-btn ${showChat ? 'active' : ''}`}
              title="Toggle Chat Sidebar"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            >
              <MessageSquare size={18} />
            </button>
          </div>
        </header>

        <section className="stage-content">
          
          {/* Text Chat Only View */}
          {roomMode === 'chat' && (
            <div className="stage-chat-view">
              <div className="chat-messages-container">
                {messages.length === 0 ? (
                  <div className="message-bubble system">Welcome to {roomTitle}! Type a message below to start chatting.</div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-row ${
                        msg.senderId === 'system'
                          ? 'system'
                          : msg.senderId === socketRef.current?.id
                          ? 'outgoing'
                          : 'incoming'
                      }`}
                    >
                      {msg.senderId !== 'system' && msg.senderId !== socketRef.current?.id && (
                        <div className="message-avatar-circle" style={{ background: msg.senderAvatar?.bg || 'var(--bg-secondary)', overflow: 'hidden' }}>
                          {msg.senderAvatar?.image ? (
                            <img src={msg.senderAvatar.image} alt="Sender DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            msg.senderAvatar?.emoji || '🐼'
                          )}
                        </div>
                      )}
                      <div className="message-bubble">
                        {msg.senderId !== 'system' && (
                          <div className="message-header">
                            <span className="message-sender" style={{ color: getSenderColor(msg.senderName) }}>{msg.senderName}</span>
                            <span className="message-time">{msg.timestamp}</span>
                          </div>
                        )}
                        <div className="message-text">{renderFormattedMessage(msg.text)}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="chat-input-form">
                <div className="chat-emoji-picker-container">
                  <button
                    type="button"
                    className="emoji-picker-toggle-btn"
                    onClick={() => setShowEmojiPicker(prev => prev === 'stage' ? false : 'stage')}
                    title="Insert Emoji"
                  >
                    <Smile size={20} />
                  </button>
                  {showEmojiPicker === 'stage' && (
                    <div className="chat-emoji-picker-popup" style={{ right: 'auto', left: 0 }}>
                      {WHATSAPP_PICKER_EMOJIS.map(emoji => (
                        <div
                          key={emoji}
                          onClick={() => {
                            setChatInput(prev => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="chat-emoji-option"
                          title={emoji}
                        >
                          <WhatsAppEmojiInline emoji={emoji} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="chat-input"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="chat-send-btn">
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}

          {/* Talk / Voice Call View */}
          {roomMode === 'talk' && (
            <div className="talk-grid-container">
              {/* Local Participant Card */}
              <div
                className={`talk-card ${speakingUsers['me'] ? 'speaking' : ''}`}
                onClick={() => {
                  setEditName(username);
                  setEditEmoji(myAvatar.emoji);
                  setEditBg(myAvatar.bg);
                  setShowProfileEditor(true);
                }}
                style={{ cursor: 'pointer' }}
                title="Click to edit your profile"
              >
                <div className="talk-card-avatar" style={{ background: myAvatar.bg, color: 'white', overflow: 'hidden' }}>
                  {myAvatar.image ? (
                    <img src={myAvatar.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    myAvatar.emoji
                  )}
                </div>
                <div className="audio-pulse-ring"></div>
                <div className="floating-reactions-container">
                  {(remoteReactions[socketRef.current?.id] || []).map(r => (
                    <span key={r.id} className="floating-reaction">{r.emoji}</span>
                  ))}
                </div>
                <div className="talk-card-username">{username} (You)</div>
                <div className="talk-card-status">
                  {micMuted ? <MicOff size={16} className="talk-card-muted" /> : <Volume2 size={16} style={{ color: 'var(--border-focus)' }} />}
                </div>
              </div>

              {/* Remote Participants Cards */}
              {Object.entries(participants).map(([socketId, p]) => (
                <div key={socketId} className={`talk-card ${speakingUsers[socketId] ? 'speaking' : ''}`}>
                  <div className="talk-card-avatar" style={{ background: p.avatar?.bg || 'var(--bg-secondary)', overflow: 'hidden' }}>
                    {p.avatar?.image ? (
                      <img src={p.avatar.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      p.avatar?.emoji || '🐼'
                    )}
                  </div>
                  <div className="audio-pulse-ring"></div>
                  <div className="floating-reactions-container">
                    {(remoteReactions[socketId] || []).map(r => (
                      <span key={r.id} className="floating-reaction">{r.emoji}</span>
                    ))}
                  </div>
                  <div className="talk-card-username">
                    {p.username}
                    {p.isHost && <span className="user-badge host" style={{ transform: 'scale(0.8)', marginLeft: '2px' }}>H</span>}
                    {p.isCoHost && <span className="user-badge cohost" style={{ transform: 'scale(0.8)', marginLeft: '2px' }}>C</span>}
                  </div>
                  
                  {remoteStreams[socketId] && (
                    <audio
                      ref={(el) => {
                        if (el && el.srcObject !== remoteStreams[socketId]) {
                          el.srcObject = remoteStreams[socketId];
                        }
                      }}
                      autoPlay
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Video Call View */}
          {roomMode === 'video' && (
            pinnedUser ? (
              videoLayout === 'spotlight' ? (
                <div className="video-grid-container spotlight-active">
                  <div className="pinned-video-main spotlight-only">
                    {pinnedUser === 'me' ? (
                      renderLocalVideoFrame(true)
                    ) : (
                      renderRemoteVideoFrame(pinnedUser, true)
                    )}
                  </div>
                </div>
              ) : (
                <div className="video-grid-container pinned-active">
                  <div className="pinned-video-main">
                    {pinnedUser === 'me' ? (
                      renderLocalVideoFrame(true)
                    ) : (
                      renderRemoteVideoFrame(pinnedUser, true)
                    )}
                  </div>
                  <div className="pinned-video-strip">
                    {pinnedUser !== 'me' && renderLocalVideoFrame(false)}
                    {Object.keys(remoteStreams).map(socketId => {
                      if (pinnedUser === socketId) return null;
                      return renderRemoteVideoFrame(socketId, false);
                    })}
                  </div>
                </div>
              )
            ) : (
              <div className={`video-grid-container peers-${Object.keys(remoteStreams).length}`}>
                {renderLocalVideoFrame(false)}
                {Object.keys(remoteStreams).map(socketId => renderRemoteVideoFrame(socketId, false))}
              </div>
            )
          )}

        </section>

        {/* Quick Reactions Bar (Visible during active calls) */}
        {(roomMode === 'talk' || roomMode === 'video') && (
          <div className="reactions-quick-bar">
            {['❤️', '👍', '👏', '😂', '🔥', '🎉'].map(emoji => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="reaction-trigger-btn"
                title={`Send ${emoji} Reaction`}
              >
                <WhatsAppEmojiInline emoji={emoji} />
              </button>
            ))}
          </div>
        )}

        {/* Action Controls Bar */}
        <footer className="controls-bar">
          
          {(roomMode === 'talk' || roomMode === 'video') && (
            <>
              {/* Mic Toggle Button */}
              <button
                onClick={toggleMic}
                className={`control-btn ${micMuted ? 'muted' : 'active'}`}
                title={micMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {micMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* Video Toggle Button (only for Video mode) */}
              {roomMode === 'video' && (
                <>
                  <button
                    onClick={toggleCamera}
                    className={`control-btn ${cameraOff ? 'muted' : 'active'}`}
                    title={cameraOff ? "Turn Camera On" : "Turn Camera Off"}
                  >
                    {cameraOff ? <VideoOff size={20} /> : <Video size={20} />}
                  </button>

                  {/* Google Meet style Layout arrangement Switcher (when someone is pinned) */}
                  {pinnedUser && (
                    <button
                      onClick={() => setVideoLayout(prev => prev === 'sidebar' ? 'spotlight' : 'sidebar')}
                      className={`control-btn ${videoLayout === 'spotlight' ? 'active' : ''}`}
                      title={videoLayout === 'sidebar' ? "Switch to Spotlight View (Google Meet)" : "Switch to Sidebar View (Google Meet)"}
                    >
                      {videoLayout === 'sidebar' ? <Tv size={20} /> : <Grid size={20} />}
                    </button>
                  )}
                </>
              )}
            </>
          )}

          {/* Mode Switcher Group (Only visible to Host/Co-host) */}
          {(isHost || isCoHost) ? (
            <div className="mode-controls-group">
              <button
                onClick={() => changeRoomMode('chat')}
                className={`mode-control-tab ${roomMode === 'chat' ? 'active' : ''}`}
              >
                <MessageSquare size={14} />
                <span>Chat</span>
              </button>
              <button
                onClick={() => changeRoomMode('talk')}
                className={`mode-control-tab ${roomMode === 'talk' ? 'active' : ''}`}
              >
                <Volume2 size={14} />
                <span>Talk</span>
              </button>
              <button
                onClick={() => changeRoomMode('video')}
                className={`mode-control-tab ${roomMode === 'video' ? 'active' : ''}`}
              >
                <Tv size={14} />
                <span>Video</span>
              </button>
            </div>
          ) : (
            // Non-moderators see static indicator
            <div className="mode-badge" style={{ background: 'var(--bg-primary)' }}>
              <span>Moderated Room Call</span>
            </div>
          )}

          {/* Leave Room Button */}
          <button onClick={leaveRoom} className="btn btn-danger control-btn-leave">
            <PhoneOff size={16} />
            <span>Leave</span>
          </button>
        </footer>
      </main>

      {/* Right Chat Drawer (displays concurrently side-by-side during calls) */}
      {roomMode !== 'chat' && (
        <aside className="room-chat-drawer">
          <header className="drawer-header">
            <h3 className="drawer-title">Room Chat</h3>
            <button
              onClick={() => setShowChat(false)}
              className="btn btn-secondary"
              style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%' }}
            >
              <X size={16} />
            </button>
          </header>

          <div className="chat-messages-container">
            {messages.length === 0 ? (
              <div className="message-bubble system">No messages yet. Send one below!</div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-row ${
                    msg.senderId === 'system'
                      ? 'system'
                      : msg.senderId === socketRef.current?.id
                      ? 'outgoing'
                      : 'incoming'
                  }`}
                >
                  {msg.senderId !== 'system' && msg.senderId !== socketRef.current?.id && (
                    <div className="message-avatar-circle" style={{ background: msg.senderAvatar?.bg || 'var(--bg-secondary)', overflow: 'hidden' }}>
                      {msg.senderAvatar?.image ? (
                        <img src={msg.senderAvatar.image} alt="Sender DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        msg.senderAvatar?.emoji || '🐼'
                      )}
                    </div>
                  )}
                  <div className="message-bubble">
                    {msg.senderId !== 'system' && (
                      <div className="message-header">
                        <span className="message-sender" style={{ color: getSenderColor(msg.senderName) }}>{msg.senderName}</span>
                        <span className="message-time">{msg.timestamp}</span>
                      </div>
                    )}
                    <div className="message-text">{renderFormattedMessage(msg.text)}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <div className="chat-emoji-picker-container">
              <button
                type="button"
                className="emoji-picker-toggle-btn"
                onClick={() => setShowEmojiPicker(prev => prev === 'drawer' ? false : 'drawer')}
                title="Insert Emoji"
              >
                <Smile size={20} />
              </button>
              {showEmojiPicker === 'drawer' && (
                <div className="chat-emoji-picker-popup">
                  {WHATSAPP_PICKER_EMOJIS.map(emoji => (
                    <div
                      key={emoji}
                      onClick={() => {
                        setChatInput(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="chat-emoji-option"
                      title={emoji}
                    >
                      <WhatsAppEmojiInline emoji={emoji} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Type a message..."
              className="chat-input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" className="chat-send-btn">
              <Send size={16} />
            </button>
          </form>
        </aside>
      )}

    </div>
  );
}

export default App;
