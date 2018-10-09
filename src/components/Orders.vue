<script lang="ts">

    import Vue from 'vue'

    import MessageService from '../services/message.service'
    import orders from '../store/modules/orders'
    import auth from '../store/modules/auth'
    import User, { UserModel } from '../models'

    export default Vue.extend({

        name: "Orders",

        data() {
            return {

                user: <UserModel> auth.state.user,
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

        },

        mounted() {


        },

        watch: {

            orders: function() {
                this.refreshTableData()
            }

        },

        methods: {

            refreshTableData() {
                this.tableData = this.orders || []
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

            }

        }

    })

</script>

<template>

    <div>

        <el-button v-if="isUser" type="primary" size="mini" icon="el-icon-circle-plus" @click="addOrder">Add order</el-button>

        <el-table :data="tableData" :default-sort = "{prop: 'id', order: 'ascending'}">

            <el-table-column prop="id" label="Id" width="60px" :sortable="true"></el-table-column>
            <el-table-column prop="created_at" label="Date" :sortable="true"></el-table-column>
            <el-table-column prop="ordername" label="Name" :sortable="true"></el-table-column>
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
                    <el-button type="warning" size="mini" icon="el-icon-edit" circle @click="editOrder(data.row.id)"></el-button>
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
        color: #67C23A;
    }

    .order-waiting-for-approve {
        color: #E6A23C;
    }

</style>
