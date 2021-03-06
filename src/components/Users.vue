<script lang="ts">

    import Vue from "vue"
    import NetworkService from '../services/network.service'
    import MessageService from '../services/message.service'
    import auth from '../store/modules/auth'
    import roles from '../store/modules/roles'
    import User, { UserModel } from '../models'

    export default Vue.extend({

        name: "Users",

        data() {
            return {
                user: <UserModel> auth.state.user,
                busy: <boolean> false,
                usersData: <Array<any>> [],
                isAdmin: <boolean> false
            }
        },

        created() {

            roles.dispatchGetRoles();

            this.isAdmin = User.isAdmin(this.user);

            if (this.isAdmin) {

                this.busy = true;

                NetworkService.getUsers()
                    .then(users => this.usersData = users)
                    .catch(MessageService.showError)
                    .then(() => this.busy = false)

            } else {
                this.usersData = [this.user];
            }

        },

        computed: {

            isMobile(): boolean {
                return window.innerWidth <= 768
            },

            tableFields() {

                return [
                    {
                        prop: 'id',
                        label: 'Id',
                        minWidth: 60,
                        fixed: true,
                        sortable: true
                    },
                    {
                        prop: 'username',
                        label: 'Name',
                        minWidth: 90,
                        sortable: true
                    },
                    {
                        prop: 'roles',
                        label: 'Roles',
                        filters: roles.state.rolesList.map(role => {
                            return { text: role.rolename, value: role.rolename }
                        }),
                        filterMethod: (value, row) => row.roles.split(',').includes(value)
                    }
                ]

            }

        },

        methods: {

            detailClick(userId) {
                this.$router.push({name: 'Profile', params: {id: userId}})
            },
            addNewUser() {
                this.$router.push({name: 'Register'})
            },
            filterRole(value, row) {
                return row.role === value;
            }

        }

    });

</script>

<template>

    <div>

        <el-table :data="usersData"
                  :default-sort = "{prop: 'id', order: 'ascending'}"
                  v-loading="busy"
                  :height="isMobile ? 300 : 500">

            <el-table-column v-for="field in tableFields"
                             :prop="field.prop"
                             :label="field.label"
                             :fixed="field.fixed"
                             :key="field.prop"
                             :width="field.width"
                             :min-width="field.minWidth"
                             :sortable="field.sortable"
                             :formatter="field.formatter"
                             :filters="field.filters"
                             :filter-method="field.filterMethod"
                             filter-placement="bottom-end">
            </el-table-column>

            <el-table-column fixed="right" :width="isMobile ? 50 : 96">
                <template slot-scope="data">

                    <el-button @click="detailClick(data.row.id)"
                               type="text"
                               size="small">Detail</el-button>

                </template>
            </el-table-column>

        </el-table>

        <el-button v-if="isAdmin"
                   class="el-button--new-user"
                   @click="addNewUser"
                   type="primary">
            Add new user
        </el-button>

    </div>

</template>

<style scoped>

    .el-button--new-user {
        margin: 20px 10px;
    }

</style>
