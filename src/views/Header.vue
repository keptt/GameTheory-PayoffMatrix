<template>
    <div>
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <a class="navbar-brand" href="#"><b>{{ msg }}</b></a>
        </nav>
    </div>
</template>

<script>
export default {
    props: {
        msg: {
            type: String
            , default: ''
        }
    }
}
</script>
