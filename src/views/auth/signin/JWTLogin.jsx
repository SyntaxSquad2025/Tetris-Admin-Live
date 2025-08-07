import React, { useState, useEffect } from 'react';
import { Row, Col, Alert, Button } from 'react-bootstrap';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { postData } from "../../../apiConfigs/apiCalls";
import {ADMIN_LOGIN } from "../../../apiConfigs/endpoints";

const JWTLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(''); // State to handle errors
  const [rememberMe, setRememberMe] = useState(false); // State to track the remember me checkbox

  // Load email and password from localStorage if available
  useEffect(() => {
    const savedEmail = localStorage.getItem('email');
    const savedPassword = localStorage.getItem('password');
    if (savedEmail && savedPassword) {
      setRememberMe(true); // Set remember me to true if values exist in localStorage
    }
  }, []);

const handleLogin = async (values, { setSubmitting }) => {
  const { email, password } = values;
  setError(''); // Reset error on form submission

  if (!email || !password) {
    setError('Email and password are required.');
    setSubmitting(false);
    return;
  }

  setLoading(true);

  try {
    // Use your postData helper with ADMIN_LOGIN endpoint
    const data = await postData(ADMIN_LOGIN, { email, password });

    if (data && data.token) {
      // Store token and user info in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('id', data.user.id);

      if (rememberMe) {
        localStorage.setItem('email', email);
        localStorage.setItem('password', password);
      } else {
        localStorage.removeItem('email');
        localStorage.removeItem('password');
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } else {
      setError(data.message || 'Invalid email or password. Please try again.');
    }
  } catch (error) {
    setError(error.message || 'Invalid email or password. Please try again.');
  } finally {
    setSubmitting(false);
    setLoading(false);
  }
};


  return (
    <Formik
      initialValues={{
        email: localStorage.getItem('email') || '',
        password: localStorage.getItem('password') || '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
        password: Yup.string().max(255).required('Password is required')
      })}
      onSubmit={handleLogin}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              className="form-control"
              label="Email Address / Username"
              name="email"
              onBlur={handleBlur}
              onChange={handleChange}
              type="email"
              value={values.email}
            />
            {touched.email && errors.email && <small className="text-danger form-text">{errors.email}</small>}
          </div>

          <div className="form-group mb-4">
            <input
              className="form-control"
              label="Password"
              name="password"
              onBlur={handleBlur}
              onChange={handleChange}
              type="password"
              value={values.password}
            />
            {touched.password && errors.password && <small className="text-danger form-text">{errors.password}</small>}
          </div>

          {/* Display error message if there's an issue with the login */}
          {error && (
            <Col sm={12}>
              <Alert variant="danger">{error}</Alert>
            </Col>
          )}

          {/* Remember Me Checkbox */}
          <div className="custom-control custom-checkbox text-start mb-4 mt-2">
            <input
              type="checkbox"
              className="custom-control-input mx-2"
              id="customCheck1"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)} // Update state on checkbox change
            />
            <label className="custom-control-label" htmlFor="customCheck1">
              Remember Me
            </label>
          </div>

          {/* Login Button */}
          <Row>
            <Col mt={2}>
              <Button
                className="btn-block mb-4"
                color="primary"
                disabled={isSubmitting}
                size="large"
                type="submit"
                variant="primary"
              >
                {isSubmitting ? 'Logging In...' : 'LOGIN'}
              </Button>
            </Col>
          </Row>
        </form>
      )}
    </Formik>
  );
};

export default JWTLogin;

