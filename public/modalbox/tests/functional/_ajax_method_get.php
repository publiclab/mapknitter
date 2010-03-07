<?php
	$param = $_GET['param'];
?>

<h1>Value "<?php echo $param ?>" passed as a paramter</h1>

<p>
	<a href="_ajax_method_post.php" title="GET/POST mixed methods test: Method POST" onclick="Modalbox.show(this.href, {title: this.title, method: 'post', params: {param: '2: via POST'}, overlayClose: false }); return false;">GET/POST mixed methods test: Method POST</a>
</p>
