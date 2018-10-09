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
                    name: <string> '',
                    approved: <boolean> false
                },
                orderFormRules: {
                    name: [ { required: true, message: 'Please input Order name', trigger: 'blur' } ]
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
                    this.orderForm.name = order.name;
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

                            orders.dispatchAddOrder({ordername: form.name})
                                .then(() => {

                                    formRef.resetFields();
                                    this.isAddingOrder = false;
                                    this.orderFormVisible = false

                                })
                                .catch(MessageService.showError)

                        } else {

                            orders.dispatchUpdateOrder({orderId: form.id, ordername: form.name, approved: form.approved})
                                .then(() => {

                                    formRef.resetFields();
                                    this.orderFormVisible = false

                                })
                                .catch(MessageService.showError)

                        }

                    })
                    .catch(() => console.error('order form validation fail'))
            }

        }

    })

</script>

<template>

    <div>

        <h1>Orders</h1>

        <el-button v-if="isUser" type="primary" size="mini" icon="el-icon-circle-plus" @click="addOrder">Add order</el-button>

        <el-table :data="tableData">

            <el-table-column prop="id" label="Id" width="60px"></el-table-column>
            <el-table-column prop="ordername" label="Name"></el-table-column>
            <el-table-column prop="approved" label="Approved"></el-table-column>

            <el-table-column label="">
                <template slot-scope="data">
                    <el-button type="warning" size="mini" icon="el-icon-edit" circle @click="editOrder(data.row.id)"></el-button>
                    <el-button type="danger" size="mini" icon="el-icon-delete" circle @click="deleteOrder(data.row.id, data.row.name)"></el-button>
                </template>
            </el-table-column>

        </el-table>

        <el-dialog :title="isAddingOrder ? `Add order` : `Edit order`" :visible.sync="orderFormVisible" :append-to-body="true">

            <el-form :model="orderForm" :rules="orderFormRules" ref="orderForm">

                <el-form-item label="Order name" :label-width="formLabelWidth" required prop="name">
                    <el-input v-model="orderForm.name" auto-complete="off"></el-input>
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

</style>
