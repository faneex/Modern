﻿
(function(){var listNodeNames={ol:1,ul:1},emptyTextRegex=/^[\n\r\t ]*$/;var whitespaces=CKEDITOR.dom.walker.whitespaces(),bookmarks=CKEDITOR.dom.walker.bookmark(),nonEmpty=function(node){return!(whitespaces(node)||bookmarks(node));},blockBogus=CKEDITOR.dom.walker.bogus();function cleanUpDirection(element){var dir,parent,parentDir;if((dir=element.getDirection())){parent=element.getParent();while(parent&&!(parentDir=parent.getDirection()))
parent=parent.getParent();if(dir==parentDir)
element.removeAttribute('dir');}}
function inheirtInlineStyles(parent,el){var style=parent.getAttribute('style');style&&el.setAttribute('style',style.replace(/([^;])$/,'$1;')+(el.getAttribute('style')||''));}
CKEDITOR.plugins.list={listToArray:function(listNode,database,baseArray,baseIndentLevel,grandparentNode){if(!listNodeNames[listNode.getName()])
return[];if(!baseIndentLevel)
baseIndentLevel=0;if(!baseArray)
baseArray=[];for(var i=0,count=listNode.getChildCount();i<count;i++){var listItem=listNode.getChild(i);if(listItem.type==CKEDITOR.NODE_ELEMENT&&listItem.getName()in CKEDITOR.dtd.$list)
CKEDITOR.plugins.list.listToArray(listItem,database,baseArray,baseIndentLevel+1);if(listItem.$.nodeName.toLowerCase()!='li')
continue;var itemObj={'parent':listNode,indent:baseIndentLevel,element:listItem,contents:[]};if(!grandparentNode){itemObj.grandparent=listNode.getParent();if(itemObj.grandparent&&itemObj.grandparent.$.nodeName.toLowerCase()=='li')
itemObj.grandparent=itemObj.grandparent.getParent();}else
itemObj.grandparent=grandparentNode;if(database)
CKEDITOR.dom.element.setMarker(database,listItem,'listarray_index',baseArray.length);baseArray.push(itemObj);for(var j=0,itemChildCount=listItem.getChildCount(),child;j<itemChildCount;j++){child=listItem.getChild(j);if(child.type==CKEDITOR.NODE_ELEMENT&&listNodeNames[child.getName()])
CKEDITOR.plugins.list.listToArray(child,database,baseArray,baseIndentLevel+1,itemObj.grandparent);else
itemObj.contents.push(child);}}
return baseArray;},arrayToList:function(listArray,database,baseIndex,paragraphMode,dir){if(!baseIndex)
baseIndex=0;if(!listArray||listArray.length<baseIndex+1)
return null;var i,doc=listArray[baseIndex].parent.getDocument(),retval=new CKEDITOR.dom.documentFragment(doc),rootNode=null,currentIndex=baseIndex,indentLevel=Math.max(listArray[baseIndex].indent,0),currentListItem=null,orgDir,block,paragraphName=(paragraphMode==CKEDITOR.ENTER_P?'p':'div');while(1){var item=listArray[currentIndex],itemGrandParent=item.grandparent;orgDir=item.element.getDirection(1);if(item.indent==indentLevel){if(!rootNode||listArray[currentIndex].parent.getName()!=rootNode.getName()){rootNode=listArray[currentIndex].parent.clone(false,1);dir&&rootNode.setAttribute('dir',dir);retval.append(rootNode);}
currentListItem=rootNode.append(item.element.clone(0,1));if(orgDir!=rootNode.getDirection(1))
currentListItem.setAttribute('dir',orgDir);for(i=0;i<item.contents.length;i++)
currentListItem.append(item.contents[i].clone(1,1));currentIndex++;}else if(item.indent==Math.max(indentLevel,0)+1){var currDir=listArray[currentIndex-1].element.getDirection(1),listData=CKEDITOR.plugins.list.arrayToList(listArray,null,currentIndex,paragraphMode,currDir!=orgDir?orgDir:null);if(!currentListItem.getChildCount()&&CKEDITOR.env.needsNbspFiller&&!(doc.$.documentMode>7))
currentListItem.append(doc.createText('\xa0'));currentListItem.append(listData.listNode);currentIndex=listData.nextIndex;}else if(item.indent==-1&&!baseIndex&&itemGrandParent){if(listNodeNames[itemGrandParent.getName()]){currentListItem=item.element.clone(false,true);if(orgDir!=itemGrandParent.getDirection(1))
currentListItem.setAttribute('dir',orgDir);}else
currentListItem=new CKEDITOR.dom.documentFragment(doc);var dirLoose=itemGrandParent.getDirection(1)!=orgDir,li=item.element,className=li.getAttribute('class'),style=li.getAttribute('style');var needsBlock=currentListItem.type==CKEDITOR.NODE_DOCUMENT_FRAGMENT&&(paragraphMode!=CKEDITOR.ENTER_BR||dirLoose||style||className);var child,count=item.contents.length,cachedBookmark;for(i=0;i<count;i++){child=item.contents[i];if(bookmarks(child)&&count>1){if(!needsBlock)
currentListItem.append(child.clone(1,1));else
cachedBookmark=child.clone(1,1);}
else if(child.type==CKEDITOR.NODE_ELEMENT&&child.isBlockBoundary()){if(dirLoose&&!child.getDirection())
child.setAttribute('dir',orgDir);inheirtInlineStyles(li,child);className&&child.addClass(className);block=null;if(cachedBookmark){currentListItem.append(cachedBookmark);cachedBookmark=null;}
currentListItem.append(child.clone(1,1));}
else if(needsBlock){if(!block){block=doc.createElement(paragraphName);currentListItem.append(block);dirLoose&&block.setAttribute('dir',orgDir);}
style&&block.setAttribute('style',style);className&&block.setAttribute('class',className);if(cachedBookmark){block.append(cachedBookmark);cachedBookmark=null;}
block.append(child.clone(1,1));}
else
currentListItem.append(child.clone(1,1));}
if(cachedBookmark){(block||currentListItem).append(cachedBookmark);cachedBookmark=null;}
if(currentListItem.type==CKEDITOR.NODE_DOCUMENT_FRAGMENT&&currentIndex!=listArray.length-1){var last;if(CKEDITOR.env.needsBrFiller){last=currentListItem.getLast();if(last&&last.type==CKEDITOR.NODE_ELEMENT&&last.is('br'))
last.remove();}
last=currentListItem.getLast(nonEmpty);if(!(last&&last.type==CKEDITOR.NODE_ELEMENT&&last.is(CKEDITOR.dtd.$block)))
currentListItem.append(doc.createElement('br'));}
var currentListItemName=currentListItem.$.nodeName.toLowerCase();if(currentListItemName=='div'||currentListItemName=='p')
currentListItem.appendBogus();retval.append(currentListItem);rootNode=null;currentIndex++;}else
return null;block=null;if(listArray.length<=currentIndex||Math.max(listArray[currentIndex].indent,0)<indentLevel)
break;}
if(database){var currentNode=retval.getFirst(),listRoot=listArray[0].parent;while(currentNode){if(currentNode.type==CKEDITOR.NODE_ELEMENT){CKEDITOR.dom.element.clearMarkers(database,currentNode);if(currentNode.getName()in CKEDITOR.dtd.$listItem)
cleanUpDirection(currentNode);}
currentNode=currentNode.getNextSourceNode();}}
return{listNode:retval,nextIndex:currentIndex};}};function changeListType(editor,groupObj,database,listsCreated){var listArray=CKEDITOR.plugins.list.listToArray(groupObj.root,database),selectedListItems=[];for(var i=0;i<groupObj.contents.length;i++){var itemNode=groupObj.contents[i];itemNode=itemNode.getAscendant('li',true);if(!itemNode||itemNode.getCustomData('list_item_processed'))
continue;selectedListItems.push(itemNode);CKEDITOR.dom.element.setMarker(database,itemNode,'list_item_processed',true);}
var root=groupObj.root,doc=root.getDocument(),listNode,newListNode;for(i=0;i<selectedListItems.length;i++){var listIndex=selectedListItems[i].getCustomData('listarray_index');listNode=listArray[listIndex].parent;if(!listNode.is(this.type)){newListNode=doc.createElement(this.type);listNode.copyAttributes(newListNode,{start:1,type:1});newListNode.removeStyle('list-style-type');listArray[listIndex].parent=newListNode;}}
var newList=CKEDITOR.plugins.list.arrayToList(listArray,database,null,editor.config.enterMode);var child,length=newList.listNode.getChildCount();for(i=0;i<length&&(child=newList.listNode.getChild(i));i++){if(child.getName()==this.type)
listsCreated.push(child);}
newList.listNode.replace(groupObj.root);editor.fire('contentDomInvalidated');}
function createList(editor,groupObj,listsCreated){var contents=groupObj.contents,doc=groupObj.root.getDocument(),listContents=[];if(contents.length==1&&contents[0].equals(groupObj.root)){var divBlock=doc.createElement('div');contents[0].moveChildren&&contents[0].moveChildren(divBlock);contents[0].append(divBlock);contents[0]=divBlock;}
var commonParent=groupObj.contents[0].getParent();for(var i=0;i<contents.length;i++)
commonParent=commonParent.getCommonAncestor(contents[i].getParent());var useComputedState=editor.config.useComputedState,listDir,explicitDirection;useComputedState=useComputedState===undefined||useComputedState;for(i=0;i<contents.length;i++){var contentNode=contents[i],parentNode;while((parentNode=contentNode.getParent())){if(parentNode.equals(commonParent)){listContents.push(contentNode);if(!explicitDirection&&contentNode.getDirection())
explicitDirection=1;var itemDir=contentNode.getDirection(useComputedState);if(listDir!==null){if(listDir&&listDir!=itemDir)
listDir=null;else
listDir=itemDir;}
break;}
contentNode=parentNode;}}
if(listContents.length<1)
return;var insertAnchor=listContents[listContents.length-1].getNext(),listNode=doc.createElement(this.type);listsCreated.push(listNode);var contentBlock,listItem;while(listContents.length){contentBlock=listContents.shift();listItem=doc.createElement('li');if(shouldPreserveBlock(contentBlock))
contentBlock.appendTo(listItem);else{contentBlock.copyAttributes(listItem);if(listDir&&contentBlock.getDirection()){listItem.removeStyle('direction');listItem.removeAttribute('dir');}
contentBlock.moveChildren(listItem);contentBlock.remove();}
listItem.appendTo(listNode);}
if(listDir&&explicitDirection)
listNode.setAttribute('dir',listDir);if(insertAnchor)
listNode.insertBefore(insertAnchor);else
listNode.appendTo(commonParent);}
function removeList(editor,groupObj,database){var listArray=CKEDITOR.plugins.list.listToArray(groupObj.root,database),selectedListItems=[];for(var i=0;i<groupObj.contents.length;i++){var itemNode=groupObj.contents[i];itemNode=itemNode.getAscendant('li',true);if(!itemNode||itemNode.getCustomData('list_item_processed'))
continue;selectedListItems.push(itemNode);CKEDITOR.dom.element.setMarker(database,itemNode,'list_item_processed',true);}
var lastListIndex=null;for(i=0;i<selectedListItems.length;i++){var listIndex=selectedListItems[i].getCustomData('listarray_index');listArray[listIndex].indent=-1;lastListIndex=listIndex;}
for(i=lastListIndex+1;i<listArray.length;i++){if(listArray[i].indent>listArray[i-1].indent+1){var indentOffset=listArray[i-1].indent+1-listArray[i].indent;var oldIndent=listArray[i].indent;while(listArray[i]&&listArray[i].indent>=oldIndent){listArray[i].indent+=indentOffset;i++;}
i--;}}
var newList=CKEDITOR.plugins.list.arrayToList(listArray,database,null,editor.config.enterMode,groupObj.root.getAttribute('dir'));var docFragment=newList.listNode,boundaryNode,siblingNode;function compensateBrs(isStart){if((boundaryNode=docFragment[isStart?'getFirst':'getLast']())&&!(boundaryNode.is&&boundaryNode.isBlockBoundary())&&(siblingNode=groupObj.root[isStart?'getPrevious':'getNext']
(CKEDITOR.dom.walker.invisible(true)))&&!(siblingNode.is&&siblingNode.isBlockBoundary({br:1})))
editor.document.createElement('br')[isStart?'insertBefore':'insertAfter'](boundaryNode);}
compensateBrs(true);compensateBrs();docFragment.replace(groupObj.root);editor.fire('contentDomInvalidated');}
var headerTagRegex=/^h[1-6]$/;function shouldPreserveBlock(block){return(block.is('pre')||headerTagRegex.test(block.getName())||block.getAttribute('contenteditable')=='false');}
function listCommand(name,type){this.name=name;this.type=type;this.context=type;this.allowedContent=type+' li';this.requiredContent=type;}
var elementType=CKEDITOR.dom.walker.nodeType(CKEDITOR.NODE_ELEMENT);function mergeChildren(from,into,refNode,forward){var child,itemDir;while((child=from[forward?'getLast':'getFirst'](elementType))){if((itemDir=child.getDirection(1))!==into.getDirection(1))
child.setAttribute('dir',itemDir);child.remove();refNode?child[forward?'insertBefore':'insertAfter'](refNode):into.append(child,forward);}}
listCommand.prototype={modes:{wysiwyg:1,source:1},exec:function(editor){if(editor.mode=='source'){i=0;while(x=prompt(editor.lang.list.enterlistitem)){if(i==0){if(this.name=='numberedlist'){CKEDITOR.performInsert('[list=1]\n','',true);}else{CKEDITOR.performInsert('[list]\n','',true);}}
i++;CKEDITOR.performInsert('[*]'+x+"\n",'',true);}
if(i>0){CKEDITOR.performInsert('[/list]','',true);}
return;}
this.refresh(editor,editor.elementPath());var doc=editor.document,config=editor.config,selection=editor.getSelection(),ranges=selection&&selection.getRanges();if(this.state==CKEDITOR.TRISTATE_OFF){var editable=editor.editable();if(!editable.getFirst(nonEmpty)){config.enterMode==CKEDITOR.ENTER_BR?editable.appendBogus():ranges[0].fixBlock(1,config.enterMode==CKEDITOR.ENTER_P?'p':'div');selection.selectRanges(ranges);}
else{var range=ranges.length==1&&ranges[0],enclosedNode=range&&range.getEnclosedNode();if(enclosedNode&&enclosedNode.is&&this.type==enclosedNode.getName())
this.setState(CKEDITOR.TRISTATE_ON);}}
var bookmarks=selection.createBookmarks(true);var listGroups=[],database={},rangeIterator=ranges.createIterator(),index=0;while((range=rangeIterator.getNextRange())&&++index){var boundaryNodes=range.getBoundaryNodes(),startNode=boundaryNodes.startNode,endNode=boundaryNodes.endNode;if(startNode.type==CKEDITOR.NODE_ELEMENT&&startNode.getName()=='td')
range.setStartAt(boundaryNodes.startNode,CKEDITOR.POSITION_AFTER_START);if(endNode.type==CKEDITOR.NODE_ELEMENT&&endNode.getName()=='td')
range.setEndAt(boundaryNodes.endNode,CKEDITOR.POSITION_BEFORE_END);var iterator=range.createIterator(),block;iterator.forceBrBreak=(this.state==CKEDITOR.TRISTATE_OFF);while((block=iterator.getNextParagraph())){if(block.getCustomData('list_block'))
continue;else
CKEDITOR.dom.element.setMarker(database,block,'list_block',1);var path=editor.elementPath(block),pathElements=path.elements,pathElementsCount=pathElements.length,listNode=null,processedFlag=0,blockLimit=path.blockLimit,element;for(var i=pathElementsCount-1;i>=0&&(element=pathElements[i]);i--){if(listNodeNames[element.getName()]&&blockLimit.contains(element))
{blockLimit.removeCustomData('list_group_object_'+index);var groupObj=element.getCustomData('list_group_object');if(groupObj)
groupObj.contents.push(block);else{groupObj={root:element,contents:[block]};listGroups.push(groupObj);CKEDITOR.dom.element.setMarker(database,element,'list_group_object',groupObj);}
processedFlag=1;break;}}
if(processedFlag)
continue;var root=blockLimit;if(root.getCustomData('list_group_object_'+index))
root.getCustomData('list_group_object_'+index).contents.push(block);else{groupObj={root:root,contents:[block]};CKEDITOR.dom.element.setMarker(database,root,'list_group_object_'+index,groupObj);listGroups.push(groupObj);}}}
var listsCreated=[];while(listGroups.length>0){groupObj=listGroups.shift();if(this.state==CKEDITOR.TRISTATE_OFF){if(listNodeNames[groupObj.root.getName()])
changeListType.call(this,editor,groupObj,database,listsCreated);else
createList.call(this,editor,groupObj,listsCreated);}else if(this.state==CKEDITOR.TRISTATE_ON&&listNodeNames[groupObj.root.getName()])
removeList.call(this,editor,groupObj,database);}
for(i=0;i<listsCreated.length;i++)
mergeListSiblings(listsCreated[i]);CKEDITOR.dom.element.clearAllMarkers(database);selection.selectBookmarks(bookmarks);editor.focus();},refresh:function(editor,path){var list=path.contains(listNodeNames,1),limit=path.blockLimit||path.root;if(list&&limit.contains(list))
this.setState(list.is(this.type)?CKEDITOR.TRISTATE_ON:CKEDITOR.TRISTATE_OFF);else
this.setState(CKEDITOR.TRISTATE_OFF);}};var dtd=CKEDITOR.dtd;var tailNbspRegex=/[\t\r\n ]*(?:&nbsp;|\xa0)$/;function mergeListSiblings(listNode)
{var mergeSibling;(mergeSibling=function(rtl)
{var sibling=listNode[rtl?'getPrevious':'getNext'](nonEmpty);if(sibling&&sibling.type==CKEDITOR.NODE_ELEMENT&&sibling.is(listNode.getName()))
{mergeChildren(listNode,sibling,null,!rtl);listNode.remove();listNode=sibling;}})();mergeSibling(1);}
function indexOfFirstChildElement(element,tagNameList){var child,children=element.children,length=children.length;for(var i=0;i<length;i++){child=children[i];if(child.name&&(child.name in tagNameList))
return i;}
return length;}
function isTextBlock(node){return node.type==CKEDITOR.NODE_ELEMENT&&(node.getName()in CKEDITOR.dtd.$block||node.getName()in CKEDITOR.dtd.$listItem)&&CKEDITOR.dtd[node.getName()]['#'];}
function joinNextLineToCursor(editor,cursor,nextCursor){editor.fire('saveSnapshot');nextCursor.enlarge(CKEDITOR.ENLARGE_LIST_ITEM_CONTENTS);var frag=nextCursor.extractContents();cursor.trim(false,true);var bm=cursor.createBookmark();var currentPath=new CKEDITOR.dom.elementPath(cursor.startContainer),pathBlock=currentPath.block,currentBlock=currentPath.lastElement.getAscendant('li',1)||pathBlock,nextPath=new CKEDITOR.dom.elementPath(nextCursor.startContainer),nextLi=nextPath.contains(CKEDITOR.dtd.$listItem),nextList=nextPath.contains(CKEDITOR.dtd.$list),last;if(pathBlock){var bogus=pathBlock.getBogus();bogus&&bogus.remove();}
else if(nextList){last=nextList.getPrevious(nonEmpty);if(last&&blockBogus(last))
last.remove();}
last=frag.getLast();if(last&&last.type==CKEDITOR.NODE_ELEMENT&&last.is('br'))
last.remove();var nextNode=cursor.startContainer.getChild(cursor.startOffset);if(nextNode)
frag.insertBefore(nextNode);else
cursor.startContainer.append(frag);if(nextLi){var sublist=getSubList(nextLi);if(sublist){if(currentBlock.contains(nextLi)){mergeChildren(sublist,nextLi.getParent(),nextLi);sublist.remove();}
else
currentBlock.append(sublist);}}
var nextBlock,parent;while(nextCursor.checkStartOfBlock()&&nextCursor.checkEndOfBlock()){nextPath=nextCursor.startPath();nextBlock=nextPath.block;if(!nextBlock)
break;if(nextBlock.is('li')){parent=nextBlock.getParent();if(nextBlock.equals(parent.getLast(nonEmpty))&&nextBlock.equals(parent.getFirst(nonEmpty)))
nextBlock=parent;}
nextCursor.moveToPosition(nextBlock,CKEDITOR.POSITION_BEFORE_START);nextBlock.remove();}
var walkerRng=nextCursor.clone(),editable=editor.editable();walkerRng.setEndAt(editable,CKEDITOR.POSITION_BEFORE_END);var walker=new CKEDITOR.dom.walker(walkerRng);walker.evaluator=function(node){return nonEmpty(node)&&!blockBogus(node);};var next=walker.next();if(next&&next.type==CKEDITOR.NODE_ELEMENT&&next.getName()in CKEDITOR.dtd.$list)
mergeListSiblings(next);cursor.moveToBookmark(bm);cursor.select();editor.fire('saveSnapshot');}
function getSubList(li){var last=li.getLast(nonEmpty);return last&&last.type==CKEDITOR.NODE_ELEMENT&&last.getName()in listNodeNames?last:null;}
CKEDITOR.plugins.add('list',{lang:'af,ar,bg,bn,bs,ca,cs,cy,da,de,el,en,en-au,en-ca,en-gb,eo,es,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,ug,uk,vi,zh,zh-cn',icons:'bulletedlist,bulletedlist-rtl,numberedlist,numberedlist-rtl',hidpi:true,requires:'indentlist',init:function(editor){if(editor.blockless)
return;editor.addCommand('numberedlist',new listCommand('numberedlist','ol'));editor.addCommand('bulletedlist',new listCommand('bulletedlist','ul'));if(editor.ui.addButton){editor.ui.addButton('NumberedList',{label:editor.lang.list.numberedlist,command:'numberedlist',directional:true,toolbar:'list,10'});editor.ui.addButton('BulletedList',{label:editor.lang.list.bulletedlist,command:'bulletedlist',directional:true,toolbar:'list,20'});}
editor.on('key',function(evt){var key=evt.data.keyCode;if(editor.mode=='wysiwyg'&&key in{8:1,46:1}){var sel=editor.getSelection(),range=sel.getRanges()[0],path=range&&range.startPath();if(!range||!range.collapsed)
return;path=new CKEDITOR.dom.elementPath(range.startContainer);var isBackspace=key==8;var editable=editor.editable();var walker=new CKEDITOR.dom.walker(range.clone());walker.evaluator=function(node){return nonEmpty(node)&&!blockBogus(node);};walker.guard=function(node,isOut){return!(isOut&&node.type==CKEDITOR.NODE_ELEMENT&&node.is('table'));};var cursor=range.clone();if(isBackspace){var previous,joinWith;if((previous=path.contains(listNodeNames))&&range.checkBoundaryOfElement(previous,CKEDITOR.START)&&(previous=previous.getParent())&&previous.is('li')&&(previous=getSubList(previous))){joinWith=previous;previous=previous.getPrevious(nonEmpty);cursor.moveToPosition(previous&&blockBogus(previous)?previous:joinWith,CKEDITOR.POSITION_BEFORE_START);}
else{walker.range.setStartAt(editable,CKEDITOR.POSITION_AFTER_START);walker.range.setEnd(range.startContainer,range.startOffset);previous=walker.previous();if(previous&&previous.type==CKEDITOR.NODE_ELEMENT&&(previous.getName()in listNodeNames||previous.is('li'))){if(!previous.is('li')){walker.range.selectNodeContents(previous);walker.reset();walker.evaluator=isTextBlock;previous=walker.previous();}
joinWith=previous;cursor.moveToElementEditEnd(joinWith);}}
if(joinWith){joinNextLineToCursor(editor,cursor,range);evt.cancel();}
else{var list=path.contains(listNodeNames);if(list&&range.checkBoundaryOfElement(list,CKEDITOR.START)){li=list.getFirst(nonEmpty);if(range.checkBoundaryOfElement(li,CKEDITOR.START)){previous=list.getPrevious(nonEmpty);if(getSubList(li)){if(previous){range.moveToElementEditEnd(previous);range.select();}
evt.cancel();}
else{editor.execCommand('outdent');evt.cancel();}}}}}else{var next,nextLine,li=path.contains('li');if(li){walker.range.setEndAt(editable,CKEDITOR.POSITION_BEFORE_END);var last=li.getLast(nonEmpty);var block=last&&isTextBlock(last)?last:li;var isAtEnd=0;next=walker.next();if(next&&next.type==CKEDITOR.NODE_ELEMENT&&next.getName()in listNodeNames&&next.equals(last))
{isAtEnd=1;next=walker.next();}
else if(range.checkBoundaryOfElement(block,CKEDITOR.END))
isAtEnd=1;if(isAtEnd&&next){nextLine=range.clone();nextLine.moveToElementEditStart(next);joinNextLineToCursor(editor,cursor,nextLine);evt.cancel();}}
else
{walker.range.setEndAt(editable,CKEDITOR.POSITION_BEFORE_END);next=walker.next();if(next&&next.type==CKEDITOR.NODE_ELEMENT&&next.is(listNodeNames)){next=next.getFirst(nonEmpty);if(path.block&&range.checkStartOfBlock()&&range.checkEndOfBlock()){path.block.remove();range.moveToElementEditStart(next);range.select();evt.cancel();}
else if(getSubList(next)){range.moveToElementEditStart(next);range.select();evt.cancel();}
else{nextLine=range.clone();nextLine.moveToElementEditStart(next);joinNextLineToCursor(editor,cursor,nextLine);evt.cancel();}}}}
setTimeout(function(){editor.selectionChange(1);});}});}});})();