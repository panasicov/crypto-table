import { useEffect } from 'react';
import AuthService from './AuthService';
import './Login.css';
import { useNavigate } from 'react-router-dom';

const authService = new AuthService();

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    authService.logout();
    navigate('/');
  }, [])
}

export default Logout;