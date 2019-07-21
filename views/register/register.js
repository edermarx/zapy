const gel = element => document.querySelector(element);

gel('#register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const response = await axios.post('/api/user', {
    username: gel('input[name=username]').value,
    password: gel('input[name=password]').value,
    password2: gel('input[name=password2]').value,
    alias: gel('input[name=alias]').value,
  });

  if (response.data === 'ok') window.location.replace('/');
});