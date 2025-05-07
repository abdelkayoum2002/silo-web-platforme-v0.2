// public/main.js

import { registerSocketEvents } from './socketEvents.js';

const socket = io();

window.socket = socket; // expose globally
registerSocketEvents(socket);
let notificationContainer = null;

export function showNotification(message, type = 'MessageTopic', duration = 3000) {
  if(type=='CommandTopic'){return;}
  // Create container if it doesn't exist
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    Object.assign(notificationContainer.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: '9999',
      pointerEvents: 'none'
    });
    document.body.appendChild(notificationContainer);
  }

  // Create the notification element
  const notification = document.createElement('div');
  notification.textContent = message;

  // Set default duration if modified later
  let hideTimeout;

  // Base styles
  const baseStyles = {
    color: 'white',
    padding: '16px 24px',
    borderRadius: '10px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    fontSize: '16px',
    maxWidth: '300px',
    opacity: '0',
    transform: 'translateX(100%)',
    transition: 'transform 0.6s ease, opacity 0.6s ease',
    pointerEvents: 'auto',
    cursor: type.includes('Topic') ? 'pointer' : 'default'
  };

  // Topic background styles
  const topicStyles = {
    EmergencyTopic: 'linear-gradient(135deg, #ff416c, #ff4b2b)',
    AlertTopic: 'linear-gradient(135deg, #f7971e, #ffd200)',
    MessageTopic: 'linear-gradient(135deg, #6e8efb, #a777e3)',
    error: 'linear-gradient(135deg, #cc2b5e, #753a88)'
  };

  // Status background styles
  const statusStyles = {
    connecting: 'linear-gradient(135deg, #2980b9, #6dd5fa)',
    connected: 'linear-gradient(135deg, #28a745, #218838)',
    disconnected: 'linear-gradient(135deg, #dc3545, #c82333)',
    reconnect: 'linear-gradient(135deg, #6f42c1, #5a32a3)'
  };

  // Choose background
  const background = topicStyles[type] || statusStyles[type] || topicStyles.MessageTopic;
  Object.assign(notification.style, baseStyles, { background });

  // Append to container
  notificationContainer.appendChild(notification);

  // Click action for topic types
  if (type.includes('Topic') || type === 'error') {
    notification.style.cursor = 'pointer';
    notification.addEventListener('click', () => {
      if (type === 'error') {
        window.location.href = 'errorlog.html';
      } else {
        window.location.href = 'message.html';
      }
    });
  }
  

  // Mouse enter: pause disappearance
  notification.addEventListener('mouseenter', () => {
    clearTimeout(hideTimeout);
    notification.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
  });

  // Mouse leave: trigger quick hide
  notification.addEventListener('mouseleave', () => {
    hideNotification(500);
  });

  // Show animation
  requestAnimationFrame(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  });

  // Function to hide notification
  function hideNotification(speed = 600) {
    notification.style.transition = `transform ${speed / 1000}s ease, opacity ${speed / 1000}s ease`;
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentElement === notificationContainer) {
        notificationContainer.removeChild(notification);
        if (notificationContainer.children.length === 0) {
          document.body.removeChild(notificationContainer);
          notificationContainer = null;
        }
      }
    }, speed);
  }

  // Schedule auto-hide
  hideTimeout = setTimeout(() => hideNotification(), duration);
}

  
  
