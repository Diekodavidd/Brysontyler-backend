const layout=require("./layout");

module.exports=(user,reason)=>layout(

"Application Update",

`

<p>

Hi ${user.name},

</p>

<p>

Unfortunately we couldn't approve your Creator Application.

</p>

<p>

<b>Reason</b>

</p>

<p>

${reason}

</p>

<p>

Please update your information and submit another application.

</p>

`

);