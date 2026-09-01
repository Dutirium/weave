import { Routes, Route, Navigate } from 'react-router-dom'
import {Register} from './Register';
import {Login} from './Login';

function App(){
  return (
    <main>
     <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
     
        <Route 
          path="*"
          element={<Navigate to="/login" replace />}  
        />
     </Routes>
    </main>
  );
}

export default App;