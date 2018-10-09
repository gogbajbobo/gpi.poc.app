import { getStoreBuilder } from "vuex-typex"
import { RootState } from "../"
import NetworkServices from '../../services/network.service'
import LoggerService from '../../services/logger.service'
import { OrdersState } from "./orders";

export interface RolesState {
    rolesList: any[]
}

const initialRolesState: RolesState = {
    rolesList: []
};

const roleState = getStoreBuilder<RootState>().module<RolesState>("roles", initialRolesState);

function getRoles() {

    NetworkServices.getRoles()
        .then(rolesData => roles.commitFillUpRolesList(rolesData))
        .catch(err => LoggerService.error(err.message))

}

function fillUpRolesList(state: RolesState, roles: any[]) {
    state.rolesList = roles
}

function logout(state: RolesState) {
    Object.assign(state, initialRolesState)
}

const stateGetter = roleState.state();

const roles = {

    get state() { return stateGetter() },

    commitFillUpRolesList: roleState.commit(fillUpRolesList, 'fillUpRolesList'),
    dispatchGetRoles: roleState.dispatch(getRoles),

    commitLogout: roleState.commit(logout, 'logout')

};

export default roles
