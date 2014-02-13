<?php 
	if(move_uploaded_file($_FILES['file-0']["tmp_name"], "/file/". $_FILES["file-0"]['name'])) {
		 print "true";
	} else {
		 print "false";
	};
?>