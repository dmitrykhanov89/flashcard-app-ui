import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import {useAuth} from "../hooks/UseAuth.ts";

export const PrivateRoute = ({ children }: { children: ReactNode }) => {
    const { token, loading } = useAuth();

    if (loading) {
        return <div>Загрузка...</div>;
    }
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

