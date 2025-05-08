const { subscribe, unsubscribe } = require('diagnostics_channel');
const mqtt = require('mqtt');

let socket=null;
let mqttClient=null;
let mqttStatus ='disconnected';
let mqttError = null;
let mqttMessage = null;
const PREDEFINED_TYPES = ["EmergencyTopic", "AlertTopic", "MessageTopic", "CommandTopic", "SensorTopic"];
const topics={};

function init(io) {
    socket = io;
}

function connectToMQTT(url, options) {
    console.log(url);
    if (!url) {
      console.log("no URL");
      return;
    }
  
    if (mqttClient && mqttClient.connected) {
      return socket.emit('mqtt_status', { status: 'connected' });
    }
  
    mqttStatus = 'connecting';
    socket.emit('mqtt_status', { status: mqttStatus });
  
    mqttClient = mqtt.connect(url, options);
  
    mqttClient.on('connect', () => {
      console.log('MQTT connected');
      mqttStatus = 'connected';
      socket.emit('mqtt_status', { status: mqttStatus });
      for (const type in topics) {
        topics[type].forEach(t => {
          subscribeToTopic(type,t.topic,t.qos)
        });
      }
    });
  
    mqttClient.on('close', () => {
      console.log('MQTT disconnected');
      mqttStatus = 'disconnected';
      socket.emit('mqtt_status', { status: mqttStatus });
      for (const type in topics) {
        topics[type].forEach(topic => {
          topic.status='unsubscribe';
          socket.emit('topics',topics);
        });
      }
    });
  
    mqttClient.on('message', (topic, message) => {
      const exict = topicExists(topic);
      const type = exict.type
      console.log(`[${type}] ${topic} ${message}`)
      mqttMessage= {
        type,
        topic,
        message: message.toString()
      }
      socket.emit('mqtt_message', mqttMessage);
    });
  
    mqttClient.on('error', (err) => {
      if (mqttClient.connected || mqttClient.reconnecting) {
        disconnectMQTT();
      }
      console.error('MQTT Error:', err);
      mqttStatus = 'error';
      mqttError = {type: 'connection_error', message: err.message || 'Unknown error'};
      socket.emit('mqtt_error',mqttError);  
      console.error(mqttError.type,mqttError.message);   
      // Only disconnect if we were previously connected
    });
    
  
    mqttClient.on('reconnect', () => {
      console.log('MQTT Reconnect...');
      mqttStatus = 'reconnect';
      socket.emit('mqtt_status', { status: mqttStatus });
    });
}

function disconnectMQTT() {
  if (mqttClient) {
    if (mqttClient.connected || mqttClient.reconnecting) {
      mqttClient.end();
    }
    mqttClient = null;
  }
}

function subscribeToTopic(type, topic, qos) {
  if (!mqttClient){
    mqttError = {type: 'subscribtion_error', message: `not conected`};
    socket.emit('mqtt_error',mqttError);
    console.error(mqttError.type,mqttError.message);
    return;}
  const existe= topicExists(topic)
  console.log(existe);
  if(existe){
  if(existe.status!='unsubscribe'){
    mqttError = {type: 'subscribtion_error', message: `topic already exists in type [${existe}]`};
    socket.emit('mqtt_error',mqttError);
    console.error(mqttError.type,mqttError.message);
    return;
  }}
  console.log(topics);
  qos = Number(qos);
  mqttClient.subscribe(topic, { qos }, (err) => {
    if (err) {
      mqttError = {type: 'subscribtion_error', message: err.message || 'Unknown error'};
      socket.emit('mqtt_error',mqttError);
      console.error(mqttError.type,mqttError.message);
    } else {
      console.log(`subscribtio to:[${type}] ${topic} qos ${qos}` )
      if (PREDEFINED_TYPES.includes(type)) {
        topics[type] = [{ topic:topic, qos:qos, status:'subscribe' }]; // Only one topic per predefined type
      } else {
        if (!topics[type]) topics[type] = [];

            topics[type].push({ topic:topic, qos:qos, status:'subscribe' })
      }
      console.log(topics);
      socket.emit('topics',topics);
      socket.emit('subscribtion_ok',{type,topic,qos});
    }
  });
}

function unsubscribeToTopic(topicStr) {
  if (!mqttClient){return;}
  for (const type in topics) {
    const topic = topics[type].find(t => t.topic === topicStr);
    if (topic) {
      mqttClient.unsubscribe(topicStr, (err) => {
        if(err){      
        mqttError = {type: 'unsubscribtion_error', message: err.message || 'Unknown error'};
        socket.emit('mqtt_error',mqttError);
        console.error(mqttError.type,mqttError.message);
        return;}
        topic.status = topic.status === 'subscribe' ? 'unsubscribe' : 'subscribe';
        console.log(`Unsubscribe topic:[${topicStr}]`);
        socket.emit('topics',topics);
      })
    }
  }
}

function deleteTopic(topic) {
  console.log('s......................delete');
  unsubscribeToTopic(topic)
  for (const type in topics) {
    const index = topics[type].findIndex(t => t.topic === topic);
    if (index !== -1) {
      topics[type].splice(index, 1); // Remove the topic
      if (topics[type].length === 0) {
        delete topics[type]; // Remove the group if empty
      }
    }
  }
  console.log('s......................delete');
  socket.emit('topics',topics)
}

function topicExists(searchTopic) {
  for (const type in topics) {
    const topicList = topics[type];
    for (const entry of topicList) {
      if (entry.topic === searchTopic) {
        return { type: type, status: entry.status };
      }
    }
  }
  return null; // Topic not found
}
  

function publishToTopic(topic,message,qos,retain){
  if(!mqttClient){
    mqttError = {type: 'publishing_error', message: `not conected`};
    socket.emit('mqtt_error',mqttError);
    console.error(mqttError.type,mqttError.message);
    return;
  }
   mqttClient.publish(topic,message,{qos:qos,retain:retain}, (err) => {
    console.log({topic,message,qos,retain})
    if(err){
      mqttError = {type: 'publishing_error', message: err.message};
      socket.emit('mqtt_error',mqttError);
      console.error(mqttError.type,mqttError.message);
      return;
    }
    console.log(`Publish msg:${message} to ${topic}`);
   })
}


module.exports = {
    init,
    connectToMQTT,
    subscribeToTopic,
    unsubscribeToTopic,
    disconnectMQTT,
    deleteTopic,
    publishToTopic,
    message: () => mqttMessage,
    topics: () => topics,
    status: () => mqttStatus,
    error : () => mqttError
  };
