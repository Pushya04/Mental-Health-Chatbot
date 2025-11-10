import { useState ,useEffect} from "react";
import { useSelector,useDispatch } from "react-redux";
import { register,reset } from "../feature/login/loginSlice";
import {toast} from "react-toastify"
import { useNavigate } from "react-router-dom";
import axios from "axios";



export default function Register() {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  })
  const { name, email, password, password2 } = formData;
  const [suggestedName, setSuggestedName] = useState(null);

  const navigate=useNavigate();
  const dispatch=useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth || {
      user: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
      message: ''
    }
  )

  useEffect(() => {
    if (isError) {
      // If the error message contains a username suggestion, show it as info
      if (message && message.includes("Username already taken. Try '")) {
        toast.info(message);
      } else {
        toast.error(message);
      }
    }
    if (isSuccess) {
      toast.success('Registration successful! Please sign in.');
      setTimeout(() => navigate('/login'), 1200);
    }
    dispatch(reset())
  }, [isError, isSuccess, message, navigate, dispatch])


  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (password !== password2) {
      toast.error('Passwords do not match');
      return;
    }
    const userData = {
      name,
      email,
      password,
    };
    try {
      // Try registration directly with axios to catch 409
      const res = await axios.post('http://localhost:5001/user/register', userData);
      if (res.status === 201) {
        toast.success('Registration successful! Please sign in.');
        setTimeout(() => navigate('/login'), 1200);
      }
    } catch (err) {
      if (err.response && err.response.status === 409 && err.response.data.message) {
        // Username suggestion from backend
        const match = err.response.data.message.match(/Try '([^']+)'/);
        if (match && match[1]) {
          setSuggestedName(match[1]);
          toast.info(`Username taken. Suggested: ${match[1]}`);
        } else {
          toast.error(err.response.data.message);
        }
      } else if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Registration failed.');
      }
    }
  }

  const handleAcceptSuggestion = () => {
    setFormData((prev) => ({ ...prev, name: suggestedName }));
    setSuggestedName(null);
    toast.info(`Username changed to: ${suggestedName}`);
  };

  const renderForm = (
    <div className="wrapper" style={{ maxWidth: '400px', margin: '40px auto', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', borderRadius: '12px', padding: '32px', background: 'var(--panel)' }}>
      <div className="text-center mt-4 name" style={{ fontWeight: 'bold', fontSize: '2rem', marginBottom: '24px', color: 'var(--brand)' }}>
        Registration<br />
        <span style={{ fontSize: '1.1rem', color: 'var(--muted)', fontWeight: 'normal' }}>Create a new Account</span>
      </div>
  <form className="login" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div className="login__field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          </svg>
          <input type="text" className="login__input" placeholder="Username" name="name" value={name} onChange={handleChange} required style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--brand)', background: 'var(--bg)', color: 'var(--muted)' }} />
        </div>
        <div className="login__field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          </svg>
          <input type="text" className="login__input" placeholder="Email" name="email" value={email} onChange={handleChange} required style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--brand)', background: 'var(--bg)', color: 'var(--muted)' }} />
        </div>
        <div className="login__field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-lock-fill" viewBox="0 0 16 16">
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
          </svg>
          <input type="password" className="login__input" placeholder="Password" name="password" value={password} onChange={handleChange} required style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--brand)', background: 'var(--bg)', color: 'var(--muted)' }} />
        </div>
        <div className="login__field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-lock-fill" viewBox="0 0 16 16">
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
          </svg>
          <input type="password" className="login__input" placeholder="Confirm Password" name="password2" value={password2} onChange={handleChange} required style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--brand)', background: 'var(--bg)', color: 'var(--muted)' }} />
        </div>
        <button type="submit" className="btn mt-3" style={{ background: 'linear-gradient(90deg, var(--brand) 0%, var(--brand-2) 100%)', color: '#fff', border: 'none', borderRadius: '6px', padding: '12px', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px', cursor: 'pointer' }}>Register</button>
        {suggestedName && (
          <div style={{ marginTop: '10px', color: 'var(--brand)' }}>
            <span>Suggested username: <b>{suggestedName}</b></span>
            <button type="button" onClick={handleAcceptSuggestion} style={{ marginLeft: '10px', padding: '6px 12px', borderRadius: '4px', background: 'var(--brand-2)', color: '#fff', border: 'none', cursor: 'pointer' }}>Accept</button>
          </div>
        )}
      </form>
      <div style={{ textAlign: 'center', marginTop: '18px', color: 'var(--muted)', fontSize: '1rem' }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: 'var(--brand)', textDecoration: 'underline', fontWeight: 'bold' }}>Login</a>
      </div>
    </div>
  );

  return (
    <div className="app">

      {renderForm}

    </div>
  );
}