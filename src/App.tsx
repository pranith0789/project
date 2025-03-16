import Login from "./components/Login"
import SignUp from "./components/SignUp"
import ForgotPassword from "./components/ForgotPassword"
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom'
import Input from "./components/Input"

const PrivateRoute = ({ element} : {element : JSX.Element}) => {
  const token = localStorage.getItem('token');
  return token ? element : <Navigate to ='/'/>
}
function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/signup" element={<SignUp/>} />
        
        <Route path="/forgotpassword" element={<ForgotPassword/>} />
        <Route path="/Upload" element={<PrivateRoute element={<Input/>}/>}/>
      </Routes>
    </BrowserRouter>
      
    </>
  )
}

export default App
