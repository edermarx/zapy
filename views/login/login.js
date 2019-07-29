const gel = element => document.querySelector(element);

const toasty = new Toasty();

gel('#login-form').addEventListener('submit', async (e) => {
  try {
    e.preventDefault();

    const response = await axios.post('/api/user/login', {
      username: gel('input[name=username]').value,
      password: gel('input[name=password]').value,
    });

    window.localStorage.setItem('userID', response.data);
    window.location.replace('/');
  } catch (err) {
    console.log(err.response.data);
    if (err.response.data === 'wrong-password') toasty.error('Senha Incorreta');
  }
});
