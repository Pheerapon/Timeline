import Head from "next/head";
import Layout from "../components/layout";
import { useState } from "react";
import Navbar from "../components/navbar";
import styles from "../styles/Home.module.css";
import axios from "axios";
import config from "../config/config";
import Logo from '../components/logo'
import Link from "next/link";
import LoginBars from "../components/loginBar";

export default function Login({ token }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [remember, setRemember] = useState(false);
  const login = async (req, res) => {
    try {
      let result = await axios.post(`${config.URL}/login`,{ username, password, remember },{ withCredentials: true });
      console.log("result: ", result);
      console.log("result.data:  ", result.data);
      console.log("token:  ", token);
      setStatus(result.status + ": " + result.data.user.username);
    } 
    catch (e) {
      console.log("error: ", JSON.stringify(e.response));
      setStatus(JSON.stringify(e.response).substring(0, 80) + "...");
    }
  };
  const reMem = async () => {
    setRemember(!remember);
  };

  const loginForm = () => (
    <div className={styles.gridContainer}>
      <div className={styles.up}>username : </div>
      <div>
        <input className ={styles.input}
          type="text"
          name="username"
          placeholder="username"
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className ={styles.up}>password : </div>
      <div>
        <input className ={styles.input}
          type="password"
          name="password"
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="flex items-center">
        <input
          id="remember_me"
          name="remember_me"
          type="checkbox"
          onClick={reMem}
        />
       
      </div> 
      <div className={styles.text}><label>Remember Me</label></div>
    </div>
  );

  const copyText = () => {
    navigator.clipboard.writeText(token);
  };

  return (
    <Layout>
      <Head>
        <title>Login Page</title>
      </Head>
      <div className={styles.menuBar}>
        <div className={styles.logo}><Logo /></div>
        <div className={styles.loginBar}><LoginBars /></div>
      </div>

      <div className={styles.container}>
        <div className={styles.loginTitle}>Login</div> <br />
        {/* <div>
          <b>Token:</b> {token.substring(0, 15)}...
          <button className={styles.btn1} onClick={copyText}> Copy token </button>
        </div> */}
        <br />
        <div>Status: {status}</div>
        <br />
        {loginForm()}
        <div>
          <Link href="/myTimeline"><a><button className={styles.btnLogin} onClick={login}>Login</button></a></Link>
        </div>
      </div>
    </Layout>
  );
}

export function getServerSideProps({ req, res }) {
  return { props: { token: req.cookies.token || "" } };
}