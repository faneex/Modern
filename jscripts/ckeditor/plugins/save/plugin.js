﻿
(function(){var saveCmd={readOnly:1,exec:function(editor){if(editor.fire('save')){if(clickableEditor)
{clickableEditor.autosave_done(editor);}
else
{var $form=editor.element.$.form;if($form){try{$form.submit();}catch(e){if($form.submit.click)
$form.submit.click();}}}}}};var pluginName='save';CKEDITOR.plugins.add(pluginName,{lang:'af,ar,bg,bn,bs,ca,cs,cy,da,de,el,en,en-au,en-ca,en-gb,eo,es,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,ug,uk,vi,zh,zh-cn',icons:'save',hidpi:true,init:function(editor){if(editor.elementMode!=CKEDITOR.ELEMENT_MODE_REPLACE)
return;var command=editor.addCommand(pluginName,saveCmd);command.modes={wysiwyg:!!(editor.element.$.form),source:!!(editor.element.$.form)};editor.ui.addButton&&editor.ui.addButton('Save',{label:editor.lang.save.toolbar,command:pluginName,toolbar:'document,10'});}});})();