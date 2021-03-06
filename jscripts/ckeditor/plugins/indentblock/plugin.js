﻿
(function(){'use strict';var $listItem=CKEDITOR.dtd.$listItem,$list=CKEDITOR.dtd.$list,TRISTATE_DISABLED=CKEDITOR.TRISTATE_DISABLED,TRISTATE_OFF=CKEDITOR.TRISTATE_OFF;CKEDITOR.plugins.add('indentblock',{requires:'indent',init:function(editor){var globalHelpers=CKEDITOR.plugins.indent,classes=editor.config.indentClasses;globalHelpers.registerCommands(editor,{indentblock:new commandDefinition(editor,'indentblock',true),outdentblock:new commandDefinition(editor,'outdentblock')});function commandDefinition(editor,name){globalHelpers.specificDefinition.apply(this,arguments);this.allowedContent={'div h1 h2 h3 h4 h5 h6 ol p pre ul':{propertiesOnly:true,styles:!classes?'margin-left,margin-right':null,classes:classes||null}};if(this.enterBr)
this.allowedContent.div=true;this.requiredContent=(this.enterBr?'div':'p')+
(classes?'('+classes.join(',')+')':'{margin-left}');this.jobs={'20':{refresh:function(editor,path){var firstBlock=path.block||path.blockLimit;if(firstBlock.is($listItem))
firstBlock=firstBlock.getParent();else if(firstBlock.getAscendant($listItem))
return TRISTATE_DISABLED;if(!this.enterBr&&!this.getContext(path))
return TRISTATE_DISABLED;else if(classes){if(indentClassLeft.call(this,firstBlock,classes))
return TRISTATE_OFF;else
return TRISTATE_DISABLED;}else{if(this.isIndent)
return TRISTATE_OFF;else if(!firstBlock)
return TRISTATE_DISABLED;else{return CKEDITOR[(getIndent(firstBlock)||0)<=0?'TRISTATE_DISABLED':'TRISTATE_OFF'];}}},exec:function(editor){var selection=editor.getSelection(),range=selection&&selection.getRanges()[0],nearestListBlock;if((nearestListBlock=editor.elementPath().contains($list)))
indentElement.call(this,nearestListBlock,classes);else{var iterator=range.createIterator(),enterMode=editor.config.enterMode,block;iterator.enforceRealBlocks=true;iterator.enlargeBr=enterMode!=CKEDITOR.ENTER_BR;while((block=iterator.getNextParagraph(enterMode==CKEDITOR.ENTER_P?'p':'div'))){if(!block.isReadOnly())
indentElement.call(this,block,classes);}}
return true;}}};}
CKEDITOR.tools.extend(commandDefinition.prototype,globalHelpers.specificDefinition.prototype,{context:{div:1,dl:1,h1:1,h2:1,h3:1,h4:1,h5:1,h6:1,ul:1,ol:1,p:1,pre:1,table:1},classNameRegex:classes?new RegExp('(?:^|\\s+)('+classes.join('|')+')(?=$|\\s)'):null});}});function indentElement(element,classes,dir){if(element.getCustomData('indent_processed'))
return;var editor=this.editor,isIndent=this.isIndent;if(classes){var indentClass=element.$.className.match(this.classNameRegex),indentStep=0;if(indentClass){indentClass=indentClass[1];indentStep=CKEDITOR.tools.indexOf(classes,indentClass)+1;}
if((indentStep+=isIndent?1:-1)<0)
return;indentStep=Math.min(indentStep,classes.length);indentStep=Math.max(indentStep,0);element.$.className=CKEDITOR.tools.ltrim(element.$.className.replace(this.classNameRegex,''));if(indentStep>0)
element.addClass(classes[indentStep-1]);}else{var indentCssProperty=getIndentCss(element,dir),currentOffset=parseInt(element.getStyle(indentCssProperty),10),indentOffset=editor.config.indentOffset||40;if(isNaN(currentOffset))
currentOffset=0;currentOffset+=(isIndent?1:-1)*indentOffset;if(currentOffset<0)
return;currentOffset=Math.max(currentOffset,0);currentOffset=Math.ceil(currentOffset/indentOffset)*indentOffset;element.setStyle(indentCssProperty,currentOffset?currentOffset+(editor.config.indentUnit||'px'):'');if(element.getAttribute('style')==='')
element.removeAttribute('style');}
CKEDITOR.dom.element.setMarker(this.database,element,'indent_processed',1);return;}
function indentClassLeft(node,classes){var indentClass=node.$.className.match(this.classNameRegex),isIndent=this.isIndent;if(indentClass)
return isIndent?indentClass[1]!=classes.slice(-1):true;else
return isIndent;}
function getIndentCss(element,dir){return(dir||element.getComputedStyle('direction'))=='ltr'?'margin-left':'margin-right';}
function getIndent(element){return parseInt(element.getStyle(getIndentCss(element)),10);}})();