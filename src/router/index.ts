import Vue from 'vue'
import Router from 'vue-router'
import {RouteConfig} from "vue-router/types/router";

import auth from '../store/modules/auth'
import TokenService from '../services/token.service'

import {
    Main,
    Login,
    Profile,
    Settings,
    Users,
    Register
} from '../components/'

Vue.use(Router);

const main: RouteConfig = {
    path: '/',
    name: 'Main',
    component: Main,
    meta: {
        localname: 'Main page'
    }
};

const login: RouteConfig = {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
        localname: 'Login page'
    }
};

const profile: RouteConfig = {
    path: '/profile/:id?',
    name: 'Profile',
    component: Profile,
    meta: {
        localname: 'Profile page'
    },
    props: true
};

const settings: RouteConfig = {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
        localname: 'Settings page'
    }
};

const users: RouteConfig = {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: {
        localname: 'Users page'
    }
};

const register: RouteConfig = {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
        requiresRoles: ['admin'],
        localname: 'Register page'
    }
};

const routes: RouteConfig[] = [
    main,
    login,
    profile,
    settings,
    users,
    register
];

const router = new Router({
    routes
});

router.beforeEach((to, from, next) => {

    const isAuthorized: boolean = !!auth.state.user;

    if (!isAuthorized) {
        return to.name !== 'Login' ? next({name: 'Login'}) : next()
    }

    if (isAuthorized) {

        return TokenService.checkLifetime()
            .then(() =>
                to.name === 'Login' ? next({name: 'Main'}) : checkRoles(to, from, next)
            )
            .catch(err => {
                auth.commitLogout();
                return next({name: 'Login'})
            })

    }

});

function checkRoles(to, from, next) {

    if (!to.meta.requiresRoles) return next();

    const user = auth.state.user;
    const checkRole = (role: string): boolean => to.meta.requiresRoles.includes(role);

    user!.roles.split(',').some(checkRole)
        ? next()
        : next({name: 'Main'})

}

export default router
