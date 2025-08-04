import {React, useState} from "react";
import student_logo from './assets/students.png';
import film from './assets/film.png';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';
import TextField from '@mui/material/TextField';
import { useGoogleLogin } from '@react-oauth/google';
import { supabase } from './supabaseClient.js';
import { useNavigate } from 'react-router-dom';

{/*log in page*/}
function Login() {
const navigate = useNavigate();
const [email, setEmail] = useState("");
const login = useGoogleLogin({
  onSuccess: async (tokenResponse) => {

    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user info");

      const user = await res.json();
        const { data, error } = await supabase
          .from('users')
          .select()
          .eq('email', user.email)
        
        if (error) {
          console.error("Supabase error:", error);
        } else if (data.length > 0) {
          console.log("Email exists");
          navigate('/home')
        } else {
          console.log("Email does not exist");
          const {error} = await supabase
          .from('users')
          .insert({email: user.email, name: user.name, verified: "false", sign_in_by: "Google"})

          if (error) {
            console.log("There was an error inserting data: ", error)
          } else {
            console.log("user updated successfully")
            navigate('/home')
          }
        }
      
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  },
});

const emailLogin = async (e) => {
  e.preventDefault(); 

  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('email', email);
  if (error) {
    console.error("Supabase error:", error);
    return;
  }

  if (data.length > 0) {
    console.log("Email exists");
    navigate('/home')
  } else {
    console.log("Email does not exist");
    const {error: insertError} = await supabase
    .from('users')
    .insert({email: email, verified: email.includes("edu"), sign_in_by: "Email"})

    if (insertError) {
      console.error("Insert error:", insertError);
      return;
    }

    navigate('/home');
  }
};


    return (
        <div className="full">
        <Box className="box-container"sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
        <Grid size={{xs: 4, sm:3, md:4, lg:5, xl: 6, xxl:10}}>
            <div id="loginImages">
                <img id="student" src={student_logo} alt="log in image" ></img>
                <img className="moveImage"id="film" src={film} alt="film roll"></img>
            </div>
        </Grid>
        <Grid className="box-container"id="allLoginText"size={{xs: 4, sm:3, md:4, lg:4, xl: 5, xxl: 8}}>
          <h1>RELIVE</h1>
          <h3>Rate your University Courses</h3>
          <div className="login-text">
            <h2>Sign in With Google</h2>
            <Button className="google-text" color="warning" variant="outlined" startIcon={<GoogleIcon />} onClick={() => login()}>
            Sign in with Google
            </Button>
            <hr />
            <h2>Sign in with one time link</h2>
            <h3>Sign up here using your email! (no password required)</h3>
            <form onSubmit={emailLogin}>
              <TextField type="email" id="outlined-basic" label="Email" value={email} variant="outlined" onChange={(e) => setEmail(e.target.value)} required />
              <Button id="signUp"sx={{ml: 1}}color="warning" variant="outlined" type="submit">Sign up</Button>
            </form>
            <h3 className="mx-1 mt-2">or, continue as <a href="/home">Guest</a></h3>
          </div>
        </Grid>
        </Grid>
        </Box>
        <footer id="login-footer">"Just as books let us live other lives, RELIVE lets us learn from the real ones"</footer>
        </div>
        
    )
}

export default Login