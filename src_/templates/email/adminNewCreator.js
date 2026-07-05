const layout=require("./layout");

module.exports=(user)=>layout(

"New Creator Application",

`

<p>

A creator application has been submitted.

</p>

<p>

<b>Name:</b>

${user.name}

</p>

<p>

<b>Email:</b>

${user.email}

</p>

<p>

Please review it in the Admin Dashboard.

</p>

`

);