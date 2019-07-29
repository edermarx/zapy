const gel = element => document.querySelector(element);

const toasty = new Toasty();

gel('#register-form').addEventListener('submit', async (e) => {
  try {
    e.preventDefault();

    const response = await axios.post('/api/user', {
      username: gel('input[name=username]').value,
      password: gel('input[name=password]').value,
      password2: gel('input[name=password2]').value,
      alias: gel('input[name=alias]').value,
    });

    window.localStorage.setItem('userID', response.data);
    window.location.replace('/');
  } catch (err) {
    console.log(err.response.data);
    if (err.response.data === 'user-already-exists') toasty.error('Esse usuátio já existe');
    if (err.response.data === 'passwords-dont-match') toasty.error('As senhas devem ser iguais');
  }
});
