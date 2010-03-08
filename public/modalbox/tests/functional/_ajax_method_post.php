<?php
	$param = $_POST['param'];
?>

<h1>Value "<?php echo $param ?>" passed as a paramter</h1>

<p>
	<a href="_ajax_method_get.php" title="GET/POST mixed methods test: Method GET again" onclick="Modalbox.show(this.href, {title: this.title, method: 'get', params: {param: '3: via GET'}, overlayClose: true }); return false;">GET/POST mixed methods test: Method GET again</a>
</p>