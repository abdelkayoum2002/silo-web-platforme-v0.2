// public/socketEvents.js
import { showNotification } from "./main.js";
window.topics = {};
window.msg={};
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
      showNotification(data.message,data.type);
      window.msg=data;
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
  