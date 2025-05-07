
document.addEventListener('DOMContentLoaded', () => {
    const publishBtn = document.getElementById("publishBtn");
    publishBtn.addEventListener('click', () => {
      const topic = document.getElementById('topic').value || undefined;
      const message = document.getElementById('message').value;
      const qos = parseInt(document.getElementById('qos').value);
      const retain = document.getElementById('retain').checked;
      socket.emit('publish', { topic, message, qos, retain });
    });
  
    // ✅ Populate datalist from window.topics.Others
    const datalist = document.getElementById("options");
    const others = window.topics?.Others || [];
  
    others.forEach(item => {
      const option = document.createElement("option");
      option.value = item.topic;
      datalist.appendChild(option);
    });
  });
  