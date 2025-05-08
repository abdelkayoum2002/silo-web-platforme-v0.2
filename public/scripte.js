const socket = io();
    
const url = document.getElementById('url');
const statusText = document.getElementById('status');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const subscribeBtn =document.getElementById('subscribeBtn');

// Connect to MQTT
connectBtn.addEventListener('click', () => {
    if (url.value.trim() === '') {
        url.setCustomValidity('Please enter a URL');
        url.reportValidity();
    }
    statusText.textContent = 'Connecting...';
    statusText.className = 'connecting';
    socket.emit('mqtt_connect', url.value);
    url.value=url.value         
});
disconnectBtn.addEventListener('click', () => {
    socket.emit('mqtt_disconnect');
});
subscribeBtn.addEventListener('click', () =>{
    const type = document.getElementById('topicType').value;
    const topic = document.getElementById('topic').value === ''?undefined:document.getElementById('topic').value;
    const qos = document.getElementById('qos').value;
    console.log(topic);
    console.log(typeof(topic));
    socket.emit('subscribe',{type,topic,qos});
    
});
socket.on('connect', () => {
    console.log('Socket connected');
});

socket.on('mqtt_status', (data) => {
    statusText.textContent = data.status;
    statusText.className = data.status;
});

socket.on('mqtt_message', (data) => {
    const div = document.createElement('div');
    div.textContent = `[${data.topic}] ${data.message}`;
    document.getElementById('messages').appendChild(div);
});

socket.on('mqtt_error', (data) => {
    const div = document.createElement('div');
    div.textContent = `[${data.type}] ${data.message}`;
    document.getElementById('error').appendChild(div);
});
socket.on('topics', (data) => {
  window.topics = data;
    refrecheTopicsTable();
});



function refrecheTopicsTable() {
    console.log(window.topics);
    const container = document.getElementById('topics-container');
    container.innerHTML = ''; // Clear previous

    const table = document.createElement('table');

    // Table headers
    table.innerHTML = `
      <thead>
        <tr>
          <th>Type</th>
          <th>Topic</th>
          <th>QoS</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    for (const type in window.topics) {
      window.topics[type].forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${type}</td>
          <td>${entry.topic}</td>
          <td>${entry.qos}</td>
          <td>${entry.status}</td>
          <td>
            <button class="status-btn">${entry.status === 'subscribe' ? 'Unsubscribe' : 'Subscribe'}</button>
            <button class="delete-btn">Delete</button>
          </td>
        `;
        const statusBtn = row.querySelector('.status-btn');
        statusBtn.addEventListener('click', () => {
            if(entry.status === 'subscribe'){socket.emit('unsubscribe',entry.topic);}
            else if(entry.status === 'unsubscribe'){socket.emit('subscribe', { type, topic: entry.topic, qos: entry.qos });
        }
        });
        const deleteBtn = row.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', ()=> {
            socket.emit('deleteTopic',entry.topic);
        });
        tbody.appendChild(row);
      });
    }
    container.appendChild(table);

  }