<?php

/***************************************************************************
 *
 *  Inbox Pm plugin
 *  Author: ThanhTu
 *  Copyright: © 2015 MybbVietNam All rights reserved
 *  
 *  Website: http://mybbvietnam.com
 *  License: http://www.mybb.com/about/license
 *
 ***************************************************************************/

if(!defined("IN_MYBB"))
	die("This file cannot be accessed directly.");

$plugins->add_hook('global_start', 'inbox_list');

function inbox_pm_info()
{
    global $db, $mybb;
	
	return array(
		"name"				=> 'Inbox Pm',
		"description"		=> 'Show Inbox Pm',
		"website"			=> "http://mybbvietnam.com",
		"author"			=> "ThanhTu",
		"authorsite"		=> "http://mybbvietnam.com",
		"version"			=> "1.0",
		"guid" 				=> "",
		"compatibility"	=> "*",
	);
}

function inbox_pm_activate()
{

	global $db, $mybb;

	$template = array(
		"tid" 					=> "NULL",
		"title" 				=> "inbox_pm",
		"template" 		=> $db->escape_string('
{$tpl[\'row\']}
'),
		"sid" 				=> "-1",
	);
	$db->insert_query("templates", $template);
	
	$template = array(
		"tid" 					=> "NULL",
		"title" 				=> "inbox_pm_row",
		"template" 		=> $db->escape_string('
<li>
<img src="{$pm[\'avatar\']}" alt="" class="avatar_inbox"/>
<span>{$pm[\'subject\']} <span class="time_inbox">{$pm[\'time\']}</span><br/>
<span class="profile_inbox">from {$pm[\'profilelink\']}, {$pm[\'date\']}</span></span>
</li>
'),
		"sid" 				=> "-1",
	);
	$db->insert_query("templates", $template);
	
	$template = array(
		"tid" 					=> "NULL",
		"title" 				=> "inbox_pm_row_empty",
		"template" 		=> $db->escape_string('
<li>
<span>There are no private messages in inbox folder</span>
</li>
'),
		"sid" 				=> "-1",
	);
	$db->insert_query("templates", $template);
}

function inbox_pm_deactivate()
{

	global $db, $mybb;
	
	$db->delete_query('templates', 'title LIKE (\'%inbox_pm%\')');
}

function inbox_list()
{
	global $db, $mybb, $templates, $theme, $inbox_pm;
	
	if($mybb->user['uid'] > 0)
	{	
		$query = $db->query("SELECT pm.status, pm.subject, pm.pmid, pm.dateline, fu.username AS fromusername, fu.uid AS fromuid, fu.avatar AS fromavatar, fu.displaygroup AS fromdisplaygroup, fu.usergroup AS fromusergroup
			FROM ".TABLE_PREFIX."privatemessages pm
			LEFT JOIN ".TABLE_PREFIX."users fu ON (fu.uid=pm.fromid)
			WHERE pm.folder='1' AND pm.uid='{$mybb->user['uid']}'
			ORDER BY pm.status ASC, pm.dateline DESC
			LIMIT 15");
		if($db->num_rows($query) == 0) 
		{
			eval("\$tpl['row'] .= \"" . $templates->get("inbox_pm_row_empty") . "\";");
		}	
		while($pm = $db->fetch_array($query ))
		{							
			if(strlen($pm['subject']) > 25)
			{
				$pm['subject'] = substr($pm['subject'], 0, 25)."...";
			}
			else
			{
				$pm['subject']  = $pm['subject']; 
			}
			$pm['subject'] = $pm['subject'];
			if($pm['status'] == '0')
			{
				$pm['subject'] = "<b>".$pm['subject']."</b>";
			}
			if(!empty($pm['fromavatar']))
			{
			    $pm['avatar'] = $pm['fromavatar'];
			} else {
			    $pm['avatar'] = $mybb->settings['useravatar'];
		    }
				
			$pm['pmid'] = $pm['pmid'];
			$pm['subject'] = "<a href=\"private.php?action=read&pmid=".$pm['pmid']."\">".$pm['subject']."</a>";
			$pm['date'] = my_date($mybb->settings['dateformat'], $pm['dateline']);
			$pm['time'] = my_date($mybb->settings['timeformat'], $pm['dateline']);
			$pm['dateline'] = $pm['date']." ".$pm['time'];
			$pm['username'] = format_name($pm['fromusername'], $pm['fromusergroup'], $pm['fromdisplaygroup']);
			$pm['profilelink'] = build_profile_link($pm['username'], $pm['fromuid']);
			eval("\$tpl['row'] .= \"" . $templates->get("inbox_pm_row") . "\";");
		}
		eval("\$inbox_pm = \"".$templates->get("inbox_pm")."\";");
		return $inbox_pm;
	}
}

?>