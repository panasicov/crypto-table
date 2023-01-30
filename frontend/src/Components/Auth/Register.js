import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import AuthService from './AuthService';
import Header from '../Header/Header';
import './Login.css';


const authService = new AuthService();

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    authService.isLogged().then((response) => {
      if (response) {
        navigate('/');
      } else {
        authService.deleteTokenFromHeaders();
      }
    });
  }, [])

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [mainError, setMainError] = useState('');

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);

    authService.register(username, email, password)
    .then(response => {
      navigate('/');
      setLoading(false);
    })
    .catch(error => {
      setUsernameError(error.response.data.username);
      setEmailError(error.response.data.email);
      setPasswordError(error.response.data.password);
      setMainError(error.response.data.detail);
      setLoading(false);
    })
  }

  return (
    <div>
      <Header />
      <div class="login-container">
        <div class="d-flex justify-content-center h-100">
          <div class="card">
            <div class="card-header">
              <h3>Sign Up</h3>
              <div class="d-flex justify-content-end social_icon">
                <span><i class="fab fa-facebook-square"></i></span>
                <span><i class="fab fa-google-plus-square"></i></span>
                <span><i class="fab fa-twitter-square"></i></span>
              </div>
            </div>
            <div class="card-body">
              {mainError ? <div className="text-danger">{mainError}</div> : ''}
              <form onSubmit={handleSubmit}>
                {usernameError ? <div className="text-danger">{usernameError}</div> : ''}
                <div class={usernameError ? "input-group form-group red-border" : "input-group form-group"}>
                  <div class="input-group-prepend">
                    <span class="input-group-text"><i class="fas fa-user"></i></span>
                  </div>
                  <input type="text" class="form-control username" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                </div>
                {emailError ? <div className="text-danger">{emailError}</div> : ''}
                <div class={emailError ? "input-group form-group red-border" : "input-group form-group"}>
                  <div class="input-group-prepend">
                    <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                  </div>
                  <input type="email" class="form-control username" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>
                {passwordError ? <div className="text-danger">{passwordError}</div> : ''}
                <div class={passwordError ? "input-group form-group red-border" : "input-group form-group"}>
                  <div class="input-group-prepend">
                    <span class="input-group-text"><i class="fas fa-key"></i></span>
                  </div>
                  <input type={showPass ? "text" : "password"} class="form-control" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                  <div class="input-group-append" onClick={() => setShowPass(!showPass)}>
                  <span class="input-group-text">
                    <i role="button" class={showPass ? "fas fa-eye" : "fas fa-eye-slash"}></i>
                  </span>
                  </div>
                </div>
                <div class="form-group">
                  <button type="submit" class="float-right login_btn" value="Login">
                  {loading ? <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : ''}
                    Register
                  </button>
                </div>
              </form>
            </div>
            <div class="card-footer">
              <div class="d-flex justify-content-center links">
                Have an account?
                <Link to='/login'>Sign In</Link>
              </div>
              <div class="d-flex justify-content-center">
                <Link to='/reset_password'>Forgot your password?</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register;