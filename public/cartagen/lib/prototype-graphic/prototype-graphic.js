var PrototypeGraphic = {
  Version: '0.1',
  require: function(libraryName) {
    // inserting via DOM fails in Safari 2.0, so brute force approach
    document.write('<script type="text/javascript" src="'+libraryName+'"></script>');
  },
  REQUIRED_PROTOTYPE: '1.5.1',
  load: function() {
    function convertVersionString(versionString){
      var r = versionString.split('.');
      return parseInt(r[0])*100000 + parseInt(r[1])*1000 + parseInt(r[2]);
    }
 
    if((typeof Prototype=='undefined') || 
       (typeof Element == 'undefined') || 
       (typeof Element.Methods=='undefined') ||
       (convertVersionString(Prototype.Version) < 
        convertVersionString(PrototypeGraphic.REQUIRED_PROTOTYPE)))
       throw("Prototype Graphic requires the Prototype JavaScript framework >= " +
        PrototypeGraphic.REQUIRED_PROTOTYPE);
    
    $A(document.getElementsByTagName("script")).findAll( function(s) {
      return (s.src && s.src.match(/prototype\-graphic\.js(\?.*)?$/))
    }).each( function(s) {
      var path = s.src.replace(/prototype\-graphic\.js(\?.*)?$/,'');
      ('utils,base/graphic,base/matrix,renderer/abstract,shape/shape,shape/rect,shape/ellipse,shape/circle,shape/polyline,shape/polygon,shape/line,shape/group,shape/text,shape/image').split(',').each(
       function(include) { PrototypeGraphic.require(path+include+'.js') });  
       var includes = s.src.match(/\?.*include=([a-z,]*)/);
       // Add includes for tools
       if (includes && includes[1] == "tools") 
        ('base/event_notifier,tools/tool,tools/tool_manager,tools/select,tools/drawing,tools/highlight').split(',').each(
          function(include) { PrototypeGraphic.require(path+include+'.js') });  
    });
  }
}

PrototypeGraphic.load();
