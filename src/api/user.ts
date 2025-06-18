import axios from 'axios';
import type { CreateUserDto, User } from '../types/User';

const AUTH_URL = 'http://localhost:8080/api/auth';

export const createUser = (data: CreateUserDto): Promise<User> =>
    axios.post<User>(`${AUTH_URL}/registration`, data).then(res => res.data);
