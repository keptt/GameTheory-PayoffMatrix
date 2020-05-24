<template>
    <div class="update-cell">
        <label><b>New Value:</b></label>
        <div>
            <div class="cell-val-box">
                <div>
                    <input ref="inpt-cell-txt" type="number" min="-1000" max="1000">
                </div>
                <button ref="inpt-cell-val-btn" type="button" class="btn btn-success">Ok</button>
            </div>
        </div>
    </div>
</template>


<script>
import { ipcRenderer } from 'electron';
import Header from './Header.vue';
// const electron = require('electron');
// {ipcRenderer}
export default {
    name: 'UpdateCell'
    // , data() {
    //     return {
    //         err: ''
    //     }
    // }
    , mounted() {
        // console.log(this.$refs['inpt-cell-val-btn']);
        // this.err = '';

        const okButton = this.$refs['inpt-cell-val-btn'];
        const _this = this;

        okButton.addEventListener('click', function() {
            // console.log(_this.$refs['inpt-cell-txt']);
            // if (isNaN(parseInt(_this.$refs['inpt-cell-txt'].value, 10))) {
            //     _this.err = 'Value must be an integer!';
            //     return;
            // }

            const val = parseInt(_this.$refs['inpt-cell-txt'].value, 10);
            ipcRenderer.send('receive-cell-val', val);
        })
    }
}
</script>


<style scoped>
    label {
        margin-left: 10px;
    }
    button {
        margin-top: 5px;
        margin-bottom: 10px;
        width: 100%;
    }
    .cell-val-box {
        max-width: 80%;
        display: inline-block;
    }

    /* .err-box {
        background-color: #ffcece;
        color: red;
        display: inline-block;
        margin-bottom: 10px;
    } */
</style>
