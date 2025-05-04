import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Loader, MessageSquare, CreditCard, Calendar, Star } from 'lucide-react';
import axios from 'axios';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [notificationsRes, messagesRes] = await Promise.all([
          axios.get('http://localhost:4000/api/notifications', config),
          axios.get('http://localhost:4000/api/messages/unread-count', config),
        ]);

        // Process notifications to include message count
        const notificationData = notificationsRes.data;
        const messageCount = messagesRes.data.unreadCount;

        if (messageCount > 0) {
          // Add a special notification for unread messages
          notificationData.unshift({
            _id: 'messages',
            type: 'message_received',
            title: 'Unread Messages',
            message: `You have ${messageCount} unread messages`,
            createdAt: new Date(),
            isRead: false,
            messageCount,
          });
        }

        setNotifications(notificationData);

        // Calculate unread count
        const unreadNotifications = notificationData.filter(n => !n.isRead).length;
        setUnreadCount(unreadNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up polling for new notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (notificationId === 'messages') {
      // Handle messages separately
      navigate('/messages');
      setIsOpen(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(`http://localhost:4000/api/notifications/${notificationId}/read`, {}, config);

      // Update local state
      setNotifications(notifications.map(notification =>
        notification._id === notificationId ? { ...notification, isRead: true } : notification
      ));

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);

    // Navigate based on notification type
    if (notification.type === 'message_received') {
      navigate('/messages');
    } else if (notification.type.includes('booking')) {
      navigate('/dashboard');
    } else if (notification.type.includes('payment')) {
      navigate('/dashboard');
    } else if (notification.type === 'review_received') {
      navigate(`/items/${notification.relatedItem}`);
    } else if (notification.relatedItem) {
      navigate(`/items/${notification.relatedItem}`);
    }

    setIsOpen(false);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    if (type.includes('message')) {
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    } else if (type.includes('payment')) {
      return <CreditCard className="h-5 w-5 text-green-500" />;
    } else if (type.includes('booking')) {
      return <Calendar className="h-5 w-5 text-orange-500" />;
    } else if (type.includes('review')) {
      return <Star className="h-5 w-5 text-yellow-500" />;
    } else {
      return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Group notifications by date
  const groupNotificationsByDate = (notifications) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    return notifications.reduce((groups, notification) => {
      const notificationDate = new Date(notification.createdAt).toDateString();
      let groupName;

      if (notificationDate === today) {
        groupName = 'Today';
      } else if (notificationDate === yesterday) {
        groupName = 'Yesterday';
      } else {
        groupName = 'Earlier';
      }

      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(notification);
      return groups;
    }, {});
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 rounded-full hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
            <h3 className="text-lg font-medium">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
              <div key={date}>
                <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {date}
                </div>
                {dateNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <span className="ml-2 mt-1 flex-shrink-0 h-2 w-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}

          
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;