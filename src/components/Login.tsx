import React, { useState } from 'react'
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const Login = () => {

    const navigate = useNavigate()

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [error,setError] = useState<string>('')

    const handleusername = (event:React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value)
    }

    const handlepassword = (event:React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value)
    }

    function isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }


    function isvalidPassword(password:string):boolean {
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }


    const handlenavigate = () => {
        navigate('/signup')
    }

    const handlesubmit = async (event:React.FormEvent) => {
        event.preventDefault()
        if(email.trim() && !isValidEmail(email)){
            setError("Invalid email format:")
            return;
        }

        if (password.trim() && !isvalidPassword(password)) {
            setError(
              "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
            );
            return;
        }

        try{
            const response = await axios.post('http://localhost:3000/login',{email,password})
            console.log('login successfull',response.data)

        }catch(error){
            console.log('login failed',error)
        }
    }
  return (
    <div className="min-h-screen w-screen flex justify-center items-center bg-gray-100 bg-[url(https://wallpapers.com/images/hd/blockchain-monochrome-earth-sphere-uknrsf6rlwtyahb9.jpg)]">
      <div className="w-130 min-h-screen flex justify-center items-center text-white p-8 rounded-lg">
        <div className='fixed flex justify-start items-start h-110'>
            <h1>Welcome</h1>
        </div>
        <div className='flex flex-col gap-5 w-80 justify-center items-center'>
            <TextField 
            id="filled-basic" 
            label="Email" 
            variant="filled" 
            className='bg-gray-50 border-solid rounded-sm w-full'
            value={email}
            onChange={handleusername}
            />
            <TextField 
            id="filled-basic" 
            label="Password" 
            type="password" 
            variant="filled"
            className='bg-gray-50 border-solid rounded-sm w-full'
            value={password}
            onChange={handlepassword}/>
            {error && <p className='text-red-600 text-md justify-center items-center'>{error}</p>}
            <Button
                variant="text"
                disableElevation
                sx={{
                    bgcolor: "transparent",
                    color: "white",
                    borderColor: "grey.400",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontFamily: `"Poppins", "Inter", "Roboto", sans-serif`,
                    fontWeight: 500,
                    width: "100%",
                    
                }}
                onClick={handlesubmit}
            >
                Login
            </Button>

            <div className='flex flex-row gap-6 justify-center'>
                <p className='underline'>Forgot Password?</p>
                <p className="underline cursor-pointer hover:text-blue-700" onClick={handlenavigate}>SignUp</p>

            </div>
        </div>
        
      </div>
    </div>
  );
}

export default Login;
