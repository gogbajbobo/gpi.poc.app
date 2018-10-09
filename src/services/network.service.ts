import axios from 'axios'
import auth from '../store/modules/auth'
import router from '../router'

import TokenService from './token.service'
import LoggerService from './logger.service'
import { clearStoreAtLogout } from '../store'

const
    authPath = '/auth',
    loginUrl = `${ authPath }/login`,
    exchangeTokenUrl = `${ authPath }/token`;

const axiosInstance = axios.create();

const isProduction = process.env.NODE_ENV === 'production';

axiosInstance.defaults.baseURL = isProduction
    ? 'https://gpi.grigoblin.ru'
    : 'http://maxbook.local:8001';

axiosInstance.interceptors.request.use(config => {

    LoggerService.log('send request', config.method, config.url);

    switch (config.url) {

        case loginUrl: { return config }

        case exchangeTokenUrl: { return authorizedConfig(config) }

        default: {

            return TokenService.checkLifetime()
                .then(() => authorizedConfig(config))
                .catch(rejectError)

        }

    }

}, rejectError);

axiosInstance.interceptors.response.use(response => {

    LoggerService.log(`${ response.config.method } ${ response.config.url } response:`);
    LoggerService.log(response);
    return response

}, error => {

    if (error.response && error.response.status === 401) {

        clearStoreAtLogout();
        router.push({name: 'Login'})

    }
    return rejectError(error)

});

function authorizedConfig(config) {

    const accessToken = auth.state.accessToken;
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;

    return config

}

function rejectError(error: Error) {
    return Promise.reject(error)
}

class NetworkService {

    static login(username: string, password: string): Promise<any> {

        const userAgent = navigator.userAgent;
        const data = {
            username,
            password,
            userAgent
        };

        return axiosInstance.post(loginUrl, data)
            .then(response => auth.commitAuthorized(response.data))
            .catch(rejectError)

    }

    static exchangeToken(): Promise<any> {

        return axiosInstance.get(exchangeTokenUrl)
            .then(response => auth.commitTokenReceived(response.data))
            .catch(rejectError)

    }

    static register(username: string, password: string, roles: string[]): Promise<any> {

        const data = {
            username,
            password,
            roles
        };

        return axiosInstance.post('/auth/register', data)
            .catch(rejectError)

    }

    static getUsers(): Promise<any> {

        return axiosInstance.get('/api/users')
            .then(response => response.data.users)
            .catch(rejectError)

    }

    static getUserById(userId): Promise<any> {

        return axiosInstance.get(`/api/users/${ userId }`)
            .then(response => response.data.user)
            .catch(rejectError)

    }

    static deleteUser(userId): Promise<any> {

        return axiosInstance.delete(`/api/users/${ userId }`)
            .then(response => response.data)
            .catch(rejectError)

    }

    static getRoles(): Promise<any> {

        return axiosInstance.get(`/api/roles`)
            .then(response => response.data.roles)
            .catch(rejectError)

    }

    static getOrders(): Promise<any> {

        return axiosInstance.get(`/api/orders`)
            .then(response => response.data.orders)
            .catch(rejectError)
    }

    static addOrder(ordername): Promise<any> {

        return axiosInstance.post(`/api/orders`, { ordername })
            .catch(rejectError)

    }

    static updateOrder(orderId, ordername, approved): Promise<any> {

        return axiosInstance.put(`/api/orders/${ orderId }`, { ordername, approved })
            .catch(rejectError)

    }

    static deleteOrder(orderId): Promise<any> {

        return axiosInstance.delete(`/api/orders/${ orderId }`)
            .catch(rejectError)

    }

}

export default NetworkService;
