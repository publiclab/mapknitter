# Mapknitter Exporter

Welcome to the Mapknitter export API!

Please provide a json file such as <a href="https://mapknitter.org/maps/irish-uk-border-mapping/warpables.json">this</a>.

You can create it online with <a href="https://mapknitter.org/">Mapknitter</a>!

<form action="/export" method="POST" enctype='multipart/form-data'>
    <input name="metadata" type="file" label="Post a json file" />
    <input type="submit" value="Send" />
</form>


<style>
    html {
        background-color: #e5e520;
    }
    body {
        margin: auto;
        border-left: 5px solid brown;
        width: 80%;
        font-family: Sans;
        background-color: lightYellow;
        padding: 2em;
    }
</style>
