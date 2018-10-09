<script lang="ts">

    import Vue from 'vue'
    import dateFormat from 'date-fns/format'

    import MessageService from '../services/message.service'
    import NetworkService from '../services/network.service'
    import orders from '../store/modules/orders'
    import auth from '../store/modules/auth'
    import User, { UserModel } from '../models'

    export default Vue.extend({

        name: "Orders",

        data() {
            return {

                user: <UserModel> auth.state.user,
                users: <Array<UserModel>> [],
                isAdmin: <boolean> false,
                isUser: <boolean> false,
                formLabelWidth: '120px',

                isAddingOrder: <boolean> false,
                orderFormVisible: <boolean> false,
                orderForm: {
                    id: <number|undefined> undefined,
                    ordername: <string> '',
                    approved: <boolean> false
                },
                orderFormRules: {
                    ordername: [ { required: true, message: 'Please input Order name', trigger: 'blur' } ]
                },

                orderSearchString: <string> '',

                tableData: <Array<any>> [],
                selectedOrderId: <number|undefined> undefined

            }
        },

        computed: {

            orders() {
                return orders.state.orders
            }

        },

        created() {

            orders.dispatchGetOrders();
            this.refreshTableData();
            this.isAdmin = User.isAdmin(this.user);
            this.isUser = User.isUser(this.user);

            if (this.isAdmin) {

                NetworkService.getUsers()
                    .then(users => this.users = users)
                    .catch(MessageService.showError)

            }

        },

        mounted() {


        },

        watch: {

            orders: function() {
                this.refreshTableData()
            },

            orderSearchString: function() {
                this.refreshTableData()
            }

        },

        methods: {

            refreshTableData() {
                
                let tableData = this.orders || [];
                
                if (this.orderSearchString) {

                    const searchStringLowercase = this.orderSearchString.toLowerCase();
                    tableData = tableData.filter(order => order.ordername.toLowerCase().includes(searchStringLowercase))

                }
                
                this.tableData = tableData

            },

            addOrder() {

                if (!this.orderFormVisible) {

                    this.isAddingOrder = true;
                    this.orderFormVisible = true

                }

            },

            editOrder(orderId: number) {

                if (!this.orderFormVisible) {

                    const order: any = (this.orders || []).filter(order => order.id === orderId)[0];

                    this.orderForm.id = order.id;
                    this.orderForm.ordername = order.ordername;
                    this.orderForm.approved = order.approved;
                    this.orderFormVisible = true

                }

            },

            deleteOrder(orderId: number, orderName: string) {

                MessageService.showConfirmMessage(`Delete order '${ orderName }'`, 'Are you sure?')
                    .then(() => orders.dispatchDeleteOrder({ orderId }).catch(MessageService.showError))
                    .catch(() => {})

            },

            cancelOrderForm() {

                if (this.orderFormVisible) this.orderFormVisible = false;
                this.isAddingOrder = false;
                (this.$refs['orderForm'] as any).resetFields()

            },

            confirmOrderForm() {

                const formRef: any = this.$refs['orderForm'];

                formRef.validate()
                    .then(() => {

                        console.log('order form validation success');

                        const form = this.orderForm;

                        if (this.isAddingOrder) {

                            orders.dispatchAddOrder({ordername: form.ordername})
                                .then(() => {

                                    formRef.resetFields();
                                    this.isAddingOrder = false;
                                    this.orderFormVisible = false

                                })
                                .catch(MessageService.showError)

                        } else {

                            orders.dispatchUpdateOrder({orderId: form.id, ordername: form.ordername, approved: form.approved})
                                .then(() => {

                                    formRef.resetFields();
                                    this.orderFormVisible = false

                                })
                                .catch(MessageService.showError)

                        }

                    })
                    .catch(() => console.error('order form validation fail'))
            },

            approveOrder(orderId: number, ordername: string) {

                MessageService.showConfirmMessage(`Approve order '${ ordername }'`, 'Are you sure?')
                    .then(() => orders.dispatchUpdateOrder({ orderId, ordername, approved: true }).catch(MessageService.showError))
                    .catch(() => {})

            },

            dateFormatter(order) {
                return dateFormat(order.created_at, 'DD MMM YYYY, HH:mm:ss')
            },

            usernameForUserId(user_id: number) {
                return (this.users.find(user => user.id === user_id) || {username: 'Unknown user'}).username
            }

        }

    })

</script>

<template>

    <div>

        <el-row v-if="isUser" >
            <el-button type="primary" size="mini" icon="el-icon-circle-plus" @click="addOrder">Add order</el-button>
        </el-row>

        <el-row>
            <el-input class="order-search-string"
                      placeholder="Search orders by name"
                      prefix-icon="el-icon-search"
                      v-model="orderSearchString"></el-input>
        </el-row>

        <el-table :data="tableData" :default-sort = "{prop: 'id', order: 'ascending'}">

            <el-table-column prop="id" label="Id" width="60px" :sortable="true"></el-table-column>
            <el-table-column prop="created_at" label="Date" :sortable="true" :formatter="dateFormatter"></el-table-column>
            <el-table-column prop="ordername" label="Name" :sortable="true"></el-table-column>
            <el-table-column v-if="isAdmin" prop="user_id" label="User" :sortable="true">
                <template slot-scope="data">
                    {{ usernameForUserId(data.row.user_id) }}
                </template>
            </el-table-column>
            <el-table-column prop="approved" label="Approved" :sortable="true">
                <template slot-scope="data">
                    <template v-if="data.row.approved">
                        <span class="order-approved"><i class="el-icon-success"></i></span>
                    </template>
                    <template v-else>
                        <el-button type="primary" v-if="isAdmin" @click="approveOrder(data.row.id, data.row.ordername)">Approve</el-button>
                        <span v-else class="order-waiting-for-approve"><i class="el-icon-question"></i></span>
                    </template>
                </template>
            </el-table-column>

            <el-table-column v-if="isUser" label="">
                <template slot-scope="data" v-if="!data.row.approved">
                    <el-button type="warning"
                               size="mini"
                               icon="el-icon-edit"
                               circle
                               @click="editOrder(data.row.id)"></el-button>
                    <el-button type="danger"
                               size="mini"
                               icon="el-icon-delete"
                               circle
                               @click="deleteOrder(data.row.id, data.row.ordername)"></el-button>
                </template>
            </el-table-column>

        </el-table>

        <el-dialog :title="isAddingOrder ? `Add order` : `Edit order`" :visible.sync="orderFormVisible" :append-to-body="true">

            <el-form :model="orderForm" :rules="orderFormRules" ref="orderForm">

                <el-form-item label="Order name" :label-width="formLabelWidth" required prop="ordername">
                    <el-input v-model="orderForm.ordername" auto-complete="off"></el-input>
                </el-form-item>

            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelOrderForm">Cancel</el-button>
                <el-button type="primary" @click="confirmOrderForm">Confirm</el-button>
            </span>

        </el-dialog>

    </div>

</template>

<style scoped>

    .order-approved {
        font-size: x-large;
        color: #67C23A;
    }

    .order-waiting-for-approve {
        font-size: x-large;
        color: #E6A23C;
    }

    .order-search-string {
        margin-top: 10px;
        width: 256px;
    }

</style>
