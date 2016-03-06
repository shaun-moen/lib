<?php
	$reset = $_REQUEST['reset'];
	$answer = $_REQUEST['answer'];

	session_start();
	
	if($reset)
		$_SESSION['toggle_count'] = 0;

	$markup = array();
	$cssClass = 'case-'. $_SESSION['toggle_count'];

	switch($_SESSION['toggle_count'])	{
		case 0:
			$markup[] = "<form action='/samples/auto-initter/evolve.php' method='post' class='auto-init' data-function='app.form' data-arguments='[]' data-instantiate='false'>";
			$markup[] =	"	When you clicked me (above), A response was sent to the server which changed this content box.<br /><br />";
			
			$markup[] =	"	In here we have a form element (below) using the AutoInitter to invoke it's \"SampleForm()\" JavaScript, which uses a library to make the form iteself AJAX-able.<br /><br />";
			
			$markup[] =	"	SampeForm changes the text value of the \"Click Me\" button to \"Next\" and then slowly hides our (degradable) submit button.";
			$markup[] =	"	After that SampleForm gets the toggler instance and listens for it's \"onClose\" event. This event is what submits the form.<br /><br />";
			
			$markup[] =	"	Refresh the page if you didn't catch what happend. Isn't this neat?<br />";
			$markup[] =	"	Yes <input type='radio' name='answer' value='yes' checked='checked'> No <input type='radio' name='answer' value='no'><br />";
			$markup[] = "	<input type='submit' value='next'>";
			$markup[] = "</form>";
				break;
		case 1:
			
			$markup[] = "<div class='auto' data-function='allDone' data-arguments='[]' data-instantiate='false'>";

			if($answer == "yes") {
				$markup[] = "Glad you could make sense of it.";
			} else {
				$markup[] = "Not very impressed are you?  Oh well, different strokes for different fokes. Thanks anyway.";				
			} 
			
			$markup[] = "</div>";

			break;
	}

	$content = implode('',$markup);	
	$_SESSION['toggle_count']++;
?>

<div class='<?=$cssClass?>'>
	<?=$content;?>
</div>
