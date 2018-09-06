<?php
/* ChangUonDyU - mybbvn.com */

if(!defined("IN_MYBB"))
{
	die("Direct initialization of this file is not allowed.<br /><br />Please make sure IN_MYBB is defined.");
}

define('MOD_ID8', 'firstpost_all_page');
define('MOD_NAME8', 'ChangUonDyU - First post on all pages');
define('MOD_DESC8', 'Show first post on all pages when viewing thread');
define('MOD_VER8', '1.1');

function firstpost_all_page_info()
{
	return array(
		"name"			=> MOD_NAME8,
		"description"	=> MOD_DESC8,
		"website"		=> "http://mybbvn.com",
		"author"		=> "ChangUonDyU",
		"authorsite"	=> "http://mybbvn.com",
		"version"		=> MOD_VER8,
	);
}

function firstpost_all_page_is_installed()
{
	global $db;
	$query = $db->query("SELECT name FROM ".TABLE_PREFIX."settinggroups WHERE name='".MOD_ID8."' LIMIT 1");
	if($db->num_rows($query))
	{
		return true;
	}
	return false;
}

function firstpost_all_page_install()
{
	global $db;
	
	### SETTINGGROUP ###
    $settinggroup = array(
		"name" =>			MOD_ID8,
		"title" =>			MOD_NAME8,
		"description" =>	MOD_DESC8,
	);
    $db->insert_query("settinggroups", $settinggroup);
	$gid = intval($db->insert_id());
	
	### SETTINGS ###
    $setting[] = array(
		"name"			=> "changfp_turn",
		"title"			=> "Enable this hack ?",
		"optionscode"	=> "yesno",
		"value"			=> 1
	);
	$setting[] = array(
		"name"			=> "changfp_allforum",
		"title"			=> "Active in all forum",
		"optionscode"	=> "yesno",
		"value"			=> 1
	);
	$setting[] = array(
		"name"			=> "changfp_forum",
		"title"			=> "Active in each forum (if you dont set Active in all forum)",
		"description"	=> "List of ForumIDs. Separate line by line. Begin of line is ForumID, after it you can add comment,hint(separate to forumID by space).",
		"optionscode"	=> "textarea",
		"value"			=> "2 announcement
3 relax
6 plugins
8"
	);
	// INSERT SETTINGS - NO NEED CHANGE
	foreach ($setting AS $st)
	{
		$dorder++;
		$st['disporder'] = $dorder;
		$st['gid'] = $gid;
		$db->insert_query("settings", $st);
	}
	rebuild_settings();
	
	
	### TEMPLATE ###
	$template['firstpost_all_page_separator'] = <<<CHANG
<table border="0" cellspacing="1" cellpadding="4" class="tborder" style="clear: both; border-bottom-width: 0; margin-top: 10px;">
		<tr>
			<td class="thead" colspan="2">
				<b>Page \$page</b> (The above is first post of this thread)
			</td>
		</tr>
		
</table>
CHANG;
	
	
	// INSERT TEMPLATE - NO NEED CHANGE
	foreach($template as $title => $tname)
	{
		$tp = array(
			'title'		=> $title,
			'template'	=> $db->escape_string($tname),
			'sid'		=> '-2',
			'version'	=> '1410',
			'dateline'	=> TIME_NOW
		);
		$db->insert_query("templates", $tp);
	}
}


function firstpost_all_page_uninstall()
{
	global $db;
	
	### Delete settings ###
	$query = $db->query("SELECT gid FROM ".TABLE_PREFIX."settinggroups WHERE name='".MOD_ID8."' LIMIT 1");
	while ($sg = $db->fetch_array($query))
	{
		$gid = intval($sg['gid']);
	}
    if ($gid) $db->query("DELETE FROM ".TABLE_PREFIX."settings WHERE gid=$gid");
	$db->query("DELETE FROM ".TABLE_PREFIX."settinggroups WHERE name='".MOD_ID8."'");
	rebuild_settings();
	
	### Delete templates ###
	$deletetemplates = array('firstpost_all_page_separator');
	foreach($deletetemplates as $title)
	{
		$db->query("DELETE FROM ".TABLE_PREFIX."templates WHERE title='$title'");
	}
}

function firstpost_all_page_activate()
{
	global $db;
}
function firstpost_all_page_deactivate()
{
	global $db;
}

$plugins->add_hook('showthread_linear', 'add_forum_manage');
function add_forum_manage()
{

}

$plugins->add_hook('showthread_linear', 'firstpost_all_page_add_showthread');
function firstpost_all_page_add_showthread()
{
	global $thread,$forum,$posts,$tid,$visible,$attachcache;
	global $db, $altbg, $theme, $mybb, $postcounter;
	global $titlescache, $page, $templates, $forumpermissions;
	global $lang, $ismod, $inlinecookie, $inlinecount, $groupscache, $fid;
	global $plugins, $parser, $cache, $ignored_users, $hascustomtitle;
	
	$fpactive = false;
	$fp_forumid = array();
	$fp_forumlist = preg_replace("#(\r\n|\r|\n)#s","#",$mybb->settings['changfp_forum']);
	$fp_forumlist = explode('#',$fp_forumlist);
	if (is_array($fp_forumlist))	
			foreach ($fp_forumlist AS $fp_line)
			{
				$fp_line = explode(' ',$fp_line);
				$fp_forumid[] = intval($fp_line[0]);
			}
	if (in_array($thread['fid'], $fp_forumid))
	{
		$fpactive = true;
	}
	if ($mybb->settings['changfp_allforum'])
	{
		$fpactive = true;
	}
	
	if ($mybb->settings['changfp_turn'] && $fpactive && $page > 1)
		{
			eval("\$fpsp .= \"".$templates->get("firstpost_all_page_separator")."\";");
			if($thread['firstpost'])
			{
				$page_tg = $page;
				$page = 1;
				
				$pfirst = true;
				
				$pids_ = $thread[firstpost];
				if($pids_)
				{
					$pids_ = "pid IN($pids_)";
					
					if($thread['attachmentcount'] > 0)
					{
						// Now lets fetch all of the attachments for these posts.
						$query2 = $db->simple_select("attachments", "*", $pids_);
						while($attachment = $db->fetch_array($query2))
						{
							$attachcache[$attachment['pid']][$attachment['aid']] = $attachment;
						}
					}
				}
				
				$queryfp = $db->query("
				SELECT u.*, u.username AS userusername, p.*, f.*, eu.username AS editusername
				FROM ".TABLE_PREFIX."posts p
				LEFT JOIN ".TABLE_PREFIX."users u ON (u.uid=p.uid)
				LEFT JOIN ".TABLE_PREFIX."userfields f ON (f.ufid=u.uid)
				LEFT JOIN ".TABLE_PREFIX."users eu ON (eu.uid=p.edituid)
				WHERE p.pid={$thread[firstpost]} 
				ORDER BY p.dateline 
				LIMIT 1;
				");
				while($firstpost_ = $db->fetch_array($queryfp))
				{
					if($pfirst && $thread['visible'] == 0)
					{
						$firstpost_['visible'] = 0;
					}
					$postcounter = 0;
					$posts = build_postbit($firstpost_).$fpsp.$posts;
					$firstpost_ = '';
					$pfirst = false;
				}
				$page = $page_alt;
			}
		}
}
?>
