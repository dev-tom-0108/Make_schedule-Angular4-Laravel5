<!DOCTYPE html>
<html>
<head>
	<title>Delete</title>
</head>
<body>
<table border="1">
	<tr>
		<td>ID</td>
		<td>Name</td>
		<td>Edit</td>
	</tr>
	<tr>
		@foreach ($users as $user)
			<tr>
				<td>{{ $user->permission_id }}</td>
				<td>{{ $user->name }}</td>
				<td><a href="delete/{{ $user->permission_id }}">Delete</a></td>
			</tr>
		@endforeach
	</tr>
</table>
</body>
</html>