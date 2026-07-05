const layout=require("./layout");

module.exports=(user)=>layout(

"Application Received",

`

<p>

Hi ${user.name},

</p>

<p>

We've received your Creator Application.

</p>

<p>

Our team is currently reviewing your submission.

</p>

<p>

Expected review time:

<strong>

24–48 Hours

</strong>

</p>

`

);