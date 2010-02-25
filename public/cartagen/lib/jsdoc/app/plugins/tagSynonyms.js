JSDOC.PluginManager.registerPlugin(
	"JSDOC.tagSynonyms",
	{
		onDocCommentSrc: function(comment) {
			comment.src = comment.src.replace(/@methodOf\b/, "@function\n@memberOf");
		},
		
		onDocCommentTags: function(comment) {
			for (var i = 0, l = comment.tags.length; i < l; i++) {
				var title = comment.tags[i].title;
				var syn;
				if ((syn = JSDOC.tagSynonyms.synonyms["="+title])) {
					comment.tags[i].title = syn;
				}
			}
		}
	}
);

new Namespace(
	"JSDOC.tagSynonyms",
	function() {
		JSDOC.tagSynonyms.synonyms = {
			"=member":             "memberof",
			"=description":        "desc",
			"=exception":          "throws",
			"=argument":           "param",
			"=returns":            "return",
			"=classdescription":   "class",
			"=fileoverview":       "overview",
			"=extends":            "augments",
			"=base":               "augments",
			"=projectdescription": "overview",
			"=classdescription":   "class",
			"=link":               "see"
		}
	}
);