﻿
CKEDITOR.plugins.add('htmlwriter',{init:function(editor){var writer=new CKEDITOR.htmlWriter();writer.forceSimpleAmpersand=editor.config.forceSimpleAmpersand;writer.indentationChars=editor.config.dataIndentationChars||'\t';editor.dataProcessor.writer=writer;}});CKEDITOR.htmlWriter=CKEDITOR.tools.createClass({base:CKEDITOR.htmlParser.basicWriter,$:function(){this.base();this.indentationChars='\t';this.selfClosingEnd=' />';this.lineBreakChars='\n';this.sortAttributes=1;this._.indent=0;this._.indentation='';this._.inPre=0;this._.rules={};var dtd=CKEDITOR.dtd;for(var e in CKEDITOR.tools.extend({},dtd.$nonBodyContent,dtd.$block,dtd.$listItem,dtd.$tableContent)){this.setRules(e,{indent:!dtd[e]['#'],breakBeforeOpen:1,breakBeforeClose:!dtd[e]['#'],breakAfterClose:1,needsSpace:(e in dtd.$block)&&!(e in{li:1,dt:1,dd:1})});}
this.setRules('br',{breakAfterOpen:1});this.setRules('title',{indent:0,breakAfterOpen:0});this.setRules('style',{indent:0,breakBeforeClose:1});this.setRules('pre',{breakAfterOpen:1,indent:0});},proto:{openTag:function(tagName,attributes){var rules=this._.rules[tagName];if(this._.afterCloser&&rules&&rules.needsSpace&&this._.needsSpace)
this._.output.push('\n');if(this._.indent)
this.indentation();else if(rules&&rules.breakBeforeOpen){this.lineBreak();this.indentation();}
this._.output.push('<',tagName);this._.afterCloser=0;},openTagClose:function(tagName,isSelfClose){var rules=this._.rules[tagName];if(isSelfClose){this._.output.push(this.selfClosingEnd);if(rules&&rules.breakAfterClose)
this._.needsSpace=rules.needsSpace;}else{this._.output.push('>');if(rules&&rules.indent)
this._.indentation+=this.indentationChars;}
if(rules&&rules.breakAfterOpen)
this.lineBreak();tagName=='pre'&&(this._.inPre=1);},attribute:function(attName,attValue){if(typeof attValue=='string'){this.forceSimpleAmpersand&&(attValue=attValue.replace(/&amp;/g,'&'));attValue=CKEDITOR.tools.htmlEncodeAttr(attValue);}
this._.output.push(' ',attName,'="',attValue,'"');},closeTag:function(tagName){var rules=this._.rules[tagName];if(rules&&rules.indent)
this._.indentation=this._.indentation.substr(this.indentationChars.length);if(this._.indent)
this.indentation();else if(rules&&rules.breakBeforeClose){this.lineBreak();this.indentation();}
this._.output.push('</',tagName,'>');tagName=='pre'&&(this._.inPre=0);if(rules&&rules.breakAfterClose){this.lineBreak();this._.needsSpace=rules.needsSpace;}
this._.afterCloser=1;},text:function(text){if(this._.indent){this.indentation();!this._.inPre&&(text=CKEDITOR.tools.ltrim(text));}
this._.output.push(text);},comment:function(comment){if(this._.indent)
this.indentation();this._.output.push('<!--',comment,'-->');},lineBreak:function(){if(!this._.inPre&&this._.output.length>0)
this._.output.push(this.lineBreakChars);this._.indent=1;},indentation:function(){if(!this._.inPre&&this._.indentation)
this._.output.push(this._.indentation);this._.indent=0;},reset:function(){this._.output=[];this._.indent=0;this._.indentation='';this._.afterCloser=0;this._.inPre=0;},setRules:function(tagName,rules){var currentRules=this._.rules[tagName];if(currentRules)
CKEDITOR.tools.extend(currentRules,rules,true);else
this._.rules[tagName]=rules;}}});