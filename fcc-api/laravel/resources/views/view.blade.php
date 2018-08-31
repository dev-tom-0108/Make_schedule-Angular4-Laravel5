<!DOCTYPE html>
<html>
<head>
	<title>View</title>
</head>
<body>
<table border="1">
	<tr>
		<td>ID</td>
		<td>Name</td>
	</tr>
	@foreach ($users as $user)
		<tr>
			<td>{{ $user->permission_id }}</td>
			<td>{{ $user->name }}</td>
		</tr>
	@endforeach
</table>
</body>
</html>