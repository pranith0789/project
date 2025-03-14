import Login from "./components/Login"
import SignUp from "./components/SignUp"
import ForgotPassword from "./components/ForgotPassword"
import {BrowserRouter,Routes,Route} from 'react-router-dom'

import Input from "./components/Input"
function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/Upload" element={<Input/>}/>
        <Route path="/forgotpassword" element={<ForgotPassword/>} />
      </Routes>
    </BrowserRouter>
      
    </>
  )
}

export default App
