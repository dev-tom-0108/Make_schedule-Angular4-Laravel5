<!DOCTYPE html>
<html>
<head>
	<title></title>
</head>
<body>
<form action="/edit/<?php echo $users[0]->permission_id; ?>" method="post">
	<input type="hidden" name="_token" value="<?php echo csrf_token(); ?>">
	<table>
		<tr>
			<td>Name</td>
			<td><input type="text" name="name" value="<?php echo $users[0]->name; ?>"></td>
		</tr>
		<tr>
			<td colspan="2">
				<input type="submit" name="" value="Update">
			</td>
		</tr>
	</table>
</form>
</body>
</html>