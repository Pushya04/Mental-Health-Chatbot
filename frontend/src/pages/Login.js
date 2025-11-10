import React, { useState, useContext } from "react";
import { loginData } from "../data/loginData";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { toast } from "react-toastify";

function Login() {
  const { state, dispatch } = useContext(UserContext);
  const [errorMessages, setErrorMessages] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const navigate = useNavigate();
  const errors = {
    uname: "Invalid Username",
    pass: "Invalid Password"
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const { uname, pass } = document.forms[0];
    
    try {
      const response = await fetch('http://localhost:5001/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: uname.value,
          password: pass.value
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Login successful
        localStorage.setItem('user', JSON.stringify(data));
        dispatch({ type: "USER", payload: true });
        setIsSubmitted(true);
        if (data && data.name) {
          toast.success(`Welcome, ${data.name}!`);
        } else {
          toast.success('Login successful!');
        }
        setTimeout(() => {
          navigate("/newchatpage");
        }, 1200);
      } else {
        // Login failed
        setErrorMessages({ 
          name: "login", 
          message: data.message || "Login failed. Please check your credentials."
        });
        toast.error(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessages({ 
        name: "login", 
        message: "Connection error. Please try again."
      });
    }
  };

  // Generate JSX code for error message
  const renderErrorMessage = (name) =>
    name === errorMessages.name && (
      <div className="error">{errorMessages.message}</div>
    );

  // JSX code for login form
  const renderForm = (
    <div className="wrapper" style={{ maxWidth: '400px', margin: '40px auto', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', borderRadius: '12px', padding: '32px', background: 'var(--panel)' }}>
      <div className="text-center mt-4 name" style={{ fontWeight: 'bold', fontSize: '2rem', marginBottom: '24px', color: 'var(--brand)' }}>
        Sign In<br />
        <span style={{ fontSize: '1.1rem', color: 'var(--muted)', fontWeight: 'normal' }}>Sign in to your account</span>
      </div>
      <form className="login" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div className="login__field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          </svg>
          <input type="text" className="login__input" placeholder="Email" name="uname" required style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--brand)', background: 'var(--bg)', color: 'var(--muted)' }} />
        </div>
        {renderErrorMessage("uname")}
        <div className="login__field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-lock-fill" viewBox="0 0 16 16">
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
          </svg>
          <input type="password" className="login__input" placeholder="Password" name="pass" required style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--brand)', background: 'var(--bg)', color: 'var(--muted)' }} />
        </div>
        {renderErrorMessage("pass")}
        {renderErrorMessage("login")}
        <button className="btn mt-3" style={{ background: 'linear-gradient(90deg, var(--brand) 0%, var(--brand-2) 100%)', color: '#fff', border: 'none', borderRadius: '6px', padding: '12px', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px', cursor: 'pointer' }}>Login</button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '18px', color: 'var(--muted)', fontSize: '1rem' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--brand)', textDecoration: 'underline', fontWeight: 'bold' }}>Sign Up</Link>
      </div>
    </div>
  );

  return (
    <div className="app">

      {renderForm}

    </div>
  );
}

export default Login;