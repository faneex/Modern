﻿
(function(){CKEDITOR.plugins.add('undo',{lang:'af,ar,bg,bn,bs,ca,cs,cy,da,de,el,en,en-au,en-ca,en-gb,eo,es,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,ug,uk,vi,zh,zh-cn',icons:'redo,redo-rtl,undo,undo-rtl',hidpi:true,init:function(editor){var undoManager=editor.undoManager=new UndoManager(editor);var undoCommand=editor.addCommand('undo',{exec:function(){if(undoManager.undo()){editor.selectionChange();this.fire('afterUndo');}},startDisabled:true,canUndo:false});var redoCommand=editor.addCommand('redo',{exec:function(){if(undoManager.redo()){editor.selectionChange();this.fire('afterRedo');}},startDisabled:true,canUndo:false});editor.setKeystroke([[CKEDITOR.CTRL+90,'undo'],[CKEDITOR.CTRL+89,'redo'],[CKEDITOR.CTRL+CKEDITOR.SHIFT+90,'redo']]);undoManager.onChange=function(){undoCommand.setState(undoManager.undoable()?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED);redoCommand.setState(undoManager.redoable()?CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED);};function recordCommand(event){if(undoManager.enabled&&event.data.command.canUndo!==false)
undoManager.save();}
editor.on('beforeCommandExec',recordCommand);editor.on('afterCommandExec',recordCommand);editor.on('saveSnapshot',function(evt){undoManager.save(evt.data&&evt.data.contentOnly);});editor.on('contentDom',function(){editor.editable().on('keydown',function(event){var keystroke=event.data.getKey();if(keystroke==8||keystroke==46)
undoManager.type(keystroke,0);});editor.editable().on('keypress',function(event){undoManager.type(event.data.getKey(),1);});});editor.on('beforeModeUnload',function(){editor.mode=='wysiwyg'&&undoManager.save(true);});function toggleUndoManager(){undoManager.enabled=editor.readOnly?false:editor.mode=='wysiwyg';undoManager.onChange();}
editor.on('mode',toggleUndoManager);editor.on('readOnly',toggleUndoManager);if(editor.ui.addButton){editor.ui.addButton('Undo',{label:editor.lang.undo.undo,command:'undo',toolbar:'undo,10'});editor.ui.addButton('Redo',{label:editor.lang.undo.redo,command:'redo',toolbar:'undo,20'});}
editor.resetUndo=function(){undoManager.reset();editor.fire('saveSnapshot');};editor.on('updateSnapshot',function(){if(undoManager.currentImage)
undoManager.update();});editor.on('lockSnapshot',function(evt){undoManager.lock(evt.data&&evt.data.dontUpdate);});editor.on('unlockSnapshot',undoManager.unlock,undoManager);}});CKEDITOR.plugins.undo={};var Image=CKEDITOR.plugins.undo.Image=function(editor,contentsOnly){this.editor=editor;editor.fire('beforeUndoImage');var contents=editor.getSnapshot();if(CKEDITOR.env.ie&&contents)
contents=contents.replace(/\s+data-cke-expando=".*?"/g,'');this.contents=contents;if(!contentsOnly){var selection=contents&&editor.getSelection();this.bookmarks=selection&&selection.createBookmarks2(true);}
editor.fire('afterUndoImage');};var protectedAttrs=/\b(?:href|src|name)="[^"]*?"/gi;Image.prototype={equalsContent:function(otherImage){var thisContents=this.contents,otherContents=otherImage.contents;if(CKEDITOR.env.ie&&(CKEDITOR.env.ie7Compat||CKEDITOR.env.ie6Compat)){thisContents=thisContents.replace(protectedAttrs,'');otherContents=otherContents.replace(protectedAttrs,'');}
if(thisContents!=otherContents)
return false;return true;},equalsSelection:function(otherImage){var bookmarksA=this.bookmarks,bookmarksB=otherImage.bookmarks;if(bookmarksA||bookmarksB){if(!bookmarksA||!bookmarksB||bookmarksA.length!=bookmarksB.length)
return false;for(var i=0;i<bookmarksA.length;i++){var bookmarkA=bookmarksA[i],bookmarkB=bookmarksB[i];if(bookmarkA.startOffset!=bookmarkB.startOffset||bookmarkA.endOffset!=bookmarkB.endOffset||!CKEDITOR.tools.arrayCompare(bookmarkA.start,bookmarkB.start)||!CKEDITOR.tools.arrayCompare(bookmarkA.end,bookmarkB.end))
return false;}}
return true;}};function UndoManager(editor){this.editor=editor;this.reset();}
UndoManager.prototype={type:function(keystroke,isCharacter){var modifierSnapshot=(!isCharacter&&keystroke!=this.lastKeystroke);var startedTyping=!this.typing||(isCharacter&&!this.wasCharacter);var editor=this.editor;if(startedTyping||modifierSnapshot){var beforeTypeImage=new Image(editor),beforeTypeCount=this.snapshots.length;CKEDITOR.tools.setTimeout(function(){var currentSnapshot=editor.getSnapshot();if(CKEDITOR.env.ie)
currentSnapshot=currentSnapshot.replace(/\s+data-cke-expando=".*?"/g,'');if(beforeTypeImage.contents!=currentSnapshot&&beforeTypeCount==this.snapshots.length){this.typing=true;if(!this.save(false,beforeTypeImage,false))
this.snapshots.splice(this.index+1,this.snapshots.length-this.index-1);this.hasUndo=true;this.hasRedo=false;this.typesCount=1;this.modifiersCount=1;this.onChange();}},0,this);}
this.lastKeystroke=keystroke;this.wasCharacter=isCharacter;if(!isCharacter){this.typesCount=0;this.modifiersCount++;if(this.modifiersCount>25){this.save(false,null,false);this.modifiersCount=1;}else{setTimeout(function(){editor.fire('change');},0);}}else{this.modifiersCount=0;this.typesCount++;if(this.typesCount>25){this.save(false,null,false);this.typesCount=1;}else{setTimeout(function(){editor.fire('change');},0);}}},reset:function(){this.lastKeystroke=0;this.snapshots=[];this.index=-1;this.limit=this.editor.config.undoStackSize||20;this.currentImage=null;this.hasUndo=false;this.hasRedo=false;this.locked=null;this.resetType();},resetType:function(){this.typing=false;delete this.lastKeystroke;this.typesCount=0;this.modifiersCount=0;},fireChange:function(){this.hasUndo=!!this.getNextImage(true);this.hasRedo=!!this.getNextImage(false);this.resetType();this.onChange();},save:function(onContentOnly,image,autoFireChange){if(this.locked)
return false;var snapshots=this.snapshots;if(!image)
image=new Image(this.editor);if(image.contents===false)
return false;if(this.currentImage){if(image.equalsContent(this.currentImage)){if(onContentOnly)
return false;if(image.equalsSelection(this.currentImage))
return false;}else
this.editor.fire('change');}
snapshots.splice(this.index+1,snapshots.length-this.index-1);if(snapshots.length==this.limit)
snapshots.shift();this.index=snapshots.push(image)-1;this.currentImage=image;if(autoFireChange!==false)
this.fireChange();return true;},restoreImage:function(image){var editor=this.editor,sel;if(image.bookmarks){editor.focus();sel=editor.getSelection();}
this.locked=1;this.editor.loadSnapshot(image.contents);if(image.bookmarks)
sel.selectBookmarks(image.bookmarks);else if(CKEDITOR.env.ie){var $range=this.editor.document.getBody().$.createTextRange();$range.collapse(true);$range.select();}
this.locked=0;this.index=image.index;this.currentImage=this.snapshots[this.index];this.update();this.fireChange();editor.fire('change');},getNextImage:function(isUndo){var snapshots=this.snapshots,currentImage=this.currentImage,image,i;if(currentImage){if(isUndo){for(i=this.index-1;i>=0;i--){image=snapshots[i];if(!currentImage.equalsContent(image)){image.index=i;return image;}}}else{for(i=this.index+1;i<snapshots.length;i++){image=snapshots[i];if(!currentImage.equalsContent(image)){image.index=i;return image;}}}}
return null;},redoable:function(){return this.enabled&&this.hasRedo;},undoable:function(){return this.enabled&&this.hasUndo;},undo:function(){if(this.undoable()){this.save(true);var image=this.getNextImage(true);if(image)
return this.restoreImage(image),true;}
return false;},redo:function(){if(this.redoable()){this.save(true);if(this.redoable()){var image=this.getNextImage(false);if(image)
return this.restoreImage(image),true;}}
return false;},update:function(newImage){if(this.locked)
return;if(!newImage)
newImage=new Image(this.editor);var i=this.index,snapshots=this.snapshots;while(i>0&&this.currentImage.equalsContent(snapshots[i-1]))
i-=1;snapshots.splice(i,this.index-i+1,newImage);this.index=i;this.currentImage=newImage;},lock:function(dontUpdate){if(!this.locked){if(dontUpdate)
this.locked={level:1};else{var imageBefore=new Image(this.editor,true);var matchedTip=this.currentImage&&this.currentImage.equalsContent(imageBefore);this.locked={update:matchedTip?imageBefore:null,level:1};}}
else
this.locked.level++;},unlock:function(){if(this.locked){if(!--this.locked.level){var updateImage=this.locked.update,newImage=updateImage&&new Image(this.editor,true);this.locked=null;if(updateImage&&!updateImage.equalsContent(newImage))
this.update();}}}};})();