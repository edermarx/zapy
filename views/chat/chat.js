const gel = element => document.querySelector(element);

const id = new URL(window.location.href).searchParams.get('id');

setInterval(async () => {
  const messages = (await axios.get(`/api/message/${id}`)).data;
  gel('#messages').innerHTML = '';
  if (!messages) return;
  Object.entries(messages).forEach(([key, message]) => {
    gel('#messages').innerHTML += `
      <p class="message">${message}</p>
    `;
  });
}, 200);