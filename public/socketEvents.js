// public/socketEvents.js
import { showNotification } from "./main.js";
window.topics = {};
export function registerSocketEvents(socket) {
    socket.on('connect', () => {
      console.log('[socket] connected');
    });
  
    socket.on('mqtt_status', (data) => {
      console.log('[mqtt_status]', data.status);
      showNotification(data.status,data.status);
    });
  
    socket.on('mqtt_message', (data) => {
      console.log('[mqtt_message]', data);
      showNotification(data.message,data.type,);
    });
  
    socket.on('mqtt_error', (data) => {
      console.log('[mqtt_error]', data);
      showNotification(`[${data.type}] ${data.message}`,'error',);
    });
  
    socket.on('topics', (data) => {
      console.log('[topics]', data);
      window.topics = data;
    });
  }
  