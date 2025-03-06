import { TextField } from '@mui/material/'
import React, { useState } from 'react'
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const SignUp = () => {
    const navigate = useNavigate()
    const [first,setFirst] = useState<string>('');
    const [last,setLast] = useState<string>('')
    const [email,setEmail] = useState<string>('')
    const [password,setPassword] = useState<string>('')
    const [error,setError] = useState<string>('')

    const handlefirstname = (event:React.ChangeEvent<HTMLInputElement>) => {
        setFirst(event.target.value)
    }

    const handlelastname = (event:React.ChangeEvent<HTMLInputElement>) =>{
        setLast(event.target.value)
    }


    const handleusername = (event:React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value)
    }
    
    const handlepassword = (event:React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value)
    }

    const handlenavigate = () => {
        navigate('/')
    }
    function isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }


    function isvalidPassword(password:string):boolean {
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    const handlesubmit = async (event: React.FormEvent) => {
        event.preventDefault();
    
        if (first.trim() && last.trim() && first === last) {
            setError('First name and last name should be unique');
            return;
        }
    
        if (email.trim() && !isValidEmail(email)) {
            setError('Invalid email format');
            return;
        }
    
        if (password.trim() && !isvalidPassword(password)) {
            setError(
                "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
            );
            return;
        }
    
        setError("");
    
        try {
            const response = await axios.post('http://localhost:3000/register', {
                firstName: first,
                lastName: last,
                email,
                password
            });
            console.log("User registered successfully", response.data);
        } catch (error) {
            console.log("Error registering user", error);
        }
    };
    

  return (
    <div className='min-h-screen w-screen p-0 m-0 flex justify-center items-center   bg-cover bg-[url(https://media.gettyimages.com/id/1329268006/photo/digital-security-concept.jpg?s=612x612&w=gi&k=20&c=7x8_1qZE50IgnD_OAeNrRNvtsU-_6ka5JQxCTPS7eO0=)]'>
        <div className='h-screen w-110px flex mr-280 fixed justify-center items-center'>
            <div className='flex flex-col gap-4 w-80 justify-center items-center'>
                <TextField 
                    id="filled-basic" 
                    label="First Name" 
                    variant="filled" 
                    className='bg-gray-50 border-solid rounded-sm w-full'
                    value={first}
                    onChange={handlefirstname}
                />
                <TextField 
                    id="filled-basic" 
                    label="Last Name" 
                    variant="filled" 
                    className='bg-gray-50 border-solid rounded-sm w-full'
                    value={last}
                    onChange={handlelastname}
                />
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
                    onChange={handlepassword}
                />
                {error ? (<p className='text-red-600 text-md justify-center items-center'>{error}</p>) : (<p></p>)}
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
                    SignUp
                </Button>
                <div className='flex flex-row gap-6 justify-center'>
                    <p className='underline'>Already a user?</p>
                    <p className='underline cursor-pointer' onClick={handlenavigate}>Login</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default SignUp