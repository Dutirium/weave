import { Routes, Route } from 'react-router-dom';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import  Dashboard  from './pages/Dashboard';
import ProtectedRoute from './middleware/ProtectedRoute';
import { CheckCredentials }  from "./middleware/CheckCredentials";
import Weave from './pages/Weave';

function App(){

  return (
    <main>
    <Routes>
    
      {/* Public Routes */}
      <Route path="/register" element={
        <CheckCredentials>
          <Register />
        </CheckCredentials>
        }/>
        
      <Route path="/login" element={
        <CheckCredentials>
        <Login />
        </CheckCredentials>
      } />
      

      {/* Protected Routes */ }
      <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/weaves/:id" element={<Weave />} />
      </Route>

      {/* Any other routes */}
      
    </Routes>
 
    </main>
  );
}

export default App;