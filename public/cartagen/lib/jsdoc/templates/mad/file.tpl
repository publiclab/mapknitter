<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" xml:lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>

<meta http-equiv="content-type"        content="text/html; charset=UTF-8" />
<meta http-equiv="content-style-type"  content="text/css" />
<meta http-equiv="content-script-type" content="text/javascript" />
<meta name="generator" content="JsDoc Toolkit {+JsDoc.VERSION+}" />
<title>{+data.index.mad.title+} &raquo; {+(data.overview.name||data.filename)+}</title>
<link href="default.css" type="text/css" rel="stylesheet" media="all" />
<script src="default.js" type="text/javascript"></script>

</head>
<body id="pagetop">
<div id="body">



<!--============= HEADER ============-->
<div id="header">
	<ul>
		<li><a href="index.html">{+data.index.mad.title+}</a></li>
		<li><a href="{+data.file+}">{+(data.overview.name||data.filename)+}</a></li>
	</ul>
</div>
<!--============ /HEADER ============-->



<div id="layout">



<!--============== NAV ==============-->
<div id="nav">
	<for each="file" in="data.index.files">
	<div class="close">
		<h2>
			<span class="name"><a href="{+file.file+}">{+file.name+}</a></span>
			<if test="!file.is_page && (file.constructors.length || file.objects.length)">
				<span class="ico"><a href="#"></a></span>
			</if>
		</h2>
		<div class="list">
		<if test="!file.is_page">
			<if test="file.constructors.length">
				<h3>Constructors</h3>
				<ul>
					<for each="cons" in="file.constructors.sort()">
						<li><a href="{+file.file+}#{+cons+}">{+cons+}</a></li>
					</for>
				</ul>
			</if>
			<if test="file.objects.length">
				<h3>Objects</h3>
				<ul>
					<for each="obj" in="file.objects.sort()">
						<li><a href="{+file.file+}#{+obj+}">{+obj+}</a></li>
					</for>
				</ul>
			</if>
		</if>
		</div>
	</div>
	</for>
</div>
<!--============= /NAV ==============-->


    
<!--============== DOCS =============-->
<div id="docs">
<h1>{+(data.overview.name||data.filename)+}</h1>
<p>{+data.overview.desc+}</p>
<div class="overview">
	<table cellspacing="0">
		<if test="data.src">
			<tr>
				<th class="tag">source</th>
				<td class="desc"><a href="{+data.src+}">{+data.filename+}</a></td>
			</tr>
		</if>
		<for each="tag" in="data.overview.doc.tags">
			<tr>
				<th class="tag">{+tag.title+}</th>
				<td class="desc">{+tag.desc+}</td>
			</tr>
		</for>
	</table>
</div>



{! constructors = []; !}
{! objects      = []; !}
{! functions    = []; !}
<for each="symbol" in="data.symbols">
	<if test="symbol.is('CONSTRUCTOR')">{! constructors.push(symbol); !}</if>
	<if test="symbol.is('OBJECT')">     {! objects.push(symbol);      !}</if>
	<if test="symbol.is('FUNCTION')">   {! functions.push(symbol);    !}</if>
</for>



<if test="constructors.length">
<h2>Constructors</h2>
<for each="symbol" in="constructors">
<div class="section constructor">
	<a href="#pagetop" class="pagetop"></a>
	<h3><a id="{+symbol.alias+}"></a>
		<if test="symbol.memberof">
			<i><a href="#{+symbol.memberof+}" class="member">{+symbol.memberof+}.</a></i>{+symbol.name+}(<span class="signature">{+symbol.signature()+}</span>)
		</if>
		<if test="!symbol.memberof">
			{+symbol.alias+}(<span class="signature">{+symbol.signature()+}</span>)
		</if>
	</h3>
	
	<if test="symbol.desc != 'undocumented'">
		<p>{+symbol.desc+}</p>
	</if>
	
	<if test="symbol.doc.getTag('example').length">
		<h4>examples</h4>
		<for each="example" in="symbol.doc.getTag('example')">
			<pre>{+example.desc+}</pre>
		</for>
	</if>
	
	<if test="symbol.inherits.length">
		<h4>inherits</h4>
		<ul>
		<for each="inherit" in="symbol.inherits">
			<li><a href="#{+inherit+}">{+inherit+}</a></li>
		</for>
		</ul>
	</if>
	
	<if test="symbol.params.length">
		<h4>parameters</h4>
		<table cellspacing="0">
			<tr>
				<th>type</th>
				<th>name</th>
				<th>description</th>
			</tr>
		<for each="param" in="symbol.params">
			<tr>
				<td class="type">{+param.type+}</td>
				<td class="name param">
					{+param.name+}
					<if test="param.isOptional">
						<span class="option">(optional)</span>
					</if>
				</td>
				<td class="desc">{+param.desc+}</td>
			</tr>
		</for>
		</table>
	</if>
	
	{! cons_objects    = []; !}
	{! cons_properties = []; !}
	<for each="property" in="symbol.properties">
		<if test="property.isa">
			{! cons_objects.push({
				type : property.type,
				alias: property.alias,
				name : property.name,
				desc : property.desc
			}); !}
		</if>
		<if test="!property.isa">
			{! cons_properties.push({
				type : property.type,
				name : property.name,
				desc : property.desc
			}); !}
		</if>
	</for>
	
	<if test="cons_objects.length">
		<h4>objects</h4>
		<table cellspacing="0">
			<tr>
				<th>type</th>
				<th>name</th>
				<th>description</th>
			</tr>
		<for each="obj" in="cons_objects">
			<tr>
				<td class="type"><if test="obj.type">{+obj.type+}</if></td>
				<td class="name"><a href="#{+obj.alias+}">{+obj.name+}</a></td>
				<td class="desc">{+obj.desc+}</td>
			</tr>
		</for>
		</table>
	</if>
	
	<if test="cons_properties.length">
		<h4>properties</h4>
		<table cellspacing="0">
			<tr>
				<th>type</th>
				<th>name</th>
				<th>description</th>
			</tr>
		<for each="property" in="cons_properties">
			<tr>
				<td class="type"><if test="property.type">{+property.type+}</if></td>
				<td class="name">{+property.name+}</td>
				<td class="desc">{+property.desc+}</td>
			</tr>
		</for>
		</table>
	</if>
	
	<if test="symbol.methods.length">
		<h4>methods</h4>
		<ul>
		<for each="method" in="symbol.methods">
			<li><a href="#{+method.alias+}">{+method.name+}</a>(<span class="signature">{+method.signature()+}</span>)</li>
		</for>
		</ul>
	</if>
	
	<if test="symbol.exceptions.length">
		<h4>exceptions</h4>
		<table cellspacing="0">
			<tr>
				<th>type</th>
				<th>description</th>
			</tr>
		<for each="ex" in="symbol.exceptions">
			<tr>
				<td class="type">{+ex.type+}</td>
				<td class="desc">{+ex.desc+}</td>
			</tr>
		</for>
		</table>
	</if>
</div>
</for>
</if>



<if test="objects.length">
<h2>Objects</h2>
<for each="symbol" in="objects">
<div class="section object">
	<a href="#pagetop" class="pagetop"></a>
	<h3><a name="{+symbol.alias+}"></a>
		<if test="symbol.type">
			<span class="type">{+symbol.type+}</span>
		</if>
		<if test="symbol.memberof">
			<i><a href="#{+symbol.memberof+}" class="member">{+symbol.memberof+}.</a></i>{+symbol.name+}
		</if>
		<if test="!symbol.memberof">
			{+symbol.alias+}
		</if>
	</h3>
	
	<if test="symbol.desc != 'undocumented'">
		<p>{+symbol.desc+}</p>
	</if>
	
	<if test="symbol.doc.getTag('example').length">
		<h4>examples</h4>
		<for each="example" in="symbol.doc.getTag('example')">
			<pre>{+example.desc+}</pre>
		</for>
	</if>
	
	<if test="symbol.properties.length">
		<h4>properties</h4>
		<table cellspacing="0">
			<tr>
				<th>type</th>
				<th>name</th>
				<th>description</th>
			</tr>
		<for each="property" in="symbol.properties">
			<tr>
				<td class="type">{+property.type+}</td>
				<td class="name">{+property.name+}</td>
				<td class="desc">{+property.desc+}</td>
			</tr>
		</for>
		</table>
	</if>
	
	{! obj_methods = []; !}
	<for each="method" in="functions">
		<if test="method.alias.replace(/\.[^\.]+$/, '') == symbol.alias">
			{! obj_methods.push({
				alias    : method.alias,
				name     : method.name,
				signature: method.signature()
			}); !}
		</if>
	</for>
	
	<if test="obj_methods.length">
		<h4>methods</h4>
		<ul>
		<for each="method" in="obj_methods">
			<li><a href="#{+method.alias+}">{+method.name+}</a>(<span class="signature">{+method.signature+}</span>)</li>
		</for>
		</ul>
	</if>
</div>
</for>
</if>



<if test="functions.length">
<h2>Functions</h2>
<for each="symbol" in="functions">
<div class="section function">
	<a href="#pagetop" class="pagetop"></a>
	<h3>
		<a name="{+symbol.alias+}"></a>
		<if test="symbol.memberof">
			<i><a href="#{+symbol.memberof+}" class="member">{+symbol.memberof+}.</a></i>{+symbol.name+}(<span class="signature">{+symbol.signature()+}</span>)
		</if>
		<if test="!symbol.memberof">
			{+symbol.alias+}(<span class="signature">{+symbol.signature()+}</span>)
		</if>
	</h3>
	
	<if test="symbol.desc != 'undocumented'">
		<p>{+symbol.desc+}</p>
	</if>
	
	<if test="symbol.doc.getTag('example').length">
		<h4>examples</h4>
		<for each="example" in="symbol.doc.getTag('example')">
			<pre>{+example.desc+}</pre>
		</for>
	</if>
	
	<if test="symbol.params.length">
		<h4>parameters</h4>
		<table cellspacing="0">
			<tr>
				<th>type</th>
				<th>name</th>
				<th>description</th>
			</tr>
		<for each="param" in="symbol.params">
			<tr>
				<td class="type">{+param.type+}</td>
				<td class="name param">
					{+param.name+}
					<if test="param.isOptional">
						<span class="option">(optional)</span>
					</if>
				</td>
				<td class="desc">{+param.desc+}</td>
			</tr>
		</for>
		</table>
	</if>
	
	<if test="symbol.returns.length">
		<h4>returns</h4>
		<table cellspacing="0">
			<tr>
				<th>type</th>
				<th>description</th>
			</tr>
		<for each="ret" in="symbol.returns">
			<tr>
				<td class="type">{+ret.type+}</td>
				<td class="desc">{+ret.desc+}</td>
			</tr>
		</for>
		</table>
	</if>
	
	<if test="symbol.exceptions.length">
		<h4>exceptions</h4>
		<table cellspacing="0">
			<tr>
				<th>type</th>
				<th>description</th>
			</tr>
		<for each="ex" in="symbol.exceptions">
			<tr>
				<td class="type">{+ex.type+}</td>
				<td class="desc">{+ex.desc+}</td>
			</tr>
		</for>
		</table>
	</if>
</div>
</for>
</if>
</div>
<!--============= /DOCS =============-->



</div>



<!--============= FOOTER ============-->
<div id="footer">
	<ul>
		<li>
			{+data.index.mad.title+}<if test="data.index.mad.version"> {+data.index.mad.version+}</if>.
		</li>
		<li>
			Generated by
			<a href="http://jsdoctoolkit.org/">JsDoc Toolkit</a> {+JsDoc.VERSION+}
			with <a href="http://lib.metatype.jp/madtemplate/">mad template</a>.
		</li>
		<if test="data.index.mad.copyright">
			<li>
				{+data.index.mad.copyright+}
			</li>
		</if>
	</ul>
</div>
<!--============ /FOOTER ============-->



</div>
</body>
</html>