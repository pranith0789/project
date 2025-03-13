import { TextField } from '@mui/material/'
import React, { useEffect, useState } from 'react'
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
    const [message,setMessage] = useState<string>('')

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
            setMessage(response.data.message)
            setError('')
            
        } catch (error) {
            console.log("Error registering user", error);
            setMessage('');
            setError(error.response?.data?.message || 'Error registering user')
        }
    };

    useEffect(() => {
        if(message){
            const timer = setTimeout(() => {
                navigate('/')
            },5000);
            return () => clearTimeout(timer)
        }
    },[message,navigate])
    

  return (
    <div className='min-h-screen w-screen p-0 m-0 flex justify-start items-center bg-cover bg-center bg-no-repeat' 
        style={{ backgroundImage: `url(https://media.gettyimages.com/id/1329268006/photo/digital-security-concept.jpg?s=612x612&w=gi&k=20&c=7x8_1qZE50IgnD_OAeNrRNvtsU-_6ka5JQxCTPS7eO0=)`, backgroundSize: 'cover' }}>
        <div className='h-screen w-[350px] flex fixed left-0 top-0 justify-center items-center p-6'>
            <div className='flex flex-col gap-4 w-full'>
                <TextField 
                    label="First Name" 
                    variant="filled" 
                    className='bg-gray-50 border-solid rounded-sm w-full'
                    value={first}
                    onChange={handlefirstname}
                />
                <TextField 
                    label="Last Name" 
                    variant="filled" 
                    className='bg-gray-50 border-solid rounded-sm w-full'
                    value={last}
                    onChange={handlelastname}
                />
                <TextField 
                    label="Email" 
                    variant="filled" 
                    className='bg-gray-50 border-solid rounded-sm w-full'
                    value={email}
                    onChange={handleusername}
                />
                <TextField 
                    label="Password" 
                    type="password" 
                    variant="filled"
                    className='bg-gray-50 border-solid rounded-sm w-full'
                    value={password}
                    onChange={handlepassword}
                />
                
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ width: '100%' }}
                    onClick={handlesubmit}
                    >
                    SignUp
                </Button>
                <div className='flex flex-row gap-2 justify-center'>
                    <p>Already a user?</p>
                    <p className='underline cursor-pointer text-blue-600' onClick={handlenavigate}>Login</p>
                </div>
                {error ? (<p className='text-red-600 text-md text-center'>{error}</p>) : null}
                {message ? (<p className='text-green-600 text-md text-center'>{message}</p>) : null}
            </div>
        </div>
    </div>
  )
}

export default SignUp
