import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import LoginForm from '../components/LoginForm/LoginForm';
import styles from '../components/LoginForm/LoginForm.module.css';

const Login = () => (
  <>
    <Sidebar />
    <div className={styles.mainContent}>
      <div className={styles.header}>
      </div>
      <LoginForm />
    </div>
  </>
);

export default Login;