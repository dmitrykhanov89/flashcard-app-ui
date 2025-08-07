import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {AuthProvider} from './components/AuthProvider';
import {LoginPage} from './components/LoginPage';
import {Home} from './components/Home';
import {PrivateRoute} from './components/PrivateRoute';
import {RegisterPage} from './components/RegisterPage';
import {Library} from './components/Library';
import {Layout} from './components/Layout';
import {FlashcardSetForm} from './components/FlashcardSetForm';
import {FlashcardSet} from './components/FlashcardSet';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>
                    <Route element={<Layout/>}>
                        <Route path="/" element={<PrivateRoute><Home/></PrivateRoute>}/>
                        <Route path="/library" element={<PrivateRoute><Library/></PrivateRoute>}/>
                        <Route path="/add-flashcard-set" element={<PrivateRoute><FlashcardSetForm/></PrivateRoute>}/>
                        <Route path="/flashcard-set/:id" element={<PrivateRoute><FlashcardSet/></PrivateRoute>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
