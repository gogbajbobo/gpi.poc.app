<script lang="ts">

    import Vue from 'vue'

    import auth from '../../store/modules/auth'

    import { TheHeader, TheAside, TheFooter } from '.'

    export default Vue.extend({

        name: "TheLayout",

        components: { TheHeader, TheAside, TheFooter },

        computed: {
            isAuthorized(): boolean {
                return !!auth.state.user
            }
        }

    })

</script>

<template>

    <el-container v-if="isAuthorized">
        <the-header></the-header>
        <the-aside></the-aside>
        <el-main>
            <h1>{{ this.$router.currentRoute.meta.localname }}</h1>
            <slot></slot>
        </el-main>
        <the-footer></the-footer>
    </el-container>

    <el-container v-else>
        <slot></slot>
    </el-container>

</template>

<style scoped>

    .el-header {
        position: fixed;
        top: 0;
        width: 100%;
        height: 60px;
        background-color: white;
        border-bottom: thin solid lightgray;
        padding: 0 20px;
    }

    .el-aside {
        position: fixed;
        top: 60px;
        bottom: 60px;
        max-width: 200px;
        overflow-y: scroll;
        background-color: white;
    }

    .el-main {
        position: fixed;
        left: 200px;
        top: 60px;
        bottom: 60px;
        right: 0;
        overflow-y: scroll;
    }

    .el-footer {
        position: fixed;
        height: 60px;
        bottom: 0;
        width: 100%;
        background-color: white;
        border-top: thin solid lightgray;
    }

    @media (max-width: 768px) {

        .el-header {
            position: fixed;
            top: 0;
            width: 100%;
            height: 60px;
            z-index: 1;
        }

        .el-aside {
            position: fixed;
            top: 60px;
            bottom: 60px;
            max-width: 70px;
            overflow-y: scroll;
        }

        .el-main {
            position: relative;
            left: 0;
            top: 30px;
            bottom: 0;
            right: 0;
            margin-left: 70px;
            padding-bottom: 60px;
            overflow-y: scroll;
        }

        .el-footer {
            position: fixed;
            height: 60px;
            bottom: 0;
            width: 100%;
        }

    }

</style>
