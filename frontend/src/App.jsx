import { useDispatch, useSelector } from 'react-redux';
import './App.css'
import AppRoutes from './AppRoutes'
import { useEffect } from 'react';
import axios from 'axios';
import { clearUser, setUser } from './store/userSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get("https://mananborda-aichatbotpractice.onrender.com/api/auth/me", { withCredentials: true })
      .then((res) => {
        console.log(res.data.user);
        dispatch(setUser(res.data.user)); // user is logged in
      })
      .catch(() => {
        dispatch(clearUser()); // not logged in or invalid session
      });
  }, [dispatch]);

  return (
    <>
      <AppRoutes />
    </>
  )
}

export default App
