const gel = element => document.querySelector(element);

const toasty = new Toasty({ transition: 'pinItUp' });

const userID = window.localStorage.getItem('userID');

const renderMessages = async (chatID) => {

  window.localStorage.setItem('chatID', chatID);

  const messages = (await axios.get(`/api/message/${chatID}`)).data;

  const messagesDiv = gel('#messages');
  messagesDiv.innerHTML = '';

  if (!messages) return;

  Object.entries(messages).forEach(([key, message]) => {
    const date = new Date(message.timestamp);
    const formatHour = (n) => {
      if (n < 10) {
        return `0${n}`;
      }
      return n;
    };

    messagesDiv.innerHTML += `
    <div class="message-container ${message.sender === userID ? 'receiver' : 'sender'}">
      <div class="message" message-id="${key}" message-sender="${message.sender}">
        <p class="message-content">${message.content}</p>
        <a class="hour">${formatHour(date.getHours())}:${formatHour(date.getMinutes())}</a>
      </div>
      <svg height="10" width="60">
        <polygon class="triangle" points="25,0 50,0 60,10" />
      </svg>  
    </div>
    `;
  });

  // ============================= //
  messagesDiv.scrollTop = 10 ** 10;
};

const renderContacts = async () => {
  try {
    const contacts = (await axios.get(`/api/user/contact/${userID}`)).data;
    const contactsDiv = gel('#contacts');

    contactsDiv.innerHTML = '';

    Object.values(contacts).forEach((contact) => {
      contactsDiv.innerHTML += `
      <div class="contact ${contact.alias}" onclick="renderMessages('${btoa(contact.userID < userID ? `${contact.userID}(*-*)${userID}` : `${userID}(*-*)${contact.userID}`)}')">
        <img src="https://cdn4.iconfinder.com/data/icons/universal-5/605/User-512.png" alt="contact-image">
        <h4 class="username">${contact.alias}</h4>
      </div>
    `;
    });

    contactsDiv.addEventListener('click', (event) => {
      gel('.current-contact-name').innerHTML = event.target.className.indexOf('contact') === -1 ? event.target.parentElement.querySelector('h4').innerHTML : event.target.querySelector('h4').innerHTML;
      [...document.querySelectorAll('.contact')].forEach((contact) => {
        contact.style.backgroundColor = '#FCD9C2';
      });
      gel(`.${gel('.current-contact-name').innerHTML}`).style.backgroundColor = '#edb88b';
      gel('#new-message').focus();
    });
  } catch (err) {
    console.log(err.response);
  }
  // ============================= //
};

const addContact = async (e) => {
  try {
    e.preventDefault();

    await axios.post(`/api/user/contact/${userID}`, {
      contact: gel('input[name=contact]').value,
    });

    gel('input[name=contact]').value = '';
    renderContacts();
  } catch (err) {
    console.log(err.response);
    if (err.response.data === 'user-not-found') toasty.error('Usuário não encontrado');
  }
};

gel('#add-contact-button').addEventListener('click', addContact);

const sendMessage = async (e) => {
  try {
    if (e) e.preventDefault();

    const chatID = window.localStorage.getItem('chatID');
    await axios.post(`/api/message/${chatID}`, {
      message: gel('input[name=message]').value,
    });

    gel('input[name=message]').value = '';


    renderMessages(chatID);
  } catch (err) {
    console.log(err.response);
  }
};

gel('#send-message-form').addEventListener('submit', sendMessage);

gel('#add-contact-form').addEventListener('submit', addContact);

gel('.logout').addEventListener('click', async () => {
  await axios.post('/api/user/logout');
});

(async () => {
  const user = (await axios.get(`/api/user/${userID}`)).data;
  gel('#my-username').innerHTML = user.alias;
})();

setInterval(async () => {
  try {
    const response = await axios.get(`/api/user/has-message/${userID}`);
    const chatID = window.localStorage.getItem('chatID');
    const hasMessageIDs = [];

    const contactsNotSeen = Object.values(response.data)
      .map(NotificationChatID => atob(NotificationChatID))
      .join('(*-*)').split('(*-*)')
      .filter(id => id !== userID);

    // console.log(contactsNotSeen);

    Object.entries(response.data).forEach(([hasMessageID, hasChatID]) => {
      if (hasChatID === chatID) hasMessageIDs.push(hasMessageID);
    });

    if (!hasMessageIDs.length) return;

    hasMessageIDs.forEach(async (hasMessageID) => {
      await axios.delete(`/api/user/has-message/${userID}/${hasMessageID}`);
    });

    renderMessages(chatID);
  } catch (err) {
    console.log(err.response);
    if (err.response.data === 'unauthenticated') window.location.replace('/login');
  }
}, 200);

renderContacts();