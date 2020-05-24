<template>
    <div class="main">
        <div class="matrix-box" ref="matrix-box-ref">
            <div class="left-matrix-label">
                <div>
                    <p><b>A player</b></p>
                </div>
            </div>
            <div class="matrix-wrapper">
                <p><b>B player</b></p>
                <div class="matrix">
                    <div class="ro" v-for="(r, i) in matrix" :key="i" :ref="i">
                        <div class="co" v-for="(c, j) in r" :key="j" :ref="`${i}:${j}`" @click="sendUpdateCell($event, `${i}:${j}`)">
                            <p>{{ c }}</p>
                            <!--<div class="editable">fg</div></div> onClick="this.contentEditable='true';" contenteditable-->
                            <!--@input="updateMatrixVal($event, `${i}:${j}`)"-->
                        </div>
                    </div>
                </div>
            </div>
            <div class="vertical-set-a" ref="vertical-set-a-ref">
                <label id="set-a-label" ref="set-a-label-ref"><b>min</b></label>
                <div class="set-a-el" v-for="(el, i) in verticalSetA" :key="`${i}a`" :ref="`set-a:${i}`">
                    <p>{{ el.val }}</p>
                </div>
            </div>
        </div>
        <div class="horizontal-set-b" ref="horizontal-set-b-ref">
            <label id="set-b-label" ref="set-b-label-ref"><b>max</b></label>
            <div class="set-b-el" v-for="(el, i) in horizontalSetB" :key="`${i}b`" :ref="`set-b:${i}`">
                <p>{{ el.val }}</p>
            </div>
        </div>

        <div class="err-box">
            {{ err }}
        </div>

        <div class="btns">
            <button id="rerand-btn" type="button" class="btn btn-primary" @click="rerandomMatrix">Rerandom</button>
            <button id="clear-btn" type="button" class="btn btn-warning" @click="clearAll">Clear</button>

            <div id="run-btn-grp" class="btn-group" role="group" aria-label="Button group with nested dropdown">
                <button type="button" class="btn btn-success" @click="runCurrent">Run</button>
                <div class="btn-group" role="group">
                    <button id="btnGroupDrop2" type="button" class="btn btn-success dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
                    <div class="dropdown-menu" aria-labelledby="btnGroupDrop2" style="">
                        <a class="dropdown-item" href="#" @click="runWithDefaults">Defaults</a>
                        <a class="dropdown-item" href="#" @click="runCurrent">Current</a>
                    </div>
                </div>
            </div>
        </div>

        <div class="answs jumbotron" v-show="showAnswers">
            <div class="answ">
                <label><h4>Optimal Decision for <label class="playername" id="a-player">A</label> player:
                    <div v-for="(point, i) in processDecisionList(optimalDecisionsOfA, 'A')" :key="i">
                        {{ point }}
                    </div>
                </h4></label>
            </div>
            <div class="answ">
                <label><h4>Optimal Decision for <label class="playername" id="b-player">B</label> player:
                    <div v-for="(point, i) in processDecisionList(optimalDecisionsOfB, 'B')" :key="i">
                        {{ point }}
                    </div>
                </h4></label>
            </div>
        </div>
    </div>
</template>

<script>
import _ from 'lodash';
// import ipcRenderer from 'electron'
// const electron      = require('electron');
// const {ipcRenderer} = electron;
import { ipcRenderer, remote } from 'electron';
const { Menu } = remote;

export default {
    name: 'HelloWorld'
    // , props: ['matrix']
    , created() {
        this.initMenu();
    }
    , mounted() {
        this.rerandomMatrix();
        ipcRenderer.on('receive-cell-val', (event, cellvalue, indxs) => {
            // console.log('old');
            // console.log(this.matrix[indxs[0]][indxs[1]]);
            // console.log(this.matrix);
            this.matrix[indxs[0]][indxs[1]] = cellvalue;
            // console.log('new');
            // console.log(this.matrix[indxs[0]][indxs[1]]);
            // console.log(this.matrix);
            this.$forceUpdate(); //! Use a better approach
        });
        ipcRenderer.on('config-change', (event, config) => {
            if (config.maxVal) {
                this.upperbound = config.maxVal;
            }
            if (config.minVal) {
                this.lowerbound = config.minVal;
            }
            if (config.rowNum) {
                this.rows = config.rowNum;
            }
            if (config.colNum) {
                this.cols = config.colNum;
            }
            this.rerandomMatrix();
        })
    }
    , data() {
        return {
            matrix : []
            // [
            //     [2, 2, 3,]
            //     , [2, 2, 5,]
            //     , [1, 0, 4,]
            //     , [0, 1, 3,]
            // ]
            , rows: 4
            , cols: 4
            , upperbound: 20
            , lowerbound: -20
            , optimalDecisionsOfB: []
            , optimalDecisionsOfA: []
            , horizontalSetB: []
            , verticalSetA: []
            , showAnswers: false
            , cleared: false //! Set to true in prod
            , err: ''
        }
    }
    , methods: {
        clearAll() {
            this.err = '';
            this.uncolorMatrix();

            let zero_matrix = new Array(this.matrix.length);

            for (let i = 0; i < this.matrix.length; i++) {
                zero_matrix[i] = [];
                for (let j = 0; j < this.matrix[i].length; j++) {
                    zero_matrix[i][j] = '_';
                }
            }
            this.matrix         = zero_matrix;
            this.horizontalSetB = [];
            this.verticalSetA   = [];
            this.$refs['set-a-label-ref'].style.display = 'none';
            this.$refs['set-b-label-ref'].style.display = 'none';
            this.$refs['vertical-set-a-ref'].style.marginLeft = '0px';
            this.$refs['matrix-box-ref'].style.marginLeft = '0px';

            this.showAnswers    = false;
            this.cleared        = true;
        }
        , rerandomMatrix() {
            this.uncolorMatrix();
            this.clearAll();

            this.matrix = this.randomMatrix(this.lowerbound, this.upperbound, this.rows, this.cols);
            this.cleared = false;
            this.err = '';
        }
        , runWithDefaults() {
            if (this.cleared === true) {
                this.err = 'Nothing to run; matrix empty';
                return;
            }

            this.matrix = this.randomMatrix(-20, 20, 4, 4);
            console.table(this.matrix);
            this.runCurrent();
        }
        , runCurrent() {
            if (this.cleared === true) {
                this.err = 'Nothing to run; matrix empty';
                return;
            }
            this.err = '';
            this.uncolorMatrix();
            // console.log('success1');

            let resultObj = this.calculateMatrix(this.matrix);
            // console.log('success2');

            if (resultObj.aAnswIndxs.length && resultObj.bAnswIndxs.length) {
                for (let i = 0; i < resultObj.aAnswIndxs.length; i++) {
                    this.$refs[`${resultObj.aAnswIndxs[i].row}:${resultObj.aAnswIndxs[i].col}`][0].style.backgroundColor = 'rgb(0, 219, 84)';
                    // console.log(`success2_${i}`);
                }
                for (let i = 0; i < resultObj.bAnswIndxs.length; i++) {
                    this.$refs[`${resultObj.bAnswIndxs[i].row}:${resultObj.bAnswIndxs[i].col}`][0].style.backgroundColor = 'red';
                    if (resultObj.aAnswIndxs.map(elem => `${elem.row}:${elem.col}`).includes(`${resultObj.bAnswIndxs[i].row}:${resultObj.bAnswIndxs[i].col}`)) {// //
                        // console.log(`success3_${i}`);
                        this.$refs[`${resultObj.bAnswIndxs[i].row}:${resultObj.bAnswIndxs[i].col}`][0].style.color  = 'white';//'rgb(0, 219, 84)';
                        this.$refs[`${resultObj.bAnswIndxs[i].row}:${resultObj.bAnswIndxs[i].col}`][0].style.border = '2px solid rgb(0, 219, 84)';
                    }
                }
            }
            console.log(resultObj.bAnswIndxs);
            console.log(resultObj.aAnswIndxs);
            // console.log('success4');

            // if (!!resultObj.aAnswIndxs[0] && !!resultObj.bAnswIndxs[0]) {
            this.optimalDecisionsOfA = resultObj.aAnswIndxs;
            this.optimalDecisionsOfB = resultObj.bAnswIndxs;

            this.horizontalSetB = resultObj.horizontalSetB;
            this.verticalSetA   = resultObj.verticalSetA;

            if (resultObj.horizontalSetB.length) {
                this.$refs['vertical-set-a-ref'].style.marginLeft = '20px';
                this.$refs['matrix-box-ref'].style.marginLeft = '30px';
                this.$refs['set-a-label-ref'].style.display = 'block';
                this.$refs['set-b-label-ref'].style.display = 'inline';
            }
            // }
            this.showAnswers        = true;
            this.cleared            = false;

            // console.log('success5');
        }
        , calculateMatrix(matrix) {
            let resultObj = {
                'bAnswIndxs' : []
                , 'aAnswIndxs' : [] //{'row': 1, 'col': 1, 'saddle': false}
                , 'horizontalSetB' : null
                , 'verticalSetA' : null
            };
            let verticalSetA = new Array(matrix.length).fill(0);

            for (let i = 0; i < matrix.length; i++) {
                let minElement = Math.min.apply(null, matrix[i]);
                verticalSetA[i] = {
                    'row': i
                    , 'col': matrix[i].indexOf(minElement)
                    , 'val': minElement
                    , 'saddle': false
                };
            }

            let transposedMatrix = _.zip(...matrix)
            let horizontalSetB = new Array(transposedMatrix.length).fill(0);

            for (let i = 0; i < transposedMatrix.length; i++) {
                let maxElement = Math.max.apply(null, transposedMatrix[i]);
                horizontalSetB[i] = {
                    'row': transposedMatrix[i].indexOf(maxElement)
                    , 'col': i
                    , 'val': maxElement
                    , 'saddle': false
                };
            }

            let bAnswIndxs = horizontalSetB.filter(elem => (elem.val === Math.min.apply(null, horizontalSetB.map(el => el.val))));
            let aAnswIndxs = verticalSetA.filter(elem => (elem.val === Math.max.apply(null, verticalSetA.map(el => el.val))));

            // bAnswIndxs
            // aAnswIndxs
            for (let i = 0; i < transposedMatrix.length; i++) {
                for (let j = 0; j < transposedMatrix[i].length; j++) {
                    if (bAnswIndxs.length && !bAnswIndxs.map(elem => `${elem.row}:${elem.col}`).includes(`${j}:${i}`) && bAnswIndxs[0].val === transposedMatrix[i][j]) {
                        bAnswIndxs.push({
                            'row': j
                            , 'col': i
                            , 'val': transposedMatrix[i][j]
                            , 'saddle': false
                        });
                    }
                }
            }

            for (let i = 0; i < matrix.length; i++) {
                for (let j = 0; j < matrix[i].length; j++) {
                    if (aAnswIndxs.length && !aAnswIndxs.map(elem => `${elem.row}:${elem.col}`).includes(`${i}:${j}`) && aAnswIndxs[0].val === matrix[i][j]) {
                        aAnswIndxs.push({
                            'row': i
                            , 'col': j
                            , 'val': matrix[i][j]
                            , 'saddle': false
                        });
                    }
                }
            }

            if (!!bAnswIndxs.length && !!aAnswIndxs.length) {
                if (bAnswIndxs[0].val === aAnswIndxs[0].val) {
                    bAnswIndxs.map(elem => {elem.saddle = true; return elem;});
                    aAnswIndxs.map(elem => {elem.saddle = true; return elem;});
                }
            }

            resultObj.bAnswIndxs        = bAnswIndxs;
            resultObj.aAnswIndxs        = aAnswIndxs;
            resultObj.horizontalSetB    = horizontalSetB;
            resultObj.verticalSetA      = verticalSetA;

            return resultObj;
        }
        , randomMatrix(lowerbound, upperbound, rows, cols) {
            let matrix = new Array(rows);
            for (let i = 0; i < rows; i++) {
                matrix[i] = new Array(cols).fill(0);
                for (let j = 0; j < cols; j++) {
                    matrix[i][j] = Math.floor(Math.random() * (upperbound - lowerbound + 1)) + lowerbound;
                }
            }
            return matrix
        }
        // , createEmptyMatrix(rows, cols) {
        //     let matrix = new Array(rows);
        //     for (let i = 0; i < rows; i++) {
        //         matrix[i] = new Array(cols).fill(0);
        //         for (let j = 0; j < cols; j++) {
        //             matrix[i][j] = '_';
        //         }
        //     }
        //     return matrix
        // }
        , uncolorMatrix() {
            for (let i = 0; i < this.matrix.length; i++) {
                console.log(this.$refs[`${i}`])
                for (let j = 0; j < this.matrix[i].length; j++) {
                    console.log('su')
                    console.log(`${i}:${j}`)
                    console.log(this.$refs)
                    console.log(this.$refs[`${i}:${j}`])
                    console.log(this.$refs['0:3'])
                    console.log(this.$refs[`${i}:${j}`][0])
                    this.$refs[`${i}:${j}`][0].style.backgroundColor = null;
                    this.$refs[`${i}:${j}`][0].style.color  = 'black';
                    this.$refs[`${i}:${j}`][0].style.border = '1px solid lightgrey';
                    console.log('end su')
                }
            }
        }
        , sendUpdateCell(e, id) {
            ipcRenderer.send('update-cell', id.split(':'));
        }
        // , initEmptyMatrix() {
        //     this.matrix = this.createEmptyMatrix(this.rows, this.cols);
        // }
        , initMenu() {
            const menu = Menu.buildFromTemplate([
                {
                    label: 'File',
                    submenu: [
                        {
                            label: 'Configure'
                            , accelerator: 'CmdOrCtrl+N'
                            , click: () => {
                                ipcRenderer.send('toggle-config');
                            }
                        }
                        , { type: 'separator' }
                        , {
                            label: 'Quit'
                            , accelerator: 'CmdOrCtrl+Q'
                            , click: () => {
                                ipcRenderer.send('shut-down');
                            }
                        }
                    ]
                },
            ])
            Menu.setApplicationMenu(menu);
        }
        , processDecisionList(decisionList, type) {
            console.log('desList');
            console.log(decisionList);
            console.log(decisionList.length);
            console.log(!!decisionList.length);
            console.log(decisionList[0]);
            let resList = [];
            // let ending_with = ' or ';

            if (decisionList.length) {
                console.log('success');
                if (type.toUpperCase() === 'B') {
                    resList = decisionList.map((curr) => `${decisionList[0].val}, column=${curr.col + 1}` + (curr.saddle ? ` (row=${curr.row + 1}) is saddle` : ''));
                }
                else {
                    resList = decisionList.map((curr) => `${decisionList[0].val}, row=${curr.row + 1}` + (curr.saddle ? ` (column=${curr.col + 1}) is saddle` : ''));
                }
                console.log('after success');
            }
            console.log('resList');
            console.log(resList);
            // if (mergedStr.endsWith(' or ')) {
            //     mergedStr = mergedStr.slice(0, mergedStr.length - mergedStr.length)
            // }
            return resList;
        }
        // , lupdateMatrixVa(e, id) {
        //     this.err = '';
        //     let i, j;
        //     let val = e.target.innerHTML;
        //     console.log(id);
        //     [i, j] = id.split(':');
        //     [i, j] = [parseInt(i, 10), parseInt(j, 10)];
        //     let oldVal = this.matrix[i][j];
        //     // if (!parseInt(e.target.text, 10)) {
        //     //     alert("Error! You must enter an integer");
        //     //     return;
        //     // }
        //     console.log('target');
        //     console.log(e.target);
        //     console.log('oldValue');
        //     console.log(oldVal);
        //     console.log('value');
        //     console.log(val);
        //     if (!val) {
        //         val = 0;
        //     }
        //     else if (val == '-') {
        //         val = 0;
        //     }
        //     else if (isNaN(parseInt(val, 10))) {
        //         this.err = 'Error! You must enter an integer';
        //         // alert("Error! You must enter an integer");
        //         // e.target.innerHTML = oldVal;
        //         this.$forceUpdate();
        //         return;
        //     }
        //     this.$forceUpdate();
        //     console.log('rerendered');
        //     this.matrix[i][j] = parseInt(val, 10);
        //     console.log('matrix');
        //     console.log(this.matrix);
        // }
        // , isInt(n) {
        //     return !isNaN(parseInt(n, 10)) && parseInt(n, 10);
        // }
        // , formatDecisionList(decisionList) {
        //     return decisionList.reduce((accumulator, curr) => accumulator += `${curr.val} (row=${curr.row + 1}, column=${curr.col + 1}); `, '');
        // }
        // , transposeArray(array, arrayLength){
        //     let newArray = [];
        //     for(let i = 0; i < array.length; i++){
        //         newArray.push([]);
        //     };

        //     for(let i = 0; i < array.length; i++){
        //         for(let j = 0; j < arrayLength; j++){
        //             newArray[j].push(array[i][j]);
        //         };
        //     };

        //     return newArray;
        // }
    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
}
ul {
    list-style-type: none;
    padding: 0;
}
li {
    display: inline-block;
    margin: 0 10px;
}
a {
    color: #42b983;
}

/* .editable {
    display: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    width:100%;
    height: 100%;
    white-space:normal;
    background-color: red;
} */

.co {
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    border: 1px solid lightgrey;
    padding: 12px 30px;
    /* margin: 20px; */
    display: table-cell;
}

.co:hover {
    background-color: lightskyblue;
    border: 1px solid transparent;
    color: white;
    cursor: pointer;
}

.ro {
    display: table-row;
}

.matrix {
    /* background-color: red; */
    display: table;
    max-width: 100%;
    margin: 0 auto;
    border: 1px solid lightgrey;
    margin-bottom: 20px;
}

.matrix:hover {
    border: 1px solid transparent;
}

.main {
    margin-top: 50px;
}

#run-btn-grp {
    width: 105px;
}

#rerand-btn {
    width: 105px;
}

#clear-btn {
    width: 105px;
}

.answs {
    margin-top: 50px;
}

.playername {
    color: rgb(0, 219, 84);
}

#b-player {
    color: red;
}

.err-box {
    background-color: #ffcece;
    color: red;
    display: inline-block;
    margin-bottom: 10px;
}

.btns {
    margin-bottom: 50px;
}

.matrix-box {
    display: flex;
    justify-content: center;
    margin-right: 50px;
}

.vertical-set-a {
    margin-top: 2px;
}

.vertical-set-a > div {
    border: 2px solid lightgrey;
    padding: 12px 30px;
    background-color: rgb(0, 219, 84);
    color: white;
}

#set-b-label {
    margin-right: 10px;
}


.horizontal-set-b {
    margin-right: 108px;
    margin-bottom: 30px;
}

.horizontal-set-b > div {
    display: inline-block;
    border: 2px solid lightgrey;
    padding: 12px 30px;
    background-color: red;
    color: white;
}

.left-matrix-label {
    display: flex;
}

.left-matrix-label > div {
    /* display: table-cell; */
    /* vertical-align: middle; */
    margin: auto; /* Important */
    text-align: center;
}

.left-matrix-label > div > p {
    transform: rotate(-90deg);
}

</style>
