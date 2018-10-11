import { getStoreBuilder } from "vuex-typex"
import { RootState } from "../"
import NetworkServices from '../../services/network.service'
import MessageService from '../../services/message.service'

export interface OrdersState {
    orders: any[] | undefined
}

const initialOrdersState: OrdersState = {
    orders: undefined
};

const orderState = getStoreBuilder<RootState>().module<OrdersState>("orders", Object.assign({}, initialOrdersState));

function refreshOrders() {

    orders.commitFillUpOrders(undefined);
    return orders.dispatchGetOrders();

}

function getOrders() {

    if (orders.state.orders) return Promise.resolve(orders.state.orders);

    NetworkServices.getOrders()
        .then(ordersData => orders.commitFillUpOrders(ordersData))
        .catch(MessageService.showError)

}

function addOrder(context: any, { ordername }) {

    return NetworkServices.addOrder(ordername)
        .then(orders.dispatchRefreshOrders)
        .catch(err => Promise.reject(err))

}

function updateOrder(context: any, { orderId, ordername, approved }) {

    return NetworkServices.updateOrder(orderId, ordername, approved)
        .then(orders.dispatchRefreshOrders)
        .catch(err => Promise.reject(err))

}

function deleteOrder(context: any, { orderId }) {

    return NetworkServices.deleteOrder(orderId)
        .then(orders.dispatchRefreshOrders)
        .catch(err => Promise.reject(err))

}

function fillUpOrders(state: OrdersState, orders: any[] | undefined) {
    state.orders = orders
}

function logout(state: OrdersState) {
    Object.assign(state, initialOrdersState)
}

const stateGetter = orderState.state();

const orders = {

    get state() { return stateGetter() },

    commitFillUpOrders: orderState.commit(fillUpOrders, 'fillUpOrders'),

    commitLogout: orderState.commit(logout, 'logout'),

    dispatchGetOrders: orderState.dispatch(getOrders),
    dispatchRefreshOrders: orderState.dispatch(refreshOrders),
    dispatchAddOrder: orderState.dispatch(addOrder),
    dispatchUpdateOrder: orderState.dispatch(updateOrder),
    dispatchDeleteOrder: orderState.dispatch(deleteOrder)

};

export default orders
