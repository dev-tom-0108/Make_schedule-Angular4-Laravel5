<!DOCTYPE html>
<html>
<head>
	<title>Edit</title>
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
				<td><a href="edit/{{ $user->permission_id }}">Edit</a></td>
			</tr>
		@endforeach
	</tr>
</table>
</body>
</html>