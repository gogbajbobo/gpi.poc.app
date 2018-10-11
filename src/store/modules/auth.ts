import { getStoreBuilder } from "vuex-typex"
import { RootState } from "../"
import { UserModel } from '../../models'

export interface AuthState {
    user?: UserModel,
    accessToken?: string,
    expirationTime?: number
}

const initialAuthState: AuthState = {
    user: undefined,
    accessToken: undefined,
    expirationTime: undefined
};

const authState = getStoreBuilder<RootState>().module<AuthState>("auth", Object.assign({}, initialAuthState));

function logout(state: AuthState) {

    console.log('logout', auth.state.user!.username);
    fillUpAuthStore(state, initialAuthState);

}

function authorized(state: AuthState, data: AuthState) {

    console.log('authorized', data.user);
    fillUpAuthStore(state, data)

}

function tokenReceived(state: AuthState, data: AuthState) {

    console.log('tokenReceived');
    fillUpAuthStore(state, data)

}

function fillUpAuthStore(state: AuthState, data: AuthState) {
    Object.assign(state, data)
}

const stateGetter = authState.state();

const auth = {

    get state() { return stateGetter() },

    commitAuthorized: authState.commit(authorized, 'authorized'),
    commitTokenReceived: authState.commit(tokenReceived, 'tokenReceived'),
    commitLogout: authState.commit(logout, 'logout')

};

export default auth
