import {useNavigate} from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

const RegisterPage = () => {
    const navigate = useNavigate();
    return (
        <div className="flex items-center justify-center min-h-screen">
            {/* После успешной регистрации переходим на главную страницу '/' */}
            <RegisterForm onSuccess={() => navigate('/')}/>
        </div>
    );
}
export default RegisterPage;
