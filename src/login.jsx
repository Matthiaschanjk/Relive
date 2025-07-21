import React from "react";
import student_logo from './assets/students.png';
import film from './assets/film.png';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';
import TextField from '@mui/material/TextField';

{/*log in page*/}
function Login() {

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
            <Button className="google-text" color="warning" variant="outlined" startIcon={<GoogleIcon />}>
            Sign in with Google
            </Button>
            <hr />
            <h2>Sign in with one time link</h2>
            <h3>We'll email you a one time sign in link (no password required)</h3>
            <form>
              <TextField type="email" id="outlined-basic" label="Email" variant="outlined" />
              <Button id="signUp"sx={{ml: 1}}color="warning" variant="outlined" type="submit">Send Sign up Link</Button>
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