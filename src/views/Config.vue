<template>
    <div class="config-box">
        <Header/>

        <h3>Configurations</h3>
        <div class="container-fluid">
        <div id="init-row" class="row">
            <div class="col-xs-12 offset-lg-4 col-lg-2">
                <label class='setting'>
                    <div class="label">
                        Random from:
                    </div>
                    <input ref='min-val' value="-20" type="number" max="1000" min="-1000">
                </label>
                <label class='setting'>
                    <div class="label">
                        Random to:
                    </div>
                    <input ref='max-val' value="20" type="number" max="1000" min="-1000">
                </label>
            </div>
            <div class="col-xs-12 col-lg-2">
                <label class='setting' for="">
                    <div class="label">
                        Number of rows (n):
                    </div>
                    <input ref='num-of-rows' value="4" type="number" min="1" max="18">
                </label>
                <label class='setting' for="">
                    <div class="label">
                        Number of columns (m):
                    </div>
                    <input ref='num-of-cols' value="4" type="number" min="1" max="18">
                </label>
                <button ref="send-config-btn" type="button" class="btn btn-primary" action="updatePlots()">Ok</button>
            </div>
        </div>

    </div>

    </div>
</template>


<script>
import Header from './Header.vue';
import { ipcRenderer } from 'electron';

export default {
    name: 'UpdateCell'
    , components: {
        Header
    }
    // , data() {
    //     return {
    //         err: ''
    //     }
    // }
    , mounted() {
        const okButton = this.$refs['send-config-btn'];
        const _this = this;

        okButton.addEventListener('click', function() {
            const config = {}
            config.maxVal = parseInt(_this.$refs['max-val'].value, 10);
            config.minVal = parseInt(_this.$refs['min-val'].value, 10);
            config.rowNum = parseInt(_this.$refs['num-of-rows'].value, 10);
            config.colNum = parseInt(_this.$refs['num-of-cols'].value, 10);
            ipcRenderer.send('config-change', config);
        })
    }
}
</script>


<style scoped>
    .container-fluid {
        margin-top: 20px;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 0;
    }
    button {
        margin-top: 20px;
        width: 90px;
    }
    label {
        width: 100%;
    }
    input {
        width: 160px;
    }
    h3 {
        margin-top:50px;
    }
</style>
