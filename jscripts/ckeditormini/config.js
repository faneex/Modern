﻿
CKEDITOR.editorConfig=function(config){config.plugins='dialogui,dialog,about,basicstyles,clipboard,button,toolbar,enterkey,entities,floatingspace,wysiwygarea,indent,indentlist,fakeobjects,link,list,undo,bbcode,blockquote,sourcearea,image,smiley';config.skin='moono';config.toolbarGroups=[{name:'document',groups:['mode','document','doctools']},{name:'clipboard',groups:['clipboard','undo']},{name:'editing',groups:['find','selection','spellchecker']},{name:'forms'},{name:'basicstyles',groups:['basicstyles','cleanup']},{name:'paragraph',groups:['list','indent','blocks','align','bidi']},{name:'links'},{name:'insert'},{name:'styles'},{name:'colors'},{name:'tools'},{name:'others'}];config.removeButtons='Cut,Copy,Paste,Anchor';config.removeDialogTabs='link:advanced';config.contentsCss='jscripts/ckeditor/contents.css';};