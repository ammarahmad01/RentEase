import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, User, ArrowLeft, Send, 
  Calendar, Package, Clock, Loader2
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { toast } from 'sonner';

const Messages = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  
  // Parse query params if they exist (for direct message from item/booking)
  const queryParams = new URLSearchParams(location.search);
  const recipientIdParam = queryParams.get('recipientId');
  const itemIdParam = queryParams.get('itemId');
  const bookingIdParam = queryParams.get('bookingId');

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // For starting a new conversation from parameters
  const [recipientId, setRecipientId] = useState(recipientIdParam || null);
  const [itemId, setItemId] = useState(itemIdParam || null);
  const [bookingId, setBookingId] = useState(bookingIdParam || null);
  const [directMessageMode, setDirectMessageMode] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [item, setItem] = useState(null);
  const [booking, setBooking] = useState(null);

  // Fetch conversations on component mount
  useEffect(() => {
    if (!token) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchConversations();
        
        if (recipientIdParam) {
          setDirectMessageMode(true);
          await fetchRecipientInfo(recipientIdParam);
          
          if (itemIdParam) {
            await fetchItemInfo(itemIdParam);
          }
          
          if (bookingIdParam) {
            await fetchBookingInfo(bookingIdParam);
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Handle manual scrolling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Consider user has scrolled if they move more than 50px from top
      if (scrollTop > 50) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
      // If user is near the bottom (within 100px), mark as scrolled to bottom
      if (scrollHeight - scrollTop - clientHeight < 100) {
        setHasScrolled(true);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    if (lastMessageRef.current && hasScrolled) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/messages', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      setConversations(data);
      
      if (data.length > 0 && !selectedConversation && !directMessageMode) {
        await fetchConversationDetails(data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  };

  const fetchConversationDetails = async (conversationId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/messages/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch conversation details');
      
      const data = await response.json();
      setSelectedConversation(data);
      setDirectMessageMode(false);
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      toast.error('Failed to load conversation');
    }
  };

  const fetchRecipientInfo = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch recipient info');
      
      const data = await response.json();
      setRecipient(data);
    } catch (error) {
      console.error('Error fetching recipient:', error);
      toast.error('Failed to load recipient info');
    }
  };

  const fetchItemInfo = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/items/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch item info');
      
      const data = await response.json();
      setItem(data);
    } catch (error) {
      console.error('Error fetching item:', error);
      toast.error('Failed to load item info');
    }
  };

  const fetchBookingInfo = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/bookings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch booking info');
      
      const data = await response.json();
      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to load booking info');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setSendingMessage(true);
      
      let apiData = {};
      
      if (directMessageMode) {
        apiData = {
          recipientId,
          content: newMessage,
          ...(itemId && { itemId }),
          ...(bookingId && { bookingId }),
        };
      } else {
        apiData = {
          recipientId: selectedConversation.participants.find(
            p => p._id.toString() !== user._id.toString()
          )._id,
          content: newMessage,
          ...(selectedConversation.item && { itemId: selectedConversation.item._id }),
          ...(selectedConversation.booking && { bookingId: selectedConversation.booking._id }),
        };
      }
      
      const response = await fetch('http://localhost:4000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      
      setNewMessage('');
      
      if (directMessageMode) {
        setDirectMessageMode(false);
        setSelectedConversation(data);
      } else {
        setSelectedConversation(data);
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv._id === data._id ? data : conv
          )
        );
      }
      
      await fetchConversations();
      
      if (hasScrolled) {
        scrollToBottom();
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation || !conversation.participants) return { name: 'Unknown' };
    return conversation.participants.find(p => p._id.toString() !== user?._id.toString()) || { name: 'Unknown' };
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-50 min-h-[80vh]">
      <div className="mb-8 text-center">
        <span className="px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">Messages</span>
        <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-4 text-gray-800">Your Conversations</h1>
        <div className="w-16 h-1 bg-blue-600 mx-auto mb-6"></div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Connect with renters and owners to coordinate your rentals
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[70vh] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="lg:w-1/3 bg-white border-r border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
              All Conversations
            </h2>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map(conversation => (
                <div 
                  key={conversation._id} 
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-all duration-200 ${
                    selectedConversation?._id === conversation._id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => fetchConversationDetails(conversation._id)}
                >
                  <div className="flex items-center mb-2">
                    {getOtherParticipant(conversation).profileImage ? (
                      <img 
                        src={getOtherParticipant(conversation).profileImage} 
                        alt={getOtherParticipant(conversation).name}
                        className="h-10 w-10 rounded-full mr-3 object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">
                        {getOtherParticipant(conversation).name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{getOtherParticipant(conversation).name}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(conversation.lastUpdated).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  {conversation.item && (
                    <div className="flex items-center text-xs text-gray-600 mb-2">
                      <Package className="h-4 w-4 mr-1 text-blue-600" />
                      <span className="truncate">{conversation.item.title}</span>
                    </div>
                  )}
                  
                  {conversation.messages.length > 0 && (
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.messages[conversation.messages.length - 1].content}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No conversations yet. Start one by messaging an owner or renter!
              </div>
            )}
          </div>
        </div>
        
        {/* Conversation Area */}
        <div className="lg:w-2/3 flex flex-col">
          {selectedConversation || directMessageMode ? (
            <>
              {/* Conversation Header */}
              <div className="p-6 border-b border-gray-100 bg-white">
                <div className="flex items-center">
                  {directMessageMode && (
                    <button 
                      onClick={() => {
                        setDirectMessageMode(false);
                        if (conversations.length > 0) {
                          fetchConversationDetails(conversations[0]._id);
                        } else {
                          setSelectedConversation(null);
                        }
                      }}
                      className="mr-3 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                  )}
                  
                  <div className="flex items-center flex-1">
                    {directMessageMode ? (
                      recipient?.profileImage ? (
                        <img 
                          src={recipient.profileImage} 
                          alt={recipient.name} 
                          className="h-12 w-12 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">
                          {recipient?.name.charAt(0) || '?'}
                        </div>
                      )
                    ) : (
                      selectedConversation && getOtherParticipant(selectedConversation).profileImage ? (
                        <img 
                          src={getOtherParticipant(selectedConversation).profileImage} 
                          alt={getOtherParticipant(selectedConversation).name} 
                          className="h-12 w-12 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">
                          {selectedConversation && getOtherParticipant(selectedConversation).name.charAt(0)}
                        </div>
                      )
                    )}
                    
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">
                        {directMessageMode 
                          ? recipient?.name || 'Loading...' 
                          : getOtherParticipant(selectedConversation).name}
                      </h3>
                      
                      {(directMessageMode && item) || (selectedConversation && selectedConversation.item) ? (
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Package className="h-4 w-4 mr-1 text-blue-600" />
                          {directMessageMode 
                            ? item?.title || 'Loading...' 
                            : selectedConversation.item.title}
                        </p>
                      ) : null}
                      
                      {(directMessageMode && booking) || (selectedConversation && selectedConversation.booking) ? (
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                          {directMessageMode 
                            ? booking && `${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}` 
                            : `${formatDate(selectedConversation.booking.startDate)} - ${formatDate(selectedConversation.booking.endDate)}`}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <div 
                ref={messagesContainerRef}
                className="flex-grow p-6 bg-gray-50 overflow-y-auto"
              >
                {directMessageMode ? (
                  <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                    <p className="text-gray-600 font-medium">
                      Start a conversation with {recipient?.name || 'this user'}
                    </p>
                    {item && (
                      <p className="text-sm text-gray-500 mt-2">
                        Regarding: {item.title}
                      </p>
                    )}
                  </div>
                ) : (
                  selectedConversation.messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`mb-4 flex ${
                        message.sender === user?._id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div 
                        className={`max-w-[70%] p-4 rounded-lg shadow-sm ${
                          message.sender === user?._id 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p 
                          className={`text-xs mt-2 ${
                            message.sender === user?._id ? 'text-blue-200' : 'text-gray-500'
                          }`}
                        >
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={lastMessageRef} />
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-gray-800"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center transition-all duration-200"
                    disabled={sendingMessage}
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center bg-gray-50">
              <div className="text-center p-6">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">No conversation selected</h3>
                <p className="text-gray-600 max-w-md">
                  Select a conversation from the sidebar or start a new one by contacting an owner or renter.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;