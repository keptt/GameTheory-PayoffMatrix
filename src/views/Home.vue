<template>
    <div class="home">
        <Header msg="Pay-off Matrix"/>
    <!-- <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/> -->
        <MatrixWork/>
    </div>
</template>

<script>
// @ is an alias to /src
import MatrixWork from '@/components/MatrixWork.vue';
import Header from './Header.vue';

export default {
    name: 'Home'
    , components: {
        MatrixWork
        , Header
    }
}
</script>
