const layout=require("./layout");

module.exports=(user)=>layout(

"New User Registration",

`

<p>

A new user has registered.

</p>

<table>

<tr>

<td>Name</td>

<td>${user.name}</td>

</tr>

<tr>

<td>Email</td>

<td>${user.email}</td>

</tr>

<tr>

<td>Role</td>

<td>${user.role}</td>

</tr>

<tr>

<td>Joined</td>

<td>${new Date().toLocaleString()}</td>

</tr>

</table>

`

);