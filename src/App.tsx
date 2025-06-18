import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {AuthProvider} from './components/AuthProvider.tsx';
import {LoginPage} from './components/LoginPage';
import {HomePage} from './components/HomePage';
import {PrivateRoute} from './components/PrivateRoute.tsx';
import RegisterPage from './components/RegisterPage';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/" element={<PrivateRoute> <HomePage/> </PrivateRoute>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
