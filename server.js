const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const MQTTService = require('./MQTTServices');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

MQTTService.init(io);


io.on('connection', (socket) => {
    console.log('User connected',socket.id);
    socket.emit('mqtt_message', MQTTService.message());
    socket.emit('mqtt_status', { status: MQTTService.status() });
    socket.emit('mqtt_error',MQTTService.error());
    socket.emit('topics',MQTTService.topics());
    socket.on('mqtt_connect', (url, options) => {
        MQTTService.connectToMQTT( url, options);
    });
    socket.on('mqtt_disconnect', () => {
        MQTTService.disconnectMQTT();
    });
    socket.on('subscribe' , ({ type, topic, qos }) =>{
        MQTTService.subscribeToTopic(type,topic, qos);
    })
    socket.on('unsubscribe', (topic)=> {
        console.log(topic)
        MQTTService.unsubscribeToTopic(topic);
    })
    socket.on('deleteTopic', (topic)=> {
        console.log(topic)
        MQTTService.deleteTopic(topic);
    })
    socket.on('publish',({topic,message,qos,retain}) => {
        console.log({topic,message,qos,retain})
        MQTTService.publishToTopic(topic,message,qos,retain);
    })
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});